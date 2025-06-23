import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {set as deepSet} from "lodash";

import {StyleSchema, StyleTemplate} from "../index.ts";
import {Graphty} from "../src/graphty-element.ts";

function templateFromNodeStyle(style: Record<string, unknown>, selector = ""): StyleSchema {
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

const nodeData = [
    {id: 0},
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4},
    {id: 5},
];

const edgeData = [
    {src: 0, dst: 1},
    {src: 0, dst: 2},
    {src: 2, dst: 3},
    {src: 3, dst: 0},
    {src: 3, dst: 4},
    {src: 3, dst: 5},
];

const nodeShapes = [
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

const meta: Meta = {
    title: "Styles/Node",
    component: "graphty-element",
    // XXX: https://github.com/storybookjs/storybook/issues/23343
    render: (args, storyConfig) => {
        const g = document.createElement("graphty-element") as Graphty;
        g.nodeData = nodeData;
        g.edgeData = edgeData;
        const t = args.styleTemplate;

        // if argTypes have a name like "texture.color", apply that value to the node style
        for (const arg of Object.getOwnPropertyNames(args)) {
            const {name} = storyConfig.argTypes[arg];
            const nodeStyle = t.layers[0].node.style;

            // if the arg has a name...
            if (name) {
                const val = storyConfig.args[arg];
                // ...apply the value of the argument to our style
                deepSet(nodeStyle, name, val);
            }
        }

        g.styleTemplate = t;
        return g;
    },
    argTypes: {
        nodeColor: {control: "color", table: {category: "Texture"}, name: "texture.color"},
        nodeShape: {control: "select", options: nodeShapes, table: {category: "Shape"}, name: "shape.type"},
        nodeSize: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Shape"}, name: "shape.size"},
        nodeWireframe: {control: "boolean", table: {category: "Effect"}, name: "effect.wireframe"},
        nodeLabelEnabled: {control: "boolean", table: {category: "Label"}, name: "label.enabled"},
        advancedNodeColor: {control: "color", table: {category: "Texture"}, name: "texture.color.value"},
        advancedNodeOpacity: {control: {type: "range", min: 0.1, max: 1, step: 0.1}, table: {category: "Texture"}, name: "texture.color.opacity"},
    },
    parameters: {
        // controls: {exclude: /^(#|_)/},
        controls: {
            include: [
                "texture.color",
                "shape.type",
                "shape.size",
                "effect.wireframe",
                "label.enabled",
            ],
        },
    },
    args: {
        styleTemplate: templateFromNodeStyle({}),
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Default: Story = {};

export const Color: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({texture: {color: "red"}}),
    },
    parameters: {
        controls: {
            include: ["texture.color"],
        },
    },
};

export const Shape: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({shape: {type: "box"}}),
    },
    parameters: {
        controls: {
            include: ["shape.type"],
        },
    },
};

export const Size: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({shape: {size: 3}}),
    },
    parameters: {
        controls: {
            include: ["shape.size"],
        },
    },
};

export const Wireframe: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({effect: {wireframe: true}}),
    },
    parameters: {
        controls: {
            include: ["effect.wireframe"],
        },
    },
};

export const Label: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({label: {enabled: true}}),
    },
    parameters: {
        controls: {
            include: ["label.enabled"],
        },
    },
};

export const Opacity: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({texture: {color: {
            colorType: "solid",
            value: "#0000FF",
            opacity: 0.5,
        }}}),
    },
    parameters: {
        controls: {
            include: ["texture.color.value", "texture.color.opacity"],
        },
    },
    // parameters: {
    //     controls: {
    //         include: ["label.enabled"],
    //     },
    // },
};
