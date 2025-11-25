import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Edge/Tooltips",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        tooltipEnabled: {control: "boolean", table: {category: "Tooltip"}, name: "tooltip.enabled"},
        tooltipText: {control: "text", table: {category: "Tooltip"}, name: "tooltip.text"},
        tooltipFontSize: {control: {type: "range", min: 8, max: 24, step: 1}, table: {category: "Tooltip"}, name: "tooltip.fontSize"},
        tooltipTextColor: {control: "color", table: {category: "Tooltip"}, name: "tooltip.textColor"},
        tooltipBackgroundColor: {control: "color", table: {category: "Tooltip"}, name: "tooltip.backgroundColor"},
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
 * Basic tooltip displayed on edge hover.
 * Hover over the edge to see the tooltip appear.
 */
export const BasicTooltip: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                tooltip: {
                    enabled: true,
                    text: "Edge tooltip",
                    fontSize: 14,
                    textColor: "#000000",
                    backgroundColor: "#FFFFFF",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["tooltip.enabled", "tooltip.text", "tooltip.fontSize"],
        },
    },
};

/**
 * Tooltip that uses JMESPath to display data from the edge.
 * The tooltip text is extracted from edge data using a path expression.
 */
export const TooltipWithData: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                tooltip: {
                    enabled: true,
                    textPath: "weight",
                    fontSize: 14,
                    textColor: "#000000",
                    backgroundColor: "#FFFFFF",
                },
                line: {color: "darkgrey"},
            },
        }),
        edgeData: [
            {src: "A", dst: "B", weight: 5},
        ],
    },
    parameters: {
        controls: {
            include: ["tooltip.enabled"],
        },
    },
};

/**
 * Tooltip with custom styling including background color and borders.
 */
export const StyledTooltip: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                tooltip: {
                    enabled: true,
                    text: "Styled tooltip",
                    fontSize: 16,
                    textColor: "#FFFFFF",
                    backgroundColor: "#333333",
                    cornerRadius: 8,
                    borderWidth: 2,
                    borderColor: "#666666",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["tooltip.fontSize", "tooltip.textColor", "tooltip.backgroundColor"],
        },
    },
};

/**
 * Tooltip with pointer/callout arrow pointing to the edge.
 */
export const TooltipWithPointer: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                tooltip: {
                    enabled: true,
                    text: "Pointed tooltip",
                    fontSize: 14,
                    textColor: "#000000",
                    backgroundColor: "#FFFFFF",
                    pointer: true,
                    pointerDirection: "bottom",
                },
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["tooltip.enabled", "tooltip.text"],
        },
    },
};

/**
 * Multiple edges with different tooltips showing various configurations.
 */
export const MultipleTooltips: Story = {
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
            {src: "A", dst: "B", style: {tooltip: {enabled: true, text: "Edge A→B"}}},
            {src: "B", dst: "C", style: {tooltip: {enabled: true, text: "Edge B→C", backgroundColor: "#333333", textColor: "#FFFFFF"}}},
            {src: "A", dst: "D", style: {tooltip: {enabled: true, text: "Edge A→D", pointer: true}}},
            {src: "B", dst: "E", style: {tooltip: {enabled: true, text: "Edge B→E", fontSize: 18}}},
            {src: "C", dst: "E", style: {tooltip: {enabled: true, text: "Edge C→E"}}},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};
