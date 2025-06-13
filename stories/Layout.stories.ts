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
        dataSource: undefined,
        layoutConfig: {start: 0},
        nodeData: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15}, {id: 16}, {id: 17}, {id: 18}, {id: 19}],
        edgeData: [{src: 0, dst: 1}, {src: 0, dst: 2}, {src: 0, dst: 3}, {src: 2, dst: 4}, {src: 0, dst: 5}, {src: 3, dst: 6}, {src: 5, dst: 7}, {src: 5, dst: 8}, {src: 4, dst: 9}, {src: 8, dst: 10}, {src: 3, dst: 11}, {src: 4, dst: 12}, {src: 8, dst: 13}, {src: 1, dst: 14}, {src: 13, dst: 15}, {src: 11, dst: 16}, {src: 3, dst: 17}, {src: 8, dst: 18}, {src: 0, dst: 19}],
    },
};

export const Bipartite: Story = {
    args: {
        layout: "bipartite",
        dataSource: undefined,
        layoutConfig: {nodes: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"]},
        nodeData: [{id: "A0"}, {id: "A1"}, {id: "A2"}, {id: "A3"}, {id: "A4"}, {id: "A5"}, {id: "A6"}, {id: "A7"}, {id: "A8"}, {id: "A9"}, {id: "B0"}, {id: "B1"}, {id: "B2"}, {id: "B3"}, {id: "B4"}, {id: "B5"}, {id: "B6"}, {id: "B7"}, {id: "B8"}, {id: "B9"}],
        edgeData: [{src: "A3", dst: "B5"}, {src: "A5", dst: "B4"}, {src: "A4", dst: "B5"}, {src: "A9", dst: "B5"}, {src: "A5", dst: "B7"}, {src: "A5", dst: "B6"}, {src: "A4", dst: "B9"}, {src: "A8", dst: "B6"}, {src: "A5", dst: "B8"}, {src: "A3", dst: "B0"}, {src: "A2", dst: "B5"}, {src: "A7", dst: "B0"}, {src: "A2", dst: "B7"}, {src: "A4", dst: "B3"}, {src: "A7", dst: "B6"}, {src: "A6", dst: "B2"}, {src: "A5", dst: "B5"}, {src: "A0", dst: "B5"}, {src: "A7", dst: "B8"}, {src: "A4", dst: "B1"}, {src: "A6", dst: "B9"}, {src: "A0", dst: "B0"}, {src: "A0", dst: "B6"}, {src: "A2", dst: "B2"}, {src: "A8", dst: "B5"}, {src: "A2", dst: "B1"}, {src: "A7", dst: "B1"}, {src: "A1", dst: "B4"}, {src: "A2", dst: "B6"}, {src: "A5", dst: "B3"}, {src: "A1", dst: "B5"}, {src: "A6", dst: "B7"}, {src: "A4", dst: "B4"}, {src: "A2", dst: "B4"}, {src: "A6", dst: "B5"}, {src: "A7", dst: "B2"}, {src: "A9", dst: "B6"}, {src: "A9", dst: "B9"}, {src: "A1", dst: "B7"}, {src: "A7", dst: "B5"}, {src: "A4", dst: "B7"}, {src: "A8", dst: "B3"}, {src: "A8", dst: "B4"}, {src: "A9", dst: "B3"}, {src: "A6", dst: "B3"}, {src: "A0", dst: "B1"}, {src: "A3", dst: "B2"}, {src: "A8", dst: "B2"}, {src: "A4", dst: "B2"}],
    },
};

export const Multipartite: Story = {
    args: {
        layout: "multipartite",
        dataSource: undefined,
        layoutConfig: {
            subsetKey: {
                0: ["L0N0", "L0N1", "L0N2", "L0N3", "L0N4"],
                1: ["L1N0", "L1N1", "L1N2", "L1N3", "L1N4"],
                2: ["L2N0", "L2N1", "L2N2", "L2N3", "L2N4"],
                3: ["L3N0", "L3N1", "L3N2", "L3N3", "L3N4"],
            },
        },
        nodeData: [{id: "L0N0"}, {id: "L0N1"}, {id: "L0N2"}, {id: "L0N3"}, {id: "L0N4"}, {id: "L1N0"}, {id: "L1N1"}, {id: "L1N2"}, {id: "L1N3"}, {id: "L1N4"}, {id: "L2N0"}, {id: "L2N1"}, {id: "L2N2"}, {id: "L2N3"}, {id: "L2N4"}, {id: "L3N0"}, {id: "L3N1"}, {id: "L3N2"}, {id: "L3N3"}, {id: "L3N4"}],
        edgeData: [{src: "L0N0", dst: "L1N1"}, {src: "L0N0", dst: "L1N2"}, {src: "L0N0", dst: "L1N3"}, {src: "L0N1", dst: "L1N0"}, {src: "L0N1", dst: "L1N2"}, {src: "L0N1", dst: "L1N3"}, {src: "L0N1", dst: "L1N4"}, {src: "L0N2", dst: "L1N1"}, {src: "L0N2", dst: "L1N2"}, {src: "L0N3", dst: "L1N2"}, {src: "L0N3", dst: "L1N3"}, {src: "L0N4", dst: "L1N3"}, {src: "L1N0", dst: "L2N2"}, {src: "L1N1", dst: "L2N3"}, {src: "L1N2", dst: "L2N2"}, {src: "L1N2", dst: "L2N4"}, {src: "L1N3", dst: "L2N1"}, {src: "L1N4", dst: "L2N1"}, {src: "L1N4", dst: "L2N3"}, {src: "L2N0", dst: "L3N3"}, {src: "L2N0", dst: "L3N4"}, {src: "L2N1", dst: "L3N0"}, {src: "L2N1", dst: "L3N1"}, {src: "L2N1", dst: "L3N2"}, {src: "L2N1", dst: "L3N4"}, {src: "L2N2", dst: "L3N0"}, {src: "L2N2", dst: "L3N1"}, {src: "L2N2", dst: "L3N2"}, {src: "L2N2", dst: "L3N3"}, {src: "L2N2", dst: "L3N4"}, {src: "L2N3", dst: "L3N0"}, {src: "L2N3", dst: "L3N3"}, {src: "L2N4", dst: "L3N0"}, {src: "L2N4", dst: "L3N1"}, {src: "L2N4", dst: "L3N3"}],
    },
};
