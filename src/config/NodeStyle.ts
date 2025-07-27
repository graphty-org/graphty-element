import {z} from "zod/v4";

import {AdvancedColorStyle, ColorStyle} from "./common";
import {RichTextStyle} from "./RichTextStyle";

export const NodeShapes = z.enum([
    "box",
    "sphere",
    "cylinder",
    "cone",
    "capsule",
    "torus-knot",
    "tetrahedron",
    "octahedron",
    "dodecahedron",
    "icosahedron",
    "rhombicuboctahedron",
    "triangular-prism",
    "pentagonal-prism",
    "hexagonal-prism",
    "square-pyramid",
    "pentagonal-pyramid",
    "triangular-dipyramid",
    "pentagonal-dipyramid",
    "elongated-square-dipyramid",
    "elongated-pentagonal-dipyramid",
    "elongated-pentagonal-cupola",
    "goldberg",
    "icosphere",
    "geodesic",
]);

export const NodeStyle = z.strictObject({
    shape: z.strictObject({
        size: z.number().positive().optional(),
        type: NodeShapes.optional(),
        // custom mesh https://doc.babylonjs.com/features/featuresDeepDive/mesh/creation/custom/custom
        // import mesh https://doc.babylonjs.com/typedoc/functions/BABYLON.ImportMeshAsync
    }).optional(),
    texture: z.strictObject({
        color: AdvancedColorStyle.or(ColorStyle).optional(),
        image: z.url().optional(),
        icon: z.string().optional(),
        // pieChart: z.string().or(z.null()).default(null), // https://manual.cytoscape.org/en/stable/Styles.html#using-graphics-in-styles
        // shader: z.url().or(z.null()).default(null), // https://doc.babylonjs.com/features/featuresDeepDive/materials/shaders/
        // bumpmap: z.url().or(z.null()).default(null), // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/moreMaterials/#bump-map
        // refraction // https://forum.babylonjs.com/t/how-to-make-a-semi-transparent-glass-ball-with-a-through-hole-with-albedotexture/27357/24
        // reflection // https://doc.babylonjs.com/features/featuresDeepDive/materials/using/reflectionTexture/
    }).optional(),
    effect: z.strictObject({
        glow: z.strictObject({ // https://doc.babylonjs.com/features/featuresDeepDive/mesh/glowLayer
            color: ColorStyle.optional(),
            strength: z.number().positive().optional(),
        }).optional(),
        outline: z.strictObject({ // https://forum.babylonjs.com/t/how-to-get-the-perfect-outline/31711
            color: ColorStyle.optional(),
            width: z.number().positive().optional(),
        }).optional(),
        wireframe: z.boolean().optional(),
        flatShaded: z.boolean().optional(),
    }).optional(),
    label: RichTextStyle.prefault({location: "top", textColor: "#000000"}).optional(),
    tooltip: RichTextStyle.prefault({location: "top-right", textColor: "#000000", backgroundColor: "#FFFFFF"}).optional(),
    enabled: z.boolean().default(true),
});

export type NodeStyleConfig = z.infer<typeof NodeStyle>;
export const defaultNodeStyle: NodeStyleConfig = {
    shape: {
        type: "icosphere",
        size: 1,
    },
    texture: {
        color: "#6366F1",
    },
    enabled: true,
};
