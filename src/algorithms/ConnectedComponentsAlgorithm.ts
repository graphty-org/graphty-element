import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

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
                        expr: "{ return StyleHelpers.color.categorical.carbon(arguments[0]) }",
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
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Find connected components using BFS
        const components = this.findConnectedComponents(nodes);

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

    /**
     * Find connected components using BFS
     * Treats the graph as undirected (both edge directions count)
     */
    private findConnectedComponents(nodes: (number | string)[]): (number | string)[][] {
        const visited = new Set<string>();
        const components: (number | string)[][] = [];

        // Build adjacency list for efficient neighbor lookup (undirected)
        const adjacency = this.buildAdjacency();

        for (const node of nodes) {
            const nodeStr = String(node);

            if (visited.has(nodeStr)) {
                continue;
            }

            // BFS to find all nodes in this component
            const component: (number | string)[] = [];
            const queue = [node];

            while (queue.length > 0) {
                const current = queue.shift();
                if (current === undefined) {
                    break;
                }

                const currentStr = String(current);

                if (visited.has(currentStr)) {
                    continue;
                }

                visited.add(currentStr);
                component.push(current);

                // Get neighbors from adjacency list
                const neighbors = adjacency.get(currentStr);
                if (neighbors) {
                    for (const neighborStr of neighbors) {
                        if (!visited.has(neighborStr)) {
                            // Find the original node ID (preserve type)
                            const neighborNode = nodes.find((n) => String(n) === neighborStr);
                            if (neighborNode !== undefined) {
                                queue.push(neighborNode);
                            }
                        }
                    }
                }
            }

            if (component.length > 0) {
                components.push(component);
            }
        }

        return components;
    }

    /**
     * Build adjacency list from graph edges (undirected)
     */
    private buildAdjacency(): Map<string, Set<string>> {
        const adjacency = new Map<string, Set<string>>();
        const {edges, nodes} = this.graph.getDataManager();

        // Initialize all nodes
        for (const nodeId of nodes.keys()) {
            adjacency.set(String(nodeId), new Set());
        }

        // Add edges (undirected - add both directions)
        for (const edge of edges.values()) {
            const src = String(edge.srcId);
            const dst = String(edge.dstId);

            const srcSet = adjacency.get(src);
            const dstSet = adjacency.get(dst);

            if (srcSet) {
                srcSet.add(dst);
            }

            if (dstSet) {
                dstSet.add(src);
            }
        }

        return adjacency;
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(ConnectedComponentsAlgorithm);
