import {
    AbstractMesh,
    Color3,
    CreateGreasedLine,
    Engine,
    GreasedLineBaseMesh,
    GreasedLineMeshColorMode,
    GreasedLineMeshWidthDistribution,
    GreasedLineTools,
    RawTexture,
    Ray,
    StandardMaterial,
    Vector3,
} from "@babylonjs/core";
import {Node, NodeIdType} from "./Node";
import type {EdgeStyleConfig} from "./config";
import type {Graph} from "./Graph";
import {EdgeStyleId, Styles} from "./Styles";

interface EdgeOpts {
    metadata?: object;
}

export class Edge {
    parentGraph: Graph;
    opts: EdgeOpts;
    srcId: NodeIdType;
    dstId: NodeIdType;
    dstNode: Node;
    srcNode: Node;
    data: Record<string | number, unknown>;
    mesh: AbstractMesh;
    arrowMesh: AbstractMesh | null = null;
    styleId: EdgeStyleId;
    // XXX: performance impact when not needed?
    ray: Ray;

    constructor(graph: Graph, srcNodeId: NodeIdType, dstNodeId: NodeIdType, styleId: EdgeStyleId, data: Record<string | number, unknown>, opts: EdgeOpts = {}) {
        this.parentGraph = graph;
        this.srcId = srcNodeId;
        this.dstId = dstNodeId;
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
        this.parentGraph.layoutEngine.addEdge(this);

        // create mesh
        this.mesh = Edge.defaultEdgeMeshFactory(this, this.parentGraph, this.styleId);
    }

    update(): void {
        const lnk = this.parentGraph.layoutEngine.getEdgePosition(this);

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
    }

    updateStyle(styleId: EdgeStyleId): void {
        if (styleId === this.styleId) {
            return;
        }

        this.mesh.dispose();
        this.mesh = Edge.defaultEdgeMeshFactory(this, this.parentGraph, this.styleId);
    }

    static updateRays(g: Graph): void {
        if (!g.needRays) {
            return;
        }

        for (const e of g.layoutEngine.edges) {
            const srcMesh = e.srcNode.mesh;
            const dstMesh = e.dstNode.mesh;

            const style = Styles.getStyleForEdgeStyleId(e.styleId);
            if (style?.arrowHead?.type === undefined || style.arrowHead.type === "none") {
                // TODO: this could be faster
                continue;
            }

            // RayHelper.CreateAndShow(ray, e.parentGraph.scene, Color3.Red());

            // XXX: position is missing from Ray TypeScript definition
            /* eslint-disable  @typescript-eslint/no-explicit-any */
            (e.ray as any).position = dstMesh.position;
            e.ray.direction = dstMesh.position.subtract(srcMesh.position);
        }

        // this sucks for performance, but we have to do a full render pass
        // to update rays and intersections
        g.scene.render();
    }

    static defaultEdgeMeshFactory(e: Edge, g: Graph, styleId: EdgeStyleId): AbstractMesh {
        const o = Styles.getStyleForEdgeStyleId(styleId);
        if (o.arrowHead && o.arrowHead.type !== "none") {
            e.arrowMesh = g.meshCache.get(`edge-style-${styleId}`, () => {
                const width = getArrowCapWidth(o?.line?.width ?? 0.25);
                const len = getArrowCapLen(o?.line?.width ?? 0.25);
                const cap1 = GreasedLineTools.GetArrowCap(
                    new Vector3(0, 0, -len), // position
                    new Vector3(0, 0, 1), // direction
                    len, // length
                    width, // widthUp
                    width, // widthDown
                );
                return CreateGreasedLine(
                    "lines",
                    {
                        points: cap1.points,
                        widths: cap1.widths,
                        widthDistribution: GreasedLineMeshWidthDistribution.WIDTH_DISTRIBUTION_START,
                        // instance: line,
                    },
                    {
                        color: Color3.FromHexString(o?.line?.color ?? "#FFFFFF"),
                    },
                    // e.parentGraph.scene
                );
            });
        }

        const mesh = g.meshCache.get("default-edge", () => {
            if (o?.line?.animationSpeed) {
                return Edge.createMovingLine(e, g, o);
            }

            return Edge.createPlainLine(e, g, o);
        });

        mesh.isPickable = false;
        mesh.metadata = {};
        mesh.metadata.parentEdge = this;

        return mesh;
    }

    static createPlainLine(_e: Edge, _g: Graph, o: EdgeStyleConfig): GreasedLineBaseMesh {
        return CreateGreasedLine("edge-plain",
            {
                points: Edge.unitVectorPoints,
            },
            {
                color: Color3.FromHexString(o?.line?.color ?? "#FFFFFFF"),
                width: o?.line?.width ?? 0.25,
            },
        );
    }

    static createMovingLine(_e: Edge, g: Graph, o: EdgeStyleConfig): GreasedLineBaseMesh {
        // const baseColor = Color3.FromHexString(o.movingLineOpts.baseColor.slice(0, 7));
        const baseColor = Color3.FromHexString("#D3D3D3");

        const movingColor = Color3.FromHexString(o?.line?.color ?? "#FF0000");
        const r1 = Math.floor(baseColor.r * 255);
        const g1 = Math.floor(baseColor.g * 255);
        const b1 = Math.floor(baseColor.b * 255);
        const r2 = Math.floor(movingColor.r * 255);
        const g2 = Math.floor(movingColor.g * 255);
        const b2 = Math.floor(movingColor.b * 255);

        const textureColors = new Uint8Array([r1, g1, b1, r2, g2, b2]);
        const texture = new RawTexture(
            textureColors, // data
            textureColors.length / 3, // width
            1, // height
            Engine.TEXTUREFORMAT_RGB, // format
            g.scene, // sceneOrEngine
            false, // generateMipMaps
            true, // invertY
            Engine.TEXTURE_NEAREST_NEAREST, // samplingMode
            // samplingMode
            // type
            // creationFlags
            // useSRGBBuffer
        );
        texture.wrapU = RawTexture.WRAP_ADDRESSMODE;
        texture.name = "moving-texture";

        const mesh = CreateGreasedLine("edge-moving",
            {
                points: Edge.unitVectorPoints,
            },
            {
                // color: Color3.FromHexString(colorNameToHex(edgeColor))
                width: o?.line?.width ?? 0.25,
                colorMode: GreasedLineMeshColorMode.COLOR_MODE_MULTIPLY,
            },
        );

        const material = mesh.material as StandardMaterial;
        material.emissiveTexture = texture;
        material.disableLighting = true;
        texture.uScale = 5;

        g.scene.onBeforeRenderObservable.add(() => {
            texture.uOffset -= 0.04 * g.scene.getAnimationRatio();
        });

        return mesh;
    }

    transformEdgeMesh(srcPoint: Vector3, dstPoint: Vector3) {
        const delta = dstPoint.subtract(srcPoint);
        const midPoint = new Vector3(
            srcPoint.x + (delta.x / 2),
            srcPoint.y + (delta.y / 2),
            srcPoint.z + (delta.z / 2),
        );
        const len = delta.length();

        this.mesh.position = midPoint;
        this.mesh.lookAt(dstPoint);
        this.mesh.scaling.z = len;
    }

    transformArrowCap() {
        if (this.arrowMesh) {
            this.parentGraph.stats.arrowCapUpdate.beginMonitoring();
            const {srcPoint, dstPoint, newEndPoint} = this.getInterceptPoints();
            if (!srcPoint || !dstPoint || !newEndPoint) {
                throw new Error("Internal Error: mesh intercept points not found");
            }

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

    getInterceptPoints() {
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
            const len = getArrowCapLen(style?.line?.width ?? 0.25);

            dstPoint = dstHitInfo[0].pickedPoint!;
            srcPoint = srcHitInfo[0].pickedPoint!;
            const distance = srcPoint.subtract(dstPoint).length();
            const adjDistance = distance - len;
            const {x: x1, y: y1, z: z1} = srcPoint;
            const {x: x2, y: y2, z: z2} = dstPoint;
            // calculate new line endpoint along line between midpoints of meshes
            const x3 = x1 + ((adjDistance / distance) * (x2 - x1));
            const y3 = y1 + ((adjDistance / distance) * (y2 - y1));
            const z3 = z1 + ((adjDistance / distance) * (z2 - z1));
            newEndPoint = new Vector3(x3, y3, z3);
        }

        return {
            srcPoint,
            dstPoint,
            newEndPoint,
        };
    }

    static get unitVectorPoints(): Array<number> {
        return [
            // start point
            0,
            0,
            -0.5,
            // end point
            0,
            0,
            0.5,
        ];
    }
}

function getArrowCapWidth(w: number): number {
    return Math.max(20 * w, 4);
}

function getArrowCapLen(w: number): number {
    return Math.max(w, 0.5);
}

export class EdgeMap {
    map: Map<NodeIdType, Map<NodeIdType, Edge>> = new Map();

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
}
