// Import algorithms to trigger side-effect registration
import "../../src/algorithms";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import type {Graphty} from "../../src/graphty-element";
import {eventWaitingDecorator, templateCreator, waitForGraphSettled} from "../helpers";

export type Story = StoryObj<Graphty>;

/**
 * Base meta configuration for algorithm stories (without title)
 * Each story file should spread this and add the title property
 */
export const algorithmMetaBase: Omit<Meta, "title"> = {
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete
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
        styleTemplate: templateCreator({
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for ngraph physics layout
                },
            },
        }),
    },
};

/**
 * Helper function for algorithm stories
 * Creates a story that runs an algorithm and applies its suggested styles
 */
export const createAlgorithmStory = (algorithmId: string): Story => ({
    args: {
        styleTemplate: templateCreator({
            algorithms: [algorithmId],
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for ngraph physics layout
                },
            },
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before applying algorithm styles
        await waitForGraphSettled(canvasElement);

        // Get the graphty-element
        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply suggested styles from the algorithm
        graph.applySuggestedStyles(algorithmId);

        // Re-apply styles to existing nodes and edges so they pick up the new style layers
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
});

// Re-export helpers for convenience
export {templateCreator, waitForGraphSettled} from "../helpers";
