import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Edge/Bidirectional",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    args: {
        styleTemplate: templateCreator({}),
        nodeData: [
            {id: "A", position: {x: -3, y: 0, z: 0}},
            {id: "B", position: {x: 3, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B"},
        ],
        layout: "fixed",
        layoutConfig: {},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const BasicBidirectional: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", color: "darkgrey"},
                arrowTail: {type: "normal", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
};

export const MixedTypes: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "diamond", color: "darkgrey"},
                arrowTail: {type: "tee", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
};

export const DifferentColors: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", color: "#4A90E2"},
                arrowTail: {type: "dot", color: "#E24A4A"},
                line: {color: "darkgrey"},
            },
        }),
    },
};
