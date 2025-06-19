import {StyleSchema, StyleTemplate} from "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element.ts";
import {get as deepGet, set as deepSet} from "lodash";

function templateFromNodeStyle(style: Record<string, unknown>, selector: string = ""): StyleSchema {
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

const meta: Meta = {
    title: "Styles/Node",
    component: "graphty-element",
    // XXX: https://github.com/storybookjs/storybook/issues/23343
    render: (args, storyConfig) => {
        console.log("render args", args);
        console.log("storyConfig", storyConfig);

        const g = document.createElement("graphty-element") as Graphty;
        g.nodeData = nodeData;
        g.edgeData = edgeData;
        const t = args.styleTemplate;

        // if argTypes have a name like "texture.color", apply that value to the node style
        for (const arg of Object.getOwnPropertyNames(args)) {
            const name = storyConfig?.argTypes?.[arg]?.name;
            const nodeStyle = t.layers[0].node.style;

            // if the arg has a name, and the path of that name exists in our style...
            if (name && deepGet(nodeStyle, name) !== undefined) {
                const val = storyConfig?.args?.[arg];
                // ...apply the value of the argument to our style
                deepSet(nodeStyle, name, val);
            }
        }

        g.styleTemplate = t;
        return g;
    },
    parameters: {
        // controls: {exclude: /^(#|_)/},
        controls: {
            include: ["texture.color"],
        },
    },
    argTypes: {
        nodeColor: {control: "color", table: {category: "Texture"}, name: "texture.color"},
    },
};
export default meta;

type Story = StoryObj<Graphty>

export const Default: Story = {};

export const Color: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({texture: {color: "red"}}),
    },
};
