import type {Meta, StoryObj} from "@storybook/web-components-vite";

import type {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

interface EdgeData {
    src: string;
    dst: string;
}

/**
 * Generate random edges between nodes using seeded random.
 * Ensures every node has at least one edge.
 */
function generateEdges(nodeCount: number, edgeCount: number): EdgeData[] {
    const edges: EdgeData[] = [];
    let seed = 42;
    const random = (): number => {
        seed = ((seed * 1103515245) + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    const edgeSet = new Set<string>();

    // First, ensure every node has at least one edge
    for (let i = 0; i < nodeCount; i++) {
        let dst = Math.floor(random() * nodeCount);
        while (dst === i) {
            dst = Math.floor(random() * nodeCount);
        }
        const key = `${i}-${dst}`;
        if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({src: `node-${i}`, dst: `node-${dst}`});
        }
    }

    // Then add remaining random edges
    while (edges.length < edgeCount) {
        const src = Math.floor(random() * nodeCount);
        const dst = Math.floor(random() * nodeCount);

        if (src !== dst) {
            const key = `${src}-${dst}`;
            if (!edgeSet.has(key)) {
                edgeSet.add(key);
                edges.push({src: `node-${src}`, dst: `node-${dst}`});
            }
        }
    }

    return edges;
}

// Generate 250 edges with 150 nodes (no positions for physics layout)
const nodes150 = Array.from({length: 150}, (_, i) => ({id: `node-${i}`}));
const edges250 = generateEdges(150, 250);

const meta: Meta = {
    title: "Performance/Large Graph",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    parameters: {
        chromatic: {
            disableSnapshot: true,
        },
    },
    args: {
        layout: "ngraph",
        layoutConfig: {seed: 42},
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {color: "#666666"},
                arrowHead: {type: "normal", color: "#666666"},
            },
            nodeStyle: {
                texture: {color: {colorType: "solid", value: "#5A67D8"}},
                shape: {type: "sphere", size: 0.5},
            },
        }),
        nodeData: nodes150,
        edgeData: edges250,
    },
};
export default meta;

type Story = StoryObj<Graphty>;

/**
 * 250 edges with 150 nodes - ngraph physics layout with normal arrowheads
 * Every node has at least one edge.
 */
export const Physics250: Story = {};
