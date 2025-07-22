import "../../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../../src/graphty-element";
import {renderFn, templateCreator} from "../helpers";

const meta: Meta = {
    title: "Layout/2D",
    component: "graphty-element",
    render: renderFn,
    argTypes: {
        // Spring layout controls
        springK: {control: {type: "number"}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.k"},
        springIterations: {control: {type: "range", min: 10, max: 200, step: 10}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.iterations"},
        springScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.scale"},
        springSeed: {control: {type: "number"}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.seed"},

        // Circular layout controls
        circularScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Circular Layout"}, name: "graph.layoutOptions.scale"},

        // Shell layout controls
        shellScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Shell Layout"}, name: "graph.layoutOptions.scale"},

        // Random layout controls
        randomSeed: {control: {type: "number"}, table: {category: "Random Layout"}, name: "graph.layoutOptions.seed"},

        // Spiral layout controls
        spiralScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Spiral Layout"}, name: "graph.layoutOptions.scale"},
        spiralResolution: {control: {type: "range", min: 0.1, max: 1, step: 0.05}, table: {category: "Spiral Layout"}, name: "graph.layoutOptions.resolution"},
        spiralEquidistant: {control: {type: "boolean"}, table: {category: "Spiral Layout"}, name: "graph.layoutOptions.equidistant"},

        // Planar layout controls
        planarScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Planar Layout"}, name: "graph.layoutOptions.scale"},

        // Kamada-Kawai layout controls
        kamadaScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Kamada-Kawai Layout"}, name: "graph.layoutOptions.scale"},

        // ForceAtlas2 layout controls
        fa2MaxIter: {control: {type: "range", min: 10, max: 500, step: 10}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.maxIter"},
        fa2ScalingRatio: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.scalingRatio"},
        fa2Gravity: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.gravity"},
        fa2StrongGravity: {control: {type: "boolean"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.strongGravity"},
        fa2DissuadeHubs: {control: {type: "boolean"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.dissuadeHubs"},
        fa2LinLog: {control: {type: "boolean"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.linlog"},
        fa2Seed: {control: {type: "number"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.seed"},

        // Arf layout controls
        arfScaling: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Arf Layout"}, name: "graph.layoutOptions.scaling"},
        arfMaxIter: {control: {type: "range", min: 100, max: 5000, step: 100}, table: {category: "Arf Layout"}, name: "graph.layoutOptions.maxIter"},
        arfSeed: {control: {type: "number"}, table: {category: "Arf Layout"}, name: "graph.layoutOptions.seed"},

        // Bfs layout controls
        bfsAlign: {control: {type: "select", options: ["vertical", "horizontal"]}, table: {category: "Bfs Layout"}, name: "graph.layoutOptions.align"},
        bfsScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Bfs Layout"}, name: "graph.layoutOptions.scale"},

        // Bipartite layout controls
        bipartiteAlign: {control: {type: "select", options: ["vertical", "horizontal"]}, table: {category: "Bipartite Layout"}, name: "graph.layoutOptions.align"},
        bipartiteScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Bipartite Layout"}, name: "graph.layoutOptions.scale"},
        bipartiteAspectRatio: {control: {type: "range", min: 0.5, max: 2, step: 0.1}, table: {category: "Bipartite Layout"}, name: "graph.layoutOptions.aspectRatio"},

        // Multipartite layout controls
        multipartiteAlign: {control: {type: "select", options: ["vertical", "horizontal"]}, table: {category: "Multipartite Layout"}, name: "graph.layoutOptions.align"},
        multipartiteScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Multipartite Layout"}, name: "graph.layoutOptions.scale"},
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

export const Spiral: Story = {
    args: {
        styleTemplate: templateCreator({graph: {twoD: true, layout: "spiral"}}),
        spiralScale: 1,
        spiralResolution: 0.35,
        spiralEquidistant: true,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scale",
                "graph.layoutOptions.resolution",
                "graph.layoutOptions.equidistant",
            ],
        },
    },
};

export const Circular: Story = {
    args: {
        styleTemplate: templateCreator({graph: {twoD: true, layout: "circular", layoutOptions: {dim: 2}}}),
        circularScale: 1,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scale",
            ],
        },
    },
};

export const Shell: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {
                twoD: true,
                layout: "shell",
            },
        }),
        shellScale: 1,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scale",
            ],
        },
    },
};

export const Random: Story = {
    args: {
        styleTemplate: templateCreator({graph: {twoD: true, layout: "random", layoutOptions: {dim: 2}}}),
        randomSeed: 12,
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
        styleTemplate: templateCreator({graph: {twoD: true, layout: "spring", layoutOptions: {dim: 2}}}),
        springK: null,
        springIterations: 50,
        springScale: 1,
        springSeed: 12,
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

export const Planar: Story = {
    args: {
        dataSource: undefined,
        nodeData: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}],
        edgeData: [{src: 0, dst: 1}, {src: 1, dst: 2}, {src: 2, dst: 0}, {src: 3, dst: 2}, {src: 3, dst: 1}, {src: 3, dst: 0}, {src: 4, dst: 3}, {src: 4, dst: 2}, {src: 4, dst: 1}, {src: 5, dst: 4}, {src: 5, dst: 3}, {src: 5, dst: 2}, {src: 6, dst: 5}, {src: 6, dst: 4}, {src: 6, dst: 3}, {src: 7, dst: 6}, {src: 7, dst: 5}, {src: 7, dst: 4}, {src: 8, dst: 7}, {src: 8, dst: 6}, {src: 8, dst: 5}, {src: 9, dst: 8}, {src: 9, dst: 7}, {src: 9, dst: 6}],
        styleTemplate: templateCreator({graph: {twoD: true, layout: "planar"}}),
        planarScale: 1,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scale",
            ],
        },
    },
};

export const KamadaKawai: Story = {
    args: {
        styleTemplate: templateCreator({graph: {twoD: true, layout: "kamada-kawai", layoutOptions: {dim: 2}}}),
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

export const ForceAtlas2: Story = {
    args: {
        styleTemplate: templateCreator({graph: {twoD: true, layout: "forceatlas2"}}),
        fa2MaxIter: 100,
        fa2ScalingRatio: 2.0,
        fa2Gravity: 1.0,
        fa2StrongGravity: false,
        fa2DissuadeHubs: false,
        fa2LinLog: false,
        fa2Seed: 12,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.maxIter",
                "graph.layoutOptions.scalingRatio",
                "graph.layoutOptions.gravity",
                "graph.layoutOptions.strongGravity",
                "graph.layoutOptions.dissuadeHubs",
                "graph.layoutOptions.linlog",
                "graph.layoutOptions.seed",
            ],
        },
    },
};

export const Arf: Story = {
    args: {
        styleTemplate: templateCreator({graph: {twoD: true, layout: "arf"}}),
        arfScaling: 1,
        arfMaxIter: 1000,
        arfSeed: 12,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scaling",
                "graph.layoutOptions.maxIter",
                "graph.layoutOptions.seed",
            ],
        },
    },
};

export const Bfs: Story = {
    args: {
        dataSource: undefined,
        nodeData: [{id: 0}, {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9}, {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15}, {id: 16}, {id: 17}, {id: 18}, {id: 19}],
        edgeData: [{src: 0, dst: 1}, {src: 0, dst: 2}, {src: 0, dst: 3}, {src: 2, dst: 4}, {src: 0, dst: 5}, {src: 3, dst: 6}, {src: 5, dst: 7}, {src: 5, dst: 8}, {src: 4, dst: 9}, {src: 8, dst: 10}, {src: 3, dst: 11}, {src: 4, dst: 12}, {src: 8, dst: 13}, {src: 1, dst: 14}, {src: 13, dst: 15}, {src: 11, dst: 16}, {src: 3, dst: 17}, {src: 8, dst: 18}, {src: 0, dst: 19}],
        styleTemplate: templateCreator({graph: {twoD: true, layout: "bfs", layoutOptions: {start: 0}}}),
        bfsAlign: "vertical",
        bfsScale: 1,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.align",
                "graph.layoutOptions.scale",
            ],
        },
    },
};

export const Bipartite: Story = {
    args: {
        dataSource: undefined,
        nodeData: [{id: "A0"}, {id: "A1"}, {id: "A2"}, {id: "A3"}, {id: "A4"}, {id: "A5"}, {id: "A6"}, {id: "A7"}, {id: "A8"}, {id: "A9"}, {id: "B0"}, {id: "B1"}, {id: "B2"}, {id: "B3"}, {id: "B4"}, {id: "B5"}, {id: "B6"}, {id: "B7"}, {id: "B8"}, {id: "B9"}],
        edgeData: [{src: "A3", dst: "B5"}, {src: "A5", dst: "B4"}, {src: "A4", dst: "B5"}, {src: "A9", dst: "B5"}, {src: "A5", dst: "B7"}, {src: "A5", dst: "B6"}, {src: "A4", dst: "B9"}, {src: "A8", dst: "B6"}, {src: "A5", dst: "B8"}, {src: "A3", dst: "B0"}, {src: "A2", dst: "B5"}, {src: "A7", dst: "B0"}, {src: "A2", dst: "B7"}, {src: "A4", dst: "B3"}, {src: "A7", dst: "B6"}, {src: "A6", dst: "B2"}, {src: "A5", dst: "B5"}, {src: "A0", dst: "B5"}, {src: "A7", dst: "B8"}, {src: "A4", dst: "B1"}, {src: "A6", dst: "B9"}, {src: "A0", dst: "B0"}, {src: "A0", dst: "B6"}, {src: "A2", dst: "B2"}, {src: "A8", dst: "B5"}, {src: "A2", dst: "B1"}, {src: "A7", dst: "B1"}, {src: "A1", dst: "B4"}, {src: "A2", dst: "B6"}, {src: "A5", dst: "B3"}, {src: "A1", dst: "B5"}, {src: "A6", dst: "B7"}, {src: "A4", dst: "B4"}, {src: "A2", dst: "B4"}, {src: "A6", dst: "B5"}, {src: "A7", dst: "B2"}, {src: "A9", dst: "B6"}, {src: "A9", dst: "B9"}, {src: "A1", dst: "B7"}, {src: "A7", dst: "B5"}, {src: "A4", dst: "B7"}, {src: "A8", dst: "B3"}, {src: "A8", dst: "B4"}, {src: "A9", dst: "B3"}, {src: "A6", dst: "B3"}, {src: "A0", dst: "B1"}, {src: "A3", dst: "B2"}, {src: "A8", dst: "B2"}, {src: "A4", dst: "B2"}],
        styleTemplate: templateCreator({graph: {twoD: true, layout: "bipartite", layoutOptions: {nodes: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"]}}}),
        bipartiteAlign: "vertical",
        bipartiteScale: 1,
        bipartiteAspectRatio: 1.33,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.align",
                "graph.layoutOptions.scale",
                "graph.layoutOptions.aspectRatio",
            ],
        },
    },
};

export const Multipartite: Story = {
    args: {
        dataSource: undefined,
        nodeData: [{id: "L0N0"}, {id: "L0N1"}, {id: "L0N2"}, {id: "L0N3"}, {id: "L0N4"}, {id: "L1N0"}, {id: "L1N1"}, {id: "L1N2"}, {id: "L1N3"}, {id: "L1N4"}, {id: "L2N0"}, {id: "L2N1"}, {id: "L2N2"}, {id: "L2N3"}, {id: "L2N4"}, {id: "L3N0"}, {id: "L3N1"}, {id: "L3N2"}, {id: "L3N3"}, {id: "L3N4"}],
        edgeData: [{src: "L0N0", dst: "L1N1"}, {src: "L0N0", dst: "L1N2"}, {src: "L0N0", dst: "L1N3"}, {src: "L0N1", dst: "L1N0"}, {src: "L0N1", dst: "L1N2"}, {src: "L0N1", dst: "L1N3"}, {src: "L0N1", dst: "L1N4"}, {src: "L0N2", dst: "L1N1"}, {src: "L0N2", dst: "L1N2"}, {src: "L0N3", dst: "L1N2"}, {src: "L0N3", dst: "L1N3"}, {src: "L0N4", dst: "L1N3"}, {src: "L1N0", dst: "L2N2"}, {src: "L1N1", dst: "L2N3"}, {src: "L1N2", dst: "L2N2"}, {src: "L1N2", dst: "L2N4"}, {src: "L1N3", dst: "L2N1"}, {src: "L1N4", dst: "L2N1"}, {src: "L1N4", dst: "L2N3"}, {src: "L2N0", dst: "L3N3"}, {src: "L2N0", dst: "L3N4"}, {src: "L2N1", dst: "L3N0"}, {src: "L2N1", dst: "L3N1"}, {src: "L2N1", dst: "L3N2"}, {src: "L2N1", dst: "L3N4"}, {src: "L2N2", dst: "L3N0"}, {src: "L2N2", dst: "L3N1"}, {src: "L2N2", dst: "L3N2"}, {src: "L2N2", dst: "L3N3"}, {src: "L2N2", dst: "L3N4"}, {src: "L2N3", dst: "L3N0"}, {src: "L2N3", dst: "L3N3"}, {src: "L2N4", dst: "L3N0"}, {src: "L2N4", dst: "L3N1"}, {src: "L2N4", dst: "L3N3"}],
        styleTemplate: templateCreator({
            graph: {
                twoD: true,
                layout: "multipartite",
                layoutOptions: {
                    subsetKey: {
                        layer0: ["L0N0", "L0N1", "L0N2", "L0N3", "L0N4"],
                        layer1: ["L1N0", "L1N1", "L1N2", "L1N3", "L1N4"],
                        layer2: ["L2N0", "L2N1", "L2N2", "L2N3", "L2N4"],
                        layer3: ["L3N0", "L3N1", "L3N2", "L3N3", "L3N4"],
                    },
                },
            },
        }),
        multipartiteAlign: "vertical",
        multipartiteScale: 1,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.align",
                "graph.layoutOptions.scale",
            ],
        },
    },
};
