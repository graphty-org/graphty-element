import type {SuggestedStylesConfig} from "../config";
import {Algorithm} from "./Algorithm";
import {toAlgorithmGraph} from "./utils/graphConverter";

export class DegreeAlgorithm extends Algorithm {
    static namespace = "graphty";
    static type = "degree";

    static suggestedStyles = (): SuggestedStylesConfig => ({
        layers: [
            {
                node: {
                    selector: "",
                    style: {
                        enabled: true,
                    },
                    calculatedStyle: {
                        inputs: ["algorithmResults.graphty.degree.degreePct"],
                        output: "style.texture.color",
                        expr: "{ return StyleHelpers.color.sequential.viridis(arguments[0]) }",
                    },
                },
                metadata: {
                    name: "Degree - Viridis Gradient",
                    description: "Purple (low) → Yellow (high) - colorblind-safe",
                },
            },
        ],
        description: "Visualizes node importance through color based on connection count",
        category: "node-metric",
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    async run(): Promise<void> {
        const g = this.graph;
        const nodes = Array.from(g.getDataManager().nodes.keys());

        if (nodes.length === 0) {
            return;
        }

        // Convert to @graphty/algorithms format - use directed mode to get accurate in/out degrees
        const graphData = toAlgorithmGraph(g, {directed: true, addReverseEdges: false});

        // Calculate degrees using the @graphty/algorithms Graph methods
        let maxInDegree = 0;
        let maxOutDegree = 0;
        let maxDegree = 0;

        const degreeResults = new Map<number | string, {inDegree: number, outDegree: number, degree: number}>();

        for (const nodeId of nodes) {
            const inDegree = graphData.inDegree(nodeId);
            const outDegree = graphData.outDegree(nodeId);
            const degree = inDegree + outDegree;

            degreeResults.set(nodeId, {inDegree, outDegree, degree});

            maxInDegree = Math.max(maxInDegree, inDegree);
            maxOutDegree = Math.max(maxOutDegree, outDegree);
            maxDegree = Math.max(maxDegree, degree);
        }

        // Store graph-level results
        this.addGraphResult("maxInDegree", maxInDegree);
        this.addGraphResult("maxOutDegree", maxOutDegree);
        this.addGraphResult("maxDegree", maxDegree);

        // Store node-level results
        for (const nodeId of nodes) {
            const result = degreeResults.get(nodeId);
            if (!result) {
                continue;
            }

            const {inDegree, outDegree, degree} = result;

            this.addNodeResult(nodeId, "inDegree", inDegree);
            this.addNodeResult(nodeId, "outDegree", outDegree);
            this.addNodeResult(nodeId, "degree", degree);
            // Safe division: return 0 when max is 0 to avoid NaN
            this.addNodeResult(nodeId, "inDegreePct", maxInDegree > 0 ? inDegree / maxInDegree : 0);
            this.addNodeResult(nodeId, "outDegreePct", maxOutDegree > 0 ? outDegree / maxOutDegree : 0);
            this.addNodeResult(nodeId, "degreePct", maxDegree > 0 ? degree / maxDegree : 0);
        }
    }
}

// Auto-register this algorithm when the module is imported
Algorithm.register(DegreeAlgorithm);
