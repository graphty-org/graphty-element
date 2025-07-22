import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../../src/graphty-element";
import {renderFn, templateCreator} from "../helpers";

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
        labelMarginTop: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Position"}, name: "label.marginTop"},
        labelMarginBottom: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Position"}, name: "label.marginBottom"},
        labelMarginLeft: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Position"}, name: "label.marginLeft"},
        labelMarginRight: {control: {type: "range", min: 0, max: 50, step: 1}, table: {category: "Position"}, name: "label.marginRight"},
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
        labelAnimation: {control: "select", options: ["none", "pulse", "bounce", "shake", "glow", "fill"], table: {category: "Animation"}, name: "label.animation"},
        labelAnimationSpeed: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Animation"}, name: "label.animationSpeed"},

        // Badge
        labelBadge: {control: "select", options: ["none", "notification", "label", "label-success", "label-warning", "label-danger", "count", "icon", "progress", "dot"], table: {category: "Badge"}, name: "label.badge"},

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
                "label.marginTop",
                "label.marginBottom",
                "label.marginLeft",
                "label.marginRight",
                "label.attachOffset",
                "label.cornerRadius",
                "label.fontWeight",
            ],
        },
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        styleTemplate: templateCreator({
            nodeStyle: {
                label: {
                    enabled: true,
                    textPath: "id",
                },
            },
        }),
        layout: "ngraph",
    },
};
export default meta;

type Story = StoryObj<Graphty>;

// Helper to create story args with data source
const createLabelStoryArgs = (labelConfig: Record<string, unknown>): {
    dataSource: string;
    dataSourceConfig: {data: string};
    styleTemplate: ReturnType<typeof templateCreator>;
} => ({
    dataSource: "json",
    dataSourceConfig: {
        data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
    },
    styleTemplate: templateCreator({
        nodeStyle: {
            label: labelConfig,
        },
    }),
});

export const Default: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
    }),
};

export const Enabled: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
    }),
    parameters: {
        controls: {
            include: ["label.enabled"],
        },
    },
};

export const TextPath: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "group",
    }),
    parameters: {
        controls: {
            include: ["label.textPath"],
        },
    },
};

export const StaticText: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "Static Label",
    }),
    parameters: {
        controls: {
            include: ["label.text"],
        },
    },
};

export const FontType: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        font: "'JetBrains Mono', monospace",
    }),
    parameters: {
        controls: {
            include: ["label.font"],
        },
    },
};

export const FontSize: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        fontSize: 96,
    }),
    parameters: {
        controls: {
            include: ["label.fontSize"],
        },
    },
};

export const FontWeight: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        fontWeight: "bold",
    }),
    parameters: {
        controls: {
            include: ["label.fontWeight"],
        },
    },
};

export const TextColor: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        textColor: "#6366F1",
    }),
    parameters: {
        controls: {
            include: ["label.textColor"],
        },
    },
};

export const BackgroundColor: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        backgroundColor: "#10B981",
    }),
    parameters: {
        controls: {
            include: ["label.backgroundColor"],
        },
    },
};

export const CornerRadius: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        cornerRadius: 12,
        backgroundColor: "rgba(220, 220, 220, 1)",
    }),
    parameters: {
        controls: {
            include: ["label.cornerRadius", "label.backgroundColor"],
        },
    },
};

export const Location: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        location: "top",
    }),
    parameters: {
        controls: {
            include: ["label.location"],
        },
    },
};

export const Margin: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        backgroundColor: "rgba(220, 220, 220, 1)",
    }),
    parameters: {
        controls: {
            include: ["label.marginTop", "label.marginBottom", "label.marginLeft", "label.marginRight", "label.backgroundColor"],
        },
    },
};

export const AttachOffset: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        attachOffset: 2,
    }),
    parameters: {
        controls: {
            include: ["label.attachOffset"],
        },
    },
};

export const LineHeight: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "Line 1\nLine 2\nLine 3",
        lineHeight: 1.5,
    }),
    parameters: {
        controls: {
            include: ["label.lineHeight"],
        },
    },
};

export const TextOutline: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        textOutline: true,
        textOutlineColor: "#FF0000",
        textOutlineWidth: 10,
    }),
    parameters: {
        controls: {
            include: ["label.textOutline", "label.textOutlineWidth", "label.textOutlineColor"],
        },
    },
};

export const TextShadow: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        textShadow: true,
        textShadowColor: "rgba(0, 0, 0, 0.5)",
        textShadowBlur: 4,
        textShadowOffsetX: 3,
        textShadowOffsetY: 3,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    }),
    parameters: {
        controls: {
            include: ["label.textShadow", "label.textShadowColor", "label.textShadowBlur", "label.textShadowOffsetX", "label.textShadowOffsetY", "label.backgroundColor"],
        },
    },
};

export const Border: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        borderWidth: 2,
        borderColor: "#6366F1",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
    }),
    parameters: {
        controls: {
            include: ["label.borderWidth", "label.borderColor", "label.backgroundColor"],
        },
    },
};

export const BackgroundGradient: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        backgroundGradient: true,
        backgroundGradientType: "linear",
        backgroundGradientDirection: "horizontal",
        backgroundGradientColors: ["#6366F1", "#10B981"],
    }),
    parameters: {
        controls: {
            include: ["label.backgroundGradient", "label.backgroundGradientType", "label.backgroundGradientDirection"],
        },
    },
};

export const Pointer: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        pointer: true,
        pointerDirection: "bottom",
        pointerWidth: 20,
        pointerHeight: 15,
        backgroundColor: "rgba(220, 220, 220, 1)",
        location: "top",
        attachOffset: 1.5,
    }),
    parameters: {
        controls: {
            include: ["label.pointer", "label.pointerDirection", "label.pointerWidth", "label.pointerHeight", "label.backgroundColor", "label.location"],
        },
    },
};

export const Animation: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        animation: "pulse",
        animationSpeed: 2,
        backgroundColor: "rgba(255, 59, 48, 0.9)",
        textColor: "white",
    }),
    parameters: {
        controls: {
            include: ["label.animation", "label.animationSpeed", "label.backgroundColor"],
        },
    },
};

export const Badge: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        badge: "notification",
    }),
    parameters: {
        controls: {
            include: ["label.badge"],
        },
    },
};

export const SmartOverflow: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "999999",
        smartOverflow: true,
        backgroundColor: "rgba(100, 100, 100, 0.8)",
        textColor: "white",
    }),
    parameters: {
        controls: {
            include: ["label.smartOverflow", "label.text"],
        },
    },
};

export const MaxNumber: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "1500",
        smartOverflow: true,
        maxNumber: 99,
        backgroundColor: "rgba(100, 100, 100, 0.8)",
        textColor: "white",
    }),
    parameters: {
        controls: {
            include: ["label.maxNumber", "label.text", "label.smartOverflow"],
        },
    },
};

export const OverflowSuffix: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "150",
        smartOverflow: true,
        maxNumber: 99,
        overflowSuffix: "++",
        backgroundColor: "rgba(100, 100, 100, 0.8)",
        textColor: "white",
    }),
    parameters: {
        controls: {
            include: ["label.overflowSuffix", "label.maxNumber", "label.text"],
        },
    },
};

export const TextAlign: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "This\nis\nmulti-line\ntext",
        textAlign: "center",
    }),
    parameters: {
        controls: {
            include: ["label.textAlign"],
        },
    },
};

export const DepthFade: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        textPath: "id",
        depthFadeEnabled: true,
        depthFadeNear: 50,
        depthFadeFar: 200,
    }),
    parameters: {
        controls: {
            include: ["label.depthFadeEnabled", "label.depthFadeNear", "label.depthFadeFar"],
        },
    },
};

export const EmojiLabels: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "🚀💫🌈✨",
        fontSize: 32,
    }),
};

export const UnicodeText: Story = {
    args: createLabelStoryArgs({
        enabled: true,
        text: "こんにちは\nПривет\nمرحبا",
        fontSize: 96,
        lineHeight: 1.5,
    }),
};
