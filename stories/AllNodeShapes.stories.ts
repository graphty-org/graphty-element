import type {Meta, StoryObj} from "@storybook/web-components-vite";

import type {StyleLayerType} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, nodeShapes, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Node",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    parameters: {
        chromatic: {
            delay: 500,
        },
    },
    args: {
        styleTemplate: templateCreator({}),
        layout: "fixed",
        layoutConfig: {},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

// Generate node data for all shapes in a 5x5 grid with 3D depth
const generateNodeData = (): {id: string, position: {x: number, y: number, z: number}}[] => {
    const nodes: {id: string, position: {x: number, y: number, z: number}}[] = [];
    const spacing = 4;
    const cols = 5;

    nodeShapes.forEach((shape, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        nodes.push({
            id: shape,
            position: {
                x: (col - 2) * spacing, // Center around origin (-8 to 8)
                y: (2 - row) * spacing, // Top to bottom (8 to -8)
                z: (2 - row) * 2, // Add depth for 3D effect
            },
        });
    });

    return nodes;
};

// Generate layer styles for each shape with label
const generateLayers = (): StyleLayerType[] => {
    return nodeShapes.map((shape) => ({
        node: {
            selector: `id == '${shape}'`,
            style: {
                shape: {type: shape},
                label: {
                    enabled: true,
                    text: shape,
                    fontSize: 24,
                    textColor: "#000000",
                    backgroundColor: "transparent",
                    location: "top",
                    attachOffset: 0.5,
                },
            },
        },
    }));
};

/**
 * All Node Shapes - Comprehensive showcase of all 24 available node shapes.
 * Each node is labeled with its configuration name.
 * Arranged in a 5x5 grid for easy visual comparison.
 */
export const AllNodeShapes: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: false, startingCameraDistance: 30},
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
            layers: generateLayers(),
        }),
        nodeData: generateNodeData(),
        edgeData: [],
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};
