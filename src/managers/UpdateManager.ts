import type {Vector3} from "@babylonjs/core";

import type {CameraManager} from "../cameras/CameraManager";
import {Edge} from "../Edge";
import type {DataManager} from "./DataManager";
import type {EventManager} from "./EventManager";
import type {GraphContext} from "./GraphContext";
import type {Manager} from "./interfaces";
import type {LayoutManager} from "./LayoutManager";
import type {StatsManager} from "./StatsManager";
import type {StyleManager} from "./StyleManager";

/**
 * Configuration for the UpdateManager
 */
export interface UpdateManagerConfig {
    /**
     * Number of layout steps to perform per update
     */
    layoutStepMultiplier?: number;

    /**
     * Whether to automatically zoom to fit on first load
     */
    autoZoomToFit?: boolean;

    /**
     * Minimum bounding box size to trigger zoom to fit
     */
    minBoundingBoxSize?: number;
}

/**
 * Manages the update loop logic for the graph
 * Coordinates updates across nodes, edges, layout, and camera
 */
export class UpdateManager implements Manager {
    private needsZoomToFit = false;
    private hasZoomedToFit = false;
    private config: Required<UpdateManagerConfig>;

    constructor(
        private eventManager: EventManager,
        private statsManager: StatsManager,
        private layoutManager: LayoutManager,
        private dataManager: DataManager,
        private styleManager: StyleManager,
        private camera: CameraManager,
        private graphContext: GraphContext,
        config: UpdateManagerConfig = {},
    ) {
        this.config = {
            layoutStepMultiplier: config.layoutStepMultiplier ?? 1,
            autoZoomToFit: config.autoZoomToFit ?? true,
            minBoundingBoxSize: config.minBoundingBoxSize ?? 0.1,
        };
    }

    async init(): Promise<void> {
        // UpdateManager doesn't need async initialization
        return Promise.resolve();
    }

    dispose(): void {
        // UpdateManager doesn't hold resources to dispose
    }

    /**
     * Enable zoom to fit on next update
     */
    enableZoomToFit(): void {
        this.needsZoomToFit = true;
    }

    /**
     * Main update method - called by RenderManager each frame
     */
    update(): void {
        // Update camera first
        this.camera.update();

        // Check if layout is running
        if (!this.layoutManager.running) {
            return;
        }

        // Update layout engine
        this.updateLayout();

        // Calculate bounding box and update nodes
        const {boundingBoxMin, boundingBoxMax} = this.updateNodes();

        // Update edges
        this.updateEdges();

        // Handle zoom to fit if needed
        this.handleZoomToFit(boundingBoxMin, boundingBoxMax);

        // Update statistics
        this.updateStatistics();
    }

    /**
     * Update the layout engine
     */
    private updateLayout(): void {
        this.statsManager.step();
        this.statsManager.graphStep.beginMonitoring();

        const {stepMultiplier} = this.styleManager.getStyles().config.behavior.layout;
        for (let i = 0; i < stepMultiplier; i++) {
            this.layoutManager.step();
        }

        this.statsManager.graphStep.endMonitoring();
    }

    /**
     * Update all nodes and calculate bounding box
     */
    private updateNodes(): {boundingBoxMin?: Vector3, boundingBoxMax?: Vector3} {
        let boundingBoxMin: Vector3 | undefined;
        let boundingBoxMax: Vector3 | undefined;

        this.statsManager.nodeUpdate.beginMonitoring();

        for (const node of this.layoutManager.nodes) {
            node.update();

            // Update bounding box
            const pos = node.mesh.getAbsolutePosition();
            const sz = node.size;

            if (!boundingBoxMin || !boundingBoxMax) {
                boundingBoxMin = pos.clone();
                boundingBoxMax = pos.clone();
            }

            this.updateBoundingBoxAxis(pos, boundingBoxMin, boundingBoxMax, sz, "x");
            this.updateBoundingBoxAxis(pos, boundingBoxMin, boundingBoxMax, sz, "y");
            this.updateBoundingBoxAxis(pos, boundingBoxMin, boundingBoxMax, sz, "z");
        }

        this.statsManager.nodeUpdate.endMonitoring();

        return {boundingBoxMin, boundingBoxMax};
    }

    /**
     * Update bounding box for a single axis
     */
    private updateBoundingBoxAxis(
        pos: Vector3,
        min: Vector3,
        max: Vector3,
        size: number,
        axis: "x" | "y" | "z",
    ): void {
        const value = pos[axis];
        const halfSize = size / 2;

        min[axis] = Math.min(min[axis], value - halfSize);
        max[axis] = Math.max(max[axis], value + halfSize);
    }

    /**
     * Update all edges
     */
    private updateEdges(): void {
        this.statsManager.edgeUpdate.beginMonitoring();

        // Update rays for all edges (static method on Edge class)
        Edge.updateRays(this.graphContext);

        // Update individual edges
        for (const edge of this.layoutManager.edges) {
            edge.update();
        }

        this.statsManager.edgeUpdate.endMonitoring();
    }

    /**
     * Handle zoom to fit logic
     */
    private handleZoomToFit(boundingBoxMin?: Vector3, boundingBoxMax?: Vector3): void {
        if (!this.needsZoomToFit || !boundingBoxMin || !boundingBoxMax) {
            return;
        }

        // Check if the bounding box is reasonable (not all nodes at origin)
        const size = boundingBoxMax.subtract(boundingBoxMin);

        if (size.length() > this.config.minBoundingBoxSize) {
            this.camera.zoomToBoundingBox(boundingBoxMin, boundingBoxMax);
            this.hasZoomedToFit = true;
            this.needsZoomToFit = false;

            // Emit zoom complete event
            this.eventManager.emitGraphEvent("zoom-to-fit-complete", {
                boundingBoxMin,
                boundingBoxMax,
            });
        }
    }

    /**
     * Update statistics
     */
    private updateStatistics(): void {
        this.statsManager.updateCounts(
            this.dataManager.nodeCache.size,
            this.dataManager.edgeCache.size,
        );

        // Update mesh cache stats
        const meshCache = this.graphContext.getMeshCache();
        this.statsManager.updateCacheStats(meshCache.hits, meshCache.misses);
    }

    /**
     * Check if zoom to fit has been completed
     */
    get zoomToFitCompleted(): boolean {
        return this.hasZoomedToFit;
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<UpdateManagerConfig>): void {
        Object.assign(this.config, config);
    }
}
