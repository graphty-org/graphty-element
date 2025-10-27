import {
    AbstractMesh,
    SixDofDragBehavior,
} from "@babylonjs/core";
import jmespath from "jmespath";
import _ from "lodash";

import {CalculatedValue} from "./CalculatedValue";
import {ChangeManager} from "./ChangeManager";
import {AdHocData, NodeStyle, NodeStyleConfig} from "./config";
import type {Graph} from "./Graph";
import type {GraphContext} from "./managers/GraphContext";
import {NodeMesh} from "./meshes/NodeMesh";
import {RichTextLabel, type RichTextLabelOptions} from "./meshes/RichTextLabel";
import {NodeBehavior} from "./NodeBehavior";
import {NodeStyleId, Styles} from "./Styles";

export type NodeIdType = string | number;

interface NodeOpts {
    pinOnDrag?: boolean;
}

export class Node {
    parentGraph: Graph | GraphContext;
    opts: NodeOpts;
    id: NodeIdType;
    data: AdHocData<string | number>;
    algorithmResults: AdHocData;
    styleUpdates: AdHocData;
    mesh: AbstractMesh;
    label?: RichTextLabel;
    meshDragBehavior!: SixDofDragBehavior;
    dragging = false;
    styleId: NodeStyleId;
    pinOnDrag!: boolean;
    size!: number;
    changeManager: ChangeManager;

    /**
     * Helper to check if we're using GraphContext
     */
    private get context(): GraphContext {
        // Check if parentGraph has GraphContext methods
        if ("getStyles" in this.parentGraph) {
            return this.parentGraph;
        }

        // Otherwise, it's a Graph instance which implements GraphContext
        return this.parentGraph;
    }

    constructor(graph: Graph | GraphContext, nodeId: NodeIdType, styleId: NodeStyleId, data: AdHocData<string | number>, opts: NodeOpts = {}) {
        this.parentGraph = graph;
        this.id = nodeId;
        this.opts = opts;
        this.changeManager = new ChangeManager();
        this.changeManager.loadCalculatedValues(this.context.getStyleManager().getStyles().getCalculatedStylesForNode(data));
        this.data = this.changeManager.watch("data", data);
        this.algorithmResults = this.changeManager.watch("algorithmResults", {} as unknown as AdHocData);
        this.styleUpdates = this.changeManager.addData("style", {} as unknown as AdHocData, NodeStyle);

        // copy nodeMeshOpts
        this.styleId = styleId;

        // create graph node
        // TODO: Node is added to layout engine by DataManager, not here

        // create mesh
        const o = Styles.getStyleForNodeStyleId(styleId);
        this.size = o.shape?.size ?? 0;

        this.mesh = NodeMesh.create(
            this.context.getMeshCache(),
            {styleId: String(styleId), is2D: this.context.is2D(), size: this.size},
            {shape: o.shape, texture: o.texture, effect: o.effect},
            this.context.getScene(),
        );

        // create label
        if (o.label?.enabled) {
            this.label = this.createLabel(o);
        }

        NodeBehavior.addDefaultBehaviors(this, this.opts);
    }

    addCalculatedStyle(cv: CalculatedValue): void {
        this.changeManager.addCalculatedValue(cv);
    }

    update(): void {
        const newStyleKeys = Object.keys(this.styleUpdates);
        if (newStyleKeys.length > 0) {
            let style = Styles.getStyleForNodeStyleId(this.styleId);
            style = _.defaultsDeep(this.styleUpdates, style);
            const styleId = Styles.getNodeIdForStyle(style);
            this.updateStyle(styleId);
            for (const key of newStyleKeys) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.styleUpdates[key];
            }
        }

        if (this.dragging) {
            return;
        }

        const pos = this.context.getLayoutManager().layoutEngine?.getNodePosition(this);
        if (pos) {
            this.mesh.position.x = pos.x;
            this.mesh.position.y = pos.y;
            this.mesh.position.z = pos.z ?? 0;
        }
    }

    updateStyle(styleId: NodeStyleId): void {
        // Only skip update if styleId is the same AND mesh is not disposed
        // (mesh can be disposed when switching 2D/3D modes via meshCache.clear())
        if (styleId === this.styleId && !this.mesh.isDisposed()) {
            return;
        }

        this.styleId = styleId;
        // Only dispose if not already disposed
        if (!this.mesh.isDisposed()) {
            this.mesh.dispose();
        }

        const o = Styles.getStyleForNodeStyleId(styleId);
        this.size = o.shape?.size ?? 0;

        this.mesh = NodeMesh.create(
            this.context.getMeshCache(),
            {styleId: String(styleId), is2D: this.context.is2D(), size: this.size},
            {shape: o.shape, texture: o.texture, effect: o.effect},
            this.context.getScene(),
        );

        // recreate label if needed
        if (o.label?.enabled) {
            this.label?.dispose();
            this.label = this.createLabel(o);
        } else if (this.label) {
            this.label.dispose();
            this.label = undefined;
        }

        NodeBehavior.addDefaultBehaviors(this, this.opts);
    }

    pin(): void {
        this.context.getLayoutManager().layoutEngine?.pin(this);
    }

    unpin(): void {
        this.context.getLayoutManager().layoutEngine?.unpin(this);
    }

    private createLabel(styleConfig: NodeStyleConfig): RichTextLabel {
        const labelText = this.extractLabelText(styleConfig.label);
        const labelOptions = this.createLabelOptions(labelText, styleConfig);
        return new RichTextLabel(this.mesh.getScene(), labelOptions);
    }

    private extractLabelText(labelConfig?: Record<string, unknown>): string {
        if (!labelConfig) {
            return this.id.toString();
        }

        // Check if text is directly provided
        if (labelConfig.text !== undefined && labelConfig.text !== null) {
            // Only convert to string if it's a primitive type
            if (typeof labelConfig.text === "string" || typeof labelConfig.text === "number" || typeof labelConfig.text === "boolean") {
                return String(labelConfig.text);
            }
        } else if (labelConfig.textPath && typeof labelConfig.textPath === "string") {
            try {
                const result = jmespath.search(this.data, labelConfig.textPath);
                if (result !== null && result !== undefined) {
                    return String(result);
                }
            } catch {
                // Ignore jmespath errors
            }
        }

        return this.id.toString();
    }

    private createLabelOptions(labelText: string, styleConfig: NodeStyleConfig): RichTextLabelOptions {
        const labelStyle = styleConfig.label ?? {};

        // Get attach position and offset
        const attachPosition = this.getAttachPosition(labelStyle.location ?? "top");
        const attachOffset = labelStyle.attachOffset ?? this.getDefaultAttachOffset(labelStyle.location ?? "top");

        // Transform backgroundColor to string if it's an advanced color style
        let backgroundColor: string | undefined = undefined;
        if (labelStyle.backgroundColor) {
            if (typeof labelStyle.backgroundColor === "string") {
                ({backgroundColor} = labelStyle);
            } else if (labelStyle.backgroundColor.colorType === "solid") {
                ({value: backgroundColor} = labelStyle.backgroundColor);
            } else if (labelStyle.backgroundColor.colorType === "gradient") {
                // For gradients, use the first color as a fallback
                [backgroundColor] = labelStyle.backgroundColor.colors;
            }
        }

        // Filter out undefined values from backgroundGradientColors
        let backgroundGradientColors: string[] | undefined = undefined;
        if (labelStyle.backgroundGradientColors) {
            backgroundGradientColors = labelStyle.backgroundGradientColors.filter((color): color is string => color !== undefined);
            if (backgroundGradientColors.length === 0) {
                backgroundGradientColors = undefined;
            }
        }

        // Transform borders to ensure colors are strings
        let borders: {width: number, color: string, spacing: number}[] | undefined = undefined;
        if (labelStyle.borders && labelStyle.borders.length > 0) {
            const validBorders = labelStyle.borders
                .filter((border): border is typeof border & {color: string} => border.color !== undefined)
                .map((border) => ({
                    width: border.width,
                    color: border.color,
                    spacing: border.spacing,
                }));
            // Only set borders if we have valid borders, otherwise leave it undefined
            // so the default empty array is used
            if (validBorders.length > 0) {
                borders = validBorders;
            }
        }

        // Create label options by spreading the entire labelStyle object
        const labelOptions: RichTextLabelOptions = {
            ... labelStyle,
            // Override with computed values
            text: labelText,
            attachTo: this.mesh,
            attachPosition,
            attachOffset,
            backgroundColor,
            backgroundGradientColors,
            ... (borders !== undefined && {borders}),
        };

        // Handle special case for transparent background
        if (labelOptions.backgroundColor === "transparent") {
            labelOptions.backgroundColor = undefined;
        }

        // Remove properties that shouldn't be passed to RichTextLabel
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {location, textPath, enabled, ... finalLabelOptions} = labelOptions as RichTextLabelOptions & {location?: string, textPath?: string, enabled?: boolean};

        return finalLabelOptions;
    }

    private getAttachPosition(location: string): "top" | "top-left" | "top-right" | "left" | "center" | "right" | "bottom" | "bottom-left" | "bottom-right" {
        switch (location) {
            case "floating":
            case "automatic":
                return "top";
            case "top":
            case "top-left":
            case "top-right":
            case "left":
            case "center":
            case "right":
            case "bottom":
            case "bottom-left":
            case "bottom-right":
                return location;
            default:
                return "top";
        }
    }

    private getDefaultAttachOffset(location: string): number {
        // Return larger offsets for left/right positions to prevent overlap
        switch (location) {
            case "left":
            case "right":
                return 1.0; // Larger offset for horizontal positions
            case "center":
                return 0; // No offset for center
            default:
                return 0.5; // Standard offset for top/bottom positions
        }
    }

    // Test helper methods
    getPosition(): {x: number, y: number, z: number} {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
        };
    }

    isPinned(): boolean {
        // For now, nodes are not pinned unless drag behavior is disabled
        return false;
    }

    isSelected(): boolean {
        // Check if node is in selection - this is a simplified version
        // In reality, selection state would be managed by a selection manager
        return this.mesh.isPickable && this.mesh.metadata?.selected === true;
    }
}
