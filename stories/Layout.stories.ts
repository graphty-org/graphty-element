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

type Story = StoryObj<Graphty>;

export const ngraph: Story = {
    args: {
        layout: "ngraph",
    },
    parameters: {
        chromatic: {delay: 1000},
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
    parameters: {
        chromatic: {delay: 1000},
    },
};

// TODO: 3D is broken?
// export const Circular: Story = {
//     args: {
//         layout: "circular",
//         layoutConfig: {dim: 3}, // doesn't work
//     },
// };

export const Random: Story = {
    args: {
        layout: "random",
        layoutConfig: {dim: 3},
    },
};

export const Spring: Story = {
    args: {
        layout: "spring",
    },
};

// TODO: 3D is broken? it renders as just a random graph?
// export const KamadaKawai: Story = {
//     args: {
//         layout: "kamada-kawai",
//         layoutConfig: {dim: 3},
//     },
// };

// TODO: 3D is broken?
// export const ForceAtlas2: Story = {
//     args: {
//         layout: "forceatlas2",
//     },
// };
