import type {Edge} from "../Edge";
import {LayoutEngine} from "../layout/LayoutEngine";
import type {Node} from "../Node";
import type {Styles} from "../Styles";
import type {DataManager} from "./DataManager";
import type {EventManager} from "./EventManager";
import type {GraphContext} from "./GraphContext";
import type {Manager} from "./interfaces";

/**
 * Manages layout engines and their lifecycle
 * Coordinates layout updates and transitions
 */
export class LayoutManager implements Manager {
    layoutEngine?: LayoutEngine;
    running = false;

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
        if (this.layoutEngine && "dispose" in this.layoutEngine) {
            (this.layoutEngine as any).dispose();
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

            // Store previous layout engine for cleanup if init fails
            const previousEngine = this.layoutEngine;

            try {
                // Add all existing nodes and edges to the new engine
                engine.addNodes([... this.dataManager.nodes.values()]);
                engine.addEdges([... this.dataManager.edges.values()]);

                this.layoutEngine = engine;
                await engine.init();

                // Update DataManager with new layout engine
                this.dataManager.setLayoutEngine(engine);

                // run layout presteps
                for (let i = 0; i < this.styles.config.behavior.layout.preSteps; i++) {
                    this.layoutEngine.step();
                }

                this.running = true;

                // Request zoom to fit when layout changes
                this.eventManager.emitLayoutInitialized(type, true);

                // Dispose previous engine after successful init
                if (previousEngine && "dispose" in previousEngine) {
                    (previousEngine as any).dispose();
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
        if (this.layoutEngine && "getEdgePath" in this.layoutEngine) {
            return (this.layoutEngine as any).getEdgePath(edge);
        }

        return undefined;
    }

    /**
     * Check if layout has settled
     */
    get isSettled(): boolean {
        return this.layoutEngine?.isSettled ?? true;
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

            // Only set layout if it's different from current layout or if no layout is set
            if (!this.layoutEngine || this.layoutEngine.type !== layoutType) {
                await this.setLayout(layoutType, options);
            }
        }
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
