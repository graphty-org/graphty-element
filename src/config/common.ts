import Color from "colorjs.io";
import {z} from "zod/v4";
// import * as z4 from "zod/v4/core";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function colorToHex(s: string): string | undefined {
    const color = new Color(s);
    let hex = color.to("srgb").toString({format: "hex"}).toUpperCase();
    if (hex.length === 4) {
        // XXX: BabylonJS only likes the long format of hex strings
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }

    return hex;
}

export const ColorStyle = z.string().transform(colorToHex);
export const AdvancedColorStyle = z.discriminatedUnion("colorType", [
    z.strictObject({
        colorType: z.literal("solid"),
        value: ColorStyle,
        opacity: z.number().min(0).max(1).optional(),
    }),
    z.strictObject({
        colorType: z.literal("gradient"),
        direction: z.number().min(0).max(360),
        colors: z.array(ColorStyle),
        opacity: z.number().min(0).max(1).optional(),
    }),
    z.strictObject({
        colorType: z.literal("radial-gradient"),
        colors: z.array(ColorStyle),
        opacity: z.number().min(0).max(1).optional(),
    }),
]);
// const ColorScheme = z.array(ColorStyle);

export const TextType = z.enum([
    "plain",
    "markdown",
    "html",
]);

export const TextLocation = z.enum([
    "top",
    "top-right",
    "top-left",
    "left",
    "center",
    "right",
    "bottom",
    "bottom-left",
    "bottom-right",
    "automatic",
]);

export const TextBlockStyle = z.strictObject({
    // whether or not the text block gets rendered
    enabled: z.boolean().default(false),
    // the font family / type to use for text
    font: z.string().default("Arial"),
    // a jmespath pointing to the text to use for this block
    textPath: z.string().optional(),
    // underline, bold, italic, etc.
    style: z.string().optional(),
    // pixel height of the text
    size: z.number().default(48),
    // special formatting processor (html, markdown, etc.)
    textType: TextType.optional(),
    // color of the text
    color: ColorStyle.prefault("black"),
    // color of the background behind the text
    background: AdvancedColorStyle.or(ColorStyle).prefault("white"),
    // how much rounding for the background corners
    backgroundCornerRadius: z.number().optional(),
    // where to locate the text relative to it's parent
    location: TextLocation.default("top"),
    // how much space to have between the text and the edge of the background
    margin: z.number().positive().default(5),
});

export const HttpUrl = z.url({
    protocol: /^https?$/,
    // @ts-expect-error it exists in the source, not sure why TS complains about .domain not existing
    hostname: z.regexes.domain,
});

// "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
export const EmbeddedBase64Image = z.string().startsWith("data:image/png;base64,");

export const ImageData = HttpUrl.or(EmbeddedBase64Image);

export const GraphKnownFields = z.object({
    nodeIdPath: z.string().default("id"),
    nodeWeightPath: z.string().or(z.null()).default(null),
    nodeTimePath: z.string().or(z.null()).default(null),
    edgeSrcIdPath: z.string().default("src"),
    edgeDstIdPath: z.string().default("dst"),
    edgeWeightPath: z.string().or(z.null()).default(null),
    edgeTimePath: z.string().or(z.null()).default(null),
}).prefault({});
