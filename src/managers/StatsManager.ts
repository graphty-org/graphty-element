import {
    type Engine,
    EngineInstrumentation,
    PerfCounter,
    type Scene,
    SceneInstrumentation,
    type WebGPUEngine,
} from "@babylonjs/core";

import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

/**
 * Manages performance statistics and monitoring
 * Centralizes all performance tracking and reporting
 */
export class StatsManager implements Manager {
    // Scene and engine instrumentation
    private sceneInstrumentation: SceneInstrumentation | null = null;
    private babylonInstrumentation: EngineInstrumentation | null = null;

    // Performance counters
    graphStep = new PerfCounter();
    nodeUpdate = new PerfCounter();
    edgeUpdate = new PerfCounter();
    arrowCapUpdate = new PerfCounter();
    intersectCalc = new PerfCounter();
    loadTime = new PerfCounter();
    totalUpdates = 0;

    // Cache statistics (will be updated by other managers)
    private meshCacheHits = 0;
    private meshCacheMisses = 0;
    private nodeCount = 0;
    private edgeCount = 0;

    constructor(
        private eventManager: EventManager,
    ) {}

    async init(): Promise<void> {
        // StatsManager doesn't need async initialization
        return Promise.resolve();
    }

    dispose(): void {
        // Dispose instrumentation
        if (this.sceneInstrumentation) {
            this.sceneInstrumentation.dispose();
            this.sceneInstrumentation = null;
        }

        if (this.babylonInstrumentation) {
            this.babylonInstrumentation.dispose();
            this.babylonInstrumentation = null;
        }

        // Reset counters
        this.resetCounters();
    }

    /**
     * Initialize Babylon.js instrumentation
     * Should be called after scene and engine are created
     */
    initializeBabylonInstrumentation(scene: Scene, engine: Engine | WebGPUEngine): void {
        // Scene instrumentation
        this.sceneInstrumentation = new SceneInstrumentation(scene);
        this.sceneInstrumentation.captureFrameTime = true;
        this.sceneInstrumentation.captureRenderTime = true;
        this.sceneInstrumentation.captureInterFrameTime = true;
        this.sceneInstrumentation.captureCameraRenderTime = true;
        this.sceneInstrumentation.captureActiveMeshesEvaluationTime = true;
        this.sceneInstrumentation.captureRenderTargetsRenderTime = true;

        // Engine instrumentation
        this.babylonInstrumentation = new EngineInstrumentation(engine);
        this.babylonInstrumentation.captureGPUFrameTime = true;
        this.babylonInstrumentation.captureShaderCompilationTime = true;
    }

    /**
     * Update cache statistics
     */
    updateCacheStats(hits: number, misses: number): void {
        this.meshCacheHits = hits;
        this.meshCacheMisses = misses;
    }

    /**
     * Update node/edge counts
     */
    updateCounts(nodeCount: number, edgeCount: number): void {
        this.nodeCount = nodeCount;
        this.edgeCount = edgeCount;
    }

    /**
     * Increment update counter
     */
    step(): void {
        this.totalUpdates++;

        // Emit stats update event periodically (every 60 updates)
        if (this.totalUpdates % 60 === 0) {
            this.eventManager.emitGraphEvent("stats-update", {
                totalUpdates: this.totalUpdates,
                stats: this.getStats(),
            });
        }
    }

    /**
     * Reset all counters
     */
    reset(): void {
        this.totalUpdates = 0;
        this.resetCounters();
    }

    /**
     * Reset performance counters
     */
    private resetCounters(): void {
        this.graphStep = new PerfCounter();
        this.nodeUpdate = new PerfCounter();
        this.edgeUpdate = new PerfCounter();
        this.arrowCapUpdate = new PerfCounter();
        this.intersectCalc = new PerfCounter();
        this.loadTime = new PerfCounter();
        this.totalUpdates = 0;
    }

    /**
     * Get current statistics
     */
    getStats(): {
        numNodes: number;
        numEdges: number;
        totalUpdates: number;
        meshCacheHits: number;
        meshCacheMisses: number;
        nodeUpdateCount: number;
        edgeUpdateCount: number;
        arrowCapUpdateCount: number;
    } {
        return {
            numNodes: this.nodeCount,
            numEdges: this.edgeCount,
            totalUpdates: this.totalUpdates,
            meshCacheHits: this.meshCacheHits,
            meshCacheMisses: this.meshCacheMisses,
            nodeUpdateCount: this.nodeUpdate.count,
            edgeUpdateCount: this.edgeUpdate.count,
            arrowCapUpdateCount: this.arrowCapUpdate.count,
        };
    }

    /**
     * Generate a human-readable statistics report
     */
    toString(): string {
        let statsStr = "";

        function appendStat(name: string, stat: string | number, units = ""): void {
            statsStr += `${name}: ${stat}${units}\n`;
        }

        function statsSection(name: string): void {
            statsStr += `\n${name}\n`;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < name.length; i++) {
                statsStr += "-";
            }
            statsStr += "\n";
        }

        function appendPerf(name: string, stat: PerfCounter, multiplier = 1): void {
            statsStr += `${name} (min/avg/last sec/max [total]): `;
            statsStr += `${(stat.min * multiplier).toFixed(2)} / `;
            statsStr += `${(stat.average * multiplier).toFixed(2)} / `;
            statsStr += `${(stat.lastSecAverage * multiplier).toFixed(2)} / `;
            statsStr += `${(stat.max * multiplier).toFixed(2)} `;
            statsStr += `[${(stat.total * multiplier).toFixed(2)}] ms\n`;
        }

        // Graph statistics
        statsSection("Graph");
        appendStat("Num Nodes", this.nodeCount);
        appendStat("Num Edges", this.edgeCount);
        appendStat("Total Updates", this.totalUpdates);
        appendStat("Mesh Cache Hits", this.meshCacheHits);
        appendStat("Mesh Cache Misses", this.meshCacheMisses);
        appendStat("Number of Node Updates", this.nodeUpdate.count);
        appendStat("Number of Edge Updates", this.edgeUpdate.count);
        appendStat("Number of ArrowCap Updates", this.arrowCapUpdate.count);

        // Graph engine performance
        statsSection("Graph Engine Performance");
        appendPerf("JSON Load Time", this.loadTime);
        appendPerf("Graph Physics Engine Time", this.graphStep);
        appendPerf("Node Update Time", this.nodeUpdate);
        appendPerf("Edge Update Time", this.edgeUpdate);
        appendPerf("Arrow Cap Update Time", this.arrowCapUpdate);
        appendPerf("Ray Intersect Calculation Time", this.intersectCalc);

        // BabylonJS performance (if available)
        if (this.sceneInstrumentation && this.babylonInstrumentation) {
            statsSection("BabylonJS Performance");
            appendStat("Draw Calls", this.sceneInstrumentation.drawCallsCounter.count);
            appendPerf("GPU Time", this.babylonInstrumentation.gpuFrameTimeCounter, 0.000001);
            appendPerf("Shader Time", this.babylonInstrumentation.shaderCompilationTimeCounter);
            appendPerf("Mesh Evaluation Time", this.sceneInstrumentation.activeMeshesEvaluationTimeCounter);
            appendPerf("Render Targets Time", this.sceneInstrumentation.renderTargetsRenderTimeCounter);
            appendPerf("Draw Calls Time", this.sceneInstrumentation.drawCallsCounter);
            appendPerf("Frame Time", this.sceneInstrumentation.frameTimeCounter);
            appendPerf("Render Time", this.sceneInstrumentation.renderTimeCounter);
            appendPerf("Time Between Frames", this.sceneInstrumentation.interFrameTimeCounter);
            appendPerf("Camera Render Time", this.sceneInstrumentation.cameraRenderTimeCounter);
        }

        return statsStr;
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary(): {
        fps: number;
        frameTime: number;
        renderTime: number;
        gpuTime: number;
        drawCalls: number;
    } {
        if (!this.sceneInstrumentation || !this.babylonInstrumentation) {
            return {
                fps: 0,
                frameTime: 0,
                renderTime: 0,
                gpuTime: 0,
                drawCalls: 0,
            };
        }

        return {
            fps: this.sceneInstrumentation.frameTimeCounter.average > 0 ?
                1000 / this.sceneInstrumentation.frameTimeCounter.average :
                0,
            frameTime: this.sceneInstrumentation.frameTimeCounter.lastSecAverage,
            renderTime: this.sceneInstrumentation.renderTimeCounter.lastSecAverage,
            gpuTime: this.babylonInstrumentation.gpuFrameTimeCounter.lastSecAverage * 0.000001,
            drawCalls: this.sceneInstrumentation.drawCallsCounter.count,
        };
    }
}
