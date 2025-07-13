import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

/**
 * Manages the lifecycle of all other managers
 * Ensures proper initialization order and cleanup
 */
export class LifecycleManager implements Manager {
    private initialized = false;
    private initializing = false;

    constructor(
        private managers: Map<string, Manager>,
        private eventManager: EventManager,
        private initOrder: string[],
    ) {}

    async init(): Promise<void> {
        if (this.initialized || this.initializing) {
            return;
        }

        this.initializing = true;
        const startTime = performance.now();

        try {
            // Initialize managers in specified order
            for (const managerName of this.initOrder) {
                const manager = this.managers.get(managerName);
                if (!manager) {
                    throw new Error(`Manager '${managerName}' not found in manager map`);
                }

                try {
                    await manager.init();

                    this.eventManager.emitGraphEvent("manager-initialized", {
                        managerName,
                        elapsedTime: performance.now() - startTime,
                    });
                } catch (error) {
                    // Clean up any managers that were already initialized
                    await this.cleanup(managerName);

                    throw new Error(
                        `Failed to initialize manager '${managerName}': ${
                            error instanceof Error ? error.message : String(error)
                        }`,
                    );
                }
            }

            this.initialized = true;
            this.initializing = false;

            // Emit overall initialization complete event
            this.eventManager.emitGraphEvent("lifecycle-initialized", {
                totalTime: performance.now() - startTime,
                managerCount: this.managers.size,
            });
        } catch (error) {
            this.initializing = false;

            const err = error instanceof Error ? error : new Error(String(error));
            this.eventManager.emitGraphError(
                null,
                err,
                "init",
                {component: "LifecycleManager"},
            );

            throw error;
        }
    }

    /**
     * Start the graph system after initialization
     * This coordinates starting the render loop and other post-init setup
     */
    async startGraph(updateCallback: () => void): Promise<void> {
        if (!this.initialized) {
            throw new Error("Cannot start graph before initialization");
        }

        try {
            // Get the render manager and start the render loop
            const renderManager = this.managers.get("render");
            if (renderManager && "startRenderLoop" in renderManager) {
                (renderManager as any).startRenderLoop(updateCallback);
            }

            // Emit graph started event
            this.eventManager.emitGraphEvent("graph-started", {
                timestamp: Date.now(),
            });
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.eventManager.emitGraphError(
                null,
                err,
                "init",
                {component: "LifecycleManager", operation: "startGraph"},
            );
            throw new Error(`Failed to start graph: ${err.message}`);
        }
    }

    dispose(): void {
        if (!this.initialized) {
            return;
        }

        // Dispose managers in reverse order
        const reverseOrder = [... this.initOrder].reverse();

        for (const managerName of reverseOrder) {
            const manager = this.managers.get(managerName);
            if (manager) {
                try {
                    manager.dispose();
                } catch (error) {
                    // Log error but continue disposing other managers
                    console.error(`Error disposing manager '${managerName}':`, error);

                    this.eventManager.emitGraphError(
                        null,
                        error instanceof Error ? error : new Error(String(error)),
                        "other",
                        {component: "LifecycleManager", operation: "dispose", managerName},
                    );
                }
            }
        }

        this.initialized = false;

        // Emit lifecycle disposed event
        this.eventManager.emitGraphEvent("lifecycle-disposed", {
            managerCount: this.managers.size,
        });
    }

    /**
     * Clean up managers that were initialized before the given manager failed
     */
    private async cleanup(failedManager: string): Promise<void> {
        const failedIndex = this.initOrder.indexOf(failedManager);
        if (failedIndex === -1) {
            return;
        }

        // Dispose all managers that were initialized before the failure
        for (let i = failedIndex - 1; i >= 0; i--) {
            const managerName = this.initOrder[i];
            const manager = this.managers.get(managerName);

            if (manager) {
                try {
                    manager.dispose();
                } catch (error) {
                    console.error(`Error during cleanup of manager '${managerName}':`, error);
                }
            }
        }
    }

    /**
     * Check if all managers are initialized
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Add a new manager to the lifecycle
     * Note: This should only be done before init() is called
     */
    addManager(name: string, manager: Manager, position?: number): void {
        if (this.initialized || this.initializing) {
            throw new Error("Cannot add managers after initialization has started");
        }

        this.managers.set(name, manager);

        if (position !== undefined) {
            this.initOrder.splice(position, 0, name);
        } else {
            this.initOrder.push(name);
        }
    }

    /**
     * Get a manager by name
     */
    getManager<T extends Manager>(name: string): T | undefined {
        return this.managers.get(name) as T | undefined;
    }
}
