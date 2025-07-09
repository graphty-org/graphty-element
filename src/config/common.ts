import Color from "colorjs.io";
import {z} from "zod/v4";
// import * as z4 from "zod/v4/core";

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Brand<T, B extends string> = T & {readonly __brand: B};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdHocData<KeyType extends string | number = string> = Brand<Record<KeyType, any>, "AdHocData">;

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

export const HttpUrl = z.url({
    protocol: /^https?$/,
    hostname: z.regexes.domain,
});

// "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
export const EmbeddedBase64Image = z.string().startsWith("data:image/png;base64,");

export const ImageData = HttpUrl.or(EmbeddedBase64Image);

