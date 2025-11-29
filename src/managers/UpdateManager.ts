import type {Mesh, Vector3} from "@babylonjs/core";

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
    private layoutStepCount = 0;
    private minLayoutStepsBeforeZoom = 10;
    private lastZoomStep = 0;
    private wasSettled = false;

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
        // Only reset the layout step count if we haven't zoomed yet
        // This prevents the counter from being reset when enableZoomToFit is called multiple times
        if (!this.hasZoomedToFit) {
            this.layoutStepCount = 0;
            this.lastZoomStep = 0;
            this.wasSettled = false;
        }
    }

    /**
     * Disable zoom to fit
     */
    disableZoomToFit(): void {
        this.needsZoomToFit = false;
    }

    /**
     * Get current zoom to fit state
     */
    isZoomToFitEnabled(): boolean {
        return this.needsZoomToFit;
    }

    /**
     * Get the current render frame count
     */
    getRenderFrameCount(): number {
        return this.frameCount;
    }

    /**
     * Render a fixed number of frames (for testing)
     * This ensures deterministic rendering similar to Babylon.js testing approach
     */
    renderFixedFrames(count: number): void {
        for (let i = 0; i < count; i++) {
            this.update();
        }
    }

    /**
     * Main update method - called by RenderManager each frame
     */
    private frameCount = 0;

    update(): void {
        this.frameCount++;

        // Always update camera
        this.camera.update();

        // Check if layout is running
        if (!this.layoutManager.running) {
            // Even if layout is not running, we still need to handle zoom if requested
            if (this.needsZoomToFit && !this.hasZoomedToFit) {
                // Check if we have nodes to calculate bounds from
                const nodeCount = Array.from(this.layoutManager.nodes).length;
                if (nodeCount > 0) {
                    // Calculate bounding box and update nodes
                    const {boundingBoxMin, boundingBoxMax} = this.updateNodes();

                    // Update edges (also expands bounding box for edge labels)
                    this.updateEdges(boundingBoxMin, boundingBoxMax);

                    // Handle zoom to fit
                    this.handleZoomToFit(boundingBoxMin, boundingBoxMax);

                    // Update statistics
                    this.updateStatistics();
                }
            }

            return;
        }

        // Always update nodes and edges (regardless of layout running state)
        // This ensures edges render even when layout isn't running
        const {boundingBoxMin, boundingBoxMax} = this.updateNodes();

        // Update edges (also expands bounding box for edge labels)
        this.updateEdges(boundingBoxMin, boundingBoxMax);

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
            this.layoutStepCount++;
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

            // The mesh position is already updated by node.update()

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

            // Include node label in bounding box
            if (node.label?.labelMesh) {
                this.expandBoundingBoxForLabel(node.label.labelMesh, boundingBoxMin, boundingBoxMax);
            }
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
     * Expand bounding box to include a label mesh
     */
    private expandBoundingBoxForLabel(labelMesh: Mesh, min: Vector3, max: Vector3): void {
        const labelBoundingInfo = labelMesh.getBoundingInfo();
        const labelMin = labelBoundingInfo.boundingBox.minimumWorld;
        const labelMax = labelBoundingInfo.boundingBox.maximumWorld;

        min.x = Math.min(min.x, labelMin.x);
        min.y = Math.min(min.y, labelMin.y);
        min.z = Math.min(min.z, labelMin.z);
        max.x = Math.max(max.x, labelMax.x);
        max.y = Math.max(max.y, labelMax.y);
        max.z = Math.max(max.z, labelMax.z);
    }

    /**
     * Update all edges and expand bounding box for edge labels
     */
    private updateEdges(boundingBoxMin?: Vector3, boundingBoxMax?: Vector3): void {
        this.statsManager.edgeUpdate.beginMonitoring();

        // Update rays for all edges (static method on Edge class)
        Edge.updateRays(this.graphContext);

        // Update individual edges
        for (const edge of this.layoutManager.edges) {
            edge.update();

            // Include edge labels in bounding box if we have one
            if (boundingBoxMin && boundingBoxMax) {
                // Edge label (at midpoint)
                if (edge.label?.labelMesh) {
                    this.expandBoundingBoxForLabel(edge.label.labelMesh, boundingBoxMin, boundingBoxMax);
                }

                // Arrow head text label
                if (edge.arrowHeadText?.labelMesh) {
                    this.expandBoundingBoxForLabel(edge.arrowHeadText.labelMesh, boundingBoxMin, boundingBoxMax);
                }

                // Arrow tail text label
                if (edge.arrowTailText?.labelMesh) {
                    this.expandBoundingBoxForLabel(edge.arrowTailText.labelMesh, boundingBoxMin, boundingBoxMax);
                }
            }
        }

        this.statsManager.edgeUpdate.endMonitoring();
    }

    /**
     * Handle zoom to fit logic
     */
    private handleZoomToFit(boundingBoxMin?: Vector3, boundingBoxMax?: Vector3): void {
        if (!this.needsZoomToFit) {
            return;
        }

        if (!boundingBoxMin || !boundingBoxMax) {
            return;
        }

        // Check if we should zoom:
        // 1. Wait for minimum steps on first zoom
        // 2. Zoom every N steps during layout (based on zoomStepInterval)
        // 3. Zoom when layout settles
        const isSettled = this.layoutManager.layoutEngine?.isSettled ?? false;
        const {zoomStepInterval} = this.styleManager.getStyles().config.behavior.layout;
        const shouldZoomPeriodically = this.layoutStepCount > 0 &&
                                      this.layoutStepCount >= this.lastZoomStep + zoomStepInterval;
        const justSettled = isSettled && !this.wasSettled && this.layoutStepCount > 0;

        if (!this.hasZoomedToFit && this.layoutManager.running && this.layoutStepCount < this.minLayoutStepsBeforeZoom) {
            // First zoom - wait for minimum steps
            return;
        } else if (!this.layoutManager.running && !this.hasZoomedToFit && this.layoutStepCount === 0) {
            // Layout not running and no steps taken - allow immediate zoom
        } else if (!shouldZoomPeriodically && !justSettled) {
            // Not time for periodic zoom and didn't just settle
            return;
        }

        // Update settled state for next frame
        this.wasSettled = isSettled;

        const size = boundingBoxMax.subtract(boundingBoxMin);

        if (size.length() > this.config.minBoundingBoxSize) {
            this.camera.zoomToBoundingBox(boundingBoxMin, boundingBoxMax);

            this.hasZoomedToFit = true;
            this.lastZoomStep = this.layoutStepCount;

            // Only clear needsZoomToFit if layout is settled
            if (isSettled) {
                this.needsZoomToFit = false;
            }

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
