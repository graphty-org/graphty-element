import type {OptionsSchema as ZodOptionsSchema} from "../config";
import {Algorithm} from "./Algorithm";
// Phase 4 shortest path algorithms
import {BellmanFordAlgorithm} from "./BellmanFordAlgorithm";
// Phase 2 centrality algorithms
import {BetweennessCentralityAlgorithm} from "./BetweennessCentralityAlgorithm";
// Phase 5 traversal algorithms
import {BFSAlgorithm} from "./BFSAlgorithm";
// Phase 8 advanced algorithms
import {BipartiteMatchingAlgorithm} from "./BipartiteMatchingAlgorithm";
import {ClosenessCentralityAlgorithm} from "./ClosenessCentralityAlgorithm";
// Phase 6 component algorithms
import {ConnectedComponentsAlgorithm} from "./ConnectedComponentsAlgorithm";
// Phase 1 algorithms
import {DegreeAlgorithm} from "./DegreeAlgorithm";
import {DFSAlgorithm} from "./DFSAlgorithm";
import {DijkstraAlgorithm} from "./DijkstraAlgorithm";
import {EigenvectorCentralityAlgorithm} from "./EigenvectorCentralityAlgorithm";
import {FloydWarshallAlgorithm} from "./FloydWarshallAlgorithm";
// Phase 3 community detection algorithms
import {GirvanNewmanAlgorithm} from "./GirvanNewmanAlgorithm";
import {HITSAlgorithm} from "./HITSAlgorithm";
import {KatzCentralityAlgorithm} from "./KatzCentralityAlgorithm";
// Phase 7 minimum spanning tree algorithms
import {KruskalAlgorithm} from "./KruskalAlgorithm";
import {LabelPropagationAlgorithm} from "./LabelPropagationAlgorithm";
import {LeidenAlgorithm} from "./LeidenAlgorithm";
import {LouvainAlgorithm} from "./LouvainAlgorithm";
import {MaxFlowAlgorithm} from "./MaxFlowAlgorithm";
import {MinCutAlgorithm} from "./MinCutAlgorithm";
import {PageRankAlgorithm} from "./PageRankAlgorithm";
import {PrimAlgorithm} from "./PrimAlgorithm";
import {StronglyConnectedComponentsAlgorithm} from "./StronglyConnectedComponentsAlgorithm";

// Phase 1 registrations
Algorithm.register(DegreeAlgorithm);
Algorithm.register(DijkstraAlgorithm);
Algorithm.register(PageRankAlgorithm);
Algorithm.register(LouvainAlgorithm);

// Phase 2 centrality registrations
Algorithm.register(BetweennessCentralityAlgorithm);
Algorithm.register(ClosenessCentralityAlgorithm);
Algorithm.register(EigenvectorCentralityAlgorithm);
Algorithm.register(HITSAlgorithm);
Algorithm.register(KatzCentralityAlgorithm);

// Phase 3 community detection registrations
Algorithm.register(GirvanNewmanAlgorithm);
Algorithm.register(LeidenAlgorithm);
Algorithm.register(LabelPropagationAlgorithm);

// Phase 4 shortest path registrations
Algorithm.register(BellmanFordAlgorithm);
Algorithm.register(FloydWarshallAlgorithm);

// Phase 5 traversal registrations
Algorithm.register(BFSAlgorithm);
Algorithm.register(DFSAlgorithm);

// Phase 6 component registrations
Algorithm.register(ConnectedComponentsAlgorithm);
Algorithm.register(StronglyConnectedComponentsAlgorithm);

// Phase 7 minimum spanning tree registrations
Algorithm.register(KruskalAlgorithm);
Algorithm.register(PrimAlgorithm);

// Phase 8 advanced algorithm registrations
Algorithm.register(BipartiteMatchingAlgorithm);
Algorithm.register(MaxFlowAlgorithm);
Algorithm.register(MinCutAlgorithm);

// Export base class and types
export {Algorithm} from "./Algorithm";

// Export option schema types and utilities
export type {
    OptionDefinition,
    OptionsFromSchema,
    OptionsSchema,
    OptionType,
    SelectOption,
} from "./types/OptionSchema";

// Export algorithm option types for Phase 2: Community Detection
export type {GirvanNewmanOptions} from "./GirvanNewmanAlgorithm";
export type {LabelPropagationOptions} from "./LabelPropagationAlgorithm";
export type {LeidenOptions} from "./LeidenAlgorithm";
export type {LouvainOptions} from "./LouvainAlgorithm";
export type {PageRankOptions} from "./PageRankAlgorithm";

// Export algorithm option types for Phase 3: Centrality
export type {EigenvectorCentralityOptions} from "./EigenvectorCentralityAlgorithm";
export type {HITSOptions} from "./HITSAlgorithm";
export type {KatzCentralityOptions} from "./KatzCentralityAlgorithm";

// Export algorithm option types for Phase 4: Traversal & Path
export type {BFSOptions} from "./BFSAlgorithm";
export type {DFSOptions} from "./DFSAlgorithm";
export type {DijkstraOptions} from "./DijkstraAlgorithm";
export type {MaxFlowOptions} from "./MaxFlowAlgorithm";
export type {MinCutOptions} from "./MinCutAlgorithm";
export {
    defineOptionsSchema,
    OptionValidationError,
    resolveOptions,
    validateOption,
} from "./types/OptionSchema";

/**
 * Information about a registered algorithm
 */
export interface AlgorithmInfo {
    /** Algorithm namespace (e.g., "graphty") */
    namespace: string;
    /** Algorithm type (e.g., "pagerank") */
    type: string;
    /** Full key in format "namespace:type" */
    key: string;
    /** Zod-based options schema for this algorithm */
    zodOptionsSchema: ZodOptionsSchema;
    /** Whether the algorithm has configurable options (Zod-based) */
    hasOptions: boolean;
    /** Whether the algorithm has suggested styles */
    hasSuggestedStyles: boolean;
}

/**
 * Get information about all registered algorithms including their options schemas
 *
 * @returns Array of algorithm information objects
 *
 * @example
 * ```typescript
 * const algorithms = getAllAlgorithmInfo();
 * for (const algo of algorithms) {
 *     if (algo.hasOptions) {
 *         console.log(`${algo.key} has options:`, algo.zodOptionsSchema);
 *     }
 * }
 * ```
 */
export function getAllAlgorithmInfo(): AlgorithmInfo[] {
    const algorithms: AlgorithmInfo[] = [];

    // Access the registered algorithms through known registrations
    const knownAlgorithms = [
        DegreeAlgorithm,
        DijkstraAlgorithm,
        PageRankAlgorithm,
        LouvainAlgorithm,
        BetweennessCentralityAlgorithm,
        ClosenessCentralityAlgorithm,
        EigenvectorCentralityAlgorithm,
        HITSAlgorithm,
        KatzCentralityAlgorithm,
        GirvanNewmanAlgorithm,
        LeidenAlgorithm,
        LabelPropagationAlgorithm,
        BellmanFordAlgorithm,
        FloydWarshallAlgorithm,
        BFSAlgorithm,
        DFSAlgorithm,
        ConnectedComponentsAlgorithm,
        StronglyConnectedComponentsAlgorithm,
        KruskalAlgorithm,
        PrimAlgorithm,
        BipartiteMatchingAlgorithm,
        MaxFlowAlgorithm,
        MinCutAlgorithm,
    ];

    for (const AlgoClass of knownAlgorithms) {
        algorithms.push({
            namespace: AlgoClass.namespace,
            type: AlgoClass.type,
            key: `${AlgoClass.namespace}:${AlgoClass.type}`,
            zodOptionsSchema: AlgoClass.getZodOptionsSchema(),
            hasOptions: AlgoClass.hasZodOptions(),
            hasSuggestedStyles: AlgoClass.hasSuggestedStyles(),
        });
    }

    return algorithms;
}

/**
 * Get all algorithm Zod-based options schemas as a Map
 *
 * @returns Map of algorithm key ("namespace:type") to Zod options schema
 *
 * @example
 * ```typescript
 * const schemas = getAllAlgorithmSchemas();
 * const pagerankSchema = schemas.get("graphty:pagerank");
 * ```
 */
export function getAllAlgorithmSchemas(): Map<string, ZodOptionsSchema> {
    const schemas = new Map<string, ZodOptionsSchema>();

    for (const info of getAllAlgorithmInfo()) {
        schemas.set(info.key, info.zodOptionsSchema);
    }

    return schemas;
}
