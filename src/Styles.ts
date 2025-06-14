import {
    EdgeStyle,
    EdgeStyleConfig,
    GraphKnownFields,
    GraphKnownFieldsType,
    NodeStyle,
    NodeStyleConfig,
    StyleLayerType,
    StyleSchemaV1,
    StyleTemplate,
    defaultNodeStyle,
} from "./config";

import defaultsDeep from "lodash.defaultsdeep";
import jmespath from "jmespath";

export interface StylesOpts {
    layers?: object,
    addDefaultStyle?: boolean,
    knownFields?: GraphKnownFieldsType,
}

export class Styles {
    readonly knownFields: GraphKnownFieldsType;
    readonly config: StyleSchemaV1;
    readonly layers: StyleLayerType[];
    readonly layerSelectedEdges: Array<Set<string | number>> = [];

    constructor(config: StyleSchemaV1) {
        this.knownFields = config.expectedSchema?.knownFields || GraphKnownFields.parse({});
        this.config = config;
        this.layers = config.layers;

        if (this.config.graph.addDefaultStyle) {
            this.addLayer({
                node: {
                    selector: "",
                    style: NodeStyle.parse(defaultNodeStyle),
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
        return this.fromObject(o);
    }

    static fromObject(obj: object): Styles {
        const config = StyleTemplate.parse(obj);
        if (!config.graphtyTemplate) {
            throw new TypeError("styles config does not appear to be a graphty template");
        }

        if (config.majorVersion !== "1") {
            throw new TypeError(`unsupported graphty template version: ${config.majorVersion}`);
        }

        return new Styles(config);
    }

    static async fromUrl(url: string): Promise<Styles> {
        const response = await fetch(url);
        if (!response.body) {
            throw new Error("JSON response had no body");
        }

        const data = await response.json();

        return Styles.fromObject(data);
    }

    static default(): Styles {
        return Styles.fromObject({
            graphtyTemplate: true,
            majorVersion: "1",
        });
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

    getStyleForNode(data: Record<string, unknown>): NodeStyleConfig {
        const styles: Array<NodeStyleConfig> = [];
        for (let i = 0; i < this.layers.length; i++) {
            const {node} = this.layers[i];
            const nodeMatch = node &&
                node.selector !== undefined &&
                (node.selector.length === 0 || jmespath.search(data, `[${node.selector}] == true`));
            if (nodeMatch) {
                styles.unshift(node.style);
            }
        }

        // TODO: cache of previously calculated styles to save time?

        const ret = defaultsDeep({}, ... styles);
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
