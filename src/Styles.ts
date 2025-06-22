import {
    EdgeStyle,
    EdgeStyleConfig,
    NodeStyle,
    NodeStyleConfig,
    StyleLayerType,
    StyleSchemaV1,
    StyleTemplate,
    defaultEdgeStyle,
    defaultNodeStyle,
} from "./config";

import {defaultsDeep, isEqual} from "lodash";
import jmespath from "jmespath";

export interface StylesOpts {
    layers?: object,
    addDefaultStyle?: boolean,
}

export type NodeStyleId = number & { __brand: "NodeStyleId" };
export type EdgeStyleId = number & { __brand: "EdgeStyleId" };

export class Styles {
    readonly config: StyleSchemaV1;
    readonly layers: StyleLayerType[];
    #emptyNodeStyle: NodeStyleConfig;
    #emptyEdgeStyle: EdgeStyleConfig;

    constructor(config: StyleSchemaV1) {
        this.config = config;
        this.layers = config.layers;
        this.#emptyNodeStyle = NodeStyle.parse({});
        this.#emptyEdgeStyle = EdgeStyle.parse({});

        if (this.config.graph.addDefaultStyle) {
            this.layers.unshift({
                node: {
                    selector: "",
                    style: NodeStyle.parse(defaultNodeStyle),
                },
                edge: {
                    selector: "",
                    style: EdgeStyle.parse(defaultEdgeStyle),
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

    addLayer(layer: StyleLayerType) {
        this.layers.push(layer);

        // TODO: recalculate
    }

    insertLayer(position: number, layer: StyleLayerType) {
        this.layers.splice(position, 0, layer);

        // TODO: recalculate
    }

    getStyleForNode(data: Record<string | number | symbol, unknown>): NodeStyleId {
        const styles: NodeStyleConfig[] = [];
        for (let i = 0; i < this.layers.length; i++) {
            const {node} = this.layers[i];
            const nodeMatch = node?.selector !== undefined &&
                (node.selector.length === 0 || jmespath.search(data, `[${node.selector}] == true`));
            if (nodeMatch) {
                styles.unshift(node.style);
            }
        }

        const mergedStyle: NodeStyleConfig = defaultsDeep({}, ... styles, this.#emptyNodeStyle);
        if (styles.length === 0) {
            mergedStyle.enabled = false;
        }

        return Styles.getNodeIdForStyle(mergedStyle);
    }

    getStyleForEdge(data: Record<string | number | symbol, unknown>): EdgeStyleId {
        const styles: EdgeStyleConfig[] = [];
        for (let i = 0; i < this.layers.length; i++) {
            const {edge} = this.layers[i];
            const edgeMatch = edge?.selector !== undefined &&
                (edge.selector.length === 0 || jmespath.search(data, `[${edge.selector}] == true`));
            if (edgeMatch) {
                styles.unshift(edge.style);
            }
        }

        const mergedStyle: EdgeStyleConfig = defaultsDeep({}, ... styles, this.#emptyEdgeStyle);
        if (styles.length === 0) {
            mergedStyle.enabled = false;
        }

        return Styles.getEdgeIdForStyle(mergedStyle);
    }

    static getStyleForNodeStyleId(id: NodeStyleId): NodeStyleConfig {
        const ret = nodeStyleMap.get(id);
        if (!ret) {
            throw new TypeError(`couldn't find NodeStyleId: ${id}`);
        }

        return ret;
    }

    static getStyleForEdgeStyleId(id: EdgeStyleId): EdgeStyleConfig {
        const ret = edgeStyleMap.get(id);
        if (!ret) {
            throw new TypeError(`couldn't find NodeStyleId: ${id}`);
        }

        return ret;
    }

    static getNodeIdForStyle(style: NodeStyleConfig): NodeStyleId {
        return styleToId(nodeStyleMap, style);
    }

    static getEdgeIdForStyle(style: EdgeStyleConfig): EdgeStyleId {
        return styleToId(edgeStyleMap, style);
    }
}

const nodeStyleMap = new Map<NodeStyleId, NodeStyleConfig>();
const edgeStyleMap = new Map<EdgeStyleId, EdgeStyleConfig>();

function styleToId<IdT, StyleT>(map: Map<IdT, StyleT>, style: StyleT): IdT {
    let ret: IdT | undefined;
    for (const [k, v] of map.entries()) {
        if (isEqual(v, style)) {
            ret = k;
            break;
        }
    }

    if (ret === undefined) {
        ret = map.size as IdT;
        map.set(ret, style);
    }

    return ret;
}
