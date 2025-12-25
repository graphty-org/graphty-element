import {floydWarshall} from "@graphty/algorithms";

import type {SuggestedStylesConfig} from "../config";
import type {Graph} from "../Graph";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

/**
 *
 */
export class FloydWarshallAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "floyd-warshall";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {enabled: true},
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.floyd-warshall.eccentricityPct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.viridis(arguments[0] ?? 0) }",
                    },
                },
                metadata: {
                    name: "Floyd-Warshall - Eccentricity Heatmap",
                    description: "Colors nodes by eccentricity (purple=central, yellow=peripheral)",
                },
            },
        ],
        description: "Visualizes all-pairs shortest path distances via eccentricity heatmap",
        category: "path",
    });

    /**
     * Executes the Floyd-Warshall algorithm on the graph
     *
     * Computes shortest path distances between all pairs of nodes.
     */
    async run(): Promise<void> {
        const g = this.graph;
        const dm = g.getDataManager();
        const nodes = Array.from(dm.nodes.keys());
        const n = nodes.length;

        if (n === 0) {
            return;
        }

        // Convert to @graphty/algorithms format
        const graphData = toAlgorithmGraph(g as unknown as Graph, {directed: false});

        // Run Floyd-Warshall algorithm
        const result = floydWarshall(graphData);

        // Store graph-level results
        this.addGraphResult("hasNegativeCycle", result.hasNegativeCycle);
        this.addGraphResult("nodeCount", n);

        // Compute eccentricity for each node
        // Eccentricity = max distance from node to any other node
        const eccentricities = new Map<string | number, number>();

        for (const nodeId of nodes) {
            const nodeDistances = result.distances.get(nodeId);
            if (!nodeDistances) {
                eccentricities.set(nodeId, Infinity);
                continue;
            }

            let maxDist = 0;
            for (const dist of nodeDistances.values()) {
                if (isFinite(dist) && dist > maxDist) {
                    maxDist = dist;
                }
            }
            eccentricities.set(nodeId, maxDist);
        }

        // Compute diameter (max eccentricity) and radius (min eccentricity)
        let diameter = 0;
        let radius = Infinity;

        for (const ecc of eccentricities.values()) {
            if (isFinite(ecc)) {
                if (ecc > diameter) {
                    diameter = ecc;
                }

                if (ecc < radius) {
                    radius = ecc;
                }
            }
        }

        // If no valid eccentricities, reset to 0
        if (radius === Infinity) {
            radius = 0;
        }

        this.addGraphResult("diameter", diameter);
        this.addGraphResult("radius", radius);

        // Store eccentricity results on nodes
        for (const nodeId of nodes) {
            const eccentricity = eccentricities.get(nodeId) ?? Infinity;
            this.addNodeResult(nodeId, "eccentricity", eccentricity);

            // Normalize eccentricity to percentage
            const eccentricityPct =
                diameter > 0 && isFinite(eccentricity) ? eccentricity / diameter : 0;
            this.addNodeResult(nodeId, "eccentricityPct", eccentricityPct);

            // Mark central nodes (eccentricity = radius)
            const isCentral = isFinite(eccentricity) && eccentricity === radius;
            this.addNodeResult(nodeId, "isCentral", isCentral);

            // Mark peripheral nodes (eccentricity = diameter)
            const isPeripheral = isFinite(eccentricity) && eccentricity === diameter;
            this.addNodeResult(nodeId, "isPeripheral", isPeripheral);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(FloydWarshallAlgorithm);
