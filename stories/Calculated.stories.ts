import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {StyleSchema, StyleTemplate} from "../index.ts";
import {CalculatedStyleConfig} from "../src/config/StyleTemplate.ts";
import {Graphty} from "../src/graphty-element";

function templateFromNodeStyle(calculatedStyle: CalculatedStyleConfig, algorithms: string[] = []): StyleSchema {
    const template = StyleTemplate.parse({
        graphtyTemplate: true,
        majorVersion: "1",
        data: {
            algorithms,
        },
        graph: {
            addDefaultStyle: true,
        },
        layers: [
            {
                node: {
                    selector: "",
                    style: {},
                    calculatedStyle,
                },
            },
        ],
    });

    return template;
}

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
        styleTemplate: templateFromNodeStyle(
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
        styleTemplate: templateFromNodeStyle(
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
