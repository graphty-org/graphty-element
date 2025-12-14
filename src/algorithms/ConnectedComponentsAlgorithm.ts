import {connectedComponents} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

export class ConnectedComponentsAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "connected-components";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.connected-components.componentId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.carbon(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Components - Carbon Colors",
                    description: "5 IBM design system colors for components",
                },
            },
        ],
        description: "Visualizes connected components with distinct colors",
        category: "grouping",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format (truly undirected for connected components)
        // addReverseEdges: false creates an undirected graph required by connectedComponents
        const graphData = toAlgorithmGraph(g, {addReverseEdges: false});

        // Run Connected Components algorithm - returns NodeId[][] directly
        const components = connectedComponents(graphData);

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
Algorithm.register(ConnectedComponentsAlgorithm);
