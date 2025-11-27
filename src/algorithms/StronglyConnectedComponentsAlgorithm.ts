import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

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
                        expr: "{ return StyleHelpers.color.categorical.okabeIto(arguments[0]) }",
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

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Find strongly connected components using Tarjan's algorithm
        const components = this.tarjanSCC(nodes);

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
     * Tarjan's algorithm for finding strongly connected components
     * A strongly connected component is a maximal set of vertices such that
     * there is a directed path from each vertex to every other vertex
     */
    private tarjanSCC(nodes: (number | string)[]): (number | string)[][] {
        // Build directed adjacency list
        const adjacency = this.buildDirectedAdjacency();

        let index = 0;
        const stack: (number | string)[] = [];
        const onStack = new Set<string>();
        const indices = new Map<string, number>();
        const lowlinks = new Map<string, number>();
        const components: (number | string)[][] = [];

        // DFS-based Tarjan's algorithm
        const strongConnect = (node: number | string): void => {
            const nodeStr = String(node);

            // Set the depth index for this node
            indices.set(nodeStr, index);
            lowlinks.set(nodeStr, index);
            index++;
            stack.push(node);
            onStack.add(nodeStr);

            // Consider successors
            const neighbors = adjacency.get(nodeStr);
            if (neighbors) {
                for (const neighborStr of neighbors) {
                    // Find the original node (preserve type)
                    const neighbor = nodes.find((n) => String(n) === neighborStr);
                    if (neighbor === undefined) {
                        continue;
                    }

                    if (!indices.has(neighborStr)) {
                        // Successor has not been visited; recurse on it
                        strongConnect(neighbor);
                        const currentLowlink = lowlinks.get(nodeStr) ?? 0;
                        const neighborLowlink = lowlinks.get(neighborStr) ?? 0;
                        lowlinks.set(nodeStr, Math.min(currentLowlink, neighborLowlink));
                    } else if (onStack.has(neighborStr)) {
                        // Successor is in stack and hence in the current SCC
                        const currentLowlink = lowlinks.get(nodeStr) ?? 0;
                        const neighborIndex = indices.get(neighborStr) ?? 0;
                        lowlinks.set(nodeStr, Math.min(currentLowlink, neighborIndex));
                    }
                }
            }

            // If node is a root node, pop the stack and generate an SCC
            const nodeIndex = indices.get(nodeStr) ?? 0;
            const nodeLowlink = lowlinks.get(nodeStr) ?? 0;

            if (nodeLowlink === nodeIndex) {
                const component: (number | string)[] = [];
                let w: number | string | undefined;

                do {
                    w = stack.pop();
                    if (w !== undefined) {
                        const wStr = String(w);
                        onStack.delete(wStr);
                        component.push(w);
                    }
                } while (w !== undefined && String(w) !== nodeStr);

                components.push(component);
            }
        };

        // Run Tarjan's algorithm from each unvisited node
        for (const node of nodes) {
            const nodeStr = String(node);
            if (!indices.has(nodeStr)) {
                strongConnect(node);
            }
        }

        return components;
    }

    /**
     * Build directed adjacency list from graph edges
     * Only follows edges in their declared direction (src -> dst)
     */
    private buildDirectedAdjacency(): Map<string, Set<string>> {
        const adjacency = new Map<string, Set<string>>();
        const {edges, nodes} = this.graph.getDataManager();

        // Initialize all nodes
        for (const nodeId of nodes.keys()) {
            adjacency.set(String(nodeId), new Set());
        }

        // Add edges (directed - only src -> dst)
        for (const edge of edges.values()) {
            const src = String(edge.srcId);
            const dst = String(edge.dstId);

            const srcSet = adjacency.get(src);
            if (srcSet) {
                srcSet.add(dst);
            }
        }

        return adjacency;
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(StronglyConnectedComponentsAlgorithm);
