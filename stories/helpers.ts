import type {Meta} from "@storybook/web-components-vite";
import lodash from "lodash";
const {set: deepSet} = lodash;

import {type AdHocData, type CalculatedStyleConfig, type StyleLayerType, type StyleSchema, StyleTemplate} from "../src/config";
import type {Graphty} from "../src/graphty-element";

// Helper to wait for graph to settle
export async function waitForGraphSettled(canvasElement: HTMLElement): Promise<void> {
    const graphtyElement = canvasElement.querySelector("graphty-element");
    if (!graphtyElement) {
        return;
    }

    await new Promise<void>((resolve) => {
        let settled = false;
        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                resolve();
            }
        }, 10000);

        const handleSettled = (): void => {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                resolve();
            }
        };

        graphtyElement.addEventListener("graph-settled", handleSettled, {once: true});
    });
}

export interface TemplateOpts {
    nodeStyle?: Record<string, unknown>;
    nodeSelector?: string;
    nodeCalculatedStyle?: CalculatedStyleConfig;
    edgeStyle?: Record<string, unknown>;
    edgeSelector?: string;
    edgeCalculatedStyle?: CalculatedStyleConfig;
    algorithms?: string[];
    graph?: Record<string, unknown>;
    layers?: StyleLayerType[];
    behavior?: Record<string, unknown>;
}

export function templateCreator(opts: TemplateOpts): StyleSchema {
    const config = {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
        },
    } as unknown as AdHocData;

    if (opts.nodeStyle) {
        deepSet(config, "layers[0].node.style", opts.nodeStyle);
        deepSet(config, "layers[0].node.selector", opts.nodeSelector ?? "");
    }

    if (opts.nodeCalculatedStyle) {
        deepSet(config, "layers[0].node.calculatedStyle", opts.nodeCalculatedStyle);
        deepSet(config, "layers[0].node.selector", opts.nodeSelector ?? "");
        deepSet(config, "layers[0].node.style", opts.nodeStyle ?? {});
    }

    if (opts.edgeStyle) {
        deepSet(config, "layers[0].edge.style", opts.edgeStyle);
        deepSet(config, "layers[0].edge.selector", opts.edgeSelector ?? "");
    }

    if (opts.edgeCalculatedStyle) {
        deepSet(config, "layers[0].edge.calculatedStyle", opts.edgeCalculatedStyle);
        deepSet(config, "layers[0].edge.selector", opts.edgeSelector ?? "");
        deepSet(config, "layers[0].edge.style", opts.edgeStyle ?? {});
    }

    if (opts.algorithms) {
        deepSet(config, "data.algorithms", opts.algorithms);
    }

    if (opts.layers) {
        deepSet(config, "layers", opts.layers);
    }

    if (opts.graph) {
        // Merge with existing graph config instead of overwriting
        config.graph = {... config.graph, ... opts.graph};
    }

    if (opts.behavior) {
        deepSet(config, "behavior", opts.behavior);
    }

    const template = StyleTemplate.parse(config);

    return template;
}

export const nodeData = [
    {id: 0},
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4},
    {id: 5},
];

export const edgeData = [
    {src: 0, dst: 1},
    {src: 0, dst: 2},
    {src: 2, dst: 3},
    {src: 3, dst: 0},
    {src: 3, dst: 4},
    {src: 3, dst: 5},
];

type RenderArg1 = Parameters<NonNullable<Meta["render"]>>[0];
type RenderArg2 = Parameters<NonNullable<Meta["render"]>>[1];

export const renderFn = (args: RenderArg1, storyConfig: RenderArg2): Element => {
    const g = document.createElement("graphty-element") as Graphty;
    if (args.dataSource) {
        g.dataSource = args.dataSource;
        g.dataSourceConfig = args.dataSourceConfig;
    } else {
        // Use story-specific data if provided, otherwise use defaults
        g.nodeData = args.nodeData ?? nodeData;
        g.edgeData = args.edgeData ?? edgeData;
    }

    // Set layout properties if provided
    if (args.layout) {
        g.layout = args.layout;
    }

    if (args.layoutConfig) {
        g.layoutConfig = args.layoutConfig;
    }

    const t = args.styleTemplate;

    // if argTypes have a name like "texture.color", apply that value to the node style
    for (const arg of Object.getOwnPropertyNames(args)) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const name = storyConfig.argTypes[arg]?.name;

        // if the arg has a name...
        if (name) {
            const val = args[arg];

            // Map control names to the correct template paths
            if (name.startsWith("label.")) {
                // For label properties, check if we're using nodeStyle or layers
                const labelProp = name.substring(6); // Remove "label." prefix
                if (t.nodeStyle) {
                    deepSet(t, `nodeStyle.label.${labelProp}`, val);
                } else if (t.layers) {
                    deepSet(t, `layers[0].node.style.label.${labelProp}`, val);
                }
            } else if (name.startsWith("texture.") || name.startsWith("shape.") || name.startsWith("effect.")) {
                // For other node properties
                if (t.nodeStyle) {
                    deepSet(t, `nodeStyle.${name}`, val);
                } else if (t.layers) {
                    deepSet(t, `layers[0].node.style.${name}`, val);
                }
            } else if (name.startsWith("graph.layoutOptions.")) {
                // For layout options
                const configKey = name.substring(20); // Remove "graph.layoutOptions." prefix
                if (val !== undefined) {
                    deepSet(t, `graph.layoutOptions.${configKey}`, val);
                }
            } else if (!["dataSource", "dataSourceConfig", "layout", "layoutConfig", "styleTemplate", "nodeData", "edgeData"].includes(arg)) {
                // For other properties, apply directly (but skip component-level props)
                deepSet(t, name, val);
            }
        }
    }

    g.styleTemplate = t;

    return g;
};

export const nodeShapes = [
    "box",
    "sphere",
    "cylinder",
    "cone",
    "capsule",
    "torus-knot",
    "tetrahedron",
    "octahedron",
    "dodecahedron",
    "icosahedron",
    "rhombicuboctahedron",
    "triangular_prism",
    "pentagonal_prism",
    "hexagonal_prism",
    "square_pyramid",
    "pentagonal_pyramid",
    "triangular_dipyramid",
    "pentagonal_dipyramid",
    "elongated_square_dypyramid",
    "elongated_pentagonal_dipyramid",
    "elongated_pentagonal_cupola",
    "goldberg",
    "icosphere",
    "geodesic",
];
