import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

// Simple test data: 5 nodes, 6 edges - positioned close together in 3D space
const simpleNodeData = [
    {id: "A", type: "primary", position: {x: 0, y: 2, z: 0}},
    {id: "B", type: "secondary", position: {x: -2, y: 0, z: 0}},
    {id: "C", type: "primary", position: {x: 2, y: 0, z: 0}},
    {id: "D", type: "secondary", position: {x: 0, y: -2, z: 0}},
    {id: "E", type: "tertiary", position: {x: 0, y: 0, z: 2}},
];

const simpleEdgeData = [
    {src: "A", dst: "B", weight: 1},
    {src: "A", dst: "C", weight: 2},
    {src: "B", dst: "D", weight: 1},
    {src: "C", dst: "D", weight: 2},
    {src: "D", dst: "E", weight: 1},
    {src: "E", dst: "A", weight: 2},
];

const meta: Meta = {
    title: "Styles/Layered",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    parameters: {
        chromatic: {
            delay: 500,
        },
    },
    args: {
        nodeData: simpleNodeData,
        edgeData: simpleEdgeData,
        layout: "fixed",
        layoutConfig: {
            dim: 3,
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

/**
 * Two layers setting different node colors based on node type.
 * Layer 1: primary nodes -> red
 * Layer 2: secondary nodes -> blue
 */
export const TwoLayerNodeColors: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "type == 'primary'", style: {enabled: true, texture: {color: "red"}}}},
                {node: {selector: "type == 'secondary'", style: {enabled: true, texture: {color: "blue"}}}},
            ],
        }),
    },
};

/**
 * Two layers: one sets shape, another sets color.
 * Layer 1: primary nodes -> box shape
 * Layer 2: secondary nodes -> green color
 */
export const ShapeAndColorLayers: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "type == 'primary'", style: {enabled: true, shape: {type: "box"}}}},
                {node: {selector: "type == 'secondary'", style: {enabled: true, texture: {color: "green"}}}},
            ],
        }),
    },
};

/**
 * Three layers setting different node sizes.
 * Layer 1: node A -> large (size 2)
 * Layer 2: node B and C -> medium (size 1.5)
 * Layer 3: node E -> small (size 0.5)
 */
export const ThreeLayerSizes: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "id == 'A'", style: {enabled: true, shape: {size: 2}}}},
                {node: {selector: "id == 'B' || id == 'C'", style: {enabled: true, shape: {size: 1.5}}}},
                {node: {selector: "id == 'E'", style: {enabled: true, shape: {size: 0.5}}}},
            ],
        }),
    },
};

/**
 * Two layers setting different edge widths based on weight.
 * Layer 1: weight == 1 -> thin (0.1)
 * Layer 2: weight == 2 -> thick (0.5)
 */
export const EdgeWidthLayers: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {edge: {selector: "weight == `1`", style: {enabled: true, line: {width: 0.1}}}},
                {edge: {selector: "weight == `2`", style: {enabled: true, line: {width: 0.5}}}},
            ],
        }),
    },
};

/**
 * Three layers setting different arrow head types.
 * Layer 1: weight == 1 -> sphere-dot arrows
 * Layer 2: weight == 2 -> diamond arrows
 * Layer 3: all edges -> specific arrow color
 */
export const ArrowHeadStyles: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {edge: {selector: "weight == `1`", style: {enabled: true, arrowHead: {type: "sphere-dot", size: 1.5, color: "white", opacity: 1}}}},
                {edge: {selector: "weight == `2`", style: {enabled: true, arrowHead: {type: "diamond", size: 1.5, color: "white", opacity: 1}}}},
                {edge: {selector: "", style: {enabled: true, arrowHead: {type: "normal", size: 1, color: "yellow", opacity: 1}}}},
            ],
        }),
    },
};

/**
 * Four layers combining node shape, size, and color.
 * Layer 1: primary -> red
 * Layer 2: secondary -> blue
 * Layer 3: tertiary -> yellow + cylinder shape
 * Layer 4: node A -> extra large
 */
export const MixedNodeProperties: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "type == 'primary'", style: {enabled: true, texture: {color: "red"}}}},
                {node: {selector: "type == 'secondary'", style: {enabled: true, texture: {color: "blue"}}}},
                {node: {selector: "type == 'tertiary'", style: {enabled: true, texture: {color: "yellow"}, shape: {type: "cylinder"}}}},
                {node: {selector: "id == 'A'", style: {enabled: true, shape: {size: 2.5}}}},
            ],
        }),
    },
};

/**
 * Two layers setting edge colors based on weight.
 * Layer 1: weight == 1 -> green edges
 * Layer 2: weight == 2 -> red edges
 */
export const EdgeColorVariations: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {edge: {selector: "weight == `1`", style: {enabled: true, line: {color: "green"}, arrowHead: {type: "normal", size: 1, color: "green", opacity: 1}}}},
                {edge: {selector: "weight == `2`", style: {enabled: true, line: {color: "red"}, arrowHead: {type: "normal", size: 1, color: "red", opacity: 1}}}},
            ],
        }),
    },
};

/**
 * Three layers setting different opacity levels.
 * Layer 1: node A -> 30% opacity
 * Layer 2: nodes B and C -> 60% opacity
 * Layer 3: nodes D and E -> 90% opacity
 */
export const OpacityLayers: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "id == 'A'", style: {enabled: true, texture: {color: {colorType: "solid", value: "#FF0000", opacity: 0.3}}}}},
                {node: {selector: "id == 'B' || id == 'C'", style: {enabled: true, texture: {color: {colorType: "solid", value: "#00FF00", opacity: 0.6}}}}},
                {node: {selector: "id == 'D' || id == 'E'", style: {enabled: true, texture: {color: {colorType: "solid", value: "#0000FF", opacity: 0.9}}}}},
            ],
        }),
    },
};

/**
 * Two layers with wireframe effect on some nodes.
 * Layer 1: primary nodes -> wireframe enabled + red
 * Layer 2: secondary nodes -> solid blue
 */
export const WireframeEffectLayers: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "type == 'primary'", style: {enabled: true, effect: {wireframe: true}, texture: {color: "red"}}}},
                {node: {selector: "type == 'secondary'", style: {enabled: true, texture: {color: "blue"}}}},
            ],
        }),
    },
};

/**
 * Complex multi-property layers testing precedence.
 * Layer 1: All nodes -> green, size 1
 * Layer 2: primary -> red (overrides green)
 * Layer 3: node A -> box shape + size 2 (overrides size 1)
 * Layer 4: secondary -> sphere shape
 */
export const ComplexMultiProperty: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "", style: {enabled: true, texture: {color: "green"}, shape: {size: 1}}}},
                {node: {selector: "type == 'primary'", style: {enabled: true, texture: {color: "red"}}}},
                {node: {selector: "id == 'A'", style: {enabled: true, shape: {type: "box", size: 2}}}},
                {node: {selector: "type == 'secondary'", style: {enabled: true, shape: {type: "sphere"}}}},
            ],
        }),
    },
};

/**
 * Two layers enabling labels on specific nodes.
 * Layer 1: primary nodes -> labels enabled showing node ID
 * Layer 2: node E -> label enabled showing "E" in RED color
 */
export const LabelEnabledLayers: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "type == 'primary'", style: {enabled: true, label: {enabled: true, textPath: "id"}}}},
                {node: {selector: "id == 'E'", style: {enabled: true, label: {enabled: true, textPath: "id", textColor: "red"}}}},
            ],
        }),
    },
};

/**
 * Three layers with different arrow sizes and edge styling.
 * Layer 1: weight == 1 -> small arrows (0.5)
 * Layer 2: weight == 2 -> large arrows (2.0)
 * Layer 3: edges from A -> special color
 */
export const ArrowSizeVariations: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {edge: {selector: "weight == `1`", style: {enabled: true, arrowHead: {type: "normal", size: 0.5, color: "white", opacity: 1}}}},
                {edge: {selector: "weight == `2`", style: {enabled: true, arrowHead: {type: "normal", size: 2.0, color: "white", opacity: 1}}}},
                {edge: {selector: "src == 'A'", style: {enabled: true, line: {color: "purple"}, arrowHead: {type: "normal", size: 1, color: "purple", opacity: 1}}}},
            ],
        }),
    },
};

/**
 * Two layers combining node shapes with multiple properties.
 * Layer 1: primary -> tetrahedron + red
 * Layer 2: secondary -> octahedron + blue
 */
export const ShapeVariationsWithColor: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "type == 'primary'", style: {enabled: true, shape: {type: "tetrahedron"}, texture: {color: "red"}}}},
                {node: {selector: "type == 'secondary'", style: {enabled: true, shape: {type: "octahedron"}, texture: {color: "blue"}}}},
            ],
        }),
    },
};

/**
 * Axis-aligned colored spheres demonstrating 3D coordinate system.
 * This is useful for debugging 3D positioning and camera angles.
 * - Origin (0,0,0): Tiny black sphere
 * - X-axis (5,0,0): Large red sphere
 * - Y-axis (0,5,0): Large green sphere
 * - Z-axis (0,0,5): Large blue sphere
 *
 * Edges connect origin to each axis node.
 * Colors match BabylonJS AxesViewer convention (Red=X, Green=Y, Blue=Z).
 */
export const AxisAlignedColoredSpheres: Story = {
    args: {
        nodeData: [
            {id: "origin", position: {x: 0, y: 0, z: 0}},
            {id: "x-axis", position: {x: 5, y: 0, z: 0}},
            {id: "y-axis", position: {x: 0, y: 5, z: 0}},
            {id: "z-axis", position: {x: 0, y: 0, z: 5}},
        ],
        edgeData: [
            {src: "origin", dst: "x-axis"},
            {src: "origin", dst: "y-axis"},
            {src: "origin", dst: "z-axis"},
        ],
        layout: "fixed",
        layoutConfig: {
            dim: 3,
        },
        styleTemplate: templateCreator({
            layers: [
                // Origin: tiny black sphere
                {node: {selector: "id == 'origin'", style: {enabled: true, shape: {size: 0.5}, texture: {color: "black"}}}},
                // X-axis: large red sphere
                {node: {selector: "id == 'x-axis'", style: {enabled: true, shape: {size: 1.5}, texture: {color: "red"}}}},
                // Y-axis: large green sphere
                {node: {selector: "id == 'y-axis'", style: {enabled: true, shape: {size: 1.5}, texture: {color: "green"}}}},
                // Z-axis: large blue sphere
                {node: {selector: "id == 'z-axis'", style: {enabled: true, shape: {size: 1.5}, texture: {color: "blue"}}}},
            ],
        }),
    },
};
