import "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {Graphty} from "../src/graphty-element";

const meta: Meta = {
    title: "Layout/3D",
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

export const Circular: Story = {
    args: {
        layout: "circular",
    },
};

export const Shell: Story = {
    args: {
        layout: "shell",
    },
};

export const Random: Story = {
    args: {
        layout: "random",
    },
};

export const Spring: Story = {
    args: {
        layout: "spring",
    },
};

export const Planar: Story = {
    args: {
        dataSource: undefined,
        nodeData: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}],
        edgeData: [{src: 0, dst: 1}, {src: 1, dst: 2}, {src: 2, dst: 0}, {src: 3, dst: 2}, {src: 3, dst: 1}, {src: 3, dst: 0}, {src: 4, dst: 3}, {src: 4, dst: 2}, {src: 4, dst: 1}, {src: 5, dst: 4}, {src: 5, dst: 3}, {src: 5, dst: 2}, {src: 6, dst: 5}, {src: 6, dst: 4}, {src: 6, dst: 3}, {src: 7, dst: 6}, {src: 7, dst: 5}, {src: 7, dst: 4}, {src: 8, dst: 7}, {src: 8, dst: 6}, {src: 8, dst: 5}, {src: 9, dst: 8}, {src: 9, dst: 7}, {src: 9, dst: 6}],
        layout: "planar",
    },
};

export const KamadaKawai: Story = {
    args: {
        layout: "kamada-kawai",
    },
};

export const ForceAtlas2: Story = {
    args: {
        layout: "forceatlas2",
    },
};

export const Arf: Story = {
    args: {
        layout: "arf",
    },
};

export const Spectral: Story = {
    args: {
        layout: "spectral",
        dataSource: undefined,
        nodeData: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}],
        edgeData: [{src: 9, dst: 12}, {src: 9, dst: 4}, {src: 7, dst: 5}, {src: 7, dst: 9}, {src: 12, dst: 1}, {src: 0, dst: 10}, {src: 3, dst: 1}, {src: 2, dst: 1}, {src: 9, dst: 6}, {src: 2, dst: 9}, {src: 6, dst: 11}, {src: 14, dst: 10}, {src: 4, dst: 7}, {src: 10, dst: 4}, {src: 11, dst: 3}, {src: 3, dst: 2}, {src: 10, dst: 8}, {src: 7, dst: 11}, {src: 11, dst: 14}],
    },
};

export const Bfs: Story = {
    args: {
        layout: "bfs",
        layoutConfig: {start: 0},
        dataSource: undefined,
        nodeData: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15}, {id: 16}, {id: 17}, {id: 18}, {id: 19}],
        edgeData: [{src: 0, dst: 1}, {src: 0, dst: 2}, {src: 0, dst: 3}, {src: 2, dst: 4}, {src: 0, dst: 5}, {src: 3, dst: 6}, {src: 5, dst: 7}, {src: 5, dst: 8}, {src: 4, dst: 9}, {src: 8, dst: 10}, {src: 3, dst: 11}, {src: 4, dst: 12}, {src: 8, dst: 13}, {src: 1, dst: 14}, {src: 13, dst: 15}, {src: 11, dst: 16}, {src: 3, dst: 17}, {src: 8, dst: 18}, {src: 0, dst: 19}],
    },
};
