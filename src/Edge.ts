import {
    AbstractMesh,
    Ray,
    Vector3,
} from "@babylonjs/core";
import jmespath from "jmespath";

import type {AdHocData, EdgeStyleConfig} from "./config";
import type {Graph} from "./Graph";
import {EdgeMesh} from "./meshes/EdgeMesh";
import {RichTextLabel, type RichTextLabelOptions} from "./meshes/RichTextLabel";
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
    parentGraph: Graph;
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

    constructor(graph: Graph, srcNodeId: NodeIdType, dstNodeId: NodeIdType, styleId: EdgeStyleId, data: AdHocData, opts: EdgeOpts = {}) {
        this.parentGraph = graph;
        this.srcId = srcNodeId;
        this.dstId = dstNodeId;
        this.id = `${srcNodeId}:${dstNodeId}`;
        this.data = data;
        this.opts = opts;

        // make sure both srcNode and dstNode already exist
        const srcNode = graph.nodeCache.get(srcNodeId);
        if (!srcNode) {
            throw new Error(`Attempting to create edge '${srcNodeId}->${dstNodeId}', Node '${srcNodeId}' hasn't been created yet.`);
        }

        const dstNode = graph.nodeCache.get(dstNodeId);
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
        // Only add to layout engine if it's already initialized
        // Otherwise, it will be added when the layout is set
        this.parentGraph.layoutEngine?.addEdge(this);

        // create mesh
        const style = Styles.getStyleForEdgeStyleId(this.styleId);

        // create arrow mesh if needed
        this.arrowMesh = EdgeMesh.createArrowHead(
            this.parentGraph.meshCache,
            String(this.styleId),
            {
                type: style.arrowHead?.type ?? "none",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
        );

        // create edge line mesh
        this.mesh = EdgeMesh.create(
            this.parentGraph.meshCache,
            {
                styleId: String(this.styleId),
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            this.parentGraph.scene,
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
        const lnk = this.parentGraph.layoutEngine?.getEdgePosition(this);
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
        if (styleId === this.styleId) {
            return;
        }

        this.styleId = styleId;
        this.mesh.dispose();

        const style = Styles.getStyleForEdgeStyleId(styleId);

        // recreate arrow mesh if needed
        if (this.arrowMesh) {
            this.arrowMesh.dispose();
        }

        this.arrowMesh = EdgeMesh.createArrowHead(
            this.parentGraph.meshCache,
            String(styleId),
            {
                type: style.arrowHead?.type ?? "none",
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
        );

        // recreate edge line mesh
        this.mesh = EdgeMesh.create(
            this.parentGraph.meshCache,
            {
                styleId: String(styleId),
                width: style.line?.width ?? 0.25,
                color: style.line?.color ?? "#FFFFFF",
            },
            style,
            this.parentGraph.scene,
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

    static updateRays(g: Graph): void {
        if (!g.needRays) {
            return;
        }

        if (!g.layoutEngine) {
            return;
        }

        for (const e of g.layoutEngine.edges) {
            const srcMesh = e.srcNode.mesh;
            const dstMesh = e.dstNode.mesh;

            const style = Styles.getStyleForEdgeStyleId(e.styleId);
            if (style.arrowHead?.type === undefined || style.arrowHead.type === "none") {
                // TODO: this could be faster
                continue;
            }

            // RayHelper.CreateAndShow(ray, e.parentGraph.scene, Color3.Red());

            // XXX: position is missing from Ray TypeScript definition
            (e.ray as RayWithPosition).position = dstMesh.position;
            e.ray.direction = dstMesh.position.subtract(srcMesh.position);
        }

        // this sucks for performance, but we have to do a full render pass
        // to update rays and intersections
        g.scene.render();
    }

    transformEdgeMesh(srcPoint: Vector3, dstPoint: Vector3): void {
        EdgeMesh.transformMesh(this.mesh, srcPoint, dstPoint);
    }

    transformArrowCap(): EdgeLine {
        if (this.arrowMesh) {
            this.parentGraph.stats.arrowCapUpdate.beginMonitoring();
            const {srcPoint, dstPoint, newEndPoint} = this.getInterceptPoints();

            // If we can't find intercept points, fall back to approximate positions
            if (!srcPoint || !dstPoint || !newEndPoint) {
                const fallbackSrc = this.srcNode.mesh.position;
                const fallbackDst = this.dstNode.mesh.position;

                // Hide arrow if nodes are too close or at same position
                if (fallbackSrc.equalsWithEpsilon(fallbackDst, 0.01)) {
                    this.arrowMesh.setEnabled(false);
                    this.parentGraph.stats.arrowCapUpdate.endMonitoring();
                    return {
                        srcPoint: fallbackSrc,
                        dstPoint: fallbackDst,
                    };
                }

                // Calculate approximate positions based on node sizes
                const direction = fallbackDst.subtract(fallbackSrc).normalize();
                const style = Styles.getStyleForEdgeStyleId(this.styleId);
                const arrowLen = EdgeMesh.calculateArrowLength(style.line?.width ?? 0.25);

                // Estimate node radius (assuming spherical nodes)
                const dstNodeRadius = this.dstNode.size || 1;
                const srcNodeRadius = this.srcNode.size || 1;

                // Position arrow at edge of destination node
                const approxDstPoint = fallbackDst.subtract(direction.scale(dstNodeRadius));
                const approxSrcPoint = fallbackSrc.add(direction.scale(srcNodeRadius));
                const approxNewEndPoint = approxDstPoint.subtract(direction.scale(arrowLen));

                this.arrowMesh.setEnabled(true);
                this.arrowMesh.position = approxDstPoint;
                this.arrowMesh.lookAt(this.dstNode.mesh.position);

                this.parentGraph.stats.arrowCapUpdate.endMonitoring();
                return {
                    srcPoint: approxSrcPoint,
                    dstPoint: approxNewEndPoint,
                };
            }

            this.arrowMesh.setEnabled(true);
            this.arrowMesh.position = dstPoint;
            this.arrowMesh.lookAt(this.dstNode.mesh.position);

            this.parentGraph.stats.arrowCapUpdate.endMonitoring();
            return {
                srcPoint,
                dstPoint: newEndPoint,
                // dstPoint,
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
        this.parentGraph.stats.intersectCalc.beginMonitoring();
        const dstHitInfo = this.ray.intersectsMeshes([dstMesh]);
        const srcHitInfo = this.ray.intersectsMeshes([srcMesh]);
        this.parentGraph.stats.intersectCalc.endMonitoring();

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
                const len = EdgeMesh.calculateArrowLength(style.line?.width ?? 0.25);
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
        return new RichTextLabel(this.parentGraph.scene, labelOptions);
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
        const location = styleConfig.label?.location ?? "center";
        const attachPosition = location === "automatic" ? "center" : location;

        const labelOptions: RichTextLabelOptions = {
            text: labelText,
            attachPosition: attachPosition,
            attachOffset: styleConfig.label?.attachOffset ?? 0,
        };

        const {label} = styleConfig;
        if (!label) {
            return labelOptions;
        }

        // Copy all relevant properties
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
        ];

        for (const prop of propertiesToCopy) {
            if (prop in label && label[prop as keyof typeof label] !== undefined) {
                const value = label[prop as keyof typeof label];
                (labelOptions as Record<string, unknown>)[prop] = value;
            }
        }

        return labelOptions;
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
