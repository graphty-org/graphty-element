import type {Edge} from "../Edge";
import {LayoutEngine} from "../layout/LayoutEngine";
import type {Node} from "../Node";
import type {Styles} from "../Styles";
import type {DataManager} from "./DataManager";
import type {EventManager} from "./EventManager";
import type {GraphContext} from "./GraphContext";
import type {Manager} from "./interfaces";

// Type guard for layout engines with optional dispose method
type LayoutEngineWithDispose = LayoutEngine & {dispose(): void};

function hasDispose(engine: LayoutEngine): engine is LayoutEngineWithDispose {
    return "dispose" in engine;
}

// Type guard for layout engines with optional getEdgePath method
type LayoutEngineWithEdgePath = LayoutEngine & {getEdgePath(edge: Edge): [number, number, number][]};

function hasGetEdgePath(engine: LayoutEngine): engine is LayoutEngineWithEdgePath {
    return "getEdgePath" in engine;
}

/**
 * Manages layout engines and their lifecycle
 * Coordinates layout updates and transitions
 */
export class LayoutManager implements Manager {
    layoutEngine?: LayoutEngine;
    private _running = false;

    get running(): boolean {
        return this._running;
    }

    set running(value: boolean) {
        // console.log(`[LayoutManager] running set to ${value}, layoutEngine exists: ${!!this.layoutEngine}`);
        this._running = value;
    }

    // GraphContext for error reporting
    private graphContext: GraphContext | null = null;

    constructor(
        private eventManager: EventManager,
        private dataManager: DataManager,
        private styles: Styles,
    ) {}

    /**
     * Set the GraphContext for error reporting
     */
    setGraphContext(context: GraphContext): void {
        this.graphContext = context;
    }

    async init(): Promise<void> {
        // LayoutManager doesn't need async initialization
        return Promise.resolve();
    }

    dispose(): void {
        // Dispose current layout engine if any
        if (this.layoutEngine && hasDispose(this.layoutEngine)) {
            this.layoutEngine.dispose();
        }

        this.layoutEngine = undefined;
        this.running = false;
    }

    async setLayout(type: string, opts: object = {}): Promise<void> {
        try {
            // Auto-sync layout dimension with graph's 2D/3D mode if not explicitly set
            const layoutOpts = {... opts};

            // Get dimension-specific options from the layout if not already provided
            const dimension = this.styles.config.graph.twoD ? 2 : 3;
            const dimensionOpts = LayoutEngine.getOptionsForDimensionByType(type, dimension);

            if (dimensionOpts) {
                // Merge dimension options, but don't override user-provided options
                Object.keys(dimensionOpts).forEach((key) => {
                    if (!(key in layoutOpts)) {
                        (layoutOpts as Record<string, unknown>)[key] = (dimensionOpts as Record<string, unknown>)[key];
                    }
                });
            }

            const engine = LayoutEngine.get(type, layoutOpts);
            if (!engine) {
                throw new TypeError(`No layout named: ${type}`);
            }

            // Store the current layout options for change detection
            this.currentLayoutOptions = layoutOpts;

            // Store previous layout engine for cleanup if init fails
            const previousEngine = this.layoutEngine;

            try {
                // Add all existing nodes and edges to the new engine
                const nodeArray = [... this.dataManager.nodes.values()];
                const edgeArray = [... this.dataManager.edges.values()];
                engine.addNodes(nodeArray);
                engine.addEdges(edgeArray);

                this.layoutEngine = engine;
                await engine.init();

                // Update DataManager with new layout engine
                this.dataManager.setLayoutEngine(engine);

                // run layout presteps
                const {preSteps} = this.styles.config.behavior.layout;
                for (let i = 0; i < preSteps; i++) {
                    this.layoutEngine.step();
                }

                this.running = true;

                // Request zoom to fit when layout changes
                this.eventManager.emitLayoutInitialized(type, true);

                // Dispose previous engine after successful init
                if (previousEngine && hasDispose(previousEngine)) {
                    previousEngine.dispose();
                }

                // Emit layout changed event
                this.eventManager.emitGraphEvent("layout-changed", {
                    layoutType: type,
                    options: layoutOpts,
                });
            } catch (error) {
                // Restore previous layout engine if initialization failed
                this.layoutEngine = previousEngine;
                this.dataManager.setLayoutEngine(previousEngine);

                // Emit error event
                if (this.graphContext) {
                    this.eventManager.emitGraphError(
                        this.graphContext,
                        error instanceof Error ? error : new Error(String(error)),
                        "layout",
                        {layoutType: type},
                    );
                }

                throw new Error(`Failed to initialize layout '${type}': ${error instanceof Error ? error.message : String(error)}`);
            }
        } catch (error) {
            // Re-throw if already a processed error
            if (error instanceof Error && error.message.includes("Failed to initialize layout")) {
                throw error;
            }

            // Otherwise wrap and throw
            throw new Error(`Error setting layout '${type}': ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Step the layout engine forward
     */
    step(): void {
        if (this.layoutEngine && this.running) {
            this.layoutEngine.step();
        }
    }

    /**
     * Get node position from layout engine
     */
    getNodePosition(node: Node): [number, number, number] | undefined {
        const position = this.layoutEngine?.getNodePosition(node);
        if (!position) {
            return undefined;
        }

        return [position.x, position.y, position.z ?? 0];
    }

    /**
     * Get edge path from layout engine
     */
    getEdgePath(edge: Edge): [number, number, number][] | undefined {
        if (this.layoutEngine && hasGetEdgePath(this.layoutEngine)) {
            return this.layoutEngine.getEdgePath(edge);
        }

        return undefined;
    }

    /**
     * Check if layout has settled
     */
    get isSettled(): boolean {
        // If not running, consider it settled
        if (!this.running) {
            return true;
        }

        // If no layout engine, consider it settled
        if (!this.layoutEngine) {
            return true;
        }

        // Otherwise check layout engine's settled state
        return this.layoutEngine.isSettled;
    }

    /**
     * Get nodes from layout engine
     */
    get nodes(): Iterable<Node> {
        return this.layoutEngine?.nodes ?? [];
    }

    /**
     * Get edges from layout engine
     */
    get edges(): Iterable<Edge> {
        return this.layoutEngine?.edges ?? [];
    }

    /**
     * Get current layout type
     */
    get layoutType(): string | undefined {
        return this.layoutEngine?.type;
    }

    /**
     * Update layout dimension when 2D/3D mode changes
     */
    async updateLayoutDimension(twoD: boolean): Promise<void> {
        try {
            if (this.layoutEngine) {
                const currentDimension = twoD ? 2 : 3;
                const currentDimensionOpts = LayoutEngine.getOptionsForDimensionByType(this.layoutEngine.type, currentDimension);

                // Only recreate if the layout supports dimension configuration
                if (currentDimensionOpts && Object.keys(currentDimensionOpts).length > 0) {
                    // Check if we need to recreate the layout
                    // This is a bit tricky since we don't know what property name is used for dimensions
                    // The safest approach is to always recreate when switching between 2D/3D modes
                    const layoutType = this.layoutEngine.type;
                    const layoutOpts = this.layoutEngine.config ? {... this.layoutEngine.config} : {};

                    // Remove any dimension-related options that might conflict
                    // We'll let getOptionsForDimensionByType add the correct ones
                    const previousDimensionOpts2D = LayoutEngine.getOptionsForDimensionByType(layoutType, 2);
                    const previousDimensionOpts3D = LayoutEngine.getOptionsForDimensionByType(layoutType, 3);
                    const allDimensionKeys = new Set([
                        ... Object.keys(previousDimensionOpts2D ?? {}),
                        ... Object.keys(previousDimensionOpts3D ?? {}),
                    ]);

                    allDimensionKeys.forEach((key) => {
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete (layoutOpts as Record<string, unknown>)[key];
                    });

                    await this.setLayout(layoutType, layoutOpts);
                }
            }
        } catch {
            // Layout engine not yet initialized - will be set with correct dimension when initialized
        }
    }

    /**
     * Apply layout from style template if specified
     */
    async applyTemplateLayout(layoutType?: string, layoutOptions?: object): Promise<void> {
        if (layoutType) {
            const options = layoutOptions ?? {};

            // Check if we need to update the layout
            const needsUpdate = !this.layoutEngine ||
                               this.layoutEngine.type !== layoutType ||
                               this.hasOptionsChanged(options);

            if (needsUpdate) {
                await this.setLayout(layoutType, options);
            }
        }
    }

    /**
     * Track current layout options to detect changes
     */
    private currentLayoutOptions?: object;

    /**
     * Check if layout options have changed
     */
    private hasOptionsChanged(newOptions: object): boolean {
        // If no previous options, consider it changed
        if (!this.currentLayoutOptions) {
            this.currentLayoutOptions = newOptions;
            return true;
        }

        // Deep compare options
        const oldStr = JSON.stringify(this.currentLayoutOptions);
        const newStr = JSON.stringify(newOptions);

        if (oldStr !== newStr) {
            this.currentLayoutOptions = newOptions;
            return true;
        }

        return false;
    }

    /**
     * Get layout statistics
     */
    getStats(): {
        layoutType: string | undefined;
        isRunning: boolean;
        isSettled: boolean;
        nodeCount: number;
        edgeCount: number;
    } {
        const nodeCount = this.layoutEngine ? Array.from(this.layoutEngine.nodes).length : 0;
        const edgeCount = this.layoutEngine ? Array.from(this.layoutEngine.edges).length : 0;

        return {
            layoutType: this.layoutType,
            isRunning: this.running,
            isSettled: this.isSettled,
            nodeCount,
            edgeCount,
        };
    }
}
