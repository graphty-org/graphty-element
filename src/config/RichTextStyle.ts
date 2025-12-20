import {z} from "zod/v4";

import {AdvancedColorStyle, ColorStyle, TextLocation} from "./common";

// Position types
const Position3D = z.strictObject({
    x: z.number(),
    y: z.number(),
    z: z.number(),
});

const AttachPosition = z.enum([
    "top",
    "top-left",
    "top-right",
    "left",
    "center",
    "right",
    "bottom",
    "bottom-left",
    "bottom-right",
]);

const TextAlign = z.enum(["left", "center", "right"]);
const AnimationType = z.enum(["none", "pulse", "bounce", "shake", "glow", "fill"]);
const BadgeType = z.enum([
    "notification",
    "label",
    "label-success",
    "label-warning",
    "label-danger",
    "count",
    "icon",
    "progress",
    "dot",
]);
const GradientType = z.enum(["linear", "radial"]);
const GradientDirection = z.enum(["vertical", "horizontal", "diagonal"]);
const CanvasLineJoin = z.enum(["round", "bevel", "miter"]);

// Border configuration
const BorderConfig = z.strictObject({
    width: z.number(),
    color: ColorStyle,
    spacing: z.number(),
});

// Main RichTextStyle schema
export const RichTextStyle = z.strictObject({
    // Basic properties from original TextBlockStyle
    enabled: z.boolean().default(false).optional(),
    textPath: z.string().optional(),
    location: TextLocation.default("top").optional(),

    // Text content
    text: z.string().optional(),

    // Font settings
    font: z.string().default("Verdana").optional(),
    fontSize: z.number().default(48).optional(),
    fontWeight: z.string().default("normal").optional(),
    lineHeight: z.number().default(1.2).optional(),

    // Colors
    textColor: ColorStyle.default("#000000").optional(),
    backgroundColor: AdvancedColorStyle.or(ColorStyle).optional(),

    // Single border (legacy)
    borderWidth: z.number().default(0).optional(),
    borderColor: ColorStyle.default("#000000").optional(),

    // Multiple borders
    borders: z.array(BorderConfig).optional(),

    // Margins
    marginTop: z.number().default(5).optional(),
    marginBottom: z.number().default(5).optional(),
    marginLeft: z.number().default(5).optional(),
    marginRight: z.number().default(5).optional(),

    // Layout
    textAlign: TextAlign.default("center").optional(),
    cornerRadius: z.number().default(0).optional(),
    autoSize: z.boolean().default(true).optional(),
    resolution: z.number().default(128).optional(),
    billboardMode: z.number().default(7).optional(), // BABYLON.Mesh.BILLBOARDMODE_ALL

    // Position
    position: Position3D.optional(),
    attachPosition: AttachPosition.optional(),
    attachOffset: z.number().default(0).optional(),

    // Depth fading
    depthFadeEnabled: z.boolean().default(false).optional(),
    depthFadeNear: z.number().default(10).optional(),
    depthFadeFar: z.number().default(50).optional(),

    // Text effects
    textOutline: z.boolean().default(false).optional(),
    textOutlineWidth: z.number().default(2).optional(),
    textOutlineColor: ColorStyle.default("#000000").optional(),
    textOutlineJoin: CanvasLineJoin.default("round").optional(),
    textShadow: z.boolean().default(false).optional(),
    textShadowColor: ColorStyle.default("#000000").optional(),
    textShadowBlur: z.number().default(4).optional(),
    textShadowOffsetX: z.number().default(2).optional(),
    textShadowOffsetY: z.number().default(2).optional(),

    // Background effects
    backgroundPadding: z.number().default(0).optional(),
    backgroundGradient: z.boolean().default(false).optional(),
    backgroundGradientType: GradientType.default("linear").optional(),
    backgroundGradientColors: z.array(ColorStyle).optional(),
    backgroundGradientDirection: GradientDirection.default("vertical").optional(),

    // Pointer/Arrow
    pointer: z.boolean().default(false).optional(),
    pointerDirection: z.enum(["top", "bottom", "left", "right", "auto"]).default("auto").optional(),
    pointerWidth: z.number().default(20).optional(),
    pointerHeight: z.number().default(10).optional(),
    pointerOffset: z.number().default(0).optional(),
    pointerCurve: z.boolean().default(false).optional(),

    // Animation
    animation: AnimationType.default("none").optional(),
    animationSpeed: z.number().default(1).optional(),

    // Badge
    badge: BadgeType.optional(),
    icon: z.string().optional(),
    iconPosition: z.enum(["left", "right"]).default("left").optional(),
    progress: z.number().min(0).max(1).optional(),

    // Smart overflow
    smartOverflow: z.boolean().default(false).optional(),
    maxNumber: z.number().default(999).optional(),
    overflowSuffix: z.string().default("+").optional(),
});

// Type export for convenience
export type RichTextStyleType = z.infer<typeof RichTextStyle>;

/**
 * Default values for RichTextStyle labels.
 * Parsed from the Zod schema to ensure defaults stay in sync.
 */
export const defaultRichTextLabelStyle: RichTextStyleType = RichTextStyle.parse({});

