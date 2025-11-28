import type {Meta, StoryObj} from "@storybook/web-components";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Edge/Patterns",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    tags: ["autodocs"],
    args: {
        styleTemplate: templateCreator({
            behavior: {
                layout: {
                    type: "fixed",
                },
            },
        }),
        nodeData: [
            {id: "A", position: {x: -3, y: 0, z: 0}},
            {id: "B", position: {x: 3, y: 0, z: 0}},
        ],
        edgeData: [{src: "A", dst: "B"}],
        layout: "fixed",
        layoutConfig: {},
    },
};

export default meta;
type Story = StoryObj<Graphty>;

export const Dot: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "dot",
                        color: "darkgrey",
                        width: 5,
                    },
                },
            },
        ),
    },
};

export const Star: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "star",
                        color: "darkgrey",
                        width: 5,
                    },
                },
            },
        ),
    },
};

export const Box: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "box",
                        color: "darkgrey",
                        width: 5,
                        opacity: 1.0,
                    },
                },
            },
        ),
    },
};

export const Dash: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "dash",
                        color: "darkgrey",
                        width: 5,
                    },
                },
            },
        ),
    },
};

export const Diamond: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "diamond",
                        color: "darkgrey",
                        width: 5,
                    },
                },
            },
        ),
    },
};

export const DashDot: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "dash-dot",
                        color: "darkgrey",
                        width: 5,
                    },
                },
            },
        ),
    },
};

export const Sinewave: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "sinewave",
                        color: "darkgrey",
                        width: 15,
                    },
                },
            },
        ),
    },
};

export const Zigzag: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "zigzag",
                        color: "darkgrey",
                        width: 15,
                    },
                },
            },
        ),
    },
};

export const Solid: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "solid",
                        color: "#AAA",
                        width: 5,
                    },
                },
            },
        ),
    },
};

/**
 * Phase 2: Adaptive Density Test
 * Shows edges at different lengths to demonstrate mesh count adjustment
 */
export const AdaptiveDensity: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "box",
                        color: "darkgrey",
                        width: 5,
                        opacity: 1.0,
                    },
                },
            },
        ),
        nodeData: [
            // Very short edge
            {id: "A1", position: {x: -6, y: 2, z: 0}},
            {id: "B1", position: {x: -4, y: 2, z: 0}},

            // Short edge
            {id: "A2", position: {x: -6, y: 0, z: 0}},
            {id: "B2", position: {x: -2, y: 0, z: 0}},

            // Medium edge
            {id: "A3", position: {x: -6, y: -2, z: 0}},
            {id: "B3", position: {x: 2, y: -2, z: 0}},

            // Long edge
            {id: "A4", position: {x: -6, y: -4, z: 0}},
            {id: "B4", position: {x: 6, y: -4, z: 0}},
        ],
        edgeData: [
            {src: "A1", dst: "B1"},
            {src: "A2", dst: "B2"},
            {src: "A3", dst: "B3"},
            {src: "A4", dst: "B4"},
        ],
    },
};

/**
 * Phase 3: Alternating Pattern Test
 * Demonstrates dash-dot pattern with clearly visible alternating shapes (box and circle)
 * Multiple edges of different lengths to show pattern maintains correct alternation
 */
export const AlternatingPattern: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                edgeStyle: {
                    line: {
                        type: "dash-dot",
                        color: "darkgrey",
                        width: 6,
                    },
                },
            },
        ),
        nodeData: [
            // Short edge (should show minimum 3 meshes: dash-dot-dash)
            {id: "A1", position: {x: -5, y: 3, z: 0}},
            {id: "B1", position: {x: -2, y: 3, z: 0}},

            // Medium edge (should show clear alternation)
            {id: "A2", position: {x: -5, y: 0, z: 0}},
            {id: "B2", position: {x: 0, y: 0, z: 0}},

            // Long edge (should show many alternating shapes)
            {id: "A3", position: {x: -5, y: -3, z: 0}},
            {id: "B3", position: {x: 5, y: -3, z: 0}},
        ],
        edgeData: [
            {src: "A1", dst: "B1"},
            {src: "A2", dst: "B2"},
            {src: "A3", dst: "B3"},
        ],
    },
};

/**
 * Phase 3: Dash-Dot Pattern Comparison
 * Shows dash-dot alongside dash and dot for visual comparison
 */
export const DashDotComparison: Story = {
    args: {
        nodeData: [
            // Dash pattern
            {id: "A1", position: {x: -4, y: 2, z: 0}},
            {id: "B1", position: {x: 4, y: 2, z: 0}},

            // Dash-Dot pattern (alternating)
            {id: "A2", position: {x: -4, y: 0, z: 0}},
            {id: "B2", position: {x: 4, y: 0, z: 0}},

            // Dot pattern
            {id: "A3", position: {x: -4, y: -2, z: 0}},
            {id: "B3", position: {x: 4, y: -2, z: 0}},
        ],
        edgeData: [
            {src: "A1", dst: "B1", style: "dash"},
            {src: "A2", dst: "B2", style: "dash-dot"},
            {src: "A3", dst: "B3", style: "dot"},
        ],
        styleTemplate: templateCreator(
            {
                layers: [
                    {edge: {selector: "style == 'dash'", style: {enabled: true, line: {type: "dash", color: "darkgrey", width: 6}}}},
                    {edge: {selector: "style == 'dash-dot'", style: {enabled: true, line: {type: "dash-dot", color: "darkgrey", width: 6}}}},
                    {edge: {selector: "style == 'dot'", style: {enabled: true, line: {type: "dot", color: "darkgrey", width: 6}}}},
                ],
            },
        ),
    },
};
