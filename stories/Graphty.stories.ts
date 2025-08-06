import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData} from "./helpers";

const meta: Meta = {
    title: "Graphty",
    tags: ["autodocs"],
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
    args: {
        nodeData,
        edgeData,
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const graphty: Story = {
    args: {
        layoutConfig: {
            seed: 42, // Fixed seed for deterministic layout
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 2000, // Increase preSteps for more stable layouts
                },
            },
        }),
    },
};
