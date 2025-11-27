import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, templateCreator} from "./helpers";

const meta: Meta = {
    title: "StyleHelpers/Phase 2 - Extended Options",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            delay: 500,
        },
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

/**
 * Sequential: Plasma gradient (blue → pink → yellow)
 * Alternative to viridis with warmer colors
 */
export const SequentialPlasma: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.sequential.plasma(arguments[0])",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Sequential: Inferno gradient (black → red → yellow)
 * Dramatic dark progression
 */
export const SequentialInferno: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.sequential.inferno(arguments[0])",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Sequential: Blues gradient (light → dark blue)
 * Single-hue progression, cooler aesthetic
 */
export const SequentialBlues: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.sequential.blues(arguments[0])",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Sequential: Greens gradient (light → dark green)
 * For growth and positive metrics
 */
export const SequentialGreens: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.sequential.greens(arguments[0])",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Sequential: Oranges gradient (light → dark orange)
 * For heat and activity metrics
 */
export const SequentialOranges: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.sequential.oranges(arguments[0])",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Categorical: Paul Tol Vibrant (7 colors)
 * High saturation alternative to Okabe-Ito
 */
export const CategoricalTolVibrant: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.louvain.communityId"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.categorical.tolVibrant(arguments[0])",
            },
            algorithms: ["graphty:louvain"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Categorical: Paul Tol Muted (9 colors)
 * Softer colors, supports more categories
 */
export const CategoricalTolMuted: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.louvain.communityId"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.categorical.tolMuted(arguments[0])",
            },
            algorithms: ["graphty:louvain"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Categorical: IBM Carbon (5 colors)
 * Modern enterprise aesthetic
 */
export const CategoricalCarbon: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.louvain.communityId"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.categorical.carbon(arguments[0])",
            },
            algorithms: ["graphty:louvain"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Categorical: Pastel (8 colors)
 * Softer version of Okabe-Ito
 */
export const CategoricalPastel: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.louvain.communityId"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.categorical.pastel(arguments[0])",
            },
            algorithms: ["graphty:louvain"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Diverging: Purple-Green (Paul Tol)
 * Colorblind-safe diverging gradient with midpoint
 */
export const DivergingPurpleGreen: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.diverging.purpleGreen(arguments[0], 0.5)",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Diverging: Blue-Orange
 * High contrast diverging gradient
 */
export const DivergingBlueOrange: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.diverging.blueOrange(arguments[0], 0.5)",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Diverging: Red-Blue
 * Temperature metaphor (use sparingly - not colorblind-safe)
 */
export const DivergingRedBlue: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "StyleHelpers.color.diverging.redBlue(arguments[0], 0.5)",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Size: Logarithmic scaling
 * For power-law distributions
 */
export const SizeLogarithmic: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                output: "style.shape.size",
                expr: "StyleHelpers.size.log(arguments[0], 1, 8)",
            },
            algorithms: ["graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Size: Exponential scaling
 * Emphasizes top-ranked nodes dramatically
 */
export const SizeExponential: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                output: "style.shape.size",
                expr: "StyleHelpers.size.exp(arguments[0], 1, 8, 3)",
            },
            algorithms: ["graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Size: Binned (3 tiers - small/medium/large)
 * Categorical size tiers
 */
export const SizeSmallMediumLarge: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                output: "style.shape.size",
                expr: "StyleHelpers.size.smallMediumLarge(arguments[0])",
            },
            algorithms: ["graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Size: Five discrete tiers
 * More granular binning
 */
export const SizeFiveTiers: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                output: "style.shape.size",
                expr: "StyleHelpers.size.fiveTiers(arguments[0])",
            },
            algorithms: ["graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Combined: Sequential color + Logarithmic size
 * Plasma colors with log-scaled sizes
 */
export const CombinedPlasmaLogSize: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {
                    node: {
                        selector: "",
                        style: {enabled: true},
                        calculatedStyle: {
                            inputs: ["algorithmResults.graphty.degree.degreePct"],
                            output: "style.texture.color",
                            expr: "StyleHelpers.color.sequential.plasma(arguments[0])",
                        },
                    },
                },
                {
                    node: {
                        selector: "",
                        style: {enabled: true},
                        calculatedStyle: {
                            inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                            output: "style.shape.size",
                            expr: "StyleHelpers.size.log(arguments[0], 1, 8)",
                        },
                    },
                },
            ],
            algorithms: ["graphty:degree", "graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Combined: Categorical + Size tiers
 * Community colors with importance-based size
 */
export const CombinedCategoricalSize: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {
                    node: {
                        selector: "",
                        style: {enabled: true},
                        calculatedStyle: {
                            inputs: ["algorithmResults.graphty.louvain.communityId"],
                            output: "style.texture.color",
                            expr: "StyleHelpers.color.categorical.tolVibrant(arguments[0])",
                        },
                    },
                },
                {
                    node: {
                        selector: "",
                        style: {enabled: true},
                        calculatedStyle: {
                            inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                            output: "style.shape.size",
                            expr: "StyleHelpers.size.fiveTiers(arguments[0])",
                        },
                    },
                },
            ],
            algorithms: ["graphty:louvain", "graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
};
