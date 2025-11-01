import {
    AbstractMesh,
    Ray,
    Vector3,
} from "@babylonjs/core";
import * as jmespath from "jmespath";

import type {AdHocData, EdgeStyleConfig} from "./config";
import type {Graph} from "./Graph";
import type {GraphContext} from "./managers/GraphContext";
import {EdgeMesh} from "./meshes/EdgeMesh";
import {type AttachPosition, RichTextLabel, type RichTextLabelOptions} from "./meshes/RichTextLabel";
import {Node, NodeIdType} from "./Node";
import {EdgeStyleId, Styles} from "./Styles";

interface InterceptPoint {
    srcPoint: Vector3 | null;
    dstPoint: Vector3 | null;
    newEndPoint: Vector3 | null;
}

interface EdgeLine {
    srcPoint: Vector3 | null;
    dstPoint: Vector3 | null;

}

interface EdgeOpts {
    metadata?: object;
}

// Extend Ray type to include position property
interface RayWithPosition extends Ray {
    position: Vector3;
}

export class Edge {
    parentGraph: Graph | GraphContext;
    opts: EdgeOpts;
    srcId: NodeIdType;
    dstId: NodeIdType;
    id: string;
    dstNode: Node;
    srcNode: Node;
    data: AdHocData;
    mesh: AbstractMesh;
    arrowMesh: AbstractMesh | null = null;
    styleId: EdgeStyleId;
    // XXX: performance impact when not needed?
    ray: Ray;
    label: RichTextLabel | null = null;

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

    constructor(graph: Graph | GraphContext, srcNodeId: NodeIdType, dstNodeId: NodeIdType, styleId: EdgeStyleId, data: AdHocData, opts: EdgeOpts = {}) {
        this.parentGraph = graph;
        this.srcId = srcNodeId;
        this.dstId = dstNodeId;
        this.id = `${srcNodeId}:${dstNodeId}`;
        this.data = data;
        this.opts = opts;

        // make sure both srcNode and dstNode already exist
        const srcNode = this.context.getDataManager().nodeCache.get(srcNodeId);
        if (!srcNode) {
            throw new Error(`Attempting to create edge '${srcNodeId}->${dstNodeId}', Node '${srcNodeId}' hasn't been created yet.`);
        }

        const dstNode = this.context.getDataManager().nodeCache.get(dstNodeId);
        if (!dstNode) {
            throw new Error(`Attempting to create edge '${srcNodeId}->${dstNodeId}', Node '${dstNodeId}' hasn't been created yet.`);
        }

        this.srcNode = srcNode;
        this.dstNode = dstNode;

        // create ray for direction / intercept finding
        this.ray = new Ray(this.srcNode.mesh.position, this.dstNode.mesh.position);

        // copy edgeMeshConfig
        this.styleId = styleId;

        // create ngraph link
        // TODO: Edge is added to layout engine by DataManager, not here

        // create mesh
        const style = Styles.getStyleForEdgeStyleId(this.styleId);

        // create arrow mesh if needed
        this.arrowMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            String(this.styleId),
            {
                type: style.arrowHead?.type ?? "none",
                width: style.line?.width ?? 0.25,
                color: style.arrowHead?.color ?? style.line?.color ?? "#FFFFFF",
            },
            this.context.getScene(),
        );

        // create edge line mesh
        this.mesh = EdgeMesh.create(
            this.context.getMeshCache(),
            {
                styleId: String(this.styleId),
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            this.context.getScene(),
        );

        this.mesh.isPickable = false;
        this.mesh.metadata = {};
        this.mesh.metadata.parentEdge = this;

        // create label if configured
        if (style.label?.enabled) {
            this.label = this.createLabel(style);
        }
    }

    update(): void {
        const lnk = this.context.getLayoutManager().layoutEngine?.getEdgePosition(this);
        if (!lnk) {
            return;
        }

        const {srcPoint, dstPoint} = this.transformArrowCap();

        if (srcPoint && dstPoint) {
            this.transformEdgeMesh(
                srcPoint,
                dstPoint,
            );
        } else {
            this.transformEdgeMesh(
                new Vector3(lnk.src.x, lnk.src.y, lnk.src.z),
                new Vector3(lnk.dst.x, lnk.dst.y, lnk.dst.z),
            );
        }

        // Update label position if exists
        if (this.label) {
            const midPoint = new Vector3(
                (lnk.src.x + lnk.dst.x) / 2,
                (lnk.src.y + lnk.dst.y) / 2,
                ((lnk.src.z ?? 0) + (lnk.dst.z ?? 0)) / 2,
            );
            this.label.attachTo(midPoint, "center", 0);
        }
    }

    updateStyle(styleId: EdgeStyleId): void {
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

        const style = Styles.getStyleForEdgeStyleId(styleId);

        // recreate arrow mesh if needed
        if (this.arrowMesh && !this.arrowMesh.isDisposed()) {
            this.arrowMesh.dispose();
        }

        this.arrowMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            String(styleId),
            {
                type: style.arrowHead?.type ?? "none",
                width: style.line?.width ?? 0.25,
                color: style.arrowHead?.color ?? style.line?.color ?? "#FFFFFF",
            },
            this.context.getScene(),
        );

        // recreate edge line mesh
        this.mesh = EdgeMesh.create(
            this.context.getMeshCache(),
            {
                styleId: String(styleId),
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            this.context.getScene(),
        );

        this.mesh.isPickable = false;
        this.mesh.metadata = {};
        this.mesh.metadata.parentEdge = this;

        // Update label if needed
        if (style.label?.enabled) {
            if (this.label) {
                this.label.dispose();
            }

            this.label = this.createLabel(style);
        } else if (this.label) {
            this.label.dispose();
            this.label = null;
        }
    }

    static updateRays(g: Graph | GraphContext): void {
        const context = "getStyles" in g ? g : g;

        if (!context.needsRayUpdate()) {
            return;
        }

        const {layoutEngine} = context.getLayoutManager();
        if (!layoutEngine) {
            return;
        }

        for (const e of layoutEngine.edges) {
            const srcMesh = e.srcNode.mesh;
            const dstMesh = e.dstNode.mesh;

            const style = Styles.getStyleForEdgeStyleId(e.styleId);
            if (style.arrowHead?.type === undefined || style.arrowHead.type === "none") {
                // Performance: this could be optimized
                continue;
            }

            // RayHelper.CreateAndShow(ray, e.parentGraph.scene, Color3.Red());

            // XXX: position is missing from Ray TypeScript definition
            (e.ray as RayWithPosition).position = dstMesh.position;
            e.ray.direction = dstMesh.position.subtract(srcMesh.position);
        }

        // this sucks for performance, but we have to do a full render pass
        // to update rays and intersections
        context.getScene().render();
    }

    transformEdgeMesh(srcPoint: Vector3, dstPoint: Vector3): void {
        EdgeMesh.transformMesh(this.mesh, srcPoint, dstPoint);
    }

    transformArrowCap(): EdgeLine {
        if (this.arrowMesh) {
            const {srcPoint, dstPoint, newEndPoint} = this.getInterceptPoints();

            // If we can't find intercept points, fall back to approximate positions
            if (!srcPoint || !dstPoint || !newEndPoint) {
                const fallbackSrc = this.srcNode.mesh.position;
                const fallbackDst = this.dstNode.mesh.position;

                // Hide arrow if nodes are too close or at same position
                if (fallbackSrc.equalsWithEpsilon(fallbackDst, 0.01)) {
                    this.arrowMesh.setEnabled(false);
                    return {
                        srcPoint: fallbackSrc,
                        dstPoint: fallbackDst,
                    };
                }

                // Pure geometric positioning (same as main path, but using node centers/radii)
                const direction = fallbackDst.subtract(fallbackSrc).normalize();

                // Get arrow length (including size multiplier)
                const style = Styles.getStyleForEdgeStyleId(this.styleId);
                const lineWidth = style.line?.width ?? 0.25;
                const arrowSize = style.arrowHead?.size ?? 1.0;
                const arrowLength = EdgeMesh.calculateArrowLength(lineWidth) * arrowSize;

                // Use actual bounding sphere radii
                const dstNodeRadius = this.dstNode.mesh.getBoundingInfo().boundingSphere.radiusWorld;
                const srcNodeRadius = this.srcNode.mesh.getBoundingInfo().boundingSphere.radiusWorld;

                // Calculate surface intersection points
                const srcSurfacePoint = fallbackSrc.add(direction.scale(srcNodeRadius));
                const dstSurfacePoint = fallbackDst.subtract(direction.scale(dstNodeRadius));

                // Line ends arrowLength before destination surface
                const lineEndPoint = dstSurfacePoint.subtract(direction.scale(arrowLength));

                // Position arrow at destination surface
                // Different arrow types have different pivot points
                const centerBasedArrows = ["dot", "open-dot", "sphere-dot", "sphere"];
                const arrowType = style.arrowHead?.type;

                this.arrowMesh.setEnabled(true);

                if (centerBasedArrows.includes(arrowType ?? "")) {
                    // Center-based arrows: use actual mesh bounding radius
                    const actualRadius = this.arrowMesh.getBoundingInfo().boundingSphere.radiusWorld;
                    this.arrowMesh.position = dstSurfacePoint.subtract(direction.scale(actualRadius));
                } else {
                    // Tip-based arrows: position tip at surface
                    this.arrowMesh.position = dstSurfacePoint;
                }

                this.arrowMesh.lookAt(this.dstNode.mesh.position);

                return {
                    srcPoint: srcSurfacePoint,
                    dstPoint: lineEndPoint,
                };
            }

            this.arrowMesh.setEnabled(true);

            // Get arrow style and dimensions
            const arrowStyle = Styles.getStyleForEdgeStyleId(this.styleId);
            const arrowType = arrowStyle.arrowHead?.type;
            const lineWidth = arrowStyle.line?.width ?? 0.25;
            const arrowSize = arrowStyle.arrowHead?.size ?? 1.0;
            const arrowLength = EdgeMesh.calculateArrowLength(lineWidth) * arrowSize;

            // Different arrow types have different pivot points:
            // - Triangular arrows (normal, inverted, diamond, box): tip at local origin
            // - Sphere/circle arrows (dot, open-dot, sphere-dot, sphere): center at local origin
            const centerBasedArrows = ["dot", "open-dot", "sphere-dot", "sphere"];
            const direction = dstPoint.subtract(srcPoint).normalize();

            if (centerBasedArrows.includes(arrowType ?? "")) {
                // Center-based arrows: use actual mesh bounding radius
                // (mesh geometry may differ from calculated size due to segment count)
                const actualRadius = this.arrowMesh.getBoundingInfo().boundingSphere.radiusWorld;
                this.arrowMesh.position = dstPoint.subtract(direction.scale(actualRadius));
            } else {
                // Tip-based arrows: position tip at surface
                this.arrowMesh.position = dstPoint;
            }

            this.arrowMesh.lookAt(this.dstNode.mesh.position);

            return {
                srcPoint,
                dstPoint: newEndPoint,  // Line ends before arrow to create gap for arrow to fill
            };
        }

        return {
            srcPoint: null,
            dstPoint: null,
        };
    }

    getInterceptPoints(): InterceptPoint {
        const srcMesh = this.srcNode.mesh;
        const dstMesh = this.dstNode.mesh;

        // ray is updated in updateRays to ensure intersections
        const dstHitInfo = this.ray.intersectsMeshes([dstMesh]);
        const srcHitInfo = this.ray.intersectsMeshes([srcMesh]);

        let srcPoint: Vector3 | null = null;
        let dstPoint: Vector3 | null = null;
        let newEndPoint: Vector3 | null = null;
        if (dstHitInfo.length && srcHitInfo.length) {
            const style = Styles.getStyleForEdgeStyleId(this.styleId);
            const hasArrowHead = style.arrowHead?.type && style.arrowHead.type !== "none";

            dstPoint = dstHitInfo[0].pickedPoint;
            srcPoint = srcHitInfo[0].pickedPoint;
            if (!srcPoint || !dstPoint) {
                throw new TypeError("error picking points");
            }

            // Only adjust endpoint if we have an arrow head
            if (hasArrowHead) {
                const arrowSize = style.arrowHead?.size ?? 1.0;
                const len = EdgeMesh.calculateArrowLength(style.line?.width ?? 0.25) * arrowSize;
                const distance = srcPoint.subtract(dstPoint).length();
                const adjDistance = distance - len;
                const {x: x1, y: y1, z: z1} = srcPoint;
                const {x: x2, y: y2, z: z2} = dstPoint;
                // calculate new line endpoint along line between midpoints of meshes
                const x3 = x1 + ((adjDistance / distance) * (x2 - x1));
                const y3 = y1 + ((adjDistance / distance) * (y2 - y1));
                const z3 = z1 + ((adjDistance / distance) * (z2 - z1));
                newEndPoint = new Vector3(x3, y3, z3);
            } else {
                // No arrow head, edge goes all the way to the node surface
                newEndPoint = dstPoint;
            }
        }

        return {
            srcPoint,
            dstPoint,
            newEndPoint,
        };
    }

    private createLabel(styleConfig: EdgeStyleConfig): RichTextLabel {
        const labelText = this.extractLabelText(styleConfig.label);
        const labelOptions = this.createLabelOptions(labelText, styleConfig);
        return new RichTextLabel(this.context.getScene(), labelOptions);
    }

    private extractLabelText(labelConfig?: Record<string, unknown>): string {
        if (!labelConfig) {
            return this.id;
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

        return this.id;
    }

    private createLabelOptions(labelText: string, styleConfig: EdgeStyleConfig): RichTextLabelOptions {
        const {label} = styleConfig;
        if (!label) {
            return {
                text: labelText,
                attachPosition: "center",
                attachOffset: 0,
            };
        }

        const labelLocation = label.location ?? "center";
        const attachPosition = labelLocation === "automatic" ? "center" : labelLocation;

        // Transform backgroundColor to string if it's an advanced color style
        let backgroundColor: string | undefined = undefined;
        if (label.backgroundColor) {
            if (typeof label.backgroundColor === "string") {
                ({backgroundColor} = label);
            } else if (label.backgroundColor.colorType === "solid") {
                ({value: backgroundColor} = label.backgroundColor);
            } else if (label.backgroundColor.colorType === "gradient") {
                // For gradients, use the first color as a fallback
                [backgroundColor] = label.backgroundColor.colors;
            }
        }

        // Filter out undefined values from backgroundGradientColors
        let backgroundGradientColors: string[] | undefined = undefined;
        if (label.backgroundGradientColors) {
            backgroundGradientColors = label.backgroundGradientColors.filter((color): color is string => color !== undefined);
            if (backgroundGradientColors.length === 0) {
                backgroundGradientColors = undefined;
            }
        }

        // Transform borders to ensure colors are strings
        let borders: {width: number, color: string, spacing: number}[] | undefined = undefined;
        if (label.borders && label.borders.length > 0) {
            const validBorders = label.borders
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

        // Create label options by spreading the entire label object
        const labelOptions: RichTextLabelOptions = {
            ... label,
            // Override with computed values
            text: labelText,
            attachPosition: attachPosition as AttachPosition,
            attachOffset: label.attachOffset ?? 0,
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
}

export class EdgeMap {
    map = new Map<NodeIdType, Map<NodeIdType, Edge>>();

    has(srcId: NodeIdType, dstId: NodeIdType): boolean {
        const dstMap = this.map.get(srcId);
        if (!dstMap) {
            return false;
        }

        return dstMap.has(dstId);
    }

    set(srcId: NodeIdType, dstId: NodeIdType, e: Edge): void {
        let dstMap = this.map.get(srcId);
        if (!dstMap) {
            dstMap = new Map();
            this.map.set(srcId, dstMap);
        }

        if (dstMap.has(dstId)) {
            throw new Error("Attempting to create duplicate Edge");
        }

        dstMap.set(dstId, e);
    }

    get(srcId: NodeIdType, dstId: NodeIdType): Edge | undefined {
        const dstMap = this.map.get(srcId);
        if (!dstMap) {
            return undefined;
        }

        return dstMap.get(dstId);
    }

    get size(): number {
        let sz = 0;
        for (const dstMap of this.map.values()) {
            sz += dstMap.size;
        }

        return sz;
    }

    delete(srcId: NodeIdType, dstId: NodeIdType): boolean {
        const dstMap = this.map.get(srcId);
        if (!dstMap) {
            return false;
        }

        const result = dstMap.delete(dstId);

        // Clean up empty maps
        if (dstMap.size === 0) {
            this.map.delete(srcId);
        }

        return result;
    }

    clear(): void {
        this.map.clear();
    }
}
