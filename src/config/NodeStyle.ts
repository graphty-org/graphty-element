import {z} from "zod/v4";
import {Node} from "../Node";
import {AdvancedColorStyle, ColorStyle, TextBlockStyle} from "./common";

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
    "triangular_prism",
    "pentagonal_prism",
    "hexagonal_prism",
    "square_pyramid",
    "pentagonal_pyramid",
    "triangular_dipyramid",
    "pentagonal_dipyramid",
    "elongated_square_dypyramid",
    "elongated_pentagonal_dipyramid",
    "elongated_pentagonal_cupola",
    "goldberg",
    "icosphere",
    "geodesic",
]);

export type NodeMeshFactoryType = typeof Node.defaultNodeMeshFactory;

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
    label: TextBlockStyle.prefault({location: "top-left", color: "black", background: "white"}).optional(),
    tooltip: TextBlockStyle.prefault({location: "top-right", color: "black", background: "white"}).optional(),
    enabled: z.boolean().default(true),
});

export type NodeStyleConfig = z.infer<typeof NodeStyle>;
export const defaultNodeStyle: NodeStyleConfig = {
    shape: {
        type: "icosphere",
        size: 1,
    },
    texture: {
        color: "lightgrey",
    },
    enabled: true,
};
