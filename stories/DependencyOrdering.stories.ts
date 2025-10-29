import type {Meta, StoryObj} from "@storybook/web-components";

import {Graphty} from "../src/graphty-element.js";
import {eventWaitingDecorator, templateCreator} from "./helpers.js";

const meta: Meta = {
    title: "Queue/Dependency Ordering",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        layout: "fullscreen",
        chromatic: {delay: 500},
    },
};

export default meta;
type Story = StoryObj<Graphty>;

const TEST_NODES = [
    {id: "1", label: "Node 1"},
    {id: "2", label: "Node 2"},
    {id: "3", label: "Node 3"},
    {id: "4", label: "Node 4"},
];

const TEST_EDGES = [
    {src: "1", dst: "2"},
    {src: "2", dst: "3"},
    {src: "3", dst: "4"},
];

const STYLE_TEMPLATE = templateCreator({
    nodeStyle: {
        texture: {color: "#4CAF50"},
        shape: {type: "sphere", size: 10},
    },
});

// Story 1: Rapid layout + data (no delay)
export const RapidLayoutAndData: Story = {
    name: "Rapid Layout + Data",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // No setTimeout - immediate operations
        // Testing stateless design: style AFTER data should work the same
        g.layout = "circular"; // Queues layout-set
        g.nodeData = TEST_NODES; // Immediately triggers layout-update
        g.edgeData = TEST_EDGES;
        g.styleTemplate = STYLE_TEMPLATE; // Style set LAST

        // Visual verification: nodes should be positioned in circle
        // This will FAIL without the dependency fix
        return g;
    },
};

// Story 2: Multiple data additions triggering layout-update
export const MultipleDataAdditions: Story = {
    name: "Multiple Data Additions",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        g.layout = "circular";
        g.nodeData = [TEST_NODES[0], TEST_NODES[1]];
        g.styleTemplate = STYLE_TEMPLATE; // Style set AFTER initial data

        setTimeout(() => {
            g.nodeData = [... TEST_NODES.slice(0, 2), ... TEST_NODES.slice(2)];
            g.edgeData = TEST_EDGES; // Add edges after all nodes are present
        }, 10);

        // Visual: Only final layout-update should execute (self-obsolescence)
        return g;
    },
};

// Story 3: Multiple layout changes before data
export const MultipleLayoutsBeforeData: Story = {
    name: "Multiple Layouts Before Data",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        g.layout = "random";
        g.layout = "grid";
        g.layout = "circular"; // Final

        setTimeout(() => {
            g.nodeData = TEST_NODES;
            g.edgeData = TEST_EDGES;
            g.styleTemplate = STYLE_TEMPLATE; // Style set LAST in timeout
        }, 10);

        // Visual: Nodes should use circular layout, not random
        return g;
    },
};

// Story 4: Interleaved layout and data changes
export const InterleavedLayoutData: Story = {
    name: "Interleaved Layout + Data",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        g.layout = "random";

        setTimeout(() => {
            g.nodeData = [TEST_NODES[0], TEST_NODES[1]];
        }, 5);

        setTimeout(() => {
            g.layout = "circular"; // Final
            g.styleTemplate = STYLE_TEMPLATE; // Style interleaved with operations
        }, 10);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // Final
            g.edgeData = TEST_EDGES;
        }, 15);

        // Visual: Circular layout with all nodes
        return g;
    },
};
