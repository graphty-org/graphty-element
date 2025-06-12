import {
    EdgeStyle,
    EdgeStyleConfig,
    GraphKnownFields,
    GraphKnownFieldsType,
    NodeStyle,
    NodeStyleConfig,
    StyleLayerType,
    StyleSchema,
    StyleSchemaType,
} from "./config";

import defaultsDeep from "lodash.defaultsdeep";
import jmespath from "jmespath";

const defaultNodeStyle = NodeStyle.parse({});

export interface StylesOpts {
    layers?: object,
    addDefaultStyle?: boolean,
    knownFields?: GraphKnownFieldsType,
}

export class Styles {
    readonly knownFields: GraphKnownFieldsType;
    readonly layers: StyleSchemaType = [];
    readonly layerSelectedNodes: Array<Set<string | number>> = [];
    readonly layerSelectedEdges: Array<Set<string | number>> = [];

    constructor(opts: StylesOpts = {}) {
        this.knownFields = opts.knownFields || GraphKnownFields.parse({});

        if (opts.layers) {
            this.layers = StyleSchema.parse(opts.layers);
        } else {
            this.layers = [];
        }

        if (opts.addDefaultStyle) {
            this.addLayer({
                node: {
                    selector: "",
                    style: NodeStyle.parse({}),
                },
                edge: {
                    selector: "",
                    style: EdgeStyle.parse({}),
                },
            });
        }
    }

    static fromJson(json: string): Styles {
        const o = JSON.parse(json);
        // TODO: opts.knownFields
        return this.fromObject(o);
    }

    static fromObject(obj: object): Styles {
        // TODO: opts.knownFields
        return new Styles({layers: obj});
    }

    addNodes(nodeData: Array<object>, nodeIdPath?: string) {
        const idQuery = nodeIdPath || this.knownFields.nodeIdPath;

        const id0 = jmespath.search(nodeData, `[0].${idQuery}`);
        if (id0 === null || id0 === undefined) {
            throw new TypeError("couldn't find node ID in first node data element");
        }

        for (const layer of this.layers) {
            let selectedNodes: Set<string | number> = new Set();
            if (layer.node) {
                const selector = layer.node.selector.length ? `?${layer.node.selector}` : "";
                const query = `[${selector}].${idQuery}`;
                const nodeIds = jmespath.search(nodeData, query);
                selectedNodes = new Set(nodeIds);
            }

            this.layerSelectedNodes.push(selectedNodes);
        }
    }

    addEdges(edgeData: Array<object>, edgeSrcIdPath?: string, edgeDstIdPath?: string) {
        const srcQuery = edgeSrcIdPath || this.knownFields.edgeSrcIdPath;
        const dstQuery = edgeDstIdPath || this.knownFields.edgeDstIdPath;

        const srcRet0 = jmespath.search(edgeData, `[0].[to_string(${srcQuery})]`);
        if (!srcRet0 || !Array.isArray(srcRet0) || srcRet0[0] === "null") {
            throw new TypeError("couldn't find edge source ID in first edge data element");
        }

        const dstRet0 = jmespath.search(edgeData, `[0].[to_string(${dstQuery})]`);
        if (!dstRet0 || !Array.isArray(dstRet0) || dstRet0[0] === "null") {
            throw new TypeError("couldn't find edge destination ID in first edge data element");
        }

        for (const layer of this.layers) {
            let selectedEdges: Set<string | number> = new Set();
            if (layer.edge) {
                const selector = layer.edge.selector.length ? `?${layer.edge.selector}` : "";
                const query = `[${selector}].[to_string(${srcQuery}), to_string(${dstQuery})] | [*].join(',',@)`;
                const edgeSrcDst = jmespath.search(edgeData, query);
                selectedEdges = new Set(edgeSrcDst);
            }

            this.layerSelectedEdges.push(selectedEdges);
        }
    }

    addLayer(layer: StyleLayerType) {
        this.layers.push(layer);

        // TODO: recalculate
    }

    insertLayer(position: number, layer: StyleLayerType) {
        this.layers.splice(position, 0, layer);

        // TODO: recalculate
    }

    getStyleForNode(id: string | number): NodeStyleConfig {
        const styles: Array<NodeStyleConfig> = [];
        for (let i = 0; i < this.layers.length; i++) {
            const {node} = this.layers[i];
            if (this.layerSelectedNodes[i].has(id) && node) {
                styles.push(node.style);
            }
        }

        // TODO: cache of previously calculated styles to save time?

        const ret = defaultsDeep({}, ... styles, defaultNodeStyle);
        if (styles.length === 0) {
            ret.enabled = false;
        }

        return ret;
    }

    getStyleForEdge(srcId: string, dstId: string): EdgeStyleConfig {
        // XXX: this edgeId matches the output format of the jmespath query in addEdges
        const edgeId = `${srcId},${dstId}`;
        const styles: Array<EdgeStyleConfig> = [];
        for (let i = 0; i < this.layers.length; i++) {
            const {edge} = this.layers[i];
            if (this.layerSelectedEdges[i].has(edgeId) && edge) {
                styles.push(edge.style);
            }
        }

        // TODO: cache of previously calculated styles to save time?

        const ret = defaultsDeep({}, ... styles, EdgeStyle.parse({}));
        if (styles.length === 0) {
            ret.enabled = false;
        }

        return ret;
    }
}

export class Style {
    readonly nodeStyle: NodeStyleConfig | null = null;
    readonly edgeStyle: EdgeStyleConfig | null = null;

    constructor(nodeStyle: NodeStyleConfig | null, edgeStyle: EdgeStyleConfig | null) {
        if (!nodeStyle && !edgeStyle) {
            throw new Error("must specify one of nodeStyle or edgeStyle");
        }

        this.nodeStyle = nodeStyle;
        this.edgeStyle = edgeStyle;
    }
}
