import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Calculated",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete (30 frames at 60fps)
        },
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42, // Fixed seed for consistent layouts in visual tests
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const NodeSize: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                nodeCalculatedStyle: {
                    inputs: ["algorithmResults.graphty.degree.degreePct"],
                    output: "style.shape.size",
                    expr: "{ return arguments[0] * 5 }",
                    // expr: "{ return Math.round(arguments[0] * 5) }",
                },
                algorithms: ["graphty:degree"],
            }),
        runAlgorithmsOnLoad: true,
    },
};

export const NodeColor: Story = {
    args: {
        styleTemplate: templateCreator(
            {
                nodeCalculatedStyle: {
                    inputs: ["algorithmResults.graphty.degree.inDegreePct"],
                    output: "style.texture.color",
                    expr: `{
                        let r = Math.round(255 * arguments[0]);
                        let b = Math.round(255 * (1 - arguments[0]));
                        return "rgb(" + r + ", 0," + b +")"; }
                    `,
                },
                algorithms: ["graphty:degree"],
            },
        ),
        runAlgorithmsOnLoad: true,
    },
};
