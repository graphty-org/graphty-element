import jmespath from "jmespath";
import {defaultsDeep, isEqual} from "lodash";

import {CalculatedValue} from "./CalculatedValue";
import {
    AdHocData,
    AppliedNodeStyleConfig,
    defaultEdgeStyle,
    defaultNodeStyle,
    EdgeStyle,
    EdgeStyleConfig,
    NodeStyle,
    NodeStyleConfig,
    StyleLayerType,
    StyleSchemaV1,
    StyleTemplate,
} from "./config";

export interface StylesOpts {
    layers?: object;
    addDefaultStyle?: boolean;
}

export type NodeStyleId = number & {__brand: "NodeStyleId"};
export type EdgeStyleId = number & {__brand: "EdgeStyleId"};

export class Styles {
    readonly config: StyleSchemaV1;
    #layers: StyleLayerType[];
    #emptyNodeStyle: NodeStyleConfig;
    #emptyEdgeStyle: EdgeStyleConfig;

    get layers(): readonly StyleLayerType[] {
        return this.#layers;
    }

    constructor(config: StyleSchemaV1) {
        this.config = config;
        this.#layers = config.layers;
        this.#emptyNodeStyle = NodeStyle.parse({});
        this.#emptyEdgeStyle = EdgeStyle.parse({});

        if (this.config.graph.addDefaultStyle) {
            this.#layers.unshift({
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
        // if (!config.graphtyTemplate) {
        //     throw new TypeError("styles config does not appear to be a graphty template");
        // }

        // if (config.majorVersion !== "1") {
        //     throw new TypeError(`unsupported graphty template version: ${config.majorVersion}`);
        // }

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

    addLayer(layer: StyleLayerType): void {
        this.#layers.push(layer);

        // TODO: recalculate
    }

    insertLayer(position: number, layer: StyleLayerType): void {
        this.#layers.splice(position, 0, layer);

        // TODO: recalculate
    }

    removeLayersByMetadata(predicate: (metadata: unknown) => boolean): boolean {
        const originalLength = this.#layers.length;
        this.#layers = this.#layers.filter((layer) => !predicate(layer.metadata));
        return this.#layers.length !== originalLength;
    }

    getStyleForNode(data: AdHocData, algorithmResults?: AdHocData): NodeStyleId {
        // Combine data and algorithmResults for selector matching
        const combinedData = algorithmResults ?
            {... data, algorithmResults} :
            data;

        const styles: NodeStyleConfig[] = [];
        for (const layer of this.layers) {
            const {node} = layer;

            const nodeMatch = selectorMatchesNode(node, combinedData);

            if (nodeMatch && node?.style) {
                styles.unshift(node.style);
            }
        }

        const mergedStyle: NodeStyleConfig = defaultsDeep({}, ... styles, this.#emptyNodeStyle);
        if (styles.length === 0) {
            mergedStyle.enabled = false;
        }

        return Styles.getNodeIdForStyle(mergedStyle);
    }

    getCalculatedStylesForNode(data: AdHocData): CalculatedValue[] {
        const ret: CalculatedValue[] = [];
        for (const layer of this.layers) {
            const {node} = layer;

            const nodeMatch = selectorMatchesNode(node, data);

            if (nodeMatch && node?.calculatedStyle) {
                const {inputs, output, expr} = node.calculatedStyle;
                const cv = new CalculatedValue(inputs, output, expr);
                ret.unshift(cv);
            }
        }

        return ret;
    }

    getCalculatedStylesForEdge(data: AdHocData): CalculatedValue[] {
        const ret: CalculatedValue[] = [];
        for (const layer of this.layers) {
            const {edge} = layer;

            // Check if edge selector matches
            let edgeMatch = edge?.selector === "";
            if (!edgeMatch && edge?.selector) {
                // try JMES match
                const searchResult = jmespath.search(data, `[${edge.selector}]`);
                if (Array.isArray(searchResult) && typeof searchResult[0] === "boolean") {
                    edgeMatch = searchResult[0];
                }
            }

            if (edgeMatch && edge?.calculatedStyle) {
                const {inputs, output, expr} = edge.calculatedStyle;
                const cv = new CalculatedValue(inputs, output, expr);
                ret.unshift(cv);
            }
        }

        return ret;
    }

    getStyleForEdge(data: AdHocData, algorithmResults?: AdHocData): EdgeStyleId {
        // Combine data and algorithmResults for selector matching
        const combinedData = algorithmResults ?
            {... data, algorithmResults} :
            data;

        const styles: EdgeStyleConfig[] = [];
        for (const layer of this.layers) {
            const {edge} = layer;
            let edgeMatch = edge?.selector === "";
            if (!edgeMatch) {
                // try JMES match
                const searchResult = jmespath.search(combinedData, `[${edge?.selector}]`);
                if (Array.isArray(searchResult) && typeof searchResult[0] === "boolean") {
                    edgeMatch = searchResult[0];
                }
            }

            if (edgeMatch && edge?.style) {
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

    // iterate through all defined styles to find a match
    for (const [k, v] of map.entries()) {
        if (isEqual(v, style)) {
            ret = k;
            break;
        }
    }

    // no matching style found, create a new one
    if (ret === undefined) {
        ret = map.size as IdT;
        map.set(ret, style);
    }

    return ret;
}

function selectorMatchesNode(node: AppliedNodeStyleConfig | undefined, data: AdHocData): boolean {
    if (!node) {
        return false;
    }

    let nodeMatch = node.selector.length === 0;
    if (!nodeMatch) {
        // try JMES match
        const searchResult = jmespath.search(data, `[${node.selector}]`);
        if (Array.isArray(searchResult) && typeof searchResult[0] === "boolean") {
            nodeMatch = searchResult[0];
        }
    }

    return nodeMatch;
}
