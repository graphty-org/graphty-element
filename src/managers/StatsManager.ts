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
    durationsIndex: number; // Circular buffer index
    durationsFilled: boolean; // Track if buffer is full
}

/**
 * Counter statistics
 */
interface CounterStats {
    label: string;
    value: number;
    operations: number; // Number of increment/decrement/set operations
}

/**
 * Counter snapshot for reporting
 */
export interface CounterSnapshot {
    label: string;
    value: number;
    operations: number;
}

/**
 * Comprehensive performance counter data
 */
interface PerfCounterSnapshot {
    current: number;
    avg: number;
    min: number;
    max: number;
    total: number;
    lastSecAvg: number;
}

/**
 * Draw calls counter data (includes count in addition to timing)
 */
interface DrawCallsSnapshot extends PerfCounterSnapshot {
    count: number;
}

/**
 * Layout session performance metrics
 * Tracks the complete layout session from start to settlement
 */
export interface LayoutSessionMetrics {
    startTime: number;
    endTime: number;
    totalElapsed: number;
    frameCount: number;
    totalCpuTime: number;
    totalGpuTime: number;
    blockingOverhead: number;
    percentages: {
        cpu: number;
        gpu: number;
        blocking: number;
    };
    perFrame: {
        total: number;
        cpu: number;
        gpu: number;
        blocking: number;
    };
}

/**
 * Frame-level profiling data
 * Tracks operations and blocking within a single frame
 */
interface FrameProfile {
    frameNumber: number;
    operations: {label: string, duration: number}[];
    totalCpuTime: number;
    interFrameTime: number;
    blockingTime: number;
    blockingRatio: number;
}

/**
 * Operation blocking correlation statistics
 * Shows which operations correlate with high blocking
 */
export interface OperationBlockingStats {
    label: string;
    totalCpuTime: number;
    appearanceCount: number;
    highBlockingFrames: number;
    highBlockingPercentage: number;
    avgBlockingRatioWhenPresent: number;
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
        gpuFrameTime: PerfCounterSnapshot;
        shaderCompilation: PerfCounterSnapshot;
    };
    scene?: {
        frameTime: PerfCounterSnapshot;
        renderTime: PerfCounterSnapshot;
        interFrameTime: PerfCounterSnapshot;
        cameraRenderTime: PerfCounterSnapshot;
        activeMeshesEvaluation: PerfCounterSnapshot;
        renderTargetsRenderTime: PerfCounterSnapshot;
        drawCalls: DrawCallsSnapshot;
    };
    layoutSession?: LayoutSessionMetrics;
    timestamp: number;
}

/**
 * Manages performance statistics and monitoring
 * Centralizes all performance tracking and reporting
 */
export class StatsManager implements Manager {
    private static readonly RING_BUFFER_SIZE = 1000;

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
    private counters = new Map<string, CounterStats>();

    // Layout session tracking
    private layoutSessionStartTime: number | null = null;
    private layoutSessionEndTime: number | null = null;

    // Frame-level blocking detection
    private frameProfilingEnabled = false;
    private frameProfiles: FrameProfile[] = [];
    private currentFrameOperations: {label: string, duration: number}[] = [];
    private currentFrameNumber = 0;
    private longTaskObserver: PerformanceObserver | null = null;

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
        this.counters.clear();
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
     * Inject mocked instrumentation for testing
     * @internal - Only for testing purposes
     */
    _injectMockInstrumentation(
        engineInstrumentation?: EngineInstrumentation | null,
        sceneInstrumentation?: SceneInstrumentation | null,
    ): void {
        if (engineInstrumentation !== undefined) {
            this.babylonInstrumentation = engineInstrumentation;
        }

        if (sceneInstrumentation !== undefined) {
            this.sceneInstrumentation = sceneInstrumentation;
        }
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
        this.counters.clear();
    }

    /**
     * Enable frame-level blocking detection
     * This tracks operations within each frame and correlates them with inter-frame time
     * to identify which operations cause blocking overhead
     */
    enableFrameProfiling(): void {
        this.frameProfilingEnabled = true;
        this.frameProfiles = [];
        this.currentFrameNumber = 0;

        // Setup Long Task observer to detect >50ms blocking
        if (typeof PerformanceObserver !== "undefined") {
            try {
                this.longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `⚠️ Long Task Detected (>50ms blocking): ${entry.duration.toFixed(2)}ms at ${entry.startTime.toFixed(2)}ms`,
                        );
                    }
                });
                this.longTaskObserver.observe({type: "longtask", buffered: true});
            } catch {
                // Long Task API not supported in this browser
            }
        }
    }

    /**
     * Disable frame-level blocking detection and clear data
     */
    disableFrameProfiling(): void {
        this.frameProfilingEnabled = false;
        this.frameProfiles = [];
        this.currentFrameOperations = [];

        if (this.longTaskObserver) {
            this.longTaskObserver.disconnect();
            this.longTaskObserver = null;
        }
    }

    /**
     * Start profiling a new frame
     * Should be called at the beginning of each frame
     */
    startFrameProfiling(): void {
        if (!this.frameProfilingEnabled) {
            return;
        }

        this.currentFrameNumber++;
        this.currentFrameOperations = [];
    }

    /**
     * End profiling for the current frame
     * Should be called at the end of each frame
     */
    endFrameProfiling(): void {
        if (!this.frameProfilingEnabled || !this.sceneInstrumentation) {
            return;
        }

        const totalCpuTime = this.currentFrameOperations.reduce((sum, op) => sum + op.duration, 0);
        const interFrameTime = this.sceneInstrumentation.interFrameTimeCounter.current;
        const blockingTime = Math.max(0, interFrameTime - totalCpuTime);
        const blockingRatio = totalCpuTime > 0 ? blockingTime / totalCpuTime : 0;

        const profile: FrameProfile = {
            frameNumber: this.currentFrameNumber,
            operations: [... this.currentFrameOperations],
            totalCpuTime,
            interFrameTime,
            blockingTime,
            blockingRatio,
        };

        this.frameProfiles.push(profile);

        // Keep only last 100 frames to avoid memory issues
        if (this.frameProfiles.length > 100) {
            this.frameProfiles.shift();
        }

        // Flag high-blocking frames (blocking > 2x CPU time AND > 20ms frame time)
        if (blockingRatio > 2.0 && interFrameTime > 20) {
            this.reportHighBlockingFrame(profile);
        }
    }

    /**
     * Report a frame with high blocking overhead
     */
    private reportHighBlockingFrame(profile: FrameProfile): void {
        const topOps = [... profile.operations].sort((a, b) => b.duration - a.duration).slice(0, 5);

        // eslint-disable-next-line no-console
        console.log(`⚠️ High Blocking Frame #${profile.frameNumber}:`);
        // eslint-disable-next-line no-console
        console.log(`├─ Total Frame Time: ${profile.interFrameTime.toFixed(2)}ms`);
        // eslint-disable-next-line no-console
        console.log(`├─ CPU Time: ${profile.totalCpuTime.toFixed(2)}ms`);
        // eslint-disable-next-line no-console
        console.log(
            `├─ Blocking Time: ${profile.blockingTime.toFixed(2)}ms (${profile.blockingRatio.toFixed(2)}x CPU time)`,
        );
        // eslint-disable-next-line no-console
        console.log("└─ Top Operations:");
        topOps.forEach((op, i) => {
            // eslint-disable-next-line no-console
            console.log(`   ${i + 1}. ${op.label}: ${op.duration.toFixed(2)}ms`);
        });
    }

    /**
     * Get blocking correlation report
     * Shows which operations appear most often in high-blocking frames
     */
    getBlockingReport(): OperationBlockingStats[] {
        if (this.frameProfiles.length === 0) {
            return [];
        }

        const operationStats = new Map<
            string,
            {
                totalCpuTime: number;
                appearanceCount: number;
                highBlockingFrames: number;
                blockingRatiosWhenPresent: number[];
            }
        >();

        const highBlockingThreshold = 1.0; // Blocking > 1x CPU time

        for (const frame of this.frameProfiles) {
            const isHighBlocking = frame.blockingRatio > highBlockingThreshold;

            const opsInFrame = new Set<string>();
            for (const op of frame.operations) {
                opsInFrame.add(op.label);

                if (!operationStats.has(op.label)) {
                    operationStats.set(op.label, {
                        totalCpuTime: 0,
                        appearanceCount: 0,
                        highBlockingFrames: 0,
                        blockingRatiosWhenPresent: [],
                    });
                }

                const stats = operationStats.get(op.label);
                if (stats) {
                    stats.totalCpuTime += op.duration;
                }
            }

            // Track appearances and blocking for each unique operation in frame
            for (const opLabel of opsInFrame) {
                const stats = operationStats.get(opLabel);
                if (stats) {
                    stats.appearanceCount++;
                    if (isHighBlocking) {
                        stats.highBlockingFrames++;
                    }

                    stats.blockingRatiosWhenPresent.push(frame.blockingRatio);
                }
            }
        }

        return Array.from(operationStats.entries())
            .map(([label, stats]) => ({
                label,
                totalCpuTime: stats.totalCpuTime,
                appearanceCount: stats.appearanceCount,
                highBlockingFrames: stats.highBlockingFrames,
                highBlockingPercentage: (stats.highBlockingFrames / stats.appearanceCount) * 100,
                avgBlockingRatioWhenPresent:
                    stats.blockingRatiosWhenPresent.reduce((a, b) => a + b, 0) /
                    stats.blockingRatiosWhenPresent.length,
            }))
            .sort((a, b) => b.highBlockingPercentage - a.highBlockingPercentage);
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

            // Also track for frame-level blocking detection
            if (this.frameProfilingEnabled) {
                this.currentFrameOperations.push({label, duration});
            }
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

            // Also track for frame-level blocking detection
            if (this.frameProfilingEnabled) {
                this.currentFrameOperations.push({label, duration});
            }
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
        if (entry?.label !== label) {
            console.warn(`StatsManager: Mismatched measurement end for "${label}"`);
            return;
        }

        const duration = performance.now() - entry.startTime;
        this.recordMeasurement(label, duration);

        // Also track for frame-level blocking detection
        if (this.frameProfilingEnabled) {
            this.currentFrameOperations.push({label, duration});
        }
    }

    /**
     * Reset detailed measurements (keep BabylonJS instrumentation running)
     */
    resetMeasurements(): void {
        this.measurements.clear();
        this.activeStack = [];
        this.counters.clear();
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
                durations: new Array(StatsManager.RING_BUFFER_SIZE),
                durationsIndex: 0,
                durationsFilled: false,
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

        // Optimized ring buffer: use circular index instead of shift/push
        stats.durations[stats.durationsIndex] = duration;
        stats.durationsIndex = (stats.durationsIndex + 1) % StatsManager.RING_BUFFER_SIZE;
        if (stats.durationsIndex === 0) {
            stats.durationsFilled = true;
        }
    }

    /**
     * Calculate percentile from stored durations
     * Uses simple sorting approach (accurate but not streaming)
     */
    private getPercentile(durations: number[], percentile: number, filled: boolean, currentIndex: number): number {
        // Only use filled portion of ring buffer
        const validDurations = filled ?
            durations :
            durations.slice(0, currentIndex);

        if (validDurations.length === 0) {
            return 0;
        }

        // Copy and sort to avoid mutating original array
        const sorted = [... validDurations].sort((a, b) => a - b);

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
            p50: this.getPercentile(m.durations, 50, m.durationsFilled, m.durationsIndex),
            p95: this.getPercentile(m.durations, 95, m.durationsFilled, m.durationsIndex),
            p99: this.getPercentile(m.durations, 99, m.durationsFilled, m.durationsIndex),
            lastDuration: m.lastDuration,
        }));

        // Helper to create PerfCounterSnapshot from BabylonJS PerfCounter
        const toPerfCounterSnapshot = (counter: PerfCounter): PerfCounterSnapshot => ({
            current: counter.current,
            avg: counter.average,
            min: counter.min,
            max: counter.max,
            total: counter.total,
            lastSecAvg: counter.lastSecAverage,
        });

        return {
            cpu: cpuMeasurements,

            // GPU metrics (EngineInstrumentation)
            gpu: this.babylonInstrumentation ? {
                // GPU frame time is in nanoseconds, convert to milliseconds
                gpuFrameTime: {
                    current: this.babylonInstrumentation.gpuFrameTimeCounter.current * 0.000001,
                    avg: this.babylonInstrumentation.gpuFrameTimeCounter.average * 0.000001,
                    min: this.babylonInstrumentation.gpuFrameTimeCounter.min * 0.000001,
                    max: this.babylonInstrumentation.gpuFrameTimeCounter.max * 0.000001,
                    total: this.babylonInstrumentation.gpuFrameTimeCounter.total * 0.000001,
                    lastSecAvg: this.babylonInstrumentation.gpuFrameTimeCounter.lastSecAverage * 0.000001,
                },
                // Shader compilation is already in milliseconds
                shaderCompilation: toPerfCounterSnapshot(
                    this.babylonInstrumentation.shaderCompilationTimeCounter,
                ),
            } : undefined,

            // Scene metrics (SceneInstrumentation)
            scene: this.sceneInstrumentation ? {
                frameTime: toPerfCounterSnapshot(this.sceneInstrumentation.frameTimeCounter),
                renderTime: toPerfCounterSnapshot(this.sceneInstrumentation.renderTimeCounter),
                interFrameTime: toPerfCounterSnapshot(this.sceneInstrumentation.interFrameTimeCounter),
                cameraRenderTime: toPerfCounterSnapshot(this.sceneInstrumentation.cameraRenderTimeCounter),
                activeMeshesEvaluation: toPerfCounterSnapshot(this.sceneInstrumentation.activeMeshesEvaluationTimeCounter),
                renderTargetsRenderTime: toPerfCounterSnapshot(this.sceneInstrumentation.renderTargetsRenderTimeCounter),
                // Draw calls includes count property in addition to timing
                drawCalls: {
                    ... toPerfCounterSnapshot(this.sceneInstrumentation.drawCallsCounter),
                    count: this.sceneInstrumentation.drawCallsCounter.count,
                },
            } : undefined,

            // Layout session metrics (if session has completed)
            layoutSession: this.getLayoutSessionMetrics(),

            timestamp: performance.now(),
        };
    }

    /**
     * Start tracking a layout session
     */
    startLayoutSession(): void {
        this.layoutSessionStartTime = performance.now();
        this.layoutSessionEndTime = null;
    }

    /**
     * End tracking a layout session
     */
    endLayoutSession(): void {
        this.layoutSessionEndTime = performance.now();
    }

    /**
     * Calculate layout session metrics
     */
    private getLayoutSessionMetrics(): LayoutSessionMetrics | undefined {
        if (this.layoutSessionStartTime === null || this.layoutSessionEndTime === null) {
            return undefined;
        }

        // Get frame count from Graph.update measurement
        const graphUpdateMeasurement = this.measurements.get("Graph.update");
        const frameCount = graphUpdateMeasurement?.count ?? 0;

        if (frameCount === 0) {
            return undefined;
        }

        // Calculate totals
        const totalElapsed = this.layoutSessionEndTime - this.layoutSessionStartTime;
        const totalCpuTime = graphUpdateMeasurement?.total ?? 0;
        const totalGpuTime = this.sceneInstrumentation?.frameTimeCounter.total ?? 0;
        const blockingOverhead = totalElapsed - totalCpuTime - totalGpuTime;

        // Calculate percentages
        const cpuPercentage = (totalCpuTime / totalElapsed) * 100;
        const gpuPercentage = (totalGpuTime / totalElapsed) * 100;
        const blockingPercentage = (blockingOverhead / totalElapsed) * 100;

        // Calculate per-frame averages
        const totalPerFrame = totalElapsed / frameCount;
        const cpuPerFrame = totalCpuTime / frameCount;
        const gpuPerFrame = totalGpuTime / frameCount;
        const blockingPerFrame = blockingOverhead / frameCount;

        return {
            startTime: this.layoutSessionStartTime,
            endTime: this.layoutSessionEndTime,
            totalElapsed,
            frameCount,
            totalCpuTime,
            totalGpuTime,
            blockingOverhead,
            percentages: {
                cpu: cpuPercentage,
                gpu: gpuPercentage,
                blocking: blockingPercentage,
            },
            perFrame: {
                total: totalPerFrame,
                cpu: cpuPerFrame,
                gpu: gpuPerFrame,
                blocking: blockingPerFrame,
            },
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

        // Event Counters
        const countersSnapshot = this.getCountersSnapshot();
        if (countersSnapshot.length > 0) {
            // eslint-disable-next-line no-console
            console.group("Event Counters");
            // eslint-disable-next-line no-console
            console.table(
                countersSnapshot.map((c) => ({
                    Label: c.label,
                    Value: c.value,
                    Operations: c.operations,
                })),
            );
            // eslint-disable-next-line no-console
            console.groupEnd();
        }

        // GPU metrics (VERBOSE - all properties)
        if (snapshot.gpu) {
            // eslint-disable-next-line no-console
            console.log("GPU Metrics (BabylonJS EngineInstrumentation):");
            // eslint-disable-next-line no-console
            console.group("GPU Metrics (BabylonJS EngineInstrumentation)");

            // eslint-disable-next-line no-console
            console.log("  GPU Frame Time (ms):");
            // eslint-disable-next-line no-console
            console.group("GPU Frame Time (ms)");
            // eslint-disable-next-line no-console
            console.log("  Current:", snapshot.gpu.gpuFrameTime.current.toFixed(3));
            // eslint-disable-next-line no-console
            console.log("  Average:", snapshot.gpu.gpuFrameTime.avg.toFixed(3));
            // eslint-disable-next-line no-console
            console.log("  Last Sec Avg:", snapshot.gpu.gpuFrameTime.lastSecAvg.toFixed(3));
            // eslint-disable-next-line no-console
            console.log("  Min:", snapshot.gpu.gpuFrameTime.min.toFixed(3));
            // eslint-disable-next-line no-console
            console.log("  Max:", snapshot.gpu.gpuFrameTime.max.toFixed(3));
            // eslint-disable-next-line no-console
            console.log("  Total:", snapshot.gpu.gpuFrameTime.total.toFixed(3));
            // eslint-disable-next-line no-console
            console.groupEnd();

            // eslint-disable-next-line no-console
            console.log("  Shader Compilation (ms):");
            // eslint-disable-next-line no-console
            console.group("Shader Compilation (ms)");
            // eslint-disable-next-line no-console
            console.log("  Current:", snapshot.gpu.shaderCompilation.current.toFixed(2));
            // eslint-disable-next-line no-console
            console.log("  Average:", snapshot.gpu.shaderCompilation.avg.toFixed(2));
            // eslint-disable-next-line no-console
            console.log("  Last Sec Avg:", snapshot.gpu.shaderCompilation.lastSecAvg.toFixed(2));
            // eslint-disable-next-line no-console
            console.log("  Min:", snapshot.gpu.shaderCompilation.min.toFixed(2));
            // eslint-disable-next-line no-console
            console.log("  Max:", snapshot.gpu.shaderCompilation.max.toFixed(2));
            // eslint-disable-next-line no-console
            console.log("  Total:", snapshot.gpu.shaderCompilation.total.toFixed(2));
            // eslint-disable-next-line no-console
            console.groupEnd();

            // eslint-disable-next-line no-console
            console.groupEnd();
        }

        // Scene metrics (VERBOSE - all properties for all 7 counters)
        if (snapshot.scene) {
            // eslint-disable-next-line no-console
            console.log("Scene Metrics (BabylonJS SceneInstrumentation):");
            // eslint-disable-next-line no-console
            console.group("Scene Metrics (BabylonJS SceneInstrumentation)");

            // Helper to print counter stats
            const printCounterStats = (name: string, counter: PerfCounterSnapshot, unit = "ms"): void => {
                // eslint-disable-next-line no-console
                console.log(`  ${name}:`);
                // eslint-disable-next-line no-console
                console.group(name);
                // eslint-disable-next-line no-console
                console.log(`  Current: ${counter.current.toFixed(2)} ${unit}`);
                // eslint-disable-next-line no-console
                console.log(`  Average: ${counter.avg.toFixed(2)} ${unit}`);
                // eslint-disable-next-line no-console
                console.log(`  Last Sec Avg: ${counter.lastSecAvg.toFixed(2)} ${unit}`);
                // eslint-disable-next-line no-console
                console.log(`  Min: ${counter.min.toFixed(2)} ${unit}`);
                // eslint-disable-next-line no-console
                console.log(`  Max: ${counter.max.toFixed(2)} ${unit}`);
                // eslint-disable-next-line no-console
                console.log(`  Total: ${counter.total.toFixed(2)} ${unit}`);
                // eslint-disable-next-line no-console
                console.groupEnd();
            };

            printCounterStats("Frame Time", snapshot.scene.frameTime);
            printCounterStats("Render Time", snapshot.scene.renderTime);
            printCounterStats("Inter-Frame Time", snapshot.scene.interFrameTime);
            printCounterStats("Camera Render Time", snapshot.scene.cameraRenderTime);
            printCounterStats("Active Meshes Evaluation", snapshot.scene.activeMeshesEvaluation);
            printCounterStats("Render Targets Render Time", snapshot.scene.renderTargetsRenderTime);

            // Draw Calls is special - count metric + timing
            // eslint-disable-next-line no-console
            console.log("  Draw Calls:");
            // eslint-disable-next-line no-console
            console.group("Draw Calls");
            // eslint-disable-next-line no-console
            console.log(`  Count: ${snapshot.scene.drawCalls.count}`);
            // eslint-disable-next-line no-console
            console.log(`  Current: ${snapshot.scene.drawCalls.current.toFixed(0)}`);
            // eslint-disable-next-line no-console
            console.log(`  Average: ${snapshot.scene.drawCalls.avg.toFixed(2)}`);
            // eslint-disable-next-line no-console
            console.log(`  Last Sec Avg: ${snapshot.scene.drawCalls.lastSecAvg.toFixed(2)}`);
            // eslint-disable-next-line no-console
            console.log(`  Min: ${snapshot.scene.drawCalls.min.toFixed(0)}`);
            // eslint-disable-next-line no-console
            console.log(`  Max: ${snapshot.scene.drawCalls.max.toFixed(0)}`);
            // eslint-disable-next-line no-console
            console.log(`  Total: ${snapshot.scene.drawCalls.total.toFixed(0)}`);
            // eslint-disable-next-line no-console
            console.groupEnd();

            // eslint-disable-next-line no-console
            console.groupEnd();
        }

        // Layout session summary (if available)
        if (snapshot.layoutSession) {
            const ls = snapshot.layoutSession;
            // eslint-disable-next-line no-console
            console.log("Layout Session Performance:");
            // eslint-disable-next-line no-console
            console.group("Layout Session Performance");

            // eslint-disable-next-line no-console
            console.log(`Total Time: ${ls.totalElapsed.toFixed(2)}ms (${ls.frameCount} frames)`);
            // eslint-disable-next-line no-console
            console.log(`├─ CPU Work: ${ls.totalCpuTime.toFixed(2)}ms (${ls.percentages.cpu.toFixed(1)}%)`);
            // eslint-disable-next-line no-console
            console.log(`├─ GPU Rendering: ${ls.totalGpuTime.toFixed(2)}ms (${ls.percentages.gpu.toFixed(1)}%)`);
            // eslint-disable-next-line no-console
            console.log(`└─ Blocking/Overhead: ${ls.blockingOverhead.toFixed(2)}ms (${ls.percentages.blocking.toFixed(1)}%)`);
            // eslint-disable-next-line no-console
            console.log("");
            // eslint-disable-next-line no-console
            console.log("Per-Frame Averages:");
            // eslint-disable-next-line no-console
            console.log(`├─ Total: ${ls.perFrame.total.toFixed(2)}ms/frame`);
            // eslint-disable-next-line no-console
            console.log(`├─ CPU: ${ls.perFrame.cpu.toFixed(2)}ms/frame`);
            // eslint-disable-next-line no-console
            console.log(`├─ GPU: ${ls.perFrame.gpu.toFixed(2)}ms/frame`);
            // eslint-disable-next-line no-console
            console.log(`└─ Blocking: ${ls.perFrame.blocking.toFixed(2)}ms/frame`);

            // eslint-disable-next-line no-console
            console.groupEnd();
        }

        // Blocking correlation report (if frame profiling is enabled)
        if (this.frameProfilingEnabled && this.frameProfiles.length > 0) {
            const blockingReport = this.getBlockingReport();

            if (blockingReport.length > 0) {
                // eslint-disable-next-line no-console
                console.log("");
                // eslint-disable-next-line no-console
                console.log("🔍 Blocking Correlation Analysis:");
                // eslint-disable-next-line no-console
                console.group("Blocking Correlation Analysis");

                // eslint-disable-next-line no-console
                console.log(`Analyzed ${this.frameProfiles.length} frames`);
                // eslint-disable-next-line no-console
                console.log("High-blocking threshold: blocking > 1.0x CPU time");
                // eslint-disable-next-line no-console
                console.log("");

                // Show top 10 operations by high-blocking percentage
                const topBlockingOps = blockingReport.slice(0, 10);

                // eslint-disable-next-line no-console
                console.log("Top operations correlated with blocking:");
                // eslint-disable-next-line no-console
                console.table(
                    topBlockingOps.map((op) => ({
                        "Operation": op.label,
                        "Total CPU (ms)": op.totalCpuTime.toFixed(2),
                        "Appearances": op.appearanceCount,
                        "High-Blocking Frames": op.highBlockingFrames,
                        "High-Blocking %": `${op.highBlockingPercentage.toFixed(1)}%`,
                        "Avg Blocking Ratio": Number.isNaN(op.avgBlockingRatioWhenPresent) ?
                            "N/A" :
                            `${op.avgBlockingRatioWhenPresent.toFixed(2)}x`,
                    })),
                );

                // Also output as simple logs
                // eslint-disable-next-line no-console
                console.log("Top operations correlated with blocking:");
                topBlockingOps.forEach((op, i) => {
                    // eslint-disable-next-line no-console
                    console.log(
                        `  ${i + 1}. ${op.label}: ${op.highBlockingPercentage.toFixed(1)}% high-blocking frames (${op.highBlockingFrames}/${op.appearanceCount})`,
                    );
                    const ratioStr = Number.isNaN(op.avgBlockingRatioWhenPresent) ?
                        "N/A" :
                        `${op.avgBlockingRatioWhenPresent.toFixed(2)}x`;
                    // eslint-disable-next-line no-console
                    console.log(`     Avg blocking ratio: ${ratioStr}`);
                });

                // eslint-disable-next-line no-console
                console.groupEnd();
            }
        }

        // eslint-disable-next-line no-console
        console.groupEnd();
    }

    /**
     * Increment a counter by a specified amount
     * @param label Counter identifier
     * @param amount Amount to increment (default: 1)
     */
    incrementCounter(label: string, amount = 1): void {
        if (!this.enabled) {
            return;
        }

        let counter = this.counters.get(label);
        if (!counter) {
            counter = {
                label,
                value: 0,
                operations: 0,
            };
            this.counters.set(label, counter);
        }

        counter.value += amount;
        counter.operations++;
    }

    /**
     * Decrement a counter by a specified amount
     * @param label Counter identifier
     * @param amount Amount to decrement (default: 1)
     */
    decrementCounter(label: string, amount = 1): void {
        if (!this.enabled) {
            return;
        }

        let counter = this.counters.get(label);
        if (!counter) {
            counter = {
                label,
                value: 0,
                operations: 0,
            };
            this.counters.set(label, counter);
        }

        counter.value -= amount;
        counter.operations++;
    }

    /**
     * Set a counter to a specific value
     * @param label Counter identifier
     * @param value Value to set
     */
    setCounter(label: string, value: number): void {
        if (!this.enabled) {
            return;
        }

        let counter = this.counters.get(label);
        if (!counter) {
            counter = {
                label,
                value: 0,
                operations: 0,
            };
            this.counters.set(label, counter);
        }

        counter.value = value;
        counter.operations++;
    }

    /**
     * Get current value of a counter
     * @param label Counter identifier
     * @returns Current counter value (0 if not found)
     */
    getCounter(label: string): number {
        if (!this.enabled) {
            return 0;
        }

        const counter = this.counters.get(label);
        return counter?.value ?? 0;
    }

    /**
     * Reset a specific counter to 0
     * @param label Counter identifier
     */
    resetCounter(label: string): void {
        if (!this.enabled) {
            return;
        }

        const counter = this.counters.get(label);
        if (counter) {
            counter.value = 0;
            // Don't reset operations count - this is still an operation
            counter.operations++;
        }
    }

    /**
     * Reset all counters to 0
     */
    resetAllCounters(): void {
        if (!this.enabled) {
            return;
        }

        for (const counter of this.counters.values()) {
            counter.value = 0;
            counter.operations++;
        }
    }

    /**
     * Get snapshot of all counters
     */
    getCountersSnapshot(): CounterSnapshot[] {
        return Array.from(this.counters.values()).map((c) => ({
            label: c.label,
            value: c.value,
            operations: c.operations,
        }));
    }
}
