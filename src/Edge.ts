import {
    AbstractMesh,
    Mesh,
    Ray,
    Vector3,
} from "@babylonjs/core";
import * as jmespath from "jmespath";

import type {AdHocData, EdgeStyleConfig} from "./config";
import {EDGE_CONSTANTS} from "./constants/meshConstants";
import type {Graph} from "./Graph";
import type {GraphContext} from "./managers/GraphContext";
import {CustomLineRenderer} from "./meshes/CustomLineRenderer";
import {EdgeMesh} from "./meshes/EdgeMesh";
import {FilledArrowRenderer} from "./meshes/FilledArrowRenderer";
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
    arrowTailMesh: AbstractMesh | null = null;
    styleId: EdgeStyleId;
    // XXX: performance impact when not needed?
    ray: Ray;
    label: RichTextLabel | null = null;
    private _loggedLineDirection = false; // Debug flag for logging lineDirection

    // Dirty tracking: Cache last node positions to skip unnecessary updates
    private _lastSrcPos: Vector3 | null = null;
    private _lastDstPos: Vector3 | null = null;

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
        // Ray constructor expects (origin, direction), not (origin, destination)
        this.ray = new Ray(
            this.srcNode.mesh.position,
            this.dstNode.mesh.position.subtract(this.srcNode.mesh.position),
        );

        // copy edgeMeshConfig
        this.styleId = styleId;

        // create ngraph link
        // TODO: Edge is added to layout engine by DataManager, not here

        // create mesh
        const style = Styles.getStyleForEdgeStyleId(this.styleId);

        // create arrow mesh if needed
        console.log('Edge constructor: creating arrowMesh, arrowHead type:', style.arrowHead?.type);
        this.arrowMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            String(this.styleId),
            {
                type: style.arrowHead?.type ?? "none",
                width: style.line?.width ?? EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
                color: style.arrowHead?.color ?? style.line?.color ?? "#FFFFFF",
                size: style.arrowHead?.size,
                opacity: style.arrowHead?.opacity,
            },
            this.context.getScene(),
        );
        console.log('Edge constructor: arrowMesh assigned:', this.arrowMesh?.name, this.arrowMesh !== null);

        // create arrow tail mesh if needed
        console.log('Edge constructor: creating arrowTailMesh, arrowTail type:', style.arrowTail?.type);
        this.arrowTailMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            `${String(this.styleId)}-tail`,
            {
                type: style.arrowTail?.type ?? "none",
                width: style.line?.width ?? EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
                color: style.arrowTail?.color ?? style.line?.color ?? "#FFFFFF",
                size: style.arrowTail?.size,
                opacity: style.arrowTail?.opacity,
            },
            this.context.getScene(),
        );
        console.log('Edge constructor: arrowTailMesh assigned:', this.arrowTailMesh?.name, this.arrowTailMesh !== null);

        // create edge line mesh
        this.mesh = EdgeMesh.create(
            this.context.getMeshCache(),
            {
                styleId: String(this.styleId),
                width: style.line?.width ?? EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
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
        this.context.getStatsManager().startMeasurement("Edge.update");

        const lnk = this.context.getLayoutManager().layoutEngine?.getEdgePosition(this);
        if (!lnk) {
            this.context.getStatsManager().endMeasurement("Edge.update");
            return;
        }

        // Dirty tracking: Check if nodes have moved significantly
        const srcPos = this.srcNode.mesh.position;
        const dstPos = this.dstNode.mesh.position;

        const srcMoved = !this._lastSrcPos || !this._lastSrcPos.equalsWithEpsilon(srcPos, 0.001);
        const dstMoved = !this._lastDstPos || !this._lastDstPos.equalsWithEpsilon(dstPos, 0.001);

        console.log('Edge.update dirty check:', {
            srcMoved,
            dstMoved,
            _lastSrcPos: this._lastSrcPos ? {x: this._lastSrcPos.x, y: this._lastSrcPos.y, z: this._lastSrcPos.z} : null,
            _lastDstPos: this._lastDstPos ? {x: this._lastDstPos.x, y: this._lastDstPos.y, z: this._lastDstPos.z} : null,
            srcPos: {x: srcPos.x, y: srcPos.y, z: srcPos.z},
            dstPos: {x: dstPos.x, y: dstPos.y, z: dstPos.z},
        });

        if (!srcMoved && !dstMoved) {
            // Nodes haven't moved, skip update
            console.log('Edge.update: Skipping update (nodes haven\'t moved)');
            this.context.getStatsManager().endMeasurement("Edge.update");
            return;
        }

        // Nodes have moved, perform update
        console.log('Edge.update: Performing update (nodes moved)');

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

        // Cache positions for next frame
        this._lastSrcPos = srcPos.clone();
        this._lastDstPos = dstPos.clone();

        this.context.getStatsManager().endMeasurement("Edge.update");
    }

    updateStyle(styleId: EdgeStyleId): void {
        console.log('Edge.updateStyle called:', {oldStyleId: this.styleId, newStyleId: styleId, meshDisposed: this.mesh.isDisposed()});
        // Only skip update if styleId is the same AND mesh is not disposed
        // (mesh can be disposed when switching 2D/3D modes via meshCache.clear())
        if (styleId === this.styleId && !this.mesh.isDisposed()) {
            console.log('Edge.updateStyle: skipping update (same style and mesh not disposed)');
            return;
        }

        console.log('Edge.updateStyle: proceeding with update');
        this.styleId = styleId;

        // Invalidate position cache to force edge redraw with new style
        this._lastSrcPos = null;
        this._lastDstPos = null;
        // Only dispose if not already disposed
        if (!this.mesh.isDisposed()) {
            this.mesh.dispose();
        }

        const style = Styles.getStyleForEdgeStyleId(styleId);

        // recreate arrow mesh if needed
        console.log('Edge.updateStyle: disposing old arrowMesh:', this.arrowMesh?.name);
        if (this.arrowMesh && !this.arrowMesh.isDisposed()) {
            this.arrowMesh.dispose();
        }

        console.log('Edge.updateStyle: creating new arrowMesh, type:', style.arrowHead?.type);
        this.arrowMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            String(styleId),
            {
                type: style.arrowHead?.type ?? "none",
                width: style.line?.width ?? EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
                color: style.arrowHead?.color ?? style.line?.color ?? "#FFFFFF",
                size: style.arrowHead?.size,
                opacity: style.arrowHead?.opacity,
            },
            this.context.getScene(),
        );
        console.log('Edge.updateStyle: arrowMesh created:', this.arrowMesh?.name, this.arrowMesh !== null);

        // recreate arrow tail mesh if needed
        console.log('Edge.updateStyle: disposing old arrowTailMesh:', this.arrowTailMesh?.name);
        if (this.arrowTailMesh && !this.arrowTailMesh.isDisposed()) {
            this.arrowTailMesh.dispose();
        }

        console.log('Edge.updateStyle: creating new arrowTailMesh, type:', style.arrowTail?.type);
        this.arrowTailMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            `${String(styleId)}-tail`,
            {
                type: style.arrowTail?.type ?? "none",
                width: style.line?.width ?? EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
                color: style.arrowTail?.color ?? style.line?.color ?? "#FFFFFF",
                size: style.arrowTail?.size,
                opacity: style.arrowTail?.opacity,
            },
            this.context.getScene(),
        );
        console.log('Edge.updateStyle: arrowTailMesh created:', this.arrowTailMesh?.name, this.arrowTailMesh !== null);

        // recreate edge line mesh
        this.mesh = EdgeMesh.create(
            this.context.getMeshCache(),
            {
                styleId: String(styleId),
                width: style.line?.width ?? EDGE_CONSTANTS.DEFAULT_LINE_WIDTH,
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

                // DEBUG: Log node positions and calculated direction
                // console.log(`Edge: src=(${fallbackSrc.x.toFixed(3)}, ${fallbackSrc.y.toFixed(3)}, ${fallbackSrc.z.toFixed(3)}), dst=(${fallbackDst.x.toFixed(3)}, ${fallbackDst.y.toFixed(3)}, ${fallbackDst.z.toFixed(3)}), dir=(${direction.x.toFixed(3)}, ${direction.y.toFixed(3)}, ${direction.z.toFixed(3)})`);

                // Get arrow length (including size multiplier)
                this.context.getStatsManager().startMeasurement("Edge.transformArrowCap.styleAndGeometry");
                const style = Styles.getStyleForEdgeStyleId(this.styleId);
                const arrowSize = style.arrowHead?.size ?? 1.0;
                const arrowLength = EdgeMesh.calculateArrowLength() * arrowSize;

                // Use actual bounding sphere radii
                const dstNodeRadius = this.dstNode.mesh.getBoundingInfo().boundingSphere.radiusWorld;
                const srcNodeRadius = this.srcNode.mesh.getBoundingInfo().boundingSphere.radiusWorld;
                this.context.getStatsManager().endMeasurement("Edge.transformArrowCap.styleAndGeometry");

                // Calculate surface intersection points
                this.context.getStatsManager().startMeasurement("Edge.transformArrowCap.vectorMath");
                const srcSurfacePoint = fallbackSrc.add(direction.scale(srcNodeRadius));
                const dstSurfacePoint = fallbackDst.subtract(direction.scale(dstNodeRadius));

                // Use common arrow geometry functions for positioning
                const arrowType = style.arrowHead?.type;
                const geometry = EdgeMesh.getArrowGeometry(arrowType ?? "normal");

                this.arrowMesh.setEnabled(true);

                // Calculate arrow position using common function
                const arrowPosition = EdgeMesh.calculateArrowPosition(
                    dstSurfacePoint,
                    direction,
                    arrowLength,
                    geometry,
                );

                // Calculate line endpoint using common function
                const lineEndPoint = EdgeMesh.calculateLineEndpoint(
                    dstSurfacePoint,
                    direction,
                    arrowLength,
                    geometry,
                );
                this.context.getStatsManager().endMeasurement("Edge.transformArrowCap.vectorMath");

                // Update arrow position directly (no thin instances)
                this.arrowMesh.position = arrowPosition;

                // Update lineDirection for filled arrows (shader needs it for billboarding)
                if (arrowType && ["normal", "inverted", "diamond", "box", "dot", "vee", "tee", "half-open", "crow", "empty", "open-diamond"].includes(arrowType)) {
                    // Filled arrows use shader-based billboarding via lineDirection uniform
                    FilledArrowRenderer.setLineDirection(this.arrowMesh as Mesh, direction);
                } else if (geometry.needsRotation) {
                    // CustomLineRenderer arrows need lookAt (like edge lines) instead of manual rotation
                    // Arrow geometry is along Z-axis, lookAt rotates it to point toward the edge direction
                    const lookAtPoint = arrowPosition.add(direction);
                    this.arrowMesh.lookAt(lookAtPoint);
                }

                return {
                    srcPoint: srcSurfacePoint,
                    dstPoint: lineEndPoint,
                };
            }

            this.arrowMesh.setEnabled(true);

            // Use common arrow geometry functions for positioning
            this.context.getStatsManager().startMeasurement("Edge.transformArrowCap.mainPath");
            const arrowStyle = Styles.getStyleForEdgeStyleId(this.styleId);
            const arrowType = arrowStyle.arrowHead?.type;
            const arrowSize = arrowStyle.arrowHead?.size ?? 1.0;
            const arrowLength = EdgeMesh.calculateArrowLength() * arrowSize;
            const geometry = EdgeMesh.getArrowGeometry(arrowType ?? "normal");
            const direction = dstPoint.subtract(srcPoint).normalize();

            // Calculate arrow position using common function
            const arrowPosition = EdgeMesh.calculateArrowPosition(
                dstPoint,
                direction,
                arrowLength,
                geometry,
            );
            this.context.getStatsManager().endMeasurement("Edge.transformArrowCap.mainPath");

            // Update arrow position directly (no thin instances)
            this.arrowMesh.position = arrowPosition;

            // Update lineDirection for filled arrows (shader needs it for billboarding)
            if (arrowType && ["normal", "inverted", "diamond", "box", "dot", "vee", "tee", "half-open", "crow", "empty", "open-diamond"].includes(arrowType)) {
                // Filled arrows use shader-based billboarding via lineDirection uniform
                FilledArrowRenderer.setLineDirection(this.arrowMesh as Mesh, direction);
            } else if (geometry.needsRotation) {
                // CustomLineRenderer arrows need lookAt (like edge lines) instead of manual rotation
                // Arrow geometry is along Z-axis, lookAt rotates it to point toward the edge direction
                const lookAtPoint = arrowPosition.add(direction);
                this.arrowMesh.lookAt(lookAtPoint);
            }

            // Handle arrow tail if configured
            let adjustedSrcPoint = srcPoint;
            if (this.arrowTailMesh) {
                const tailStyle = Styles.getStyleForEdgeStyleId(this.styleId);
                const tailType = tailStyle.arrowTail?.type;

                if (tailType && tailType !== "none") {
                    this.arrowTailMesh.setEnabled(true);

                    // Reverse direction for tail (points away from source toward destination)
                    const tailDirection = dstPoint.subtract(srcPoint).normalize();

                    // Get tail arrow dimensions and geometry
                    const tailSize = tailStyle.arrowTail?.size ?? 1.0;
                    const tailLength = EdgeMesh.calculateArrowLength() * tailSize;
                    const tailGeometry = EdgeMesh.getArrowGeometry(tailType);

                    // Calculate tail position using common function
                    // For tail, we negate the direction since it points away from source
                    const tailPosition = EdgeMesh.calculateArrowPosition(
                        srcPoint,
                        tailDirection.scale(-1), // Reverse direction for tail
                        tailLength,
                        tailGeometry,
                    );

                    // Tail points in opposite direction (away from source)
                    const reversedDirection = direction.scale(-1);

                    // Update arrow tail position directly (no thin instances)
                    this.arrowTailMesh.position = tailPosition;

                    // Update lineDirection for filled arrow tails (shader needs it for billboarding)
                    if (["normal", "inverted", "diamond", "box", "dot", "vee", "tee", "half-open", "crow", "empty", "open-diamond"].includes(tailType)) {
                        // Filled arrows use shader-based billboarding via lineDirection uniform
                        FilledArrowRenderer.setLineDirection(this.arrowTailMesh as Mesh, reversedDirection);
                    } else if (tailGeometry.needsRotation) {
                        // Other arrow types need explicit rotation
                        // Triangle in XY plane with tip at origin, pointing in +X direction
                        // Z rotation: horizontal angle in XY plane
                        const angleZ = Math.atan2(reversedDirection.y, reversedDirection.x);

                        // Y rotation: tilt forward/back to match edge depth
                        const horizontalDist = Math.sqrt((reversedDirection.x * reversedDirection.x) + (reversedDirection.y * reversedDirection.y));
                        const angleY = -Math.atan2(reversedDirection.z, horizontalDist);

                        // Apply rotations
                        this.arrowTailMesh.rotation.x = 0;
                        this.arrowTailMesh.rotation.y = angleY;
                        this.arrowTailMesh.rotation.z = angleZ;
                    }

                    // Adjust line start point to create gap for tail arrow
                    adjustedSrcPoint = EdgeMesh.calculateLineEndpoint(
                        srcPoint,
                        tailDirection.scale(-1), // Reverse direction for tail
                        tailLength,
                        tailGeometry,
                    );
                }
            }

            return {
                srcPoint: adjustedSrcPoint,
                dstPoint: newEndPoint, // Line ends before arrow to create gap for arrow to fill
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
                const arrowLength = EdgeMesh.calculateArrowLength() * arrowSize;
                const arrowType = style.arrowHead?.type ?? "normal";
                const geometry = EdgeMesh.getArrowGeometry(arrowType);

                // Use common function to calculate line endpoint
                // Direction points FROM source TO destination (forward direction)
                const direction = dstPoint.subtract(srcPoint).normalize();
                newEndPoint = EdgeMesh.calculateLineEndpoint(
                    dstPoint,
                    direction,
                    arrowLength,
                    geometry,
                );
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
