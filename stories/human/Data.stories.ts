import "../../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../../src/graphty-element";
import {edgeData, nodeData} from "../helpers";

const meta: Meta = {
    title: "Data",
    component: "graphty-element",
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Basic: Story = {
    args: {
        nodeData,
        edgeData,
        layout: "ngraph",
        layoutConfig: {
            seed: 12,
        },
    },
};

export const Json: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 12,
        },
    },
};

export const ModifiedJson: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data2.json",
            edge: {
                path: "links",
            },
        },
        edgeSrcIdPath: "source",
        edgeDstIdPath: "target",
        layout: "ngraph",
        layoutConfig: {
            seed: 12,
        },
    },
};
