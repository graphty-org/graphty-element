/**
 * Property Discovery System for Mesh Testing
 *
 * Automatically discovers and maps style properties to mesh properties
 * for comprehensive test coverage generation.
 */

import {Color3} from "@babylonjs/core";
import * as fc from "fast-check";

// Property definition interface
export interface PropertyDefinition {
    name: string;
    type: "string" | "number" | "boolean" | "color" | "array" | "object" | "enum";
    defaultValue?: unknown;
    enumValues?: string[];
    minValue?: number;
    maxValue?: number;
    affectsMesh: boolean;
    meshProperty?: string;
    description?: string;
    examples?: unknown[];
}

// Property map for each element type
export type PropertyMap = Record<string, PropertyDefinition>;

// Test matrix for comprehensive coverage
export interface TestMatrix {
    node: PropertyMap;
    edge: PropertyMap;
    label: PropertyMap;
    arrowhead: PropertyMap;
}

/**
 * Node Properties Discovery
 */
export const NODE_PROPERTIES: PropertyMap = {
    // Shape properties
    shape: {
        name: "shape",
        type: "enum",
        enumValues: [
            "sphere",
            "box",
            "cylinder",
            "cone",
            "capsule",
            "torus",
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
        ],
        defaultValue: "sphere",
        affectsMesh: true,
        meshProperty: "geometry.type",
        description: "The 3D shape of the node mesh",
        examples: ["sphere", "box", "cylinder", "cone"],
    },

    size: {
        name: "size",
        type: "number",
        defaultValue: 1,
        minValue: 0.01,
        maxValue: 100,
        affectsMesh: true,
        meshProperty: "scaling",
        description: "The size scaling factor for all dimensions",
        examples: [0.5, 1, 2, 10, 50],
    },

    color: {
        name: "color",
        type: "color",
        defaultValue: "#ffffff",
        affectsMesh: true,
        meshProperty: "material.diffuseColor",
        description: "The color of the node",
        examples: ["#ff0000", "#00ff00", "#0000ff", "rgba(255,0,0,0.5)", "red"],
    },

    // Material properties
    wireframe: {
        name: "wireframe",
        type: "boolean",
        defaultValue: false,
        affectsMesh: true,
        meshProperty: "material.wireframe",
        description: "Whether to render as wireframe",
        examples: [true, false],
    },

    opacity: {
        name: "opacity",
        type: "number",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        affectsMesh: true,
        meshProperty: "material.alpha",
        description: "The transparency of the node",
        examples: [0, 0.25, 0.5, 0.75, 1],
    },

    // Effect properties
    glow: {
        name: "glow",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "glowLayer",
        description: "Glow effect configuration",
        examples: [
            null,
            {color: "#ff0000", strength: 1},
            {color: "#00ff00", strength: 2.5},
        ],
    },

    outline: {
        name: "outline",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "outlineRenderer",
        description: "Outline effect configuration",
        examples: [
            null,
            {color: "#000000", width: 1},
            {color: "#ffffff", width: 3},
        ],
    },

    flatShading: {
        name: "flatShading",
        type: "boolean",
        defaultValue: false,
        affectsMesh: true,
        meshProperty: "material.flatShading",
        description: "Whether to use flat shading",
        examples: [true, false],
    },
};

/**
 * Edge Properties Discovery
 */
export const EDGE_PROPERTIES: PropertyMap = {
    // Line properties
    width: {
        name: "width",
        type: "number",
        defaultValue: 1,
        minValue: 0.1,
        maxValue: 50,
        affectsMesh: true,
        meshProperty: "greasedLine.widths",
        description: "The thickness of the edge line",
        examples: [0.5, 1, 2, 5, 10],
    },

    color: {
        name: "color",
        type: "color",
        defaultValue: "#000000",
        affectsMesh: true,
        meshProperty: "greasedLine.colors",
        description: "The color of the edge line",
        examples: ["#ff0000", "#00ff00", "#0000ff", "rgba(0,0,0,0.5)"],
    },

    type: {
        name: "type",
        type: "enum",
        enumValues: ["solid", "dash", "dash-dot", "dots", "equal-dash", "sinewave", "zigzag"],
        defaultValue: "solid",
        affectsMesh: true,
        meshProperty: "greasedLine.dashArray",
        description: "The line pattern type",
        examples: ["solid", "dash", "dots", "sinewave"],
    },

    opacity: {
        name: "opacity",
        type: "number",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        affectsMesh: true,
        meshProperty: "material.alpha",
        description: "The transparency of the edge",
        examples: [0.1, 0.5, 0.8, 1],
    },

    // Arrow properties
    arrow: {
        name: "arrow",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "arrowMeshes",
        description: "Arrow head and tail configuration",
        examples: [
            null,
            {source: {type: "normal"}},
            {target: {type: "diamond", color: "#ff0000"}},
            {source: {type: "dot"}, target: {type: "normal", size: 1.5}},
        ],
    },

    // Animation properties
    animation: {
        name: "animation",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "material.animation",
        description: "Edge animation configuration",
        examples: [
            null,
            {speed: 1},
            {speed: 2.5, reverse: true},
        ],
    },
};

/**
 * Arrow Head Properties Discovery
 */
export const ARROWHEAD_PROPERTIES: PropertyMap = {
    type: {
        name: "type",
        type: "enum",
        enumValues: [
            "normal",
            "inverted",
            "dot",
            "open-dot",
            "none",
            "tee",
            "open-normal",
            "diamond",
            "open-diamond",
            "crow",
            "box",
            "open",
            "half-open",
            "vee",
        ],
        defaultValue: "normal",
        affectsMesh: true,
        meshProperty: "geometry.type",
        description: "The shape of the arrow head",
        examples: ["normal", "diamond", "dot", "tee"],
    },

    size: {
        name: "size",
        type: "number",
        defaultValue: 1,
        minValue: 0.1,
        maxValue: 5,
        affectsMesh: true,
        meshProperty: "scaling",
        description: "Size multiplier for the arrow",
        examples: [0.5, 1, 1.5, 2.5],
    },

    color: {
        name: "color",
        type: "color",
        defaultValue: "inherit",
        affectsMesh: true,
        meshProperty: "material.diffuseColor",
        description: "Color of the arrow (inherit uses edge color)",
        examples: ["inherit", "#ff0000", "#00ff00", "#0000ff"],
    },
};

/**
 * Label Properties Discovery
 */
export const LABEL_PROPERTIES: PropertyMap = {
    // Text content
    text: {
        name: "text",
        type: "string",
        defaultValue: "",
        affectsMesh: true,
        meshProperty: "texture.textContent",
        description: "The text content of the label",
        examples: ["Hello", "Node 1", "🎉 Emoji", "Multi\nLine\nText", ""],
    },

    // Font properties
    font: {
        name: "font",
        type: "enum",
        enumValues: ["Arial", "Verdana", "Times", "Courier", "Helvetica"],
        defaultValue: "Verdana",
        affectsMesh: true,
        meshProperty: "texture.font",
        description: "The font family for the text",
        examples: ["Arial", "Verdana", "Times"],
    },

    fontSize: {
        name: "fontSize",
        type: "number",
        defaultValue: 48,
        minValue: 8,
        maxValue: 200,
        affectsMesh: true,
        meshProperty: "texture.fontSize",
        description: "The size of the font in pixels",
        examples: [12, 24, 48, 72, 120],
    },

    fontWeight: {
        name: "fontWeight",
        type: "enum",
        enumValues: ["normal", "bold"],
        defaultValue: "normal",
        affectsMesh: true,
        meshProperty: "texture.fontWeight",
        description: "The weight of the font",
        examples: ["normal", "bold"],
    },

    textColor: {
        name: "textColor",
        type: "color",
        defaultValue: "#000000",
        affectsMesh: true,
        meshProperty: "texture.fillStyle",
        description: "The color of the text",
        examples: ["#000000", "#ffffff", "#ff0000", "rgba(0,0,0,0.8)"],
    },

    textAlign: {
        name: "textAlign",
        type: "enum",
        enumValues: ["left", "center", "right"],
        defaultValue: "center",
        affectsMesh: true,
        meshProperty: "texture.textAlign",
        description: "The alignment of the text",
        examples: ["left", "center", "right"],
    },

    // Background properties
    backgroundColor: {
        name: "backgroundColor",
        type: "color",
        defaultValue: "transparent",
        affectsMesh: true,
        meshProperty: "texture.backgroundColor",
        description: "The background color of the label",
        examples: ["transparent", "#ffffff", "#000000", "rgba(255,255,255,0.8)"],
    },

    backgroundPadding: {
        name: "backgroundPadding",
        type: "number",
        defaultValue: 8,
        minValue: 0,
        maxValue: 50,
        affectsMesh: true,
        meshProperty: "texture.padding",
        description: "Padding around the text in pixels",
        examples: [0, 4, 8, 16, 32],
    },

    cornerRadius: {
        name: "cornerRadius",
        type: "number",
        defaultValue: 0,
        minValue: 0,
        maxValue: 50,
        affectsMesh: true,
        meshProperty: "texture.cornerRadius",
        description: "Corner radius for rounded backgrounds",
        examples: [0, 5, 10, 20],
    },

    // Border properties
    borders: {
        name: "borders",
        type: "array",
        defaultValue: [],
        affectsMesh: true,
        meshProperty: "texture.borders",
        description: "Array of border configurations",
        examples: [
            [],
            [{width: 2, color: "#ff0000"}],
            [
                {width: 2, color: "#ff0000"},
                {width: 1, color: "#00ff00", spacing: 3},
            ],
        ],
    },

    // Text effects properties
    textOutline: {
        name: "textOutline",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "texture.textOutline",
        description: "Text outline configuration",
        examples: [
            null,
            {width: 2, color: "#000000"},
            {width: 3, color: "#ffffff"},
        ],
    },

    textShadow: {
        name: "textShadow",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "texture.textShadow",
        description: "Text shadow configuration",
        examples: [
            null,
            {color: "rgba(0,0,0,0.5)", blur: 4, offsetX: 2, offsetY: 2},
            {color: "rgba(255,255,255,0.8)", blur: 2, offsetX: 1, offsetY: 1},
        ],
    },

    // Speech bubble properties
    pointer: {
        name: "pointer",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "texture.pointer",
        description: "Speech bubble pointer configuration",
        examples: [
            null,
            {direction: "bottom", width: 20, height: 15},
            {direction: "top", curve: true, offset: 0.3},
        ],
    },

    // Badge properties
    badge: {
        name: "badge",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "texture.badge",
        description: "Badge configuration",
        examples: [
            null,
            {type: "notification", count: 5},
            {type: "progress", progress: 0.75},
        ],
    },

    // Animation properties
    animation: {
        name: "animation",
        type: "object",
        defaultValue: null,
        affectsMesh: true,
        meshProperty: "animationGroup",
        description: "Label animation configuration",
        examples: [
            null,
            {type: "pulse", speed: 1.5},
            {type: "bounce", speed: 2},
        ],
    },
};

/**
 * Fast-check arbitraries for property-based testing
 */
export const PropertyArbitraries = {
    color(): fc.Arbitrary<string> {
        return fc.oneof(
            // Hex colors
            fc.stringMatching(/^#[0-9a-fA-F]{6}$/),
            // RGB colors
            fc.tuple(
                fc.integer({min: 0, max: 255}),
                fc.integer({min: 0, max: 255}),
                fc.integer({min: 0, max: 255}),
            ).map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`),
            // RGBA colors
            fc.tuple(
                fc.integer({min: 0, max: 255}),
                fc.integer({min: 0, max: 255}),
                fc.integer({min: 0, max: 255}),
                fc.float({min: 0, max: 1}),
            ).map(([r, g, b, a]) => `rgba(${r}, ${g}, ${b}, ${a})`),
            // Named colors
            fc.constantFrom("red", "green", "blue", "yellow", "purple", "orange", "black", "white"),
        );
    },

    nodeShape(): fc.Arbitrary<string> {
        return fc.constantFrom(... NODE_PROPERTIES.shape.enumValues ?? []);
    },

    edgeType(): fc.Arbitrary<string> {
        return fc.constantFrom(... EDGE_PROPERTIES.type.enumValues ?? []);
    },

    arrowType(): fc.Arbitrary<string> {
        return fc.constantFrom(... ARROWHEAD_PROPERTIES.type.enumValues ?? []);
    },

    borderConfig(): fc.Arbitrary<{width: number, color: string, spacing?: number}> {
        return fc.record({
            width: fc.integer({min: 1, max: 10}),
            color: this.color(),
            spacing: fc.option(fc.integer({min: 0, max: 10}), {nil: undefined}),
        });
    },

    textOutlineConfig(): fc.Arbitrary<{width: number, color: string}> {
        return fc.record({
            width: fc.integer({min: 1, max: 5}),
            color: this.color(),
        });
    },

    textShadowConfig(): fc.Arbitrary<{color: string, blur: number, offsetX: number, offsetY: number}> {
        return fc.record({
            color: this.color(),
            blur: fc.integer({min: 0, max: 10}),
            offsetX: fc.integer({min: -10, max: 10}),
            offsetY: fc.integer({min: -10, max: 10}),
        });
    },

    nodeStyle(): fc.Arbitrary<Record<string, unknown>> {
        return fc.record({
            shape: fc.option(this.nodeShape()),
            size: fc.option(fc.float({min: 0.01, max: 100})),
            color: fc.option(this.color()),
            wireframe: fc.option(fc.boolean()),
            opacity: fc.option(fc.float({min: 0, max: 1})),
        });
    },

    edgeStyle(): fc.Arbitrary<Record<string, unknown>> {
        return fc.record({
            width: fc.option(fc.float({min: 0.1, max: 50})),
            color: fc.option(this.color()),
            type: fc.option(this.edgeType()),
            opacity: fc.option(fc.float({min: 0, max: 1})),
        });
    },

    labelStyle(): fc.Arbitrary<Record<string, unknown>> {
        return fc.record({
            text: fc.option(fc.string({maxLength: 100})),
            fontSize: fc.option(fc.integer({min: 8, max: 200})),
            textColor: fc.option(this.color()),
            backgroundColor: fc.option(this.color()),
            borders: fc.option(fc.array(this.borderConfig(), {maxLength: 5})),
            textOutline: fc.option(this.textOutlineConfig()),
            textShadow: fc.option(this.textShadowConfig()),
        });
    },
};

/**
 * Property validation utilities
 */
export class PropertyValidator {
    parseColor(color: string): Color3 {
    // Simple color parsing - extend as needed
        if (color.startsWith("#")) {
            const hex = color.slice(1);
            const r = parseInt(hex.slice(0, 2), 16) / 255;
            const g = parseInt(hex.slice(2, 4), 16) / 255;
            const b = parseInt(hex.slice(4, 6), 16) / 255;
            return new Color3(r, g, b);
        }

        if (color.startsWith("rgb(")) {
            const values = color.match(/\d+/g);
            if (values && values.length >= 3) {
                return new Color3(
                    parseInt(values[0]) / 255,
                    parseInt(values[1]) / 255,
                    parseInt(values[2]) / 255,
                );
            }
        }

        // Named colors
        const namedColors: Record<string, Color3> = {
            red: new Color3(1, 0, 0),
            green: new Color3(0, 1, 0),
            blue: new Color3(0, 0, 1),
            yellow: new Color3(1, 1, 0),
            purple: new Color3(1, 0, 1),
            orange: new Color3(1, 0.5, 0),
            black: new Color3(0, 0, 0),
            white: new Color3(1, 1, 1),
        };

        return namedColors[color] ?? new Color3(1, 1, 1);
    }

    extractAlpha(color: string): number {
        if (color.startsWith("rgba(")) {
            const values = color.match(/[\d.]+/g);
            if (values && values.length >= 4) {
                return parseFloat(values[3]);
            }
        }

        return color === "transparent" ? 0 : 1;
    }

    isValidProperty(elementType: string, propertyName: string): boolean {
        const propertyMaps: Record<string, PropertyMap> = {
            node: NODE_PROPERTIES,
            edge: EDGE_PROPERTIES,
            label: LABEL_PROPERTIES,
            arrowhead: ARROWHEAD_PROPERTIES,
        };

        return elementType in propertyMaps && propertyName in propertyMaps[elementType];
    }
}

/**
 * Complete test matrix for all element types
 */
export const TEST_MATRIX: TestMatrix = {
    node: NODE_PROPERTIES,
    edge: EDGE_PROPERTIES,
    label: LABEL_PROPERTIES,
    arrowhead: ARROWHEAD_PROPERTIES,
};
