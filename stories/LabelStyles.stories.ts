import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element.ts";
import {renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Label",
    component: "graphty-element",
    render: renderFn,
    argTypes: {
        // Basic
        labelEnabled: {control: "boolean", table: {category: "Basic"}, name: "label.enabled"},
        labelText: {control: "text", table: {category: "Basic"}, name: "label.text"},
        labelTextPath: {control: "text", table: {category: "Basic"}, name: "label.textPath"},

        // Font
        labelFont: {control: "text", table: {category: "Font"}, name: "label.font"},
        labelFontSize: {control: {type: "range", min: 12, max: 400, step: 4}, table: {category: "Font"}, name: "label.fontSize"},
        labelFontWeight: {control: "text", table: {category: "Font"}, name: "label.fontWeight"},
        labelLineHeight: {control: {type: "range", min: 0.5, max: 3, step: 0.1}, table: {category: "Font"}, name: "label.lineHeight"},

        // Colors
        labelTextColor: {control: "color", table: {category: "Colors"}, name: "label.textColor"},
        labelBackgroundColor: {control: "color", table: {category: "Colors"}, name: "label.backgroundColor"},
        labelBorderColor: {control: "color", table: {category: "Colors"}, name: "label.borderColor"},

        // Position
        labelLocation: {
            control: "select",
            options: ["top", "top-right", "top-left", "left", "center", "right", "bottom", "bottom-left", "bottom-right", "automatic"],
            table: {category: "Position"},
            name: "label.location",
        },
        labelMargin: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Position"}, name: "label.margin"},
        labelAttachOffset: {control: {type: "range", min: 0, max: 5, step: 0.1}, table: {category: "Position"}, name: "label.attachOffset"},

        // Style
        labelCornerRadius: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Style"}, name: "label.cornerRadius"},
        labelBorderWidth: {control: {type: "range", min: 0, max: 10, step: 1}, table: {category: "Style"}, name: "label.borderWidth"},

        // Text Outline
        labelTextOutline: {control: "boolean", table: {category: "Text Outline"}, name: "label.textOutline"},
        labelTextOutlineWidth: {control: {type: "range", min: 0, max: 10, step: 1}, table: {category: "Text Outline"}, name: "label.textOutlineWidth"},
        labelTextOutlineColor: {control: "color", table: {category: "Text Outline"}, name: "label.textOutlineColor"},

        // Text Shadow
        labelTextShadow: {control: "boolean", table: {category: "Text Shadow"}, name: "label.textShadow"},
        labelTextShadowColor: {control: "color", table: {category: "Text Shadow"}, name: "label.textShadowColor"},
        labelTextShadowBlur: {control: {type: "range", min: 0, max: 20, step: 1}, table: {category: "Text Shadow"}, name: "label.textShadowBlur"},
        labelTextShadowOffsetX: {control: {type: "range", min: -20, max: 20, step: 1}, table: {category: "Text Shadow"}, name: "label.textShadowOffsetX"},
        labelTextShadowOffsetY: {control: {type: "range", min: -20, max: 20, step: 1}, table: {category: "Text Shadow"}, name: "label.textShadowOffsetY"},

        // Gradient
        labelBackgroundGradient: {control: "boolean", table: {category: "Gradient"}, name: "label.backgroundGradient"},
        labelBackgroundGradientType: {control: "select", options: ["linear", "radial"], table: {category: "Gradient"}, name: "label.backgroundGradientType"},
        labelBackgroundGradientDirection: {control: "select", options: ["horizontal", "vertical", "diagonal"], table: {category: "Gradient"}, name: "label.backgroundGradientDirection"},

        // Pointer
        labelPointer: {control: "boolean", table: {category: "Pointer"}, name: "label.pointer"},
        labelPointerDirection: {control: "select", options: ["top", "bottom", "left", "right"], table: {category: "Pointer"}, name: "label.pointerDirection"},
        labelPointerWidth: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Pointer"}, name: "label.pointerWidth"},
        labelPointerHeight: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Pointer"}, name: "label.pointerHeight"},

        // Animation
        labelAnimation: {control: "select", options: ["none", "pulse", "bounce", "fade"], table: {category: "Animation"}, name: "label.animation"},
        labelAnimationSpeed: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Animation"}, name: "label.animationSpeed"},

        // Badge
        labelBadge: {control: "select", options: ["none", "notification", "number", "dot"], table: {category: "Badge"}, name: "label.badge"},

        // Smart Overflow
        labelSmartOverflow: {control: "boolean", table: {category: "Smart Overflow"}, name: "label.smartOverflow"},
        labelMaxNumber: {control: {type: "number", min: 0, max: 99999}, table: {category: "Smart Overflow"}, name: "label.maxNumber"},
        labelOverflowSuffix: {control: "text", table: {category: "Smart Overflow"}, name: "label.overflowSuffix"},

        // Text Align
        labelTextAlign: {control: "select", options: ["left", "center", "right"], table: {category: "Text"}, name: "label.textAlign"},

        // Depth Fade
        labelDepthFadeEnabled: {control: "boolean", table: {category: "Depth Fade"}, name: "label.depthFadeEnabled"},
        labelDepthFadeNear: {control: {type: "range", min: 0, max: 500, step: 10}, table: {category: "Depth Fade"}, name: "label.depthFadeNear"},
        labelDepthFadeFar: {control: {type: "range", min: 0, max: 1000, step: 10}, table: {category: "Depth Fade"}, name: "label.depthFadeFar"},
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

export const LabelEnabled: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
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

export const LabelTextPath: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "group",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textPath"],
        },
    },
};

export const LabelText: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    text: "Static Label",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.text"],
        },
    },
};

export const LabelFont: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    font: "'JetBrains Mono', monospace",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.font"],
        },
    },
};

export const LabelFontSize: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontSize: 96,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.fontSize"],
        },
    },
};

export const LabelFontWeight: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    fontWeight: "bold",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.fontWeight"],
        },
    },
};

export const LabelTextColor: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textColor: "#6366F1",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textColor"],
        },
    },
};

export const LabelBackgroundColor: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    backgroundColor: "#10B981",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.backgroundColor"],
        },
    },
};

export const LabelCornerRadius: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    cornerRadius: 12,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.cornerRadius"],
        },
    },
};

export const LabelLocation: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    location: "top",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.location"],
        },
    },
};

export const LabelMargin: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    margin: 10,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.margin"],
        },
    },
};

export const LabelAttachOffset: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    attachOffset: 2,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.attachOffset"],
        },
    },
};

export const LabelLineHeight: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    text: "Line 1\nLine 2\nLine 3",
                    lineHeight: 1.5,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.lineHeight"],
        },
    },
};

export const LabelTextOutline: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textOutline: true,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textOutline"],
        },
    },
};

export const LabelTextOutlineWidth: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textOutline: true,
                    textOutlineWidth: 3,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textOutlineWidth"],
        },
    },
};

export const LabelTextOutlineColor: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textOutline: true,
                    textOutlineColor: "#1E293B",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textOutlineColor"],
        },
    },
};

export const LabelTextShadow: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textShadow: true,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textShadow"],
        },
    },
};

export const LabelTextShadowColor: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textShadow: true,
                    textShadowColor: "rgba(0, 0, 0, 0.5)",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textShadowColor"],
        },
    },
};

export const LabelTextShadowBlur: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textShadow: true,
                    textShadowBlur: 4,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textShadowBlur"],
        },
    },
};

export const LabelTextShadowOffsetX: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textShadow: true,
                    textShadowOffsetX: 3,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textShadowOffsetX"],
        },
    },
};

export const LabelTextShadowOffsetY: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    textShadow: true,
                    textShadowOffsetY: 3,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textShadowOffsetY"],
        },
    },
};

export const LabelBorderWidth: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    borderWidth: 2,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.borderWidth"],
        },
    },
};

export const LabelBorderColor: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    borderWidth: 2,
                    borderColor: "#6366F1",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.borderColor"],
        },
    },
};

export const LabelBackgroundGradient: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    backgroundGradient: true,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.backgroundGradient"],
        },
    },
};

export const LabelBackgroundGradientType: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    backgroundGradient: true,
                    backgroundGradientType: "radial",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.backgroundGradientType"],
        },
    },
};

export const LabelBackgroundGradientDirection: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    backgroundGradient: true,
                    backgroundGradientDirection: "horizontal",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.backgroundGradientDirection"],
        },
    },
};

export const LabelBackgroundGradientColors: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    backgroundGradient: true,
                    backgroundGradientColors: ["#6366F1", "#10B981"],
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.backgroundGradient"],
        },
    },
};

export const LabelPointer: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    pointer: true,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.pointer"],
        },
    },
};

export const LabelPointerDirection: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    pointer: true,
                    pointerDirection: "bottom",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.pointerDirection"],
        },
    },
};

export const LabelPointerWidth: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    pointer: true,
                    pointerWidth: 20,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.pointerWidth"],
        },
    },
};

export const LabelPointerHeight: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    pointer: true,
                    pointerHeight: 15,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.pointerHeight"],
        },
    },
};

export const LabelAnimation: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    animation: "pulse",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.animation"],
        },
    },
};

export const LabelAnimationSpeed: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    animation: "pulse",
                    animationSpeed: 2,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.animationSpeed"],
        },
    },
};

export const LabelBadge: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    badge: "notification",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.badge"],
        },
    },
};

export const LabelSmartOverflow: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    text: "999999",
                    smartOverflow: true,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.smartOverflow"],
        },
    },
};

export const LabelMaxNumber: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    text: "999999",
                    smartOverflow: true,
                    maxNumber: 999,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.maxNumber"],
        },
    },
};

export const LabelOverflowSuffix: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    text: "999999",
                    smartOverflow: true,
                    maxNumber: 999,
                    overflowSuffix: "+",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.overflowSuffix"],
        },
    },
};

export const LabelTextAlign: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    text: "Aligned Text",
                    textAlign: "center",
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.textAlign"],
        },
    },
};

export const LabelDepthFadeEnabled: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    depthFadeEnabled: true,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.depthFadeEnabled"],
        },
    },
};

export const LabelDepthFadeNear: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    depthFadeEnabled: true,
                    depthFadeNear: 50,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.depthFadeNear"],
        },
    },
};

export const LabelDepthFadeFar: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                    depthFadeEnabled: true,
                    depthFadeFar: 200,
                },
            },
        }),
    },
    parameters: {
        controls: {
            include: ["label.depthFadeFar"],
        },
    },
};
