import "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element";

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

export const Json: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
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
    },
};
