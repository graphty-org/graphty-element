import {StyleSchema, StyleTemplate} from "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element.ts";

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

const meta: Meta = {
    title: "Styles/Node",
    component: "graphty-element",
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
    args: {
        nodeData: [
            {id: 0},
            {id: 1},
            {id: 2},
            {id: 3},
            {id: 4},
            {id: 5},
        ],
        edgeData: [
            {src: 0, dst: 1},
            {src: 0, dst: 2},
            {src: 2, dst: 3},
            {src: 3, dst: 0},
            {src: 3, dst: 4},
            {src: 3, dst: 5},
        ],
    },
};
export default meta;

type Story = StoryObj<Graphty>

export const Default: Story = {
};

export const NodeColor: Story = {
    args: {
        styleTemplate: templateFromNodeStyle({texture: {color: "#FF0000"}}),
    },
};
