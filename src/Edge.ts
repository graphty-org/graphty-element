import {
    AbstractMesh,
    Matrix,
    Mesh,
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
    arrowMeshInstanceIndex = -1; // Thin instance index for filled arrows
    arrowTailMesh: AbstractMesh | null = null;
    arrowTailMeshInstanceIndex = -1; // Thin instance index for filled arrow tails
    styleId: EdgeStyleId;
    // XXX: performance impact when not needed?
    ray: Ray;
    label: RichTextLabel | null = null;
    private _loggedLineDirection = false; // Debug flag for logging lineDirection

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

    /**
     * Check if an arrow type is a filled arrow (uses thin instances)
     */
    private isFilledArrow(type: string | undefined): boolean {
        const FILLED_ARROWS = ["normal", "inverted", "diamond", "box", "dot"];
        return FILLED_ARROWS.includes(type ?? "");
    }

    /**
     * Update thin instance transform and lineDirection for filled arrows
     */
    private updateFilledArrowInstance(
        arrowMesh: Mesh,
        instanceIndex: number,
        position: Vector3,
        lineDirection: Vector3,
    ): void {
        // Create transformation matrix with ONLY translation
        // Rotation is handled by the shader via tangent billboarding
        const matrix = Matrix.Translation(position.x, position.y, position.z);

        // Update thin instance matrix
        arrowMesh.thinInstanceSetMatrixAt(instanceIndex, matrix);

        // Update lineDirection attribute (used by shader for tangent billboarding)
        arrowMesh.thinInstanceSetAttributeAt("lineDirection", instanceIndex, [
            lineDirection.x,
            lineDirection.y,
            lineDirection.z,
        ]);

        // CRITICAL: Notify BabylonJS that thin instance buffers have been updated!
        // Without these calls, the GPU never receives the updated data
        arrowMesh.thinInstanceBufferUpdated("matrix");
        arrowMesh.thinInstanceBufferUpdated("lineDirection");
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
                size: style.arrowHead?.size,
                opacity: style.arrowHead?.opacity,
            },
            this.context.getScene(),
        );

        // If this is a filled arrow (uses thin instances), create an instance
        if (this.arrowMesh && this.isFilledArrow(style.arrowHead?.type)) {
            // Check if mesh has thinInstanceAdd (only true Mesh objects, not AbstractMesh)
            if ("thinInstanceAdd" in this.arrowMesh) {
                this.arrowMeshInstanceIndex = (this.arrowMesh as Mesh).thinInstanceAdd(Matrix.Identity());
            }
        }

        // create arrow tail mesh if needed
        this.arrowTailMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            `${String(this.styleId)}-tail`,
            {
                type: style.arrowTail?.type ?? "none",
                width: style.line?.width ?? 0.25,
                color: style.arrowTail?.color ?? style.line?.color ?? "#FFFFFF",
                size: style.arrowTail?.size,
                opacity: style.arrowTail?.opacity,
            },
            this.context.getScene(),
        );

        // If this is a filled arrow (uses thin instances), create an instance
        if (this.arrowTailMesh && this.isFilledArrow(style.arrowTail?.type)) {
            // Check if mesh has thinInstanceAdd (only true Mesh objects, not AbstractMesh)
            if ("thinInstanceAdd" in this.arrowTailMesh) {
                this.arrowTailMeshInstanceIndex = (this.arrowTailMesh as Mesh).thinInstanceAdd(Matrix.Identity());
            }
        }

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
            // If this was a filled arrow using thin instances, hide it by moving far away
            const oldStyle = Styles.getStyleForEdgeStyleId(this.styleId);
            if (this.isFilledArrow(oldStyle.arrowHead?.type) && this.arrowMeshInstanceIndex >= 0) {
                // Move instance far away to hide it (thin instances can't be easily removed)
                const hideMatrix = Matrix.Translation(100000, 100000, 100000);
                (this.arrowMesh as Mesh).thinInstanceSetMatrixAt(this.arrowMeshInstanceIndex, hideMatrix);
                this.arrowMeshInstanceIndex = -1;
            } else {
                // Otherwise dispose the mesh (for non-cached arrows like billboard types)
                this.arrowMesh.dispose();
            }
        }

        this.arrowMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            String(styleId),
            {
                type: style.arrowHead?.type ?? "none",
                width: style.line?.width ?? 0.25,
                color: style.arrowHead?.color ?? style.line?.color ?? "#FFFFFF",
                size: style.arrowHead?.size,
                opacity: style.arrowHead?.opacity,
            },
            this.context.getScene(),
        );

        // If new arrow is filled, create thin instance
        if (this.arrowMesh && this.isFilledArrow(style.arrowHead?.type)) {
            // Check if mesh has thinInstanceAdd (only true Mesh objects, not AbstractMesh)
            if ("thinInstanceAdd" in this.arrowMesh) {
                this.arrowMeshInstanceIndex = (this.arrowMesh as Mesh).thinInstanceAdd(Matrix.Identity());
            }
        }

        // recreate arrow tail mesh if needed
        if (this.arrowTailMesh && !this.arrowTailMesh.isDisposed()) {
            // If this was a filled arrow using thin instances, hide it by moving far away
            const oldStyle = Styles.getStyleForEdgeStyleId(this.styleId);
            if (this.isFilledArrow(oldStyle.arrowTail?.type) && this.arrowTailMeshInstanceIndex >= 0) {
                // Move instance far away to hide it (thin instances can't be easily removed)
                const hideMatrix = Matrix.Translation(100000, 100000, 100000);
                (this.arrowTailMesh as Mesh).thinInstanceSetMatrixAt(this.arrowTailMeshInstanceIndex, hideMatrix);
                this.arrowTailMeshInstanceIndex = -1;
            } else {
                // Otherwise dispose the mesh (for non-cached arrows like billboard types)
                this.arrowTailMesh.dispose();
            }
        }

        this.arrowTailMesh = EdgeMesh.createArrowHead(
            this.context.getMeshCache(),
            `${String(styleId)}-tail`,
            {
                type: style.arrowTail?.type ?? "none",
                width: style.line?.width ?? 0.25,
                color: style.arrowTail?.color ?? style.line?.color ?? "#FFFFFF",
                size: style.arrowTail?.size,
                opacity: style.arrowTail?.opacity,
            },
            this.context.getScene(),
        );

        // If new arrow tail is filled, create thin instance
        if (this.arrowTailMesh && this.isFilledArrow(style.arrowTail?.type)) {
            // Check if mesh has thinInstanceAdd (only true Mesh objects, not AbstractMesh)
            if ("thinInstanceAdd" in this.arrowTailMesh) {
                this.arrowTailMeshInstanceIndex = (this.arrowTailMesh as Mesh).thinInstanceAdd(Matrix.Identity());
            }
        }

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

                // DEBUG: Log node positions and calculated direction
                // console.log(`Edge: src=(${fallbackSrc.x.toFixed(3)}, ${fallbackSrc.y.toFixed(3)}, ${fallbackSrc.z.toFixed(3)}), dst=(${fallbackDst.x.toFixed(3)}, ${fallbackDst.y.toFixed(3)}, ${fallbackDst.z.toFixed(3)}), dir=(${direction.x.toFixed(3)}, ${direction.y.toFixed(3)}, ${direction.z.toFixed(3)})`);

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

                // Handle filled arrows (thin instances) vs other arrow types
                if (this.isFilledArrow(arrowType) && this.arrowMeshInstanceIndex >= 0) {
                    // Filled arrows: Update thin instance with position and lineDirection
                    this.updateFilledArrowInstance(
                        this.arrowMesh as Mesh,
                        this.arrowMeshInstanceIndex,
                        arrowPosition,
                        direction,
                    );
                } else {
                    // Other arrow types: Update position and rotation directly
                    this.arrowMesh.position = arrowPosition;

                    // Rotate arrow to point along edge
                    if (geometry.needsRotation) {
                        // Use the edge direction (same as used for positioning)
                        // Triangle in XY plane with tip at origin, pointing in +X direction
                        // Rotate to align +X with edge direction

                        // Z rotation: horizontal angle in XY plane
                        const angleZ = Math.atan2(direction.y, direction.x);

                        // Y rotation: tilt forward/back to match edge depth
                        const horizontalDist = Math.sqrt((direction.x * direction.x) + (direction.y * direction.y));
                        const angleY = -Math.atan2(direction.z, horizontalDist);

                        // Apply rotations
                        this.arrowMesh.rotation.x = 0; // No roll needed
                        this.arrowMesh.rotation.y = angleY;
                        this.arrowMesh.rotation.z = angleZ;
                    }
                }

                return {
                    srcPoint: srcSurfacePoint,
                    dstPoint: lineEndPoint,
                };
            }

            this.arrowMesh.setEnabled(true);

            // Use common arrow geometry functions for positioning
            const arrowStyle = Styles.getStyleForEdgeStyleId(this.styleId);
            const arrowType = arrowStyle.arrowHead?.type;
            const arrowSize = arrowStyle.arrowHead?.size ?? 1.0;
            const arrowLength = EdgeMesh.calculateArrowLength(arrowStyle.line?.width ?? 0.25) * arrowSize;
            const geometry = EdgeMesh.getArrowGeometry(arrowType ?? "normal");
            const direction = dstPoint.subtract(srcPoint).normalize();

            // Calculate arrow position using common function
            const arrowPosition = EdgeMesh.calculateArrowPosition(
                dstPoint,
                direction,
                arrowLength,
                geometry,
            );

            // Handle filled arrows (thin instances) vs other arrow types
            if (this.isFilledArrow(arrowType) && this.arrowMeshInstanceIndex >= 0) {
                // Filled arrows: Update thin instance with position and lineDirection
                this.updateFilledArrowInstance(
                    this.arrowMesh as Mesh,
                    this.arrowMeshInstanceIndex,
                    arrowPosition,
                    direction,
                );
            } else {
                // Other arrow types: Update position and rotation directly
                this.arrowMesh.position = arrowPosition;

                // Rotate arrow to point along edge
                // NOTE: Filled arrows use tangent billboarding shaders and don't need rotation
                // Only apply rotation to arrows that need it (outline arrows, 3D billboard arrows)
                if (geometry.needsRotation) {
                    // Use the edge direction (same as used for positioning)
                    // Triangle in XY plane with tip at origin, pointing in +X direction
                    // Rotate to align +X with edge direction

                    // Z rotation: horizontal angle in XY plane
                    const angleZ = Math.atan2(direction.y, direction.x);

                    // Y rotation: tilt forward/back to match edge depth
                    const horizontalDist = Math.sqrt((direction.x * direction.x) + (direction.y * direction.y));
                    const angleY = -Math.atan2(direction.z, horizontalDist);

                    // Apply rotations
                    this.arrowMesh.rotation.x = 0; // No roll needed
                    this.arrowMesh.rotation.y = angleY;
                    this.arrowMesh.rotation.z = angleZ;
                } else {
                    // For billboard arrows, reset rotation
                    this.arrowMesh.rotation.x = 0;
                    this.arrowMesh.rotation.y = 0;
                    this.arrowMesh.rotation.z = 0;
                }
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
                    const tailLength = EdgeMesh.calculateArrowLength(tailStyle.line?.width ?? 0.25) * tailSize;
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

                    // Handle filled arrows (thin instances) vs other arrow types
                    if (this.isFilledArrow(tailType) && this.arrowTailMeshInstanceIndex >= 0) {
                        // Filled arrows: Update thin instance with position and lineDirection
                        this.updateFilledArrowInstance(
                            this.arrowTailMesh as Mesh,
                            this.arrowTailMeshInstanceIndex,
                            tailPosition,
                            reversedDirection,
                        );
                    } else {
                        // Other arrow types: Update position and rotation directly
                        this.arrowTailMesh.position = tailPosition;

                        // Rotate arrow tail to point along edge (away from source)
                        if (tailGeometry.needsRotation) {
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
                const arrowLength = EdgeMesh.calculateArrowLength(style.line?.width ?? 0.25) * arrowSize;
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
