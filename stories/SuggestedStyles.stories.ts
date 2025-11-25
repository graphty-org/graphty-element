import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Suggested Styles",
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

/**
 * Manual configuration of node color based on degree centrality.
 * This shows the traditional approach where you manually configure the calculatedStyle.
 */
export const ManualConfiguration: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.degree.degreePct"],
                output: "style.texture.color",
                expr: "{ return 'hsl(' + (0 + arguments[0] * 60) + ', 70%, 50%)' }",
            },
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Using suggested styles from the DegreeAlgorithm.
 * This demonstrates the new applySuggestedStyles() API which automatically
 * configures the visualization based on the algorithm's recommended styling.
 */
export const WithSuggestedStyles: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        // Wait for the graph to load and settle
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the graphty-element
        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;

        // Access the graph instance via the public API
        const {graph} = graphtyElement;

        // Apply suggested styles from the degree algorithm
        graph.applySuggestedStyles("graphty:degree");

        // CRITICAL: Re-apply styles to existing nodes so they pick up the new calculatedStyle layer
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Demonstrates the API for applying suggested styles from multiple algorithms.
 * Note: Currently only DegreeAlgorithm has suggested styles, so this looks identical
 * to WithSuggestedStyles. This story demonstrates the array syntax for when we have
 * multiple algorithms with suggested styles in the future.
 */
export const MultipleAlgorithmsAPI: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:degree"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;

        // Access the graph instance via the public API
        const {graph} = graphtyElement;

        // Demonstrate applying suggested styles from multiple algorithms using array syntax
        // Currently only "graphty:degree" has suggested styles, but this shows the pattern
        // for when we have more algorithms like betweenness, closeness, pagerank, etc.
        graph.applySuggestedStyles(["graphty:degree"]);

        // Re-apply styles to existing nodes so they pick up the new calculatedStyle layers
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * PageRank algorithm with suggested styles.
 * Demonstrates PageRank centrality visualization using node size.
 * Nodes are scaled by importance (1-5 based on PageRank score).
 */
export const PageRankWithSuggestedStyles: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply suggested styles from PageRank algorithm
        graph.applySuggestedStyles("graphty:pagerank");

        // Re-apply styles to existing nodes so they pick up the new calculatedStyle layers
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Multiple algorithms coexisting - Degree and PageRank.
 * Demonstrates how different algorithms can complement each other:
 * - Degree colors nodes (red to yellow) based on connection count
 * - PageRank sizes nodes (1-5) based on importance
 * Together they provide a rich visualization showing both connectivity and influence.
 */
export const MultipleAlgorithmsCoexisting: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:degree", "graphty:pagerank"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply suggested styles from both algorithms
        // PageRank is applied last, so its styles take priority
        graph.applySuggestedStyles(["graphty:degree", "graphty:pagerank"]);

        // Re-apply styles to existing nodes
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Louvain community detection algorithm with suggested styles.
 * Demonstrates categorical styling where nodes are colored by their detected community.
 * Each community gets a distinct color from a predefined palette.
 */
export const LouvainWithSuggestedStyles: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:louvain"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply suggested styles from Louvain algorithm
        graph.applySuggestedStyles("graphty:louvain");

        // Re-apply styles to existing nodes so they pick up the new calculatedStyle layers
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Manual configuration of node color based on Louvain community detection.
 * This shows the traditional approach where you manually configure the calculatedStyle
 * for categorical data visualization.
 * Uses a DIFFERENT color palette (cool blues/purples) to distinguish from suggested styles.
 */
export const LouvainManualConfiguration: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeCalculatedStyle: {
                inputs: ["algorithmResults.graphty.louvain.communityId"],
                output: "style.texture.color",
                expr: `{
                    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
                    return colors[arguments[0] % colors.length];
                }`,
            },
            algorithms: ["graphty:louvain"],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * Dijkstra shortest path algorithm with suggested styles.
 * Demonstrates path visualization where the shortest path edges and nodes
 * are highlighted in red with increased width and glow effect.
 */
export const DijkstraWithSuggestedStyles: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:dijkstra"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply suggested styles from Dijkstra algorithm
        graph.applySuggestedStyles("graphty:dijkstra");

        // Re-apply styles to existing nodes and edges so they pick up the new style layers
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Manual configuration of shortest path highlighting.
 * This shows the traditional approach where you manually configure styles
 * for path visualization using JMESPath selectors.
 */
export const DijkstraManualConfiguration: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:dijkstra"],
            layers: [
                {
                    edge: {
                        selector: "algorithmResults.graphty.dijkstra.isInPath == `true`",
                        style: {
                            enabled: true,
                            line: {
                                color: "#3498db",
                                width: 4,
                            },
                        },
                    },
                },
                {
                    node: {
                        selector: "algorithmResults.graphty.dijkstra.isInPath == `true`",
                        style: {
                            enabled: true,
                            texture: {
                                color: "#3498db",
                            },
                            shape: {
                                size: 2.5,
                            },
                        },
                    },
                },
            ],
        }),
        runAlgorithmsOnLoad: true,
    },
};

/**
 * All Four Algorithms Combined
 *
 * This story demonstrates all 4 implemented algorithms with their suggested styles applied together:
 * - **Degree Algorithm**: Colors nodes by connection count (Viridis gradient)
 * - **PageRank Algorithm**: Sizes nodes by importance (1-5 scale)
 * - **Louvain Algorithm**: Colors nodes by detected community (Okabe-Ito categorical)
 * - **Dijkstra Algorithm**: Highlights the shortest path in red
 *
 * Note: When combining multiple algorithms, some styles may override others.
 * In this example, Louvain community colors take precedence over Degree colors
 * since it's applied later in the array.
 */
export const AllFourAlgorithmsCombined: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:degree", "graphty:pagerank", "graphty:louvain", "graphty:dijkstra"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply suggested styles from all four algorithms
        // Order matters: later algorithms can override earlier ones
        graph.applySuggestedStyles([
            "graphty:degree", // Color by degree (will be overridden by louvain)
            "graphty:pagerank", // Size by PageRank importance
            "graphty:louvain", // Color by community (overrides degree color)
            "graphty:dijkstra", // Highlight shortest path
        ]);

        // Re-apply styles to existing nodes and edges
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Algorithm Comparison: Centrality vs Community
 *
 * Demonstrates the difference between centrality-based (PageRank) and
 * community-based (Louvain) visualization approaches:
 * - Nodes are colored by community membership
 * - Node size indicates PageRank importance within each community
 *
 * This combination is particularly useful for identifying influential
 * nodes within each community group.
 */
export const CentralityVsCommunity: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:pagerank", "graphty:louvain"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply PageRank first (size), then Louvain (color)
        graph.applySuggestedStyles(["graphty:pagerank", "graphty:louvain"]);

        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};
