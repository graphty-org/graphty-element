import type {Scene} from "@babylonjs/core";

import type {MeshCache} from "../meshes/MeshCache";
import type {DataManager} from "./DataManager";
import type {LayoutManager} from "./LayoutManager";
import type {StatsManager} from "./StatsManager";
import type {StyleManager} from "./StyleManager";

/**
 * GraphContext provides controlled access to graph services
 * This interface allows Node and Edge classes to access required services
 * without direct dependency on the Graph class, eliminating circular dependencies
 */
export interface GraphContext {
    /**
     * Get the StyleManager for style operations
     */
    getStyleManager(): StyleManager;

    /**
     * Get the DataManager for node/edge operations
     */
    getDataManager(): DataManager;

    /**
     * Get the LayoutManager for layout operations
     */
    getLayoutManager(): LayoutManager;

    /**
     * Get the MeshCache for mesh creation and caching
     */
    getMeshCache(): MeshCache;

    /**
     * Get the Babylon.js Scene
     */
    getScene(): Scene;

    /**
     * Get the StatsManager for performance monitoring
     */
    getStatsManager(): StatsManager;

    /**
     * Check if the graph is in 2D mode
     */
    is2D(): boolean;

    /**
     * Check if ray updates are needed (for edge arrows)
     */
    needsRayUpdate(): boolean;

    /**
     * Get graph-level configuration options
     */
    getConfig(): GraphContextConfig;

    /**
     * Check if the layout is running
     */
    isRunning(): boolean;

    /**
     * Set the running state
     */
    setRunning(running: boolean): void;
}

/**
 * Configuration options accessible through GraphContext
 */
export interface GraphContextConfig {
    /**
     * Whether to pin nodes when dragged
     */
    pinOnDrag?: boolean;

    /**
     * Other graph-level configuration options can be added here
     */
}

/**
 * Default implementation of GraphContext
 * This can be used by Graph to provide services to Node/Edge
 */
export class DefaultGraphContext implements GraphContext {
    constructor(
        private styleManager: StyleManager,
        private dataManager: DataManager,
        private layoutManager: LayoutManager,
        private meshCache: MeshCache,
        private scene: Scene,
        private statsManager: StatsManager,
        private config: GraphContextConfig,
        private rayUpdateNeeded = true,
    ) {}

    getStyleManager(): StyleManager {
        return this.styleManager;
    }

    getDataManager(): DataManager {
        return this.dataManager;
    }

    getLayoutManager(): LayoutManager {
        return this.layoutManager;
    }

    getMeshCache(): MeshCache {
        return this.meshCache;
    }

    getScene(): Scene {
        return this.scene;
    }

    getStatsManager(): StatsManager {
        return this.statsManager;
    }

    is2D(): boolean {
        return this.styleManager.getStyles().config.graph.twoD;
    }

    needsRayUpdate(): boolean {
        return this.rayUpdateNeeded;
    }

    setRayUpdateNeeded(needed: boolean): void {
        this.rayUpdateNeeded = needed;
    }

    getConfig(): GraphContextConfig {
        return this.config;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<GraphContextConfig>): void {
        Object.assign(this.config, config);
    }

    isRunning(): boolean {
        return this.layoutManager.running;
    }

    setRunning(running: boolean): void {
        this.layoutManager.running = running;
    }
}
