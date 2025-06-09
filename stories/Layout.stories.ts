import "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element";

const meta: Meta = {
    title: "Layout",
    tags: ["autodocs"],
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
    },
};
