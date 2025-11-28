import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Edge",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    parameters: {
        chromatic: {
            delay: 500,
        },
    },
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
        }),
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

/**
 * Edge with text labels on both arrow head, arrow tail, and the edge itself.
 * Demonstrates all three label positions with black text and no background.
 */
export const ArrowText: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {
                    type: "normal",
                    text: {
                        text: "end label",
                        fontSize: 14,
                        textColor: "#000000",
                        backgroundColor: "transparent",
                        attachOffset: 1,
                    },
                    color: "darkgrey",
                },
                arrowTail: {
                    type: "normal",
                    text: {
                        text: "start label",
                        fontSize: 14,
                        textColor: "#000000",
                        backgroundColor: "transparent",
                        attachOffset: 1,
                    },
                    color: "darkgrey",
                },
                label: {
                    enabled: true,
                    text: "edge label",
                    fontSize: 14,
                    textColor: "#000000",
                    backgroundColor: "transparent",
                    location: "top",
                    attachOffset: 0.5,
                },
                line: {type: "solid", color: "darkgrey"},
            },
        }),
    },
};
