import type {Meta} from "@storybook/web-components-vite";
import {set as deepSet} from "lodash";

import {StyleSchema, StyleTemplate} from "../index";
import {StyleLayerType} from "../src/config";
import {CalculatedStyleConfig} from "../src/config/StyleTemplate";
import {Graphty} from "../src/graphty-element";

// TODO: refactor template creation
export function templateFromNodeStyle(style: Record<string, unknown>, selector = ""): StyleSchema {
    const template = StyleTemplate.parse({
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
        },
        layers: [
            {
                node: {
                    selector,
                    style,
                },
            },
        ],
    });

    return template;
}

export function templateFromCalculatedNodeStyle(calculatedStyle: CalculatedStyleConfig, algorithms: string[] = []): StyleSchema {
    const template = StyleTemplate.parse({
        graphtyTemplate: true,
        majorVersion: "1",
        data: {
            algorithms,
        },
        graph: {
            addDefaultStyle: true,
        },
        layers: [
            {
                node: {
                    selector: "",
                    style: {},
                    calculatedStyle,
                },
            },
        ],
    });

    return template;
}

export function templateFromEdgeStyle(style: Record<string, unknown>, selector = ""): StyleSchema {
    const template = StyleTemplate.parse({
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
        },
        layers: [
            {
                edge: {
                    selector,
                    style,
                },
            },
        ],
    });

    return template;
}

interface GraphTemplateOpts {
    graph?: Record<string, unknown>;
    layers?: StyleLayerType[];
}

export function templateFromGraphStyle(opts: GraphTemplateOpts): StyleSchema {
    const template = StyleTemplate.parse({
        graphtyTemplate: true,
        majorVersion: "1",
        graph: opts.graph,
        layers: opts.layers,
    });

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

type RenderArg1 = Parameters<NonNullable<Meta["render"]>>[0];
type RenderArg2 = Parameters<NonNullable<Meta["render"]>>[1];

export const renderFn = (args: RenderArg1, storyConfig: RenderArg2): Element => {
    const g = document.createElement("graphty-element") as Graphty;
    if (args.dataSource) {
        g.dataSource = args.dataSource;
        g.dataSourceConfig = args.dataSourceConfig;
    } else {
        g.nodeData = nodeData;
        g.edgeData = edgeData;
    }

    const t = args.styleTemplate;

    // if argTypes have a name like "texture.color", apply that value to the node style
    for (const arg of Object.getOwnPropertyNames(args)) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const name = storyConfig.argTypes[arg]?.name;

        // if the arg has a name...
        if (name) {
            const val = storyConfig.args[arg];
            // ...apply the value of the argument to our style
            deepSet(t, name, val);
        }
    }

    g.styleTemplate = t;
    return g;
};
