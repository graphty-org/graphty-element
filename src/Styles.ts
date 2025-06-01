import {EdgeStyleOpts, EdgeStyleOptsType, NodeStyleOpts, NodeStyleOptsType, StyleLayerType, StyleSchema, StyleSchemaType} from "./config";
import defaultsDeep from "lodash.defaultsdeep";
import jmespath from "jmespath";

const defaultNodeStyle = NodeStyleOpts.parse({});

export interface StylesOpts {
    layers?: object,
    addDefaultStyle?: boolean,
}

export class Styles {
    readonly layers: StyleSchemaType = [];
    readonly layerSelectedNodes: Array<Set<string | number>> = [];
    readonly layerSelectedEdges: Array<Set<string | number>> = [];

    constructor(opts: StylesOpts = {}) {
        if (opts.layers) {
            this.layers = StyleSchema.parse(opts.layers);
        } else {
            this.layers = [];
        }

        if (opts.addDefaultStyle) {
            this.addLayer({
                node: {
                    selector: "",
                    style: NodeStyleOpts.parse({}),
                },
                edge: {
                    selector: "",
                    style: EdgeStyleOpts.parse({}),
                },
            });
        }
    }

    static fromJson(json: string): Styles {
        const o = JSON.parse(json);
        return this.fromObject(o);
    }

    static fromObject(obj: object): Styles {
        return new Styles({layers: obj});
    }

    addNodes(nodeData: Array<object>, nodeIdPath: string = "id") {
        for (const layer of this.layers) {
            let selectedNodes: Set<string | number> = new Set();
            if (layer.node) {
                const selector = layer.node.selector.length ? `?${layer.node.selector}` : "";
                const query = `[${selector}].${nodeIdPath}`;
                const nodeIds = jmespath.search(nodeData, query);
                selectedNodes = new Set(nodeIds);
            }

            this.layerSelectedNodes.push(selectedNodes);
        }
    }

    addEdges(edgeData: Array<object>, edgeSrcPath = "source", edgeDstPath = "target") {
        for (const layer of this.layers) {
            let selectedEdges: Set<string | number> = new Set();
            if (layer.edge) {
                const selector = layer.edge.selector.length ? `?${layer.edge.selector}` : "";
                const query = `[${selector}].{src: ${edgeSrcPath}, dst: ${edgeDstPath}}`;
                const edgeSrcDst = jmespath.search(edgeData, query);
                selectedEdges = new Set(edgeSrcDst);
            }

            this.layerSelectedEdges.push(selectedEdges);
        }
    }

    addLayer(layer: StyleLayerType) {
        this.layers.push(layer);
    }

    insertLayer(position: number, layer: StyleLayerType) {
        this.layers.splice(position, 0, layer);
    }

    getStyleForNode(id: string | number): NodeStyleOptsType {
        const styles: Array<NodeStyleOptsType> = [];
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

    getStyleForEdge(id: string): EdgeStyleOptsType | null {
        const styles: Array<EdgeStyleOptsType> = [];
        for (let i = 0; i < this.layers.length; i++) {
            const {edge} = this.layers[i];
            if (this.layerSelectedEdges[i].has(id) && edge) {
                styles.push(edge.style);
            }
        }

        // TODO: cache of previously calculated styles to save time?

        const ret = defaultsDeep({}, ... styles);
        if (Object.keys(ret).length === 0) {
            return null;
        }

        return ret;
    }
}

export class Style {
    readonly nodeStyle: NodeStyleOptsType| null = null;
    readonly edgeStyle: EdgeStyleOptsType | null = null;

    constructor(nodeStyle: NodeStyleOptsType | null, edgeStyle: EdgeStyleOptsType | null) {
        if (!nodeStyle && !edgeStyle) {
            throw new Error("must specify one of nodeStyle or edgeStyle");
        }

        this.nodeStyle = nodeStyle;
        this.edgeStyle = edgeStyle;
    }
}
