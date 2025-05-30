import {EdgeStyleType, NodeStyleType, StyleLayerType, StyleSchema, StyleSchemaType} from "./config";
import defaultsDeep from "lodash.defaultsdeep";
import jmespath from "jmespath";

export class Styles {
    readonly layers: StyleSchemaType = [];
    dataLoaded = false;
    readonly layerSelectedNodes: Array<Set<string | number>> = [];
    readonly layerSelectedEdges: Array<Set<string | number>> = [];

    constructor(schema: string | object) {
        this.layers = StyleSchema.parse(schema);
    }

    static fromJson(json: string): Styles {
        const o = JSON.parse(json);
        return this.fromObject(o);
    }

    static fromObject(obj: object): Styles {
        return new Styles(obj);
    }

    applyData(nodeData: Array<object>, edgeData: Array<object>) {
        const nodeIdPath = "id";
        const edgeSrcPath = "source";
        const edgeDstPath = "target";

        this.layerSelectedEdges.length = 0;
        this.layerSelectedNodes.length = 0;

        for (const layer of this.layers) {
            let selectedNodes: Set<string | number> = new Set();
            if (layer.node) {
                const selector = layer.node.selector.length ? `?${layer.node.selector}` : "";
                const query = `[${selector}].${nodeIdPath}`;
                const nodeIds = jmespath.search(nodeData, query);
                selectedNodes = new Set(nodeIds);
            }

            this.layerSelectedNodes.push(selectedNodes);

            let selectedEdges: Set<string | number> = new Set();
            if (layer.edge) {
                const selector = layer.edge.selector.length ? `?${layer.edge.selector}` : "";
                const query = `[${selector}].{src: ${edgeSrcPath}, dst: ${edgeDstPath}}`;
                const edgeSrcDst = jmespath.search(edgeData, query);
                selectedEdges = new Set(edgeSrcDst);
            }

            this.layerSelectedEdges.push(selectedEdges);
        }

        this.dataLoaded = true;
    }

    addLayer(layer: StyleLayerType) {
        this.layers.push(layer);
    }

    insertLayer(position: number, layer: StyleLayerType) {
        this.layers.splice(position, 0, layer);
    }

    getStyleForNode(id: string | number): NodeStyleType {
        const styles: Array<NodeStyleType> = [];
        for (let i = 0; i < this.layers.length; i++) {
            const {node} = this.layers[i];
            if (this.layerSelectedNodes[i].has(id) && node) {
                styles.push(node.style);
            }
        }

        // TODO: cache of previously calculated styles to save time?

        const ret = defaultsDeep({}, ... styles);
        return ret;
    }
}

export class Style {
    readonly nodeStyle: NodeStyleType| null = null;
    readonly edgeStyle: EdgeStyleType | null = null;

    constructor(nodeStyle: NodeStyleType | null, edgeStyle: EdgeStyleType | null) {
        if (!nodeStyle && !edgeStyle) {
            throw new Error("must specify one of nodeStyle or edgeStyle");
        }

        this.nodeStyle = nodeStyle;
        this.edgeStyle = edgeStyle;
    }
}
