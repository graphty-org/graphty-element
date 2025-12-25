import {
    AbstractMesh,
} from "@babylonjs/core";
import jmespath from "jmespath";
import _ from "lodash";

import {CalculatedValue} from "./CalculatedValue";
import {ChangeManager} from "./ChangeManager";
import {AdHocData, NodeStyle, NodeStyleConfig} from "./config";
import type {Graph} from "./Graph";
import type {GraphContext} from "./managers/GraphContext";
import {NodeEffects} from "./meshes/NodeEffects";
import {NodeMesh} from "./meshes/NodeMesh";
import {RichTextLabel, type RichTextLabelOptions} from "./meshes/RichTextLabel";
import {NodeBehavior, type NodeDragHandler} from "./NodeBehavior";
import {NodeStyleId, Styles} from "./Styles";

export type NodeIdType = string | number;

interface NodeOpts {
    pinOnDrag?: boolean;
}

/**
 * Represents a node in the graph visualization with its mesh, label, and associated data.
 * Manages node rendering, styling, drag behavior, and interactions with the layout engine.
 */
export class Node {
    parentGraph: Graph | GraphContext;
    opts: NodeOpts;
    id: NodeIdType;
    data: AdHocData<string | number>;
    algorithmResults: AdHocData;
    styleUpdates: AdHocData;
    mesh: AbstractMesh;
    label?: RichTextLabel;
    dragHandler?: NodeDragHandler;
    dragging = false;
    styleId: NodeStyleId;
    pinOnDrag!: boolean;
    size!: number;
    changeManager: ChangeManager;

    /**
     * Helper to check if we're using GraphContext
     * @returns The GraphContext instance from the parent graph
     */
    private get context(): GraphContext {
        // Check if parentGraph has GraphContext methods
        if ("getStyles" in this.parentGraph) {
            return this.parentGraph;
        }

        // Otherwise, it's a Graph instance which implements GraphContext
        return this.parentGraph;
    }

    /**
     * Creates a new Node instance with mesh, label, and behaviors.
     * @param graph - The parent graph or graph context that owns this node
     * @param nodeId - Unique identifier for this node
     * @param styleId - Style identifier determining the node's visual appearance
     * @param data - Custom data associated with this node
     * @param opts - Optional configuration options for the node
     */
    constructor(graph: Graph | GraphContext, nodeId: NodeIdType, styleId: NodeStyleId, data: AdHocData<string | number>, opts: NodeOpts = {}) {
        this.parentGraph = graph;
        this.id = nodeId;
        this.opts = opts;
        this.changeManager = new ChangeManager();
        this.data = this.changeManager.watch("data", data);
        this.algorithmResults = this.changeManager.watch("algorithmResults", {} as unknown as AdHocData);
        this.styleUpdates = this.changeManager.addData("style", {} as unknown as AdHocData, NodeStyle);
        this.changeManager.loadCalculatedValues(this.context.getStyleManager().getStyles().getCalculatedStylesForNode(data));

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

        // Parent to graph-root for XR gesture support
        // This allows gestures to transform the entire graph by manipulating the root
        const graphRoot = this.context.getScene().getTransformNodeByName("graph-root");
        if (graphRoot) {
            this.mesh.parent = graphRoot;
        }

        // Add metadata for XR controller raycasting
        // IMPORTANT: For InstancedMesh, we must set metadata on the INSTANCE, not spread from source
        this.mesh.metadata = {
            graphNode: this,
            styleId: String(styleId),
            nodeId: this.id,
        };

        // Apply outline effect if configured in style
        NodeEffects.applyOutlineEffect(this.mesh, o.effect);

        // create label
        if (o.label?.enabled) {
            this.label = this.createLabel(o);
        }

        NodeBehavior.addDefaultBehaviors(this, this.opts);
    }

    /**
     * Adds a calculated style value to this node's change manager.
     * @param cv - The calculated value to add to the node's styling system
     */
    addCalculatedStyle(cv: CalculatedValue): void {
        this.changeManager.addCalculatedValue(cv);
    }

    /**
     * Updates the node's mesh position and style based on layout engine and style changes.
     * Handles mesh recreation if disposed and applies any pending style updates.
     */
    update(): void {
        this.context.getStatsManager().startMeasurement("Node.update");

        // Check if mesh was disposed (e.g., from 2D/3D mode switch) and recreate it
        if (this.mesh.isDisposed()) {
            this.updateStyle(this.styleId);
        }

        const newStyleKeys = Object.keys(this.styleUpdates);
        if (newStyleKeys.length > 0) {
            let style = Styles.getStyleForNodeStyleId(this.styleId);
            // Convert styleUpdates Proxy to plain object for proper merging
            // (styleUpdates is wrapped by on-change library's Proxy)
            const plainStyleUpdates = _.cloneDeep(this.styleUpdates);
            style = _.defaultsDeep(plainStyleUpdates, style);
            const styleId = Styles.getNodeIdForStyle(style);
            this.updateStyle(styleId);
            for (const key of newStyleKeys) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete this.styleUpdates[key];
            }
        }

        if (this.dragging) {
            this.context.getStatsManager().endMeasurement("Node.update");
            return;
        }

        const layoutManager = this.context.getLayoutManager();
        const {layoutEngine} = layoutManager;

        const pos = layoutEngine?.getNodePosition(this);
        if (pos) {
            this.mesh.position.x = pos.x;
            this.mesh.position.y = pos.y;
            this.mesh.position.z = pos.z ?? 0;
        }

        this.context.getStatsManager().endMeasurement("Node.update");
    }

    /**
     * Updates the node's visual style by recreating the mesh with the specified style.
     * Preserves the node's position and reattaches behaviors and labels.
     * @param styleId - The new style identifier to apply to the node
     */
    updateStyle(styleId: NodeStyleId): void {
        this.context.getStatsManager().startMeasurement("Node.updateMesh");

        // Only skip update if styleId is the same AND mesh is not disposed
        // (mesh can be disposed when switching 2D/3D modes via meshCache.clear())
        if (styleId === this.styleId && !this.mesh.isDisposed()) {
            this.context.getStatsManager().endMeasurement("Node.updateMesh");
            return;
        }

        this.styleId = styleId;

        // Save the current position before disposing the mesh
        // This is critical for style changes when layout is settled,
        // because updateNodes() won't be called to restore positions
        const savedPosition = {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
        };

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

        // Restore the saved position to the new mesh
        this.mesh.position.x = savedPosition.x;
        this.mesh.position.y = savedPosition.y;
        this.mesh.position.z = savedPosition.z;

        // Parent to graph-root for XR gesture support
        const graphRoot = this.context.getScene().getTransformNodeByName("graph-root");
        if (graphRoot) {
            this.mesh.parent = graphRoot;
        }

        // Add metadata for XR controller raycasting
        // IMPORTANT: For InstancedMesh, we must set metadata on the INSTANCE, not spread from source
        this.mesh.metadata = {
            graphNode: this,
            styleId: String(styleId),
            nodeId: this.id,
        };

        // Restore position from layout engine after mesh recreation
        // This ensures the mesh doesn't reset to (0, 0, 0) when style changes
        const layoutManager = this.context.getLayoutManager();
        const pos = layoutManager.layoutEngine?.getNodePosition(this);
        if (pos) {
            this.mesh.position.x = pos.x;
            this.mesh.position.y = pos.y;
            this.mesh.position.z = pos.z ?? 0;
        }

        // Apply outline effect if configured in style
        NodeEffects.applyOutlineEffect(this.mesh, o.effect);

        // recreate label if needed
        if (o.label?.enabled) {
            this.label?.dispose();
            this.label = this.createLabel(o);
        } else if (this.label) {
            this.label.dispose();
            this.label = undefined;
        }

        // Dispose old drag handler before creating new one to prevent duplicate event listeners
        if (this.dragHandler) {
            this.dragHandler.dispose();
        }

        NodeBehavior.addDefaultBehaviors(this, this.opts);

        this.context.getStatsManager().endMeasurement("Node.updateMesh");
    }

    /**
     * Pins the node in place, preventing the layout engine from moving it.
     */
    pin(): void {
        this.context.getLayoutManager().layoutEngine?.pin(this);
    }

    /**
     * Unpins the node, allowing the layout engine to move it again.
     */
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
    /**
     * Gets the current 3D position of the node's mesh.
     * @returns An object containing the x, y, and z coordinates of the node
     */
    getPosition(): {x: number, y: number, z: number} {
        return {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z,
        };
    }

    /**
     * Checks whether the node is currently pinned in place.
     * @returns True if the node is pinned, false otherwise
     */
    isPinned(): boolean {
        // For now, nodes are not pinned unless drag behavior is disabled
        return false;
    }

    /**
     * Checks whether the node is currently selected.
     * @returns True if the node is selected, false otherwise
     */
    isSelected(): boolean {
        // Check if node is in selection - this is a simplified version
        // In reality, selection state would be managed by a selection manager
        return this.mesh.isPickable && this.mesh.metadata?.selected === true;
    }
}
