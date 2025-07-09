import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element.ts";
import {renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Label",
    component: "graphty-element",
    render: renderFn,
    argTypes: {
        labelEnabled: {control: "boolean", table: {category: "Basic"}, name: "label.enabled"},
        labelFont: {control: "text", table: {category: "Font"}, name: "label.font"},
        labelFontSize: {control: {type: "range", min: 12, max: 96, step: 4}, table: {category: "Font"}, name: "label.fontSize"},
        labelTextColor: {control: "color", table: {category: "Colors"}, name: "label.textColor"},
        labelBackgroundColor: {control: "color", table: {category: "Colors"}, name: "label.backgroundColor"},
        labelLocation: {
            control: "select",
            options: ["top", "top-right", "top-left", "left", "center", "right", "bottom", "bottom-left", "bottom-right", "automatic"],
            table: {category: "Position"},
            name: "label.location",
        },
        labelMargin: {control: {type: "range", min: 0, max: 20, step: 1}, table: {category: "Position"}, name: "label.margin"},
        labelAttachOffset: {control: {type: "range", min: 0, max: 5, step: 0.1}, table: {category: "Position"}, name: "label.attachOffset"},
        labelCornerRadius: {control: {type: "range", min: 0, max: 20, step: 1}, table: {category: "Style"}, name: "label.cornerRadius"},
        labelFontWeight: {control: "text", table: {category: "Font"}, name: "label.fontWeight"},
    },
    parameters: {
        controls: {
            include: [
                "label.enabled",
                "label.font",
                "label.fontSize",
                "label.textColor",
                "label.backgroundColor",
                "label.location",
                "label.margin",
                "label.attachOffset",
                "label.cornerRadius",
                "label.fontWeight",
            ],
        },
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                },
            },
        }),
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Default: Story = {};

export const BasicLabel: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    font: "Arial",
                    size: 48,
                    textColor: "black",
                    backgroundColor: "white",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.enabled"],
        },
    },
};

export const CustomFont: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    font: "Courier New",
                    fontSize: 36,
                    fontWeight: "bold",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.font", "label.fontSize", "label.fontWeight"],
        },
    },
};

export const ColorScheme: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textColor: "white",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    cornerRadius: 10,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textColor", "label.backgroundColor", "label.cornerRadius"],
        },
    },
};

export const LabelPositions: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    location: "top",
                    margin: 10,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.location", "label.margin", "label.attachOffset"],
        },
    },
};

export const TransparentBackground: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textColor: "blue",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    cornerRadius: 5,
                    fontSize: 24,
                },
            },
        }),
    },
};

export const NoBackground: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textColor: "red",
                    backgroundColor: "transparent",
                    fontSize: 60,
                    fontWeight: "bold",
                },
            },
        }),
    },
};

export const DifferentLabelsPerNode: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            layers: [
                {
                    node: {
                        selector: "group == `1`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                textColor: "white",
                                backgroundColor: "red",
                                location: "top",
                            },
                        },
                    },
                },
                {
                    node: {
                        selector: "group == `2`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                textColor: "black",
                                backgroundColor: "yellow",
                                location: "bottom",
                            },
                        },
                    },
                },
                {
                    node: {
                        selector: "group == `3`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                textColor: "white",
                                backgroundColor: "blue",
                                location: "right",
                                fontWeight: "italic",
                            },
                        },
                    },
                },
            ],
        }),
    },
};

export const EdgeLabels: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            edgeStyle: {
                label: {
                    enabled: true,
                    text: "→",
                    textColor: "purple",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    fontSize: 24,
                    location: "center",
                    cornerRadius: 12,
                },
            },
        }),
    },
};

export const LargeLabels: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 72,
                    textColor: "darkgreen",
                    backgroundColor: "lightgreen",
                    cornerRadius: 15,
                    margin: 15,
                },
            },
        }),
    },
};

export const MinimalLabels: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                shape: {
                    size: 0.5,
                },
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 16,
                    textColor: "gray",
                    backgroundColor: "white",
                    cornerRadius: 3,
                    margin: 2,
                },
            },
        }),
    },
};

export const CustomTextPath: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    font: "Georgia",
                    fontSize: 32,
                    textColor: "navy",
                    backgroundColor: "lightyellow",
                    cornerRadius: 8,
                },
            },
        }),
    },
};

export const ComplexLabels: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                enabled: true,
                label: {
                    enabled: true,
                    text: "<bold>Rich</bold> <italic>Text</italic> <color='red'>Label</color>\n<bg='yellow'><color='black'>Highlighted</color></bg> <font='monospace'>Code</font>\n<size='20'>Mix <bold><color='green'>nested</color></bold> tags!</size>",
                    fontSize: 28,
                    fontWeight: "normal",
                    textColor: "darkblue",
                    backgroundColor: "lightblue",
                    location: "top",
                    cornerRadius: 12,
                    lineHeight: 1.5,
                },
            },
        }),
    },
};

export const TextOutline: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 32,
                    textColor: "white",
                    backgroundColor: "transparent",
                    textOutline: true,
                    textOutlineWidth: 3,
                    textOutlineColor: "black",
                },
            },
        }),
    },
};

export const TextShadow: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 36,
                    textColor: "darkgreen",
                    backgroundColor: "transparent",
                    textShadow: true,
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                    textShadowBlur: 4,
                    textShadowOffsetX: 3,
                    textShadowOffsetY: 3,
                },
            },
        }),
    },
};

export const MultipleBorders: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 24,
                    textColor: "white",
                    backgroundColor: "#2196F3",
                    cornerRadius: 8,
                    borders: [
                        {width: 2, color: "#1976D2", spacing: 0},
                        {width: 2, color: "#0D47A1", spacing: 2},
                        {width: 3, color: "#BBDEFB", spacing: 2},
                    ],
                },
            },
        }),
    },
};

export const GradientBackground: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 28,
                    textColor: "white",
                    backgroundGradient: true,
                    backgroundGradientType: "linear",
                    backgroundGradientDirection: "vertical",
                    backgroundGradientColors: ["#FF6B6B", "#4ECDC4"],
                    cornerRadius: 12,
                },
            },
        }),
    },
};

export const RadialGradient: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 32,
                    textColor: "black",
                    backgroundGradient: true,
                    backgroundGradientType: "radial",
                    backgroundGradientColors: ["#FFFFFF", "#FFD93D", "#F6B73C"],
                    cornerRadius: 999,
                },
            },
        }),
    },
};

export const Pointer: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 20,
                    textColor: "black",
                    backgroundColor: "white",
                    borderWidth: 2,
                    borderColor: "black",
                    cornerRadius: 8,
                    pointer: true,
                    pointerDirection: "bottom",
                    pointerWidth: 20,
                    pointerHeight: 15,
                    location: "top",
                    attachOffset: 0.8,
                },
            },
        }),
    },
};

export const PulseAnimation: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 24,
                    textColor: "white",
                    backgroundColor: "#E91E63",
                    cornerRadius: 20,
                    animation: "pulse",
                    animationSpeed: 1.5,
                },
            },
        }),
    },
};

export const BounceAnimation: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 20,
                    textColor: "white",
                    backgroundColor: "#4CAF50",
                    cornerRadius: 16,
                    animation: "bounce",
                    animationSpeed: 2,
                },
            },
        }),
    },
};

export const NotificationBadge: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "group",
                    badge: "notification",
                },
            },
        }),
    },
};

export const LabelBadges: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            layers: [
                {
                    node: {
                        selector: "group == `1`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                badge: "label-success",
                            },
                        },
                    },
                },
                {
                    node: {
                        selector: "group == `2`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                badge: "label-warning",
                            },
                        },
                    },
                },
                {
                    node: {
                        selector: "group == `3`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                badge: "label-danger",
                            },
                        },
                    },
                },
            ],
        }),
    },
};

export const SmartOverflow: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    text: "999999",
                    fontSize: 20,
                    textColor: "white",
                    backgroundColor: "#FF5722",
                    cornerRadius: 12,
                    smartOverflow: true,
                    maxNumber: 999,
                    overflowSuffix: "+",
                },
            },
        }),
    },
};

export const TextAlignment: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            layers: [
                {
                    node: {
                        selector: "group == `1`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                fontSize: 16,
                                textAlign: "left",
                                backgroundColor: "lightgray",
                                marginLeft: 20,
                                marginRight: 20,
                            },
                        },
                    },
                },
                {
                    node: {
                        selector: "group == `2`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                fontSize: 16,
                                textAlign: "center",
                                backgroundColor: "lightblue",
                                marginLeft: 20,
                                marginRight: 20,
                            },
                        },
                    },
                },
                {
                    node: {
                        selector: "group == `3`",
                        style: {
                            enabled: true,
                            label: {
                                enabled: true,
                                textPath: "id",
                                fontSize: 16,
                                textAlign: "right",
                                backgroundColor: "lightgreen",
                                marginLeft: 20,
                                marginRight: 20,
                            },
                        },
                    },
                },
            ],
        }),
    },
};

export const DepthFading: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 24,
                    textColor: "white",
                    backgroundColor: "#673AB7",
                    cornerRadius: 8,
                    depthFadeEnabled: true,
                    depthFadeNear: 50,
                    depthFadeFar: 200,
                },
            },
        }),
    },
};
