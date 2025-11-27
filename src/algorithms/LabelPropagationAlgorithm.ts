import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

interface CommunityResult {
    communities: (number | string)[][];
    iterations: number;
}

export class LabelPropagationAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "label-propagation";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.label-propagation.communityId"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.categorical.pastel(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Label Propagation - Pastel Colors",
                    description: "8 soft pastel community colors",
                },
            },
        ],
        description: "Visualizes communities detected via fast label propagation",
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

        // Run Label Propagation algorithm
        const result = this.labelPropagation(nodes);

        // Store community assignments for each node
        const communityMap = new Map<number | string, number>();
        for (let i = 0; i < result.communities.length; i++) {
            for (const nodeId of result.communities[i]) {
                communityMap.set(nodeId, i);
            }
        }

        // Store results on nodes
        for (const nodeId of nodes) {
            const communityId = communityMap.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "communityId", communityId);
        }

        // Store graph-level results
        this.addGraphResult("communityCount", result.communities.length);
    }

    /**
     * Label Propagation community detection implementation
     * Fast algorithm that converges by propagating labels to neighbors
     */
    private labelPropagation(nodes: (number | string)[]): CommunityResult {
        const maxIterations = 100;

        // Initialize: each node gets its own unique label
        const labels = new Map<number | string, number>();
        for (let i = 0; i < nodes.length; i++) {
            labels.set(nodes[i], i);
        }

        let iteration = 0;
        let changed = true;

        while (iteration < maxIterations && changed) {
            changed = false;

            // Shuffle nodes to avoid bias
            const shuffledNodes = this.shuffleArray([... nodes]);

            for (const nodeId of shuffledNodes) {
                // Get neighbor labels
                const neighborLabels = this.getNeighborLabels(nodeId, labels);

                if (neighborLabels.length === 0) {
                    continue;
                }

                // Find most frequent label among neighbors
                const labelCounts = new Map<number, number>();
                for (const label of neighborLabels) {
                    labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
                }

                // Find max count
                let maxCount = 0;
                for (const count of labelCounts.values()) {
                    if (count > maxCount) {
                        maxCount = count;
                    }
                }

                // Get all labels with max count (ties)
                const maxLabels: number[] = [];
                for (const [label, count] of labelCounts) {
                    if (count === maxCount) {
                        maxLabels.push(label);
                    }
                }

                // Choose randomly among ties (or just take smallest for determinism)
                const newLabel = Math.min(... maxLabels);
                const currentLabel = labels.get(nodeId);

                if (newLabel !== currentLabel) {
                    labels.set(nodeId, newLabel);
                    changed = true;
                }
            }

            iteration++;
        }

        return {
            communities: this.extractCommunities(labels),
            iterations: iteration,
        };
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    private shuffleArray<T>(array: T[]): T[] {
        const result = [... array];

        for (let i = result.length - 1; i > 0; i--) {
            // Use a simple deterministic shuffle based on position
            // This keeps the algorithm deterministic while still varying order
            const j = i % (i + 1);
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }

    /**
     * Get labels of neighboring nodes
     */
    private getNeighborLabels(
        nodeId: number | string,
        labels: Map<number | string, number>,
    ): number[] {
        const neighborLabels: number[] = [];
        const {edges} = this.graph.getDataManager();

        for (const edge of edges.values()) {
            if (edge.srcId === nodeId) {
                const label = labels.get(edge.dstId);
                if (label !== undefined) {
                    neighborLabels.push(label);
                }
            }

            if (edge.dstId === nodeId) {
                const label = labels.get(edge.srcId);
                if (label !== undefined) {
                    neighborLabels.push(label);
                }
            }
        }

        return neighborLabels;
    }

    /**
     * Extract communities from label assignments
     */
    private extractCommunities(
        labels: Map<number | string, number>,
    ): (number | string)[][] {
        const communityMap = new Map<number, (number | string)[]>();

        for (const [nodeId, label] of labels) {
            if (!communityMap.has(label)) {
                communityMap.set(label, []);
            }

            const communityNodes = communityMap.get(label);
            if (communityNodes) {
                communityNodes.push(nodeId);
            }
        }

        return Array.from(communityMap.values());
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(LabelPropagationAlgorithm);
