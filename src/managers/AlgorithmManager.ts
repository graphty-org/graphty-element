import {Algorithm} from "../algorithms/Algorithm";
import type {Graph} from "../Graph";
import type {AlgorithmSpecificOptions} from "../utils/queue-migration";
import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

/**
 * Manages algorithm execution and coordination
 * Handles running algorithms from templates and individual algorithm execution
 */
export class AlgorithmManager implements Manager {
    /**
     * Creates an instance of AlgorithmManager
     * @param eventManager - Event manager for emitting algorithm events
     * @param graph - Graph instance to run algorithms on
     */
    constructor(
        private eventManager: EventManager,
        private graph: Graph,
    ) {}

    /**
     * Initializes the algorithm manager
     * @returns Promise that resolves when initialization is complete
     */
    async init(): Promise<void> {
        // AlgorithmManager doesn't need async initialization
        return Promise.resolve();
    }

    /**
     * Disposes of the algorithm manager and cleans up resources
     */
    dispose(): void {
        // No cleanup needed for algorithms
    }

    /**
     * Run algorithms specified in the template configuration
     * Called during initialization if runAlgorithmsOnLoad is true
     * @param algorithms - Array of algorithm names in "namespace:type" format
     */
    async runAlgorithmsFromTemplate(algorithms: string[]): Promise<void> {
        const errors: Error[] = [];

        for (const algName of algorithms) {
            try {
                const trimmedName = algName.trim();
                const [namespace, type] = trimmedName.split(":");
                if (!namespace || !type) {
                    throw new Error(`invalid algorithm name format: ${trimmedName}. Expected format: namespace:type`);
                }

                await this.runAlgorithm(namespace.trim(), type.trim());
            } catch (error) {
                const algorithmError = error instanceof Error ? error : new Error(String(error));
                errors.push(algorithmError);
                // Individual error already emitted by runAlgorithm
            }
        }

        // If there were any errors, throw a summary error
        if (errors.length > 0) {
            const summaryError = new Error(
                `${errors.length} algorithm(s) failed during template execution: ${
                    errors.map((e) => e.message).join(", ")
                }`,
            );

            this.eventManager.emitGraphError(
                this.graph,
                summaryError,
                "algorithm",
                {
                    errorCount: errors.length,
                    component: "AlgorithmManager",
                },
            );

            throw summaryError;
        }
    }

    /**
     * Run a specific algorithm by namespace and type
     * @param namespace - Algorithm namespace (e.g., "graphty")
     * @param type - Algorithm type (e.g., "dijkstra")
     * @param algorithmOptions - Optional algorithm-specific options (source, target, etc.)
     */
    async runAlgorithm(
        namespace: string,
        type: string,
        algorithmOptions?: AlgorithmSpecificOptions,
    ): Promise<void> {
        try {
            const alg = Algorithm.get(this.graph, namespace, type);
            if (!alg) {
                throw new Error(`algorithm not found: ${namespace}:${type}`);
            }

            // Configure the algorithm if options are provided and configure method exists
            if (algorithmOptions && "configure" in alg && typeof alg.configure === "function") {
                alg.configure(algorithmOptions);
            }

            await alg.run(this.graph);

            // Re-apply styles to all nodes and edges after algorithm completes
            // This ensures algorithm results are used in style selector matching
            this.graph.getDataManager().applyStylesToExistingNodes();
            this.graph.getDataManager().applyStylesToExistingEdges();
        } catch (error) {
            // Emit error event for any error (not found or execution)
            const algorithmError = error instanceof Error ? error : new Error(String(error));

            this.eventManager.emitGraphError(
                this.graph,
                algorithmError,
                "algorithm",
                {
                    algorithm: `${namespace}:${type}`,
                    component: "AlgorithmManager",
                },
            );

            throw algorithmError;
        }
    }

    /**
     * Check if an algorithm exists
     * @param namespace - Algorithm namespace
     * @param type - Algorithm type
     * @returns True if the algorithm exists, false otherwise
     */
    hasAlgorithm(namespace: string, type: string): boolean {
        try {
            const alg = Algorithm.get(this.graph, namespace, type);
            return alg !== null;
        } catch {
            return false;
        }
    }

    /**
     * Get list of available algorithms
     * TODO: This depends on the Algorithm registry implementation
     * @returns Array of available algorithm names
     */
    getAvailableAlgorithms(): string[] {
        // This would need to be implemented in the Algorithm class
        // For now, return empty array
        return [];
    }
}
