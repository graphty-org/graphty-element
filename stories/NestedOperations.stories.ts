import type {Meta, StoryObj} from "@storybook/web-components";

import {Graphty} from "../src/graphty-element.js";
import {eventWaitingDecorator, templateCreator} from "./helpers.js";

const meta: Meta = {
    title: "Queue/Nested Operations",
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
];

const TEST_EDGES = [
    {src: "1", dst: "2"},
    {src: "2", dst: "3"},
];

const BASE_STYLE = {
    nodeStyle: {
        texture: {color: "#4CAF50"},
        shape: {type: "sphere", size: 10},
    },
};

// Story 1: Style template changes twoD property
export const StyleChanges2D: Story = {
    name: "Style Changes twoD Property",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Start with 3D
        g.styleTemplate = templateCreator({
            ... BASE_STYLE,
            graph: {twoD: false},
        });
        g.layout = "circular";
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;

        setTimeout(() => {
            // Switch to 2D - internally calls updateLayoutDimension()
            // This will fail without the nested operation fix
            g.styleTemplate = templateCreator({
                ... BASE_STYLE,
                graph: {twoD: true},
            });
        }, 10);

        // Visual: Should render correctly in 2D
        return g;
    },
};

// Story 2: Style template includes layout property
export const StyleWithLayoutProperty: Story = {
    name: "Style with Layout Property",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Style template includes layout configuration
        // This will fail without the nested operation fix
        g.styleTemplate = templateCreator({
            ... BASE_STYLE,
            graph: {
                layout: "circular",
            },
        });
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;

        // Visual: Should apply circular layout correctly
        return g;
    },
};

// Story 3: Multiple rapid style changes affecting layout
export const RapidStyleChanges2D: Story = {
    name: "Rapid Style Changes (2D/3D)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Rapidly toggle 2D/3D
        g.styleTemplate = templateCreator({
            ... BASE_STYLE,
            graph: {twoD: false},
        });
        g.layout = "circular";
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;

        setTimeout(() => {
            g.styleTemplate = templateCreator({
                ... BASE_STYLE,
                graph: {twoD: true},
            });
        }, 5);

        setTimeout(() => {
            g.styleTemplate = templateCreator({
                ... BASE_STYLE,
                graph: {twoD: false},
            });
        }, 10);

        // Final: 3D
        setTimeout(() => {
            g.styleTemplate = templateCreator(BASE_STYLE);
        }, 15);

        // Visual: Should render correctly in final state
        return g;
    },
};
