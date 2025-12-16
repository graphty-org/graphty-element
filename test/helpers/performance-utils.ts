/**
 * Performance Test Utilities
 *
 * Utility functions for measuring edge performance using StatsManager.
 * This integrates with the existing instrumentation infrastructure.
 */

import type {Graph} from "../../src/Graph";
import type {
    OperationBlockingStats,
    PerformanceSnapshot,
} from "../../src/managers/StatsManager";

/**
 * Extended performance metrics using StatsManager data
 */
export interface PerformanceMetrics {
    // Test configuration
    edgeCount: number;
    layoutType: string;
    lineStyle: string;
    arrowType: string;

    // CPU timing metrics (from StatsManager.getSnapshot().cpu)
    edgeCreationTime: number;
    edgeUpdateTime: number;
    arrowCapUpdateTime: number;
    intersectCalcTime: number;
    graphStepTime: number;

    // Percentiles (from StatsManager)
    edgeUpdateP95: number;
    edgeUpdateP99: number;

    // Scene metrics (from BabylonJS SceneInstrumentation)
    frameTimeAvg: number;
    frameTimeP95: number;
    renderTimeAvg: number;
    interFrameTimeAvg: number;
    drawCallsCount: number;
    activeMeshesEvalTime: number;

    // GPU metrics (from BabylonJS EngineInstrumentation)
    gpuFrameTimeAvg: number;
    shaderCompilationTime: number;

    // Layout session metrics (from StatsManager.getLayoutSessionMetrics())
    layoutTotalTime: number;
    layoutCpuPercent: number;
    layoutGpuPercent: number;
    layoutBlockingPercent: number;
    layoutFrameCount: number;

    // Derived metrics
    fps: number;
    edgesPerSecond: number;

    // Memory metrics
    heapUsedBefore: number;
    heapUsedAfter: number;
    memoryDelta: number;

    // Bottleneck identification (from StatsManager.getBlockingReport())
    topBlockingOperations: OperationBlockingStats[];
}

/**
 * Bottleneck item from analysis
 */
export interface BottleneckItem {
    type: string;
    severity: "low" | "medium" | "high";
    component: string;
    message: string;
    suggestion: string;
}

/**
 * Bottleneck report from analysis
 */
export interface BottleneckReport {
    bottlenecks: BottleneckItem[];
    overallHealth: "good" | "fair" | "poor";
    summary: string;
}

/**
 * Options for performance measurement
 */
export interface MeasurementOptions {
    edgeCount: number;
    layoutType: string;
    lineStyle: string;
    arrowType: string;
    arrowTailType?: string;
}

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
    EDGE_COUNTS: [10, 100, 1000, 10000],

    LAYOUT_TYPES: [
        {name: "fixed", type: "fixed", isPhysics: false},
        {name: "ngraph", type: "ngraph", isPhysics: true},
    ],

    LINE_STYLES: [
        {name: "solid", type: "solid", pattern: null},
        {name: "dot", type: "dot", pattern: "circle"},
        {name: "dash", type: "dash", pattern: "rectangle"},
        {name: "diamond", type: "diamond", pattern: "diamond"},
        {name: "sinewave", type: "sinewave", pattern: "wave"},
        {name: "zigzag", type: "zigzag", pattern: "zigzag"},
    ],

    ARROW_TYPES: [
        {name: "none", type: "none", renderer: null},
        {name: "normal", type: "normal", renderer: "FilledArrowRenderer"},
        {name: "sphere-dot", type: "sphere-dot", renderer: "FilledArrowRenderer"},
        {name: "diamond", type: "diamond", renderer: "FilledArrowRenderer"},
        {name: "box", type: "box", renderer: "FilledArrowRenderer"},
        {name: "dot", type: "dot", renderer: "FilledArrowRenderer"},
        {name: "tee", type: "tee", renderer: "CustomLineRenderer"},
        {name: "open-normal", type: "open-normal", renderer: "CustomLineRenderer"},
        {name: "crow", type: "crow", renderer: "CustomLineRenderer"},
    ],

    // Test settings
    WARMUP_FRAMES: 10,
    MEASURE_FRAMES: 100,
    PHYSICS_SETTLE_TIMEOUT_MS: 5000,
};

/**
 * Extract structured metrics from StatsManager snapshot
 */
export function extractMetricsFromSnapshot(
    snapshot: PerformanceSnapshot,
    blockingReport: OperationBlockingStats[],
    config: {edgeCount: number, layoutType: string, lineStyle: string, arrowType: string},
    memory: {heapUsedBefore: number, heapUsedAfter: number, memoryDelta: number},
): PerformanceMetrics {
    // Helper to find CPU measurement by label
    type CpuMeasurement = PerformanceSnapshot["cpu"][number];
    const findCpu = (label: string): CpuMeasurement | undefined =>
        snapshot.cpu.find((m) => m.label === label);

    // Extract CPU metrics
    const edgeUpdate = findCpu("Edge.update");
    const edgeCreation = findCpu("Edge.constructor");
    const arrowCapUpdate = findCpu("ArrowCap.update");
    const intersectCalc = findCpu("Ray.intersect");
    const graphStep = findCpu("Graph.step");

    // Calculate FPS from scene metrics
    const fps = snapshot.scene?.frameTime.avg ? 1000 / snapshot.scene.frameTime.avg : 0;

    // Get layout session safely
    const {layoutSession} = snapshot;

    return {
        // Config
        edgeCount: config.edgeCount,
        layoutType: config.layoutType,
        lineStyle: config.lineStyle,
        arrowType: config.arrowType,

        // CPU metrics
        edgeCreationTime: edgeCreation?.total ?? 0,
        edgeUpdateTime: edgeUpdate?.total ?? 0,
        arrowCapUpdateTime: arrowCapUpdate?.total ?? 0,
        intersectCalcTime: intersectCalc?.total ?? 0,
        graphStepTime: graphStep?.total ?? 0,

        // Percentiles
        edgeUpdateP95: edgeUpdate?.p95 ?? 0,
        edgeUpdateP99: edgeUpdate?.p99 ?? 0,

        // Scene metrics
        frameTimeAvg: snapshot.scene?.frameTime.avg ?? 0,
        frameTimeP95: 0, // Would need to track in StatsManager
        renderTimeAvg: snapshot.scene?.renderTime.avg ?? 0,
        interFrameTimeAvg: snapshot.scene?.interFrameTime.avg ?? 0,
        drawCallsCount: snapshot.scene?.drawCalls.count ?? 0,
        activeMeshesEvalTime: snapshot.scene?.activeMeshesEvaluation.total ?? 0,

        // GPU metrics
        gpuFrameTimeAvg: snapshot.gpu?.gpuFrameTime.avg ?? 0,
        shaderCompilationTime: snapshot.gpu?.shaderCompilation.total ?? 0,

        // Layout session
        layoutTotalTime: layoutSession?.totalElapsed ?? 0,
        layoutCpuPercent: layoutSession?.percentages.cpu ?? 0,
        layoutGpuPercent: layoutSession?.percentages.gpu ?? 0,
        layoutBlockingPercent: layoutSession?.percentages.blocking ?? 0,
        layoutFrameCount: layoutSession?.frameCount ?? 0,

        // Derived
        fps,
        edgesPerSecond:
            (edgeCreation?.total ?? 0) > 0 ?
                config.edgeCount / ((edgeCreation?.total ?? 1) / 1000) :
                0,

        // Memory
        ... memory,

        // Bottleneck identification - top 5 blocking operations
        topBlockingOperations: blockingReport.slice(0, 5),
    };
}

/**
 * Identifies performance bottlenecks from metrics
 * Returns actionable recommendations
 */
export function identifyBottlenecks(metrics: PerformanceMetrics): BottleneckReport {
    const bottlenecks: BottleneckItem[] = [];

    // Check for CPU-bound issues
    if (metrics.layoutCpuPercent > 80) {
        bottlenecks.push({
            type: "cpu-bound",
            severity: "high",
            component: "layout",
            message: `Layout is CPU-bound (${metrics.layoutCpuPercent.toFixed(1)}% CPU)`,
            suggestion: "Consider using fixed layout or reducing preSteps",
        });
    }

    // Check for blocking issues
    if (metrics.layoutBlockingPercent > 30) {
        bottlenecks.push({
            type: "blocking",
            severity: "medium",
            component: "main-thread",
            message: `High blocking overhead (${metrics.layoutBlockingPercent.toFixed(1)}%)`,
            suggestion: "Profile with DevTools to identify blocking operations",
        });
    }

    // Check edge update performance
    if (metrics.edgeUpdateP99 > 5) {
        bottlenecks.push({
            type: "edge-update",
            severity: "medium",
            component: "Edge.update",
            message: `P99 edge update time is ${metrics.edgeUpdateP99.toFixed(2)}ms`,
            suggestion: "Check ray intersection or arrow positioning code",
        });
    }

    // Check for GPU issues
    if (metrics.gpuFrameTimeAvg > 16) {
        bottlenecks.push({
            type: "gpu-bound",
            severity: "high",
            component: "gpu",
            message: `GPU frame time is ${metrics.gpuFrameTimeAvg.toFixed(2)}ms (>16ms)`,
            suggestion: "Reduce draw calls or mesh complexity",
        });
    }

    // Check draw calls (rule of thumb: <1000 for good perf)
    if (metrics.drawCallsCount > 500) {
        bottlenecks.push({
            type: "draw-calls",
            severity: metrics.drawCallsCount > 1000 ? "high" : "low",
            component: "rendering",
            message: `${metrics.drawCallsCount} draw calls`,
            suggestion: "Enable mesh instancing or reduce unique materials",
        });
    }

    // Check shader compilation
    if (metrics.shaderCompilationTime > 100) {
        bottlenecks.push({
            type: "shader-compilation",
            severity: "medium",
            component: "shaders",
            message: `${metrics.shaderCompilationTime.toFixed(0)}ms shader compilation`,
            suggestion: "Pre-compile shaders or reduce shader variants",
        });
    }

    // Include operations identified by blocking correlation
    for (const op of metrics.topBlockingOperations) {
        if (op.highBlockingPercentage > 50) {
            bottlenecks.push({
                type: "blocking-correlation",
                severity: "high",
                component: op.label,
                message: `${op.label} appears in ${op.highBlockingPercentage.toFixed(0)}% of high-blocking frames`,
                suggestion: `Optimize ${op.label} - avg blocking ratio: ${op.avgBlockingRatioWhenPresent.toFixed(1)}x`,
            });
        }
    }

    // Determine overall health based on bottleneck severity
    let overallHealth: BottleneckReport["overallHealth"] = "good";
    if (bottlenecks.filter((b) => b.severity === "high").length > 0) {
        overallHealth = "poor";
    } else if (bottlenecks.filter((b) => b.severity === "medium").length > 0) {
        overallHealth = "fair";
    }

    return {
        bottlenecks,
        overallHealth,
        summary: generateSummary(metrics, bottlenecks),
    };
}

/**
 * Generate human-readable summary
 */
function generateSummary(metrics: PerformanceMetrics, bottlenecks: BottleneckItem[]): string {
    const lines = [
        `${metrics.edgeCount} edges @ ${metrics.fps.toFixed(1)} FPS`,
        `Layout: ${metrics.layoutType} (${metrics.lineStyle} line, ${metrics.arrowType} arrow)`,
        `Time breakdown: CPU ${metrics.layoutCpuPercent.toFixed(0)}%, GPU ${metrics.layoutGpuPercent.toFixed(0)}%, Blocking ${metrics.layoutBlockingPercent.toFixed(0)}%`,
        `Draw calls: ${metrics.drawCallsCount}`,
    ];

    if (bottlenecks.length > 0) {
        lines.push(`\nBottlenecks found: ${bottlenecks.length}`);
        for (const b of bottlenecks.filter((b) => b.severity === "high")) {
            lines.push(`  ⚠️ ${b.message}`);
        }
    }

    return lines.join("\n");
}

/**
 * Generate random node positions in a grid or scattered pattern
 */
export function generateNodes(
    count: number,
    useGrid: boolean,
): {id: string, x?: number, y?: number, z?: number}[] {
    const nodes: {id: string, x?: number, y?: number, z?: number}[] = [];

    if (useGrid) {
        // Grid layout for fixed positions
        const gridSize = Math.ceil(Math.sqrt(count));
        const spacing = 10;

        for (let i = 0; i < count; i++) {
            const x = ((i % gridSize) * spacing) - ((gridSize * spacing) / 2);
            const y = (Math.floor(i / gridSize) * spacing) - ((gridSize * spacing) / 2);
            nodes.push({id: `node-${i}`, x, y, z: 0});
        }
    } else {
        // Random positions for physics layouts (let engine position them)
        for (let i = 0; i < count; i++) {
            nodes.push({id: `node-${i}`});
        }
    }

    return nodes;
}

/**
 * Generate random edges between nodes
 */
export function generateEdges(
    nodes: {id: string}[],
    edgeCount: number,
): {source: string, target: string}[] {
    const edges: {source: string, target: string}[] = [];
    const nodeCount = nodes.length;

    // Create a connected graph first (spanning tree)
    for (let i = 1; i < nodeCount && edges.length < edgeCount; i++) {
        const sourceIndex = Math.floor(Math.random() * i);
        edges.push({
            source: nodes[sourceIndex].id,
            target: nodes[i].id,
        });
    }

    // Add random edges until we reach the target count
    while (edges.length < edgeCount && nodeCount > 1) {
        const sourceIndex = Math.floor(Math.random() * nodeCount);
        let targetIndex = Math.floor(Math.random() * nodeCount);

        // Avoid self-loops
        if (sourceIndex === targetIndex) {
            targetIndex = (targetIndex + 1) % nodeCount;
        }

        edges.push({
            source: nodes[sourceIndex].id,
            target: nodes[targetIndex].id,
        });
    }

    return edges;
}

/**
 * Type for accessing private layoutManager in tests
 */
interface GraphWithLayout extends Omit<Graph, "layoutManager"> {
    layoutManager?: {isSettled: boolean};
}

/**
 * Waits for physics layout to settle
 */
export async function waitForLayoutSettle(graph: Graph, timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const checkSettle = (): void => {
            // Check if graph is settled via layoutManager
            const graphWithLayout = graph as unknown as GraphWithLayout;
            const isSettled = graphWithLayout.layoutManager?.isSettled ?? false;

            if (isSettled || Date.now() - startTime > timeoutMs) {
                resolve();
            } else {
                setTimeout(checkSettle, 16);
            }
        };

        checkSettle();
    });
}

/**
 * Baseline performance expectations
 */
export const BASELINES: Record<string, {fps: number, creationTime: number}> = {
    "100_edges_fixed_solid_none": {fps: 60, creationTime: 100},
    "1000_edges_fixed_solid_none": {fps: 45, creationTime: 500},
    "1000_edges_fixed_solid_normal": {fps: 35, creationTime: 700},
    "1000_edges_ngraph_solid_none": {fps: 20, creationTime: 800},
    "1000_edges_fixed_diamond_normal": {fps: 25, creationTime: 800},
};

/**
 * Get memory usage in browser environment
 * Returns 0 if memory API is not available
 */
export function getHeapUsed(): number {
    // Browser environment - performance.memory is non-standard (Chrome only)
    const perf = performance as Performance & {
        memory?: {usedJSHeapSize: number};
    };
    return perf.memory?.usedJSHeapSize ?? 0;
}
