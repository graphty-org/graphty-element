import "../index.ts";
import "../src/layout/index.ts"; // Ensure all layouts are registered
import "../src/data/index.ts"; // Ensure all data sources are registered

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import isChromatic from "chromatic/isChromatic";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator, waitForGraphSettled} from "./helpers";

const meta: Meta = {
    title: "Layout/3D",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        // D3 layout controls
        d3AlphaMin: {control: {type: "range", min: 0.001, max: 0.5, step: 0.001}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.alphaMin"},
        d3AlphaTarget: {control: {type: "range", min: 0, max: 1, step: 0.01}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.alphaTarget"},
        d3AlphaDecay: {control: {type: "range", min: 0.001, max: 0.1, step: 0.001}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.alphaDecay"},
        d3VelocityDecay: {control: {type: "range", min: 0.1, max: 0.9, step: 0.1}, table: {category: "D3 Layout"}, name: "graph.layoutOptions.velocityDecay"},

        // Spring layout controls
        springK: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.k"},
        springIterations: {control: {type: "range", min: 10, max: 200, step: 10}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.iterations"},
        springScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.scale"},
        springSeed: {control: {type: "number"}, table: {category: "Spring Layout"}, name: "graph.layoutOptions.seed"},

        // Random layout controls
        randomSeed: {control: {type: "number"}, table: {category: "Random Layout"}, name: "graph.layoutOptions.seed"},

        // Kamada-Kawai layout controls
        kamadaScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Kamada-Kawai Layout"}, name: "graph.layoutOptions.scale"},
        kamadaWeightProperty: {control: {type: "text"}, table: {category: "Kamada-Kawai Layout"}, name: "graph.layoutOptions.weightProperty"},

        // Circular layout controls
        circularScale: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Circular Layout"}, name: "graph.layoutOptions.scale"},

        // ForceAtlas2 layout controls
        fa2MaxIter: {control: {type: "range", min: 10, max: 1000, step: 10}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.maxIter"},
        fa2JitterTolerance: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.jitterTolerance"},
        fa2ScalingRatio: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.scalingRatio"},
        fa2Gravity: {control: {type: "range", min: 0, max: 10, step: 0.1}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.gravity"},
        fa2DistributedAction: {control: {type: "boolean"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.distributedAction"},
        fa2StrongGravity: {control: {type: "boolean"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.strongGravity"},
        fa2DissuadeHubs: {control: {type: "boolean"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.dissuadeHubs"},
        fa2Linlog: {control: {type: "boolean"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.linlog"},
        fa2WeightPath: {control: {type: "text"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.weightPath"},
        fa2Seed: {control: {type: "number"}, table: {category: "ForceAtlas2 Layout"}, name: "graph.layoutOptions.seed"},

        // NGraph layout controls
        ngraphSeed: {control: {type: "number"}, table: {category: "NGraph Layout"}, name: "graph.layoutOptions.seed"},
        ngraphSpringLength: {control: {type: "range", min: 10, max: 100, step: 5}, table: {category: "NGraph Layout"}, name: "graph.layoutOptions.springLength"},
        ngraphSpringCoefficient: {control: {type: "range", min: 0.0001, max: 0.01, step: 0.0001}, table: {category: "NGraph Layout"}, name: "graph.layoutOptions.springCoefficient"},
        ngraphGravity: {control: {type: "range", min: -10, max: 10, step: 0.1}, table: {category: "NGraph Layout"}, name: "graph.layoutOptions.gravity"},
        ngraphTheta: {control: {type: "range", min: 0.1, max: 1, step: 0.1}, table: {category: "NGraph Layout"}, name: "graph.layoutOptions.theta"},
        ngraphDragCoefficient: {control: {type: "range", min: 0.001, max: 0.1, step: 0.001}, table: {category: "NGraph Layout"}, name: "graph.layoutOptions.dragCoefficient"},
        ngraphTimeStep: {control: {type: "range", min: 1, max: 50, step: 1}, table: {category: "NGraph Layout"}, name: "graph.layoutOptions.timeStep"},
    },
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            // Using event-based waiting via play function instead of delay
            diffIncludeAntiAliasing: true,
            diffThreshold: 0.3, // Reduced threshold since we wait for actual settling
        },
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
        layoutConfig: {
            seed: 42, // Fixed seed for consistent layouts in visual tests (same as other working ngraph stories)
        },
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // Explicitly set to 3D mode
            },
            behavior: {
                layout: {
                    // Physics-based layouts need preSteps for visual stability
                    // Use constant value like other working ngraph stories (NodeStyles, GraphStyles)
                    preSteps: 8000,
                },
            },
        }),
        // Individual parameter args for controls
        ngraphSeed: 42,
        // ngraphSpringLength: 30,
        // ngraphSpringCoefficient: 0.0008,
        // ngraphGravity: -1.2,
        // ngraphTheta: 0.8,
        // ngraphDragCoefficient: 0.02,
        // ngraphTimeStep: 20,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.seed",
                "graph.layoutOptions.springLength",
                "graph.layoutOptions.springCoefficient",
                "graph.layoutOptions.gravity",
                "graph.layoutOptions.theta",
                "graph.layoutOptions.dragCoefficient",
                "graph.layoutOptions.timeStep",
            ],
        },
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const D3: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // Explicitly set to 3D mode
                layout: "d3",
                layoutOptions: {
                    alphaMin: 0.1,
                    alphaTarget: 0,
                    alphaDecay: 0.0228,
                    velocityDecay: 0.4,
                },
            },
            behavior: {
                layout: {
                    // D3 physics-based layout needs preSteps for Chromatic
                    preSteps: isChromatic() ? 15000 : 200,
                },
            },
        }),
        d3AlphaMin: 0.1,
        d3AlphaTarget: 0,
        d3AlphaDecay: 0.0228,
        d3VelocityDecay: 0.4,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.alphaMin",
                "graph.layoutOptions.alphaTarget",
                "graph.layoutOptions.alphaDecay",
                "graph.layoutOptions.velocityDecay",
            ],
        },
        chromatic: {
            diffIncludeAntiAliasing: true,
            diffThreshold: 0.8, // Increased tolerance for D3 physics-based layout
        },
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const Circular: Story = {
    args: {
        dataSource: "json", // Add data source
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // Explicitly set to 3D mode
                layout: "circular",
                layoutOptions: {
                    dim: 3,
                    scale: 1,
                },
            },
        }),
        circularScale: 1,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scale",
            ],
        },
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const Random: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // Explicitly set to 3D mode
                layout: "random",
                layoutOptions: {dim: 3},
            },
        }),
        randomSeed: 12,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.seed",
            ],
        },
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const Spring: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // Explicitly set to 3D mode
                layout: "spring",
                layoutOptions: {dim: 3},
            },
        }),
        springK: 1,
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
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const KamadaKawai: Story = {
    args: {
        dataSource: "json", // Add data source
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // Explicitly set to 3D mode
                layout: "kamada-kawai",
                layoutOptions: {
                    dim: 3,
                    scale: 1,
                    weightProperty: undefined,
                },
            },
        }),
        kamadaScale: 1,
        kamadaWeightProperty: undefined,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.scale",
                "graph.layoutOptions.weightProperty",
            ],
        },
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const ForceAtlas2: Story = {
    args: {
        dataSource: "json", // Add data source
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // 3D mode
                layout: "forceatlas2",
                layoutOptions: {
                    dim: 3,
                    maxIter: 500,
                    jitterTolerance: 1.0,
                    scalingRatio: 2.0,
                    gravity: 1.0,
                    distributedAction: false,
                    strongGravity: false,
                    dissuadeHubs: false,
                    linlog: false,
                    seed: 42,
                },
            },
        }),
        // Individual parameter args for controls
        fa2MaxIter: 500,
        fa2JitterTolerance: 1.0,
        fa2ScalingRatio: 2.0,
        fa2Gravity: 1.0,
        fa2DistributedAction: false,
        fa2StrongGravity: false,
        fa2DissuadeHubs: false,
        fa2Linlog: false,
        fa2Seed: 42,
    },
    parameters: {
        controls: {
            include: [
                "graph.layoutOptions.maxIter",
                "graph.layoutOptions.jitterTolerance",
                "graph.layoutOptions.scalingRatio",
                "graph.layoutOptions.gravity",
                "graph.layoutOptions.distributedAction",
                "graph.layoutOptions.strongGravity",
                "graph.layoutOptions.dissuadeHubs",
                "graph.layoutOptions.linlog",
                "graph.layoutOptions.weightPath",
                "graph.layoutOptions.seed",
            ],
        },
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const Fixed: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3-fixed-positions.json",
        },
        layout: "fixed",
        layoutConfig: {
            dim: 3,
        },
        styleTemplate: templateCreator({
            graph: {
                twoD: false, // Explicitly set to 3D mode
            },
            behavior: {
                layout: {
                    preSteps: 0, // Fixed layout doesn't need preSteps since positions are pre-calculated
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: [], // No controls for fixed layout
        },
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};
