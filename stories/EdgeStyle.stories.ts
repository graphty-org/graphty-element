import {StyleSchema, StyleTemplate} from "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element.ts";
import {set as deepSet} from "lodash";

function templateFromEdgeStyle(style: Record<string, unknown>, selector = ""): StyleSchema {
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

const meta: Meta = {
    title: "Styles/Edge",
    component: "graphty-element",
    // XXX: https://github.com/storybookjs/storybook/issues/23343
    render: (args, storyConfig) => {
        const g = document.createElement("graphty-element") as Graphty;
        g.nodeData = nodeData;
        g.edgeData = edgeData;
        const t = args.styleTemplate as StyleSchema;

        // if argTypes have a name like "texture.color", apply that value to the node style
        for (const arg of Object.getOwnPropertyNames(args)) {
            const name = storyConfig.argTypes[arg].name;
            const edgeStyle = t.layers[0]?.edge?.style;
            const val = storyConfig.args[arg] as unknown;

            // if the arg has a name...
            if (edgeStyle && name && val) {
                // ...apply the value of the argument to our style
                deepSet(edgeStyle, name, val);
            }
        }

        g.styleTemplate = t;
        return g;
    },
    argTypes: {
        edgeLineWidth: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Line"}, name: "line.width"},
    },
    parameters: {
        // controls: {exclude: /^(#|_)/},
        controls: {
            include: [
                "line.width",
            ],
        },
    },
    args: {
        styleTemplate: templateFromEdgeStyle({}),
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Default: Story = {};

export const Width: Story = {
    args: {
        styleTemplate: templateFromEdgeStyle({line: {width: 2}}),
    },
    parameters: {
        controls: {
            include: ["line.width"],
        },
    },
};

export const NormalArrowHead: Story = {
    args: {
        styleTemplate: templateFromEdgeStyle({arrowHead: {type: "normal"}}),
    },
};

export const CircleArrowHead: Story = {
    args: {
        styleTemplate: templateFromEdgeStyle({arrowHead: {type: "dot"}}),
    },
};
