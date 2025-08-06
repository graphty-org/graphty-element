import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, nodeData, eventWaitingDecorator} from "./helpers";

const meta: Meta = {
    title: "Data",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete (30 frames at 60fps)
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Basic: Story = {
    args: {
        nodeData,
        edgeData,
        layout: "circular", // Use deterministic layout for visual tests
        layoutConfig: {
            // circular layout is deterministic, no seed needed
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for data3.json (77 nodes) with ngraph
                },
            },
        }),
    },
};

export const Json: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        layout: "circular", // Use deterministic layout for visual tests
        layoutConfig: {
            // circular layout is deterministic, no seed needed
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for data3.json (77 nodes) with ngraph
                },
            },
        }),
    },
};

export const ModifiedJson: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data2.json",
            edge: {
                path: "links",
            },
        },
        edgeSrcIdPath: "source",
        edgeDstIdPath: "target",
        layout: "circular", // Use deterministic layout for visual tests
        layoutConfig: {
            // circular layout is deterministic, no seed needed
        },
        // Add minimal styleTemplate just for preSteps
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for data3.json (77 nodes) with ngraph
                },
            },
        }),
    },
};
