import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Edge/Arrow Text",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        arrowHeadTextText: {control: "text", table: {category: "Head"}, name: "arrowHead.text.text"},
        arrowHeadTextFontSize: {control: {type: "range", min: 8, max: 24, step: 1}, table: {category: "Head"}, name: "arrowHead.text.fontSize"},
        arrowHeadTextColor: {control: "color", table: {category: "Head"}, name: "arrowHead.text.textColor"},
        arrowTailTextText: {control: "text", table: {category: "Tail"}, name: "arrowTail.text.text"},
        arrowTailTextFontSize: {control: {type: "range", min: 8, max: 24, step: 1}, table: {category: "Tail"}, name: "arrowTail.text.fontSize"},
        arrowTailTextColor: {control: "color", table: {category: "Tail"}, name: "arrowTail.text.textColor"},
    },
    parameters: {
        chromatic: {
            delay: 500,
        },
    },
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
        }),
        nodeData: [
            {id: "A", position: {x: -3, y: 0, z: 0}},
            {id: "B", position: {x: 3, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B"},
        ],
        layout: "fixed",
        layoutConfig: {},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

/**
 * Arrow head with text label.
 * The text appears near the arrow head of the edge.
 */
export const ArrowHeadText: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "→",
                        fontSize: 14,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.text.text", "arrowHead.text.fontSize"],
        },
    },
};

/**
 * Arrow tail with text label.
 * The text appears near the arrow tail of the edge.
 */
export const ArrowTailText: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowTail: {
                    type: "normal",
                    text: {
                        text: "←",
                        fontSize: 14,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowTail.text.text", "arrowTail.text.fontSize"],
        },
    },
};

/**
 * Bidirectional edge with text labels on both head and tail arrows.
 * Both labels are visible and positioned correctly at their respective ends.
 */
export const BidirectionalWithText: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "Head",
                        fontSize: 12,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                },
                arrowTail: {
                    type: "normal",
                    text: {
                        text: "Tail",
                        fontSize: 12,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.text.text", "arrowTail.text.text"],
        },
    },
};

/**
 * Arrow text using JMESPath to display data from the edge.
 * The text is extracted from edge data using a path expression.
 */
export const ArrowTextWithData: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {
                    type: "normal",
                    text: {
                        textPath: "relationship",
                        fontSize: 10,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                },
                line: {color: "darkgrey"},
            },
        }),
        edgeData: [
            {src: "A", dst: "B", relationship: "depends-on"},
        ],
    },
};

/**
 * Arrow text with custom styling including background color.
 */
export const StyledArrowText: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "1",
                        fontSize: 16,
                        textColor: "#FFFFFF",
                        backgroundColor: "#FF0000",
                        cornerRadius: 4,
                    },
                    color: "darkgrey",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.text.text", "arrowHead.text.fontSize", "arrowHead.text.textColor"],
        },
    },
};

/**
 * Multiple edges with different arrow text configurations.
 */
export const MultipleArrowTexts: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
        }),
        nodeData: [
            {id: "A", position: {x: -4, y: 2, z: 0}},
            {id: "B", position: {x: 0, y: 2, z: 0}},
            {id: "C", position: {x: 4, y: 2, z: 0}},
            {id: "D", position: {x: -2, y: -2, z: 0}},
            {id: "E", position: {x: 2, y: -2, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B", style: {arrowHead: {type: "normal", text: {text: "1"}}}},
            {src: "B", dst: "C", style: {arrowHead: {type: "normal", text: {text: "2"}}, arrowTail: {type: "normal", text: {text: "←"}}}},
            {src: "A", dst: "D", style: {arrowHead: {type: "diamond", text: {text: "◇"}}}},
            {src: "B", dst: "E", style: {arrowHead: {type: "normal", text: {text: "→", fontSize: 18}}}},
            {src: "C", dst: "E", style: {arrowHead: {type: "dot", text: {text: "•"}}}},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};

/**
 * Arrow text combined with edge label for comprehensive annotation.
 */
export const ArrowTextWithEdgeLabel: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "→",
                        fontSize: 12,
                        textColor: "#FFFFFF",
                    },
                    color: "darkgrey",
                },
                label: {
                    enabled: true,
                    text: "Edge Label",
                    fontSize: 12,
                    textColor: "#000000",
                    backgroundColor: "#FFFFFF",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
};
