import type {Graphty} from "../../../src/graphty-element";
import {algorithmMetaBase, type Story, templateCreator} from "../helpers";

const meta = {
    ... algorithmMetaBase,
    title: "Algorithms/Combined",
};
export default meta;

/**
 * Multiple algorithms coexisting - Degree and PageRank
 * - Degree colors nodes (red to yellow) based on connection count
 * - PageRank sizes nodes (1-5) based on importance
 */
export const DegreeAndPageRank: Story = {
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

        graph.applySuggestedStyles(["graphty:degree", "graphty:pagerank"]);
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Centrality vs Community - compares centrality-based and community-based visualization
 *
 * Demonstrates the difference between centrality-based (PageRank) and
 * community-based (Louvain) visualization approaches:
 * - Nodes are colored by community membership (Louvain)
 * - Node size indicates PageRank importance within each community
 *
 * This combination is particularly useful for identifying influential
 * nodes within each community group.
 */
export const CentralityVsCommunity: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:louvain", "graphty:pagerank"],
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

        graph.applySuggestedStyles(["graphty:pagerank", "graphty:louvain"]);
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Community Structure with Path Highlighting
 * Combines multiple visualization techniques:
 * - Louvain: Colors nodes by community membership
 * - PageRank: Sizes nodes by importance within the network
 * - Dijkstra: Highlights the shortest path between default nodes
 */
export const CommunityStructureWithPath: Story = {
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

        // Order matters: later algorithms can override earlier ones
        graph.applySuggestedStyles([
            "graphty:degree", // Color by degree (will be overridden by louvain)
            "graphty:pagerank", // Size by PageRank importance
            "graphty:louvain", // Color by community (overrides degree color)
            "graphty:dijkstra", // Highlight shortest path
        ]);

        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Combined Edge Flow - edge color and width based on relationship strength
 * Demonstrates multi-dimensional edge styling where:
 * - Edge color intensity reflects the value (blues gradient)
 * - Edge width scales with the value
 * - Arrow head color matches the line color
 */
export const CombinedEdgeFlow: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {
                    edge: {
                        selector: "",
                        style: {enabled: true},
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.line.color",
                            expr: "(result => result.color)(StyleHelpers.combined.edgeFlow(arguments[0] / 10))",
                        },
                    },
                },
                {
                    edge: {
                        selector: "",
                        style: {enabled: true},
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.line.width",
                            expr: "(result => result.width)(StyleHelpers.combined.edgeFlow(arguments[0] / 10))",
                        },
                    },
                },
                {
                    edge: {
                        selector: "",
                        style: {enabled: true},
                        calculatedStyle: {
                            inputs: ["data.value"],
                            output: "style.arrowHead.color",
                            expr: "(result => result.color)(StyleHelpers.combined.edgeFlow(arguments[0] / 10))",
                        },
                    },
                },
            ],
            algorithms: [],
        }),
        runAlgorithmsOnLoad: false,
    },
};
