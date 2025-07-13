import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Layout/3D",
    component: "graphty-element",
    render: renderFn,
    argTypes: {
        // D3 layout controls
        d3AlphaMin: {control: {type: "range", min: 0.001, max: 0.5, step: 0.001}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.alphaMin"},
        d3AlphaTarget: {control: {type: "range", min: 0, max: 1, step: 0.01}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.alphaTarget"},
        d3AlphaDecay: {control: {type: "range", min: 0.001, max: 0.1, step: 0.001}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.alphaDecay"},
        d3VelocityDecay: {control: {type: "range", min: 0.1, max: 0.9, step: 0.1}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.velocityDecay"},

        // Spring layout controls
        springK: {control: {type: "number"}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.k"},
        springIterations: {control: {type: "range", min: 10, max: 200, step: 10}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.iterations"},
        springScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.scale"},
        springSeed: {control: {type: "number"}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.seed"},

        // Random layout controls
        randomSeed: {control: {type: "number"}, table: {category: "Random Layout"}, name: "graph.layoutOptions.seed"},

        // Kamada-Kawai layout controls
        kamadaScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Kamada-Kawai Layout"}, name: "graph.layoutOptions.scale"},
    },
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

type Story = StoryObj<Graphty & Record<string, unknown>>;

export const ngraph: Story = {
    args: {
        layout: "ngraph",
        styleTemplate: templateCreator({}),
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
        styleTemplate: templateCreator({}),
        d3AlphaMin: 0.1,
        d3AlphaTarget: 0,
        d3AlphaDecay: 0.0228,
        d3VelocityDecay: 0.4,
    },
    parameters: {
        chromatic: {delay: 1000},
        controls: {
            include: [
                "graph.layoutOptions.alphaMin",
                "graph.layoutOptions.alphaTarget",
                "graph.layoutOptions.alphaDecay",
                "graph.layoutOptions.velocityDecay",
            ],
        },
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
        styleTemplate: templateCreator({}),
        randomSeed: null,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.seed",
            ],
        },
    },
};

export const Spring: Story = {
    args: {
        layout: "spring",
        styleTemplate: templateCreator({}),
        springK: null,
        springIterations: 50,
        springScale: 1,
        springSeed: null,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.k",
                "graph.layoutOptions.iterations",
                "graph.layoutOptions.scale",
                "graph.layoutOptions.seed",
            ],
        },
    },
};

// TODO: 3D is broken? it renders as just a random graph?
export const KamadaKawai: Story = {
    args: {
        layout: "kamada-kawai",
        layoutConfig: {dim: 3},
        styleTemplate: templateCreator({}),
        kamadaScale: 1,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scale",
            ],
        },
    },
};

// TODO: 3D is broken?
// export const ForceAtlas2: Story = {
//     args: {
//         layout: "forceatlas2",
//     },
// };
