import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {templateFromCalculatedNodeStyle} from "./helpers";

const meta: Meta = {
    title: "Calculated",
    component: "graphty-element",
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const NodeSize: Story = {
    args: {
        styleTemplate: templateFromCalculatedNodeStyle(
            {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.shape.size",
                expr: "{ return arguments[0] * 5 }",
                // expr: "{ return Math.round(arguments[0] * 5) }",
            },
            ["graphty:degree"],
        ),
        runAlgorithmsOnLoad: true,
    },
};

export const NodeColor: Story = {
    args: {
        styleTemplate: templateFromCalculatedNodeStyle(
            {
                inputs: ["algorithmResults.graphty.degree.inDegreePct"],
                output: "style.texture.color",
                expr: `{
                    let r = Math.round(255 * arguments[0]);
                    let b = Math.round(255 * (1 - arguments[0]));
                    return "rgb(" + r + ", 0," + b +")"; }
                `,
            },
            ["graphty:degree"],
        ),
        runAlgorithmsOnLoad: true,
    },
};
