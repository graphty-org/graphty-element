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
 * Internal measurement statistics for profiling
 */
interface MeasurementStats {
    label: string;
    count: number;
    total: number;
    min: number;
    max: number;
    avg: number;
    lastDuration: number;
    durations: number[]; // Ring buffer for percentile calculation
}

/**
 * Performance snapshot including CPU, GPU, and scene metrics
 */
export interface PerformanceSnapshot {
    cpu: {
        label: string;
        count: number;
        total: number;
        min: number;
        max: number;
        avg: number;
        p50: number;
        p95: number;
        p99: number;
        lastDuration: number;
    }[];
    gpu?: {
        gpuFrameTime: {current: number, avg: number, min: number, max: number};
        shaderCompilation: {current: number, avg: number, total: number};
    };
    scene?: {
        drawCalls: {current: number, avg: number};
        frameTime: {avg: number};
        renderTime: {avg: number};
        activeMeshesEvaluation: {avg: number};
    };
    timestamp: number;
}

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

    // Profiling fields
    private enabled = false;
    private measurements = new Map<string, MeasurementStats>();
    private activeStack: {label: string, startTime: number}[] = [];

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

        // Clear profiling state
        this.measurements.clear();
        this.activeStack = [];
        this.enabled = false;
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

    /**
     * Enable detailed profiling
     */
    enableProfiling(): void {
        this.enabled = true;
    }

    /**
     * Disable detailed profiling and clear measurements
     */
    disableProfiling(): void {
        this.enabled = false;
        this.measurements.clear();
        this.activeStack = [];
    }

    /**
     * Measure synchronous code execution
     */
    measure<T>(label: string, fn: () => T): T {
        if (!this.enabled) {
            return fn();
        }

        const start = performance.now();
        try {
            return fn();
        } finally {
            const duration = performance.now() - start;
            this.recordMeasurement(label, duration);
        }
    }

    /**
     * Measure async code execution
     */
    async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
        if (!this.enabled) {
            return await fn();
        }

        const start = performance.now();
        try {
            return await fn();
        } finally {
            const duration = performance.now() - start;
            this.recordMeasurement(label, duration);
        }
    }

    /**
     * Start manual timing
     */
    startMeasurement(label: string): void {
        if (!this.enabled) {
            return;
        }

        this.activeStack.push({label, startTime: performance.now()});
    }

    /**
     * End manual timing
     */
    endMeasurement(label: string): void {
        if (!this.enabled) {
            return;
        }

        const entry = this.activeStack.pop();
        if (!entry || entry.label !== label) {
            console.warn(`StatsManager: Mismatched measurement end for "${label}"`);
            return;
        }

        const duration = performance.now() - entry.startTime;
        this.recordMeasurement(label, duration);
    }

    /**
     * Reset detailed measurements (keep BabylonJS instrumentation running)
     */
    resetMeasurements(): void {
        this.measurements.clear();
        this.activeStack = [];
    }

    /**
     * Record a measurement and update statistics
     */
    private recordMeasurement(label: string, duration: number): void {
        if (!this.measurements.has(label)) {
            this.measurements.set(label, {
                label,
                count: 0,
                total: 0,
                min: Infinity,
                max: -Infinity,
                avg: 0,
                lastDuration: 0,
                durations: [],
            });
        }

        const stats = this.measurements.get(label);
        if (!stats) {
            return;
        }

        stats.count++;
        stats.total += duration;
        stats.min = Math.min(stats.min, duration);
        stats.max = Math.max(stats.max, duration);
        stats.avg = stats.total / stats.count;
        stats.lastDuration = duration;

        // Ring buffer for percentiles (keep last 1000 samples)
        if (stats.durations.length >= 1000) {
            stats.durations.shift();
        }

        stats.durations.push(duration);
    }

    /**
     * Calculate percentile from stored durations
     * Uses simple sorting approach (accurate but not streaming)
     */
    private getPercentile(durations: number[], percentile: number): number {
        if (durations.length === 0) {
            return 0;
        }

        // Copy and sort to avoid mutating original array
        const sorted = [... durations].sort((a, b) => a - b);

        // Calculate index (percentile as fraction * length)
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;

        // Clamp to valid range
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }

    /**
     * Get comprehensive performance snapshot
     */
    getSnapshot(): PerformanceSnapshot {
        const cpuMeasurements = Array.from(this.measurements.values()).map((m) => ({
            label: m.label,
            count: m.count,
            total: m.total,
            min: m.min,
            max: m.max,
            avg: m.avg,
            p50: this.getPercentile(m.durations, 50),
            p95: this.getPercentile(m.durations, 95),
            p99: this.getPercentile(m.durations, 99),
            lastDuration: m.lastDuration,
        }));

        return {
            cpu: cpuMeasurements,
            timestamp: performance.now(),
        };
    }

    /**
     * Report detailed performance data to console
     */
    reportDetailed(): void {
        // Don't print anything if profiling is disabled
        if (!this.enabled) {
            return;
        }

        const snapshot = this.getSnapshot();

        // eslint-disable-next-line no-console
        console.group("📊 Performance Report");

        // CPU metrics
        if (snapshot.cpu.length > 0) {
            // eslint-disable-next-line no-console
            console.group("CPU Metrics");
            // eslint-disable-next-line no-console
            console.table(
                snapshot.cpu.map((m) => ({
                    "Label": m.label,
                    "Calls": m.count,
                    "Total (ms)": m.total.toFixed(2),
                    "Avg (ms)": m.avg.toFixed(2),
                    "Min (ms)": m.min === Infinity ? 0 : m.min.toFixed(2),
                    "Max (ms)": m.max === -Infinity ? 0 : m.max.toFixed(2),
                    "P95 (ms)": m.p95.toFixed(2),
                    "P99 (ms)": m.p99.toFixed(2),
                })),
            );

            // Also output as simple logs for console capture utilities (e.g., Storybook)
            // eslint-disable-next-line no-console
            console.log("CPU Metrics:");
            snapshot.cpu.forEach((m) => {
                // eslint-disable-next-line no-console
                console.log(
                    `  ${m.label}: ${m.count} calls, ${m.total.toFixed(2)}ms total, ${m.avg.toFixed(2)}ms avg`,
                );
            });

            // eslint-disable-next-line no-console
            console.groupEnd();
        }

        // GPU metrics
        if (snapshot.gpu) {
            // eslint-disable-next-line no-console
            console.group("GPU Metrics");
            // eslint-disable-next-line no-console
            console.log("Frame Time:", snapshot.gpu.gpuFrameTime.avg.toFixed(2), "ms (avg)");
            // eslint-disable-next-line no-console
            console.log("Shader Compilation:", snapshot.gpu.shaderCompilation.total.toFixed(2), "ms (total)");
            // eslint-disable-next-line no-console
            console.groupEnd();
        }

        // Scene metrics
        if (snapshot.scene) {
            // eslint-disable-next-line no-console
            console.group("Scene Metrics");
            // eslint-disable-next-line no-console
            console.log("Draw Calls:", snapshot.scene.drawCalls.avg.toFixed(0), "(avg)");
            // eslint-disable-next-line no-console
            console.log("Render Time:", snapshot.scene.renderTime.avg.toFixed(2), "ms (avg)");
            // eslint-disable-next-line no-console
            console.log("Frame Time:", snapshot.scene.frameTime.avg.toFixed(2), "ms (avg)");
            // eslint-disable-next-line no-console
            console.log("Active Meshes Evaluation:", snapshot.scene.activeMeshesEvaluation.avg.toFixed(2), "ms (avg)");
            // eslint-disable-next-line no-console
            console.groupEnd();
        }

        // eslint-disable-next-line no-console
        console.groupEnd();
    }
}
