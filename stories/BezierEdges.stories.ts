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
        layout: "fixed",
        layoutConfig: {},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Bezier: Story = {
    args: {
        nodeData: [
            {id: "A", position: {x: -5, y: 0, z: -3}},
            {id: "B", position: {x: 5, y: 0, z: 3}},
            {id: "C", position: {x: 0, y: 5, z: 0}},
            {id: "D", position: {x: 0, y: -5, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B"},
            {src: "B", dst: "C"},
            {src: "C", dst: "D"},
            {src: "D", dst: "A"},
            {src: "A", dst: "C"},
            {src: "B", dst: "D"},
        ],
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {
                    bezier: true,
                    color: "#48DBFB",
                },
                arrowHead: {
                    type: "normal",
                    color: "#48DBFB",
                    size: 1.2,
                },
            },
        }),
    },
};
