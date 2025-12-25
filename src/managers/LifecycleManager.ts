import {GraphtyLogger, type Logger} from "../logging/GraphtyLogger.js";
import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

// Type guard for render managers with startRenderLoop method
type RenderManagerWithStartLoop = Manager & {startRenderLoop(callback: () => void): void};

function hasStartRenderLoop(manager: Manager): manager is RenderManagerWithStartLoop {
    return "startRenderLoop" in manager;
}

/**
 * Manages the lifecycle of all other managers
 * Ensures proper initialization order and cleanup
 */
export class LifecycleManager implements Manager {
    private initialized = false;
    private initializing = false;
    private logger: Logger = GraphtyLogger.getLogger(["graphty", "lifecycle"]);

    /**
     * Creates a new lifecycle manager for coordinating manager initialization and disposal
     * @param managers - Map of manager names to manager instances
     * @param eventManager - Event manager for emitting lifecycle events
     * @param initOrder - Array of manager names defining initialization order
     */
    constructor(
        private managers: Map<string, Manager>,
        private eventManager: EventManager,
        private initOrder: string[],
    ) {}

    /**
     * Initialize all managers in the specified order
     */
    async init(): Promise<void> {
        if (this.initialized || this.initializing) {
            return;
        }

        this.initializing = true;
        const startTime = performance.now();

        this.logger.info("Initializing managers", {
            managerCount: this.managers.size,
            initOrder: this.initOrder,
        });

        try {
            // Initialize managers in specified order
            for (const managerName of this.initOrder) {
                const manager = this.managers.get(managerName);
                if (!manager) {
                    throw new Error(`Manager '${managerName}' not found in manager map`);
                }

                try {
                    const managerStartTime = performance.now();
                    this.logger.debug(`Initializing manager: ${managerName}`);
                    await manager.init();
                    const managerDuration = performance.now() - managerStartTime;

                    this.logger.debug(`Manager initialized: ${managerName}`, {
                        duration: managerDuration.toFixed(2),
                    });

                    this.eventManager.emitGraphEvent("manager-initialized", {
                        managerName,
                        elapsedTime: performance.now() - startTime,
                    });
                } catch (error) {
                    // Log the failure
                    this.logger.error(
                        `Manager initialization failed: ${managerName}`,
                        error instanceof Error ? error : new Error(String(error)),
                        {managerName},
                    );

                    // Clean up any managers that were already initialized
                    this.cleanup(managerName);

                    throw new Error(
                        `Failed to initialize manager '${managerName}': ${
                            error instanceof Error ? error.message : String(error)
                        }`,
                    );
                }
            }

            this.initialized = true;
            this.initializing = false;

            const totalTime = performance.now() - startTime;
            this.logger.info("All managers initialized", {
                totalTime: totalTime.toFixed(2),
                managerCount: this.managers.size,
            });

            // Emit overall initialization complete event
            this.eventManager.emitGraphEvent("lifecycle-initialized", {
                totalTime,
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
     * @param updateCallback - Callback function to execute on each render frame
     */
    startGraph(updateCallback: () => void): void {
        if (!this.initialized) {
            throw new Error("Cannot start graph before initialization");
        }

        try {
            // Get the render manager and start the render loop
            const renderManager = this.managers.get("render");
            if (renderManager && hasStartRenderLoop(renderManager)) {
                renderManager.startRenderLoop(updateCallback);
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

    /**
     * Dispose all managers in reverse initialization order
     */
    dispose(): void {
        if (!this.initialized) {
            return;
        }

        this.logger.info("Disposing managers", {
            managerCount: this.managers.size,
        });

        // Dispose managers in reverse order
        const reverseOrder = [... this.initOrder].reverse();

        for (const managerName of reverseOrder) {
            const manager = this.managers.get(managerName);
            if (manager) {
                try {
                    this.logger.debug(`Disposing manager: ${managerName}`);
                    manager.dispose();
                } catch (error) {
                    // Log error but continue disposing other managers
                    this.logger.error(
                        `Error disposing manager: ${managerName}`,
                        error instanceof Error ? error : new Error(String(error)),
                        {managerName},
                    );

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

        this.logger.info("All managers disposed", {
            managerCount: this.managers.size,
        });

        // Emit lifecycle disposed event
        this.eventManager.emitGraphEvent("lifecycle-disposed", {
            managerCount: this.managers.size,
        });
    }

    /**
     * Clean up managers that were initialized before the given manager failed
     * @param failedManager - Name of the manager that failed to initialize
     */
    private cleanup(failedManager: string): void {
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
                    this.logger.error(
                        `Error during cleanup of manager: ${managerName}`,
                        error instanceof Error ? error : new Error(String(error)),
                        {managerName},
                    );
                }
            }
        }
    }

    /**
     * Check if all managers are initialized
     * @returns True if initialization is complete, false otherwise
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Add a new manager to the lifecycle
     * TODO: This should only be done before init() is called
     * @param name - Unique name for the manager
     * @param manager - Manager instance to add
     * @param position - Optional position in initialization order (defaults to end)
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
     * @param name - Name of the manager to retrieve
     * @returns The manager instance or undefined if not found
     */
    getManager(name: string): Manager | undefined {
        return this.managers.get(name);
    }
}
