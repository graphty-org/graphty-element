import "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element";

const meta: Meta = {
    title: "Layout",
    component: "graphty-element",
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>

export const ngraph: Story = {
    args: {
        layout: "ngraph",
    },
};

export const D3: Story = {
    args: {
        layout: "d3",
        layoutConfig: {
            alphaMin: 0.1,
            alphaTarget: 0,
            alphaDecay: 0.0228,
            velocityDecay: 0.4,
        },
    },
};

export const Spiral: Story = {
    args: {
        layout: "spiral",
    },
};

export const Circle: Story = {
    args: {
        layout: "circle",
    },
};
