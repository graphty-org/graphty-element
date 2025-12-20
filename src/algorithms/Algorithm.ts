import {set as deepSet} from "lodash";

import {AdHocData, type OptionsSchema as ZodOptionsSchema, SuggestedStylesConfig, SuggestedStylesProvider} from "../config";
import {Edge} from "../Edge";
import {Graph} from "../Graph";
import {type OptionsFromSchema, type OptionsSchema, resolveOptions} from "./types/OptionSchema";

/**
 * Type for algorithm class constructor
 * Uses any for options to allow flexibility with different algorithm option types
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AlgorithmClass = new (g: Graph, options?: any) => Algorithm;

/**
 * Interface for Algorithm class static members
 * Exported for use in type annotations when referencing algorithm classes
 */
export interface AlgorithmStatics {
    type: string;
    namespace: string;
    optionsSchema: OptionsSchema;
    suggestedStyles?: SuggestedStylesProvider;
    /** @deprecated Use getZodOptionsSchema() instead */
    getOptionsSchema(): OptionsSchema;
    /** @deprecated Use hasZodOptions() instead */
    hasOptions(): boolean;
    hasSuggestedStyles(): boolean;
    getSuggestedStyles(): SuggestedStylesConfig | null;
    /** NEW: Zod-based options schema for unified validation and UI metadata */
    zodOptionsSchema?: ZodOptionsSchema;
    /** Get the Zod-based options schema for this algorithm */
    getZodOptionsSchema(): ZodOptionsSchema;
    /** Check if this algorithm has a Zod-based options schema */
    hasZodOptions(): boolean;
}

const algorithmRegistry = new Map<string, AlgorithmClass>();

// algorithmResults layout:
// {
//     node: {
//         id: {
//             namespace: {
//                 algorithm: {
//                     result: unknown
//                 }
//             }
//         }
//     },
//     edge: {
//         id: {
//             namespace: {
//                 algorithm: {
//                     result: unknown
//                 }
//             }
//         }
//     },
//     graph: {
//         namespace: {
//             algorithm: {
//                 result: unknown
//             }
//         }
//     }
// }

/**
 * Base class for all graph algorithms
 *
 * @typeParam TOptions - The options type for this algorithm (defaults to empty object)
 *
 * @example
 * ```typescript
 * // Algorithm with options
 * interface PageRankOptions {
 *     dampingFactor: number;
 *     maxIterations: number;
 * }
 *
 * class PageRankAlgorithm extends Algorithm<PageRankOptions> {
 *     static optionsSchema: OptionsSchema = {
 *         dampingFactor: { type: 'number', default: 0.85, ... },
 *         maxIterations: { type: 'integer', default: 100, ... }
 *     };
 *
 *     async run(): Promise<void> {
 *         const { dampingFactor, maxIterations } = this.options;
 *         // ... use options
 *     }
 * }
 * ```
 */
export abstract class Algorithm<TOptions extends Record<string, unknown> = Record<string, unknown>> {
    static type: string;
    static namespace: string;
    static suggestedStyles?: SuggestedStylesProvider;

    /**
     * Options schema for this algorithm
     *
     * Subclasses should override this to define their configurable options.
     * An empty schema means the algorithm has no configurable options.
     *
     * @deprecated Use zodOptionsSchema instead for new implementations
     */
    static optionsSchema: OptionsSchema = {};

    /**
     * NEW: Zod-based options schema with rich metadata for UI generation.
     *
     * Override in subclasses to define algorithm-specific options.
     * This is the new unified system that provides both validation and UI metadata.
     */
    static zodOptionsSchema?: ZodOptionsSchema;

    protected graph: Graph;

    /**
     * Resolved options for this algorithm instance
     *
     * Options are resolved at construction time by:
     * 1. Starting with schema defaults
     * 2. Overriding with any provided options
     * 3. Validating all values against the schema
     *
     * Note: Named with underscore prefix to avoid conflicts with
     * existing algorithm implementations that have their own
     * options properties (will be removed in future refactoring).
     */
    protected _schemaOptions: TOptions;

    /**
     * Getter for schema options
     *
     * Algorithms that use the new schema-based options should access
     * options via this getter.
     */
    protected get schemaOptions(): TOptions {
        return this._schemaOptions;
    }

    /**
     * Creates a new algorithm instance
     *
     * @param g - The graph to run the algorithm on
     * @param options - Optional configuration options (uses schema defaults if not provided)
     */
    constructor(g: Graph, options?: Partial<TOptions>) {
        this.graph = g;
        this._schemaOptions = this.resolveOptions(options);
    }

    /**
     * Resolves and validates options against the schema
     *
     * @param options - User-provided options (partial)
     * @returns Fully resolved options with defaults applied
     */
    protected resolveOptions(options?: Partial<TOptions>): TOptions {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Supporting backward compatibility
        const schema = (this.constructor as typeof Algorithm).optionsSchema;

        // If no schema defined, return empty object (backward compatible)
        if (Object.keys(schema).length === 0) {
            return {} as TOptions;
        }

        return resolveOptions(schema, options as Partial<OptionsFromSchema<typeof schema>>) as TOptions;
    }

    get type(): string {
        return (this.constructor as typeof Algorithm).type;
    }

    get namespace(): string {
        return (this.constructor as typeof Algorithm).namespace;
    }

    get results(): AdHocData {
        const algorithmResults = {} as AdHocData;

        // Node results
        for (const n of this.graph.getDataManager().nodes.values()) {
            deepSet(algorithmResults, `node.${n.id}`, n.algorithmResults);
        }

        // Edge results
        for (const e of this.graph.getDataManager().edges.values()) {
            const edgeKey = `${e.srcId}:${e.dstId}`;
            deepSet(algorithmResults, `edge.${edgeKey}`, e.algorithmResults);
        }

        // Graph results
        const dm = this.graph.getDataManager();
        if (dm.graphResults) {
            algorithmResults.graph = dm.graphResults;
        }

        return algorithmResults;
    }

    abstract run(g: Graph): Promise<void>;

    #createPath(resultName: string): string[] {
        const ret: string[] = [];

        ret.push("algorithmResults");
        ret.push(this.namespace);
        ret.push(this.type);
        ret.push(resultName);

        return ret;
    }

    addNodeResult(nodeId: number | string, resultName: string, result: unknown): void {
        const p = this.#createPath(resultName);
        const n = this.graph.getDataManager().nodes.get(nodeId);
        if (!n) {
            throw new Error(`couldn't find nodeId '${nodeId}' while trying to run algorithm '${this.type}'`);
        }

        deepSet(n, p, result);
        // XXX: THIS IS WHERE I LEFT OFF
        // replace algorithmResults with graph.nodes; set result on each node.algorithmResult
    }

    addEdgeResult(edge: Edge, resultName: string, result: unknown): void {
        const p = this.#createPath(resultName);
        deepSet(edge, p, result);
    }

    addGraphResult(resultName: string, result: unknown): void {
        const dm = this.graph.getDataManager();
        dm.graphResults ??= {} as AdHocData;

        const path = [this.namespace, this.type, resultName];
        deepSet(dm.graphResults, path, result);
    }

    static register<T extends AlgorithmClass>(cls: T): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t: string = (cls as any).type;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ns: string = (cls as any).namespace;
        algorithmRegistry.set(`${ns}:${t}`, cls);
        return cls;
    }

    static get(g: Graph, namespace: string, type: string): Algorithm | null {
        const SourceClass = algorithmRegistry.get(`${namespace}:${type}`);
        if (SourceClass) {
            return new SourceClass(g);
        }

        return null;
    }

    static getClass(namespace: string, type: string): (AlgorithmClass & AlgorithmStatics) | null {
        return algorithmRegistry.get(`${namespace}:${type}`) as (AlgorithmClass & AlgorithmStatics) | null ?? null;
    }

    /**
     * Check if this algorithm has suggested styles
     */
    static hasSuggestedStyles(): boolean {
        return !!this.suggestedStyles;
    }

    /**
     * Get suggested styles for this algorithm
     */
    static getSuggestedStyles(): SuggestedStylesConfig | null {
        return this.suggestedStyles ? this.suggestedStyles() : null;
    }

    /**
     * Get the options schema for this algorithm
     *
     * @returns The options schema, or an empty object if no options defined
     * @deprecated Use getZodOptionsSchema() instead
     */
    static getOptionsSchema(): OptionsSchema {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Implementation of deprecated method
        return this.optionsSchema;
    }

    /**
     * Check if this algorithm has configurable options
     *
     * @returns true if the algorithm has at least one option defined
     * @deprecated Use hasZodOptions() instead
     */
    static hasOptions(): boolean {
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- Implementation of deprecated method
        return Object.keys(this.optionsSchema).length > 0;
    }

    /**
     * Get the Zod-based options schema for this algorithm.
     *
     * @returns The Zod options schema, or an empty object if no schema defined
     */
    static getZodOptionsSchema(): ZodOptionsSchema {
        return this.zodOptionsSchema ?? {};
    }

    /**
     * Check if this algorithm has a Zod-based options schema.
     *
     * @returns true if the algorithm has a Zod options schema defined
     */
    static hasZodOptions(): boolean {
        return this.zodOptionsSchema !== undefined &&
               Object.keys(this.zodOptionsSchema).length > 0;
    }

    /**
     * Get all registered algorithm names.
     * @param namespace - Optional namespace to filter by
     * @returns Array of algorithm names in "namespace:type" format
     */
    static getRegisteredAlgorithms(namespace?: string): string[] {
        const algorithms: string[] = [];
        for (const key of algorithmRegistry.keys()) {
            if (!namespace || key.startsWith(`${namespace}:`)) {
                algorithms.push(key);
            }
        }

        return algorithms.sort();
    }
}
