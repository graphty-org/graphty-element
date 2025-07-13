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
        this.changeManager.loadCalculatedValues(this.context.getStyles().getCalculatedStylesForNode(data));
        this.data = this.changeManager.watch("data", data);
        this.algorithmResults = this.changeManager.watch("algorithmResults", {} as unknown as AdHocData);
        this.styleUpdates = this.changeManager.addData("style", {} as unknown as AdHocData, NodeStyle);

        // copy nodeMeshOpts
        this.styleId = styleId;

        // create graph node
        // Only add to layout engine if it's already initialized
        // Otherwise, it will be added when the layout is set
        this.context.getLayoutManager().layoutEngine?.addNode(this);

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
        if (styleId === this.styleId) {
            return;
        }

        this.styleId = styleId;
        this.mesh.dispose();

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

        // Create base options
        const labelOptions: RichTextLabelOptions = {
            text: labelText,
            attachTo: this.mesh,
            attachPosition,
            attachOffset,
        };

        // Copy all relevant properties from labelStyle
        const propertiesToCopy = [
            "font",
            "fontSize",
            "fontWeight",
            "lineHeight",
            "textColor",
            "backgroundColor",
            "borderWidth",
            "borderColor",
            "borders",
            "marginTop",
            "marginBottom",
            "marginLeft",
            "marginRight",
            "textAlign",
            "cornerRadius",
            "autoSize",
            "animation",
            "animationSpeed",
            "badge",
            "progress",
            "textOutline",
            "textOutlineWidth",
            "textOutlineColor",
            "backgroundPadding",
            "smartOverflow",
            "maxNumber",
            "overflowSuffix",
        ];

        for (const prop of propertiesToCopy) {
            if (prop in labelStyle && labelStyle[prop as keyof typeof labelStyle] !== undefined) {
                const value = labelStyle[prop as keyof typeof labelStyle];
                (labelOptions as Record<string, unknown>)[prop] = value;
            }
        }

        // Handle special case for transparent background
        if (labelStyle.backgroundColor === "transparent") {
            labelOptions.backgroundColor = undefined;
        }

        return labelOptions;
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
}
