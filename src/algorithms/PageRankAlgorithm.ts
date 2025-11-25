import {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";

export class PageRankAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "pagerank";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.pagerank.rankPct"],
                        output: "style.shape.size",
                        expr: "{ return StyleHelpers.size.linear(arguments[0], 1, 5) }",
                    },
                },
                metadata: {
                    name: "PageRank - Node Size",
                    description: "Size 1-5 based on PageRank importance",
                },
            },
        ],
        description: "Visualizes node importance through size based on PageRank algorithm",
        category: "node-metric",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // PageRank parameters
        const dampingFactor = 0.85;
        const maxIterations = 100;
        const tolerance = 1e-6;

        // Initialize PageRank values (uniform distribution)
        const ranks = new Map<number | string, number>();
        for (const nodeId of nodes) {
            ranks.set(nodeId, 1 / n);
        }

        // Calculate out-degrees for each node
        const outDegrees = new Map<number | string, number>();
        const outgoingEdges = new Map<number | string, (number | string)[]>();

        for (const nodeId of nodes) {
            outDegrees.set(nodeId, 0);
            outgoingEdges.set(nodeId, []);
        }

        for (const e of g.getDataManager().edges.values()) {
            const srcOutDegree = outDegrees.get(e.srcId) ?? 0;
            outDegrees.set(e.srcId, srcOutDegree + 1);

            const srcEdges = outgoingEdges.get(e.srcId) ?? [];
            srcEdges.push(e.dstId);
            outgoingEdges.set(e.srcId, srcEdges);
        }

        // Track dangling nodes (no outgoing edges)
        const danglingNodes: (number | string)[] = [];
        for (const nodeId of nodes) {
            if ((outDegrees.get(nodeId) ?? 0) === 0) {
                danglingNodes.push(nodeId);
            }
        }

        // Power iteration
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const newRanks = new Map<number | string, number>();

            // Initialize with teleportation probability
            for (const nodeId of nodes) {
                newRanks.set(nodeId, (1 - dampingFactor) / n);
            }

            // Handle dangling nodes (distribute their rank equally)
            let danglingSum = 0;
            for (const danglingNode of danglingNodes) {
                danglingSum += ranks.get(danglingNode) ?? 0;
            }
            if (danglingSum > 0) {
                const danglingContribution = dampingFactor * danglingSum / n;
                for (const nodeId of nodes) {
                    const currentRank = newRanks.get(nodeId) ?? 0;
                    newRanks.set(nodeId, currentRank + danglingContribution);
                }
            }

            // Propagate rank from each node to its neighbors
            for (const nodeId of nodes) {
                const currentRank = ranks.get(nodeId) ?? 0;
                const nodeOutDegree = outDegrees.get(nodeId) ?? 0;

                if (nodeOutDegree > 0) {
                    const neighbors = outgoingEdges.get(nodeId) ?? [];
                    for (const neighbor of neighbors) {
                        const contribution = dampingFactor * currentRank / nodeOutDegree;
                        const neighborRank = newRanks.get(neighbor) ?? 0;
                        newRanks.set(neighbor, neighborRank + contribution);
                    }
                }
            }

            // Check for convergence
            let maxDiff = 0;
            for (const nodeId of nodes) {
                const oldRank = ranks.get(nodeId) ?? 0;
                const newRank = newRanks.get(nodeId) ?? 0;
                maxDiff = Math.max(maxDiff, Math.abs(newRank - oldRank));
            }

            // Update ranks
            for (const nodeId of nodes) {
                ranks.set(nodeId, newRanks.get(nodeId) ?? 0);
            }

            if (maxDiff < tolerance) {
                break;
            }
        }

        // Find max rank for normalization
        let maxRank = 0;
        for (const rank of ranks.values()) {
            maxRank = Math.max(maxRank, rank);
        }

        // Store results
        for (const nodeId of nodes) {
            const rank = ranks.get(nodeId) ?? 0;
            this.addNodeResult(nodeId, "rank", rank);
            this.addNodeResult(nodeId, "rankPct", maxRank > 0 ? rank / maxRank : 0);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(PageRankAlgorithm);
