import {stronglyConnectedComponents} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 *
 */
export class StronglyConnectedComponentsAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "scc";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.scc.componentId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.okabeIto(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "SCC - Okabe-Ito Colors",
                    description: "8 colorblind-safe colors for strongly connected components",
                },
            },
        ],
        description: "Visualizes strongly connected components in directed graphs with distinct colors",
        category: "grouping",
    });

    /**
     * Executes the strongly connected components algorithm on the graph
     *
     * Identifies maximal strongly connected components in a directed graph.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format - SCC requires directed graph
        const graphData = toAlgorithmGraph(g, {directed: true, addReverseEdges: false});

        // Run Strongly Connected Components algorithm - returns NodeId[][] directly
        const components = stronglyConnectedComponents(graphData);

        // Store component assignments for each node
        const componentMap = new Map<number | string, number>();
        for (let i = 0; i < components.length; i++) {
            for (const nodeId of components[i]) {
                componentMap.set(nodeId, i);
            }
        }

        // Store results on nodes
        for (const nodeId of nodes) {
            const componentId = componentMap.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "componentId", componentId);
        }

        // Store graph-level results
        this.addGraphResult("componentCount", components.length);
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(StronglyConnectedComponentsAlgorithm);
