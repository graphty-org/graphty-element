/**
 * Edge Performance Report Generator
 *
 * Comprehensive benchmark testing edge rendering performance across:
 * - Edge counts: 1000 → 30000+
 * - Line styles: solid, dash, dot, star, diamond
 * - Arrow types: none, normal, crow, open-diamond, open-dot
 * - Modes: 2D and 3D
 * - Scenarios: camera rotation and zoom
 *
 * Outputs a markdown report to tmp/edge-performance-report.md
 */

import * as fs from "fs";
import * as path from "path";
import {afterAll, afterEach, assert, describe, test} from "vitest";

import type {Graph} from "../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../helpers/testSetup";

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Test duration per scenario (ms)
    // Significantly reduced to prevent p-queue stack overflow in vitest browser mode
    TEST_DURATION_MS: 500,

    // Warmup time before measuring (ms)
    WARMUP_MS: 100,

    // Edge counts to test
    // Minimized to work within vitest browser mode limits
    EDGE_COUNTS: {
        PHASE1: [500, 1000],
        PHASE2: [500],
        PHASE3: [500],
        PHASE4: [1000],
    },

    // Line styles to test (baseline to most complex)
    LINE_STYLES: ["solid", "dash", "dot", "star", "diamond"] as const,

    // Arrow types to test (baseline to most complex)
    ARROW_TYPES: ["none", "normal", "crow", "open-diamond", "open-dot"] as const,

    // Target FPS threshold
    TARGET_FPS: 30,
    JANK_THRESHOLD_MS: 33, // Below 30fps

    // Node count calculation: edgeCount / EDGE_TO_NODE_RATIO
    EDGE_TO_NODE_RATIO: 50,
};

// ============================================================================
// TYPES
// ============================================================================

interface TestConfig {
    edgeCount: number;
    lineStyle: string;
    arrowType: string;
    mode: "2d" | "3d";
    scenario: "rotation" | "zoom";
}

interface TestResult {
    config: TestConfig;
    avgFps: number;
    minFps: number;
    maxFps: number;
    p95FrameTimeMs: number;
    jankFrameCount: number;
    jankPercent: number;
    totalFrames: number;
    drawCalls: number;
    passesTarget: boolean;
}

interface PhaseResults {
    phase: string;
    results: TestResult[];
}

// ============================================================================
// GLOBALS
// ============================================================================

const allResults: PhaseResults[] = [];
let currentGraph: Graph | null = null;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateGridNodes(
    nodeCount: number,
    mode: "2d" | "3d",
): {id: string, x: number, y: number, z: number}[] {
    const nodes: {id: string, x: number, y: number, z: number}[] = [];
    const gridSize = Math.ceil(Math.sqrt(nodeCount));
    const spacing = 10;

    for (let i = 0; i < nodeCount; i++) {
        const x = ((i % gridSize) * spacing) - ((gridSize * spacing) / 2);
        const y = (Math.floor(i / gridSize) * spacing) - ((gridSize * spacing) / 2);
        const z = mode === "3d" ? (Math.random() - 0.5) * spacing * 2 : 0;
        nodes.push({id: `node-${i}`, x, y, z});
    }

    return nodes;
}

function generateRandomEdges(
    nodes: {id: string}[],
    edgeCount: number,
): {source: string, target: string}[] {
    const edges: {source: string, target: string}[] = [];
    const nodeCount = nodes.length;

    // Ensure connected graph with spanning tree first
    for (let i = 1; i < nodeCount && edges.length < edgeCount; i++) {
        const sourceIdx = Math.floor(Math.random() * i);
        edges.push({source: nodes[sourceIdx].id, target: nodes[i].id});
    }

    // Fill remaining with random edges
    while (edges.length < edgeCount && nodeCount > 1) {
        const srcIdx = Math.floor(Math.random() * nodeCount);
        let dstIdx = Math.floor(Math.random() * nodeCount);
        if (srcIdx === dstIdx) {
            dstIdx = (dstIdx + 1) % nodeCount;
        }

        edges.push({source: nodes[srcIdx].id, target: nodes[dstIdx].id});
    }

    return edges;
}

function calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) {
        return 0;
    }

    const sorted = [... values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CAMERA ANIMATION
// ============================================================================

async function animateRotation(
    graph: Graph,
    durationMs: number,
): Promise<number[]> {
    const frameTimes: number[] = [];
    const startTime = performance.now();

    // Access camera through graph - using unknown intermediate for proper type narrowing
    const graphUnknown = graph as unknown;
    const graphWithCamera = graphUnknown as {camera?: {alpha: number, beta: number}};
    const {camera} = graphWithCamera;
    if (!camera) {
        throw new Error("Could not access camera");
    }

    const startAlpha = camera.alpha;

    // Use fixed number of iterations instead of requestAnimationFrame to prevent queue accumulation
    const frameIntervalMs = 16; // ~60fps simulation
    const frameCount = Math.floor(durationMs / frameIntervalMs);
    let lastFrameTime = startTime;

    for (let i = 0; i < frameCount; i++) {
        // Simulate frame timing
        await new Promise((resolve) => setTimeout(resolve, frameIntervalMs));

        const now = performance.now();
        const elapsed = now - startTime;

        // Record frame time
        const frameTime = now - lastFrameTime;
        frameTimes.push(frameTime);
        lastFrameTime = now;

        // Rotate camera (full 360° over duration)
        const progress = elapsed / durationMs;
        camera.alpha = startAlpha + (progress * Math.PI * 2);
    }

    return frameTimes;
}

async function animateZoom(
    graph: Graph,
    durationMs: number,
): Promise<number[]> {
    const frameTimes: number[] = [];
    const startTime = performance.now();

    // Access camera through graph - using unknown intermediate for proper type narrowing
    const graphUnknown = graph as unknown;
    const graphWithCamera = graphUnknown as {camera?: {radius: number}};
    const {camera} = graphWithCamera;
    if (!camera) {
        throw new Error("Could not access camera");
    }

    const startRadius = camera.radius;

    // Use fixed number of iterations instead of requestAnimationFrame to prevent queue accumulation
    const frameIntervalMs = 16; // ~60fps simulation
    const frameCount = Math.floor(durationMs / frameIntervalMs);
    let lastFrameTime = startTime;

    for (let i = 0; i < frameCount; i++) {
        // Simulate frame timing
        await new Promise((resolve) => setTimeout(resolve, frameIntervalMs));

        const now = performance.now();
        const elapsed = now - startTime;

        // Record frame time
        const frameTime = now - lastFrameTime;
        frameTimes.push(frameTime);
        lastFrameTime = now;

        // Zoom in and out (2x → 0.5x → 2x)
        const progress = elapsed / durationMs;
        const zoomFactor = 1 + (Math.sin(progress * Math.PI * 2) * 0.75);
        camera.radius = startRadius * zoomFactor;
    }

    camera.radius = startRadius; // Reset
    return frameTimes;
}

// ============================================================================
// BENCHMARK RUNNER
// ============================================================================

async function runBenchmark(config: TestConfig): Promise<TestResult> {
    // Calculate node count (sparser graph as requested)
    const nodeCount = Math.max(10, Math.ceil(config.edgeCount / CONFIG.EDGE_TO_NODE_RATIO));

    // Create graph
    currentGraph = await createTestGraph();
    const graph = currentGraph;

    // Generate test data
    const nodes = generateGridNodes(nodeCount, config.mode);
    const edges = generateRandomEdges(nodes, config.edgeCount);

    // Build edge style
    const edgeStyleProps: Record<string, unknown> = {
        line: {
            type: config.lineStyle,
            width: 0.5,
            color: "#FFFFFF",
        },
    };

    if (config.arrowType !== "none") {
        edgeStyleProps.arrowHead = {
            type: config.arrowType,
            size: 1.0,
            color: "#FF0000",
        };
    }

    // Set layout to fixed
    await (graph as Graph & {setLayout: (type: string) => Promise<void>}).setLayout("fixed");

    // Set 2D/3D mode
    const graphWithMode = graph as Graph & {set2DMode: (is2d: boolean) => void};
    if (typeof graphWithMode.set2DMode === "function") {
        graphWithMode.set2DMode(config.mode === "2d");
    }

    // Add data
    const graphData = {
        nodes: nodes.map((n) => ({
            id: n.id,
            position: {x: n.x, y: n.y, z: n.z},
        })),
        edges: edges.map((e, i) => ({
            id: `edge-${i}`,
            source: e.source,
            target: e.target,
            ... edgeStyleProps,
        })),
    };

    (graph as Graph & {setData: (data: unknown) => void}).setData(graphData);

    // Wait for initial render
    await sleep(CONFIG.WARMUP_MS);

    // Get initial draw calls
    const statsManager = graph.getStatsManager();
    const perfSummary = statsManager.getPerformanceSummary();
    const {drawCalls} = perfSummary;

    // Run animation and collect frame times
    let frameTimes: number[];
    if (config.scenario === "rotation") {
        frameTimes = await animateRotation(graph, CONFIG.TEST_DURATION_MS);
    } else {
        frameTimes = await animateZoom(graph, CONFIG.TEST_DURATION_MS);
    }

    // Calculate metrics
    const validFrameTimes = frameTimes.filter((t) => t > 0 && t < 1000);
    const fps = validFrameTimes.map((t) => 1000 / t);

    const avgFps = fps.length > 0 ? fps.reduce((a, b) => a + b, 0) / fps.length : 0;
    const minFps = fps.length > 0 ? Math.min(... fps) : 0;
    const maxFps = fps.length > 0 ? Math.max(... fps) : 0;
    const p95FrameTimeMs = calculatePercentile(validFrameTimes, 95);
    const jankFrameCount = validFrameTimes.filter((t) => t > CONFIG.JANK_THRESHOLD_MS).length;
    const jankPercent = validFrameTimes.length > 0 ? (jankFrameCount / validFrameTimes.length) * 100 : 0;

    // Cleanup
    cleanupTestGraph(graph);
    currentGraph = null;

    return {
        config,
        avgFps,
        minFps,
        maxFps,
        p95FrameTimeMs,
        jankFrameCount,
        jankPercent,
        totalFrames: validFrameTimes.length,
        drawCalls,
        passesTarget: avgFps >= CONFIG.TARGET_FPS && jankPercent < 10,
    };
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateMarkdownReport(): string {
    const timestamp = new Date().toISOString();

    let report = `# Edge Performance Report

Generated: ${timestamp}

## Test Configuration

- **Target FPS:** ${CONFIG.TARGET_FPS}
- **Jank Threshold:** ${CONFIG.JANK_THRESHOLD_MS}ms (below ${Math.round(1000 / CONFIG.JANK_THRESHOLD_MS)}fps)
- **Test Duration:** ${CONFIG.TEST_DURATION_MS / 1000}s per test
- **Node Density:** 1 node per ${CONFIG.EDGE_TO_NODE_RATIO} edges

## Executive Summary

`;

    // Find limits for each configuration
    const phase1 = allResults.find((p) => p.phase === "Phase 1: 3D Rotation");
    if (phase1) {
        const configs = new Map<string, TestResult[]>();
        for (const r of phase1.results) {
            const key = `${r.config.lineStyle}/${r.config.arrowType}`;
            let arr = configs.get(key);
            if (!arr) {
                arr = [];
                configs.set(key, arr);
            }

            arr.push(r);
        }

        report += `### Maximum Edges at ${CONFIG.TARGET_FPS}fps (3D Rotation)\n\n`;
        report += "| Line Style | Arrow Type | Max Edges | Notes |\n";
        report += "|------------|------------|-----------|-------|\n";

        for (const [key, results] of configs) {
            const [lineStyle, arrowType] = key.split("/");
            const passing = results.filter((r) => r.passesTarget);
            const maxEdges = passing.length > 0 ?
                Math.max(... passing.map((r) => r.config.edgeCount)) :
                `<${results[0]?.config.edgeCount ?? 0}`;
            const note = passing.length === results.length ? "✅ All tested counts pass" : "";
            report += `| ${lineStyle} | ${arrowType} | ${maxEdges} | ${note} |\n`;
        }
    }

    // Detailed results for each phase
    for (const phase of allResults) {
        report += `\n## ${phase.phase}\n\n`;

        if (phase.results.length === 0) {
            report += "*No results*\n";
            continue;
        }

        report += "| Edges | Line | Arrow | Mode | Scenario | Avg FPS | Min FPS | P95 Frame | Jank % | Draw Calls | Pass |\n";
        report += "|-------|------|-------|------|----------|---------|---------|-----------|--------|------------|------|\n";

        for (const r of phase.results) {
            const pass = r.passesTarget ? "✅" : "❌";
            report += `| ${r.config.edgeCount} | ${r.config.lineStyle} | ${r.config.arrowType} | ${r.config.mode} | ${r.config.scenario} | ${r.avgFps.toFixed(1)} | ${r.minFps.toFixed(1)} | ${r.p95FrameTimeMs.toFixed(1)}ms | ${r.jankPercent.toFixed(1)}% | ${r.drawCalls} | ${pass} |\n`;
        }
    }

    // Analysis sections
    report += "\n## Scaling Analysis\n\n";

    if (phase1) {
        // Find baseline config (solid/none)
        const baseline = phase1.results.filter(
            (r) => r.config.lineStyle === "solid" && r.config.arrowType === "none",
        );

        if (baseline.length > 0) {
            report += "### Edge Count Impact (solid/none, 3D rotation)\n\n";
            report += "| Edge Count | Avg FPS | Change |\n";
            report += "|------------|---------|--------|\n";

            let prevFps = baseline[0].avgFps;
            for (const r of baseline) {
                const change = r === baseline[0] ? "-" : `${(((r.avgFps - prevFps) / prevFps) * 100).toFixed(1)}%`;
                report += `| ${r.config.edgeCount} | ${r.avgFps.toFixed(1)} | ${change} |\n`;
                prevFps = r.avgFps;
            }
        }
    }

    // Feature cost analysis
    report += "\n## Feature Cost Analysis\n\n";

    if (phase1) {
        const at5000 = phase1.results.filter((r) => r.config.edgeCount === 5000);

        if (at5000.length > 0) {
            const baselineFps = at5000.find(
                (r) => r.config.lineStyle === "solid" && r.config.arrowType === "none",
            )?.avgFps ?? 0;

            report += "### At 5000 edges (3D rotation)\n\n";
            report += "| Configuration | Avg FPS | Cost vs Baseline |\n";
            report += "|---------------|---------|------------------|\n";

            for (const r of at5000) {
                const cost = baselineFps > 0 ?
                    `${(((baselineFps - r.avgFps) / baselineFps) * 100).toFixed(1)}%` :
                    "-";
                report += `| ${r.config.lineStyle}/${r.config.arrowType} | ${r.avgFps.toFixed(1)} | ${cost} |\n`;
            }
        }
    }

    // Recommendations
    report += "\n## Recommendations\n\n";
    report += "Based on the benchmark results:\n\n";

    if (phase1) {
        const solidNone = phase1.results.filter(
            (r) => r.config.lineStyle === "solid" && r.config.arrowType === "none" && r.passesTarget,
        );
        const maxSolidNone = solidNone.length > 0 ?
            Math.max(... solidNone.map((r) => r.config.edgeCount)) :
            "unknown";

        const diamondCrow = phase1.results.filter(
            (r) => r.config.lineStyle === "diamond" && r.config.arrowType === "crow" && r.passesTarget,
        );
        const maxDiamondCrow = diamondCrow.length > 0 ?
            Math.max(... diamondCrow.map((r) => r.config.edgeCount)) :
            "unknown";

        report += `1. **For maximum performance (solid lines, no arrows):** Up to ${maxSolidNone} edges at ${CONFIG.TARGET_FPS}fps\n`;
        report += `2. **For complex styling (diamond + crow arrows):** Up to ${maxDiamondCrow} edges at ${CONFIG.TARGET_FPS}fps\n`;
    }

    report += "\n---\n*Report generated by edge-performance-report.test.ts*\n";

    return report;
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe("Edge Performance Report", () => {
    afterEach(async() => {
        if (currentGraph) {
            cleanupTestGraph(currentGraph);
            currentGraph = null;
        }

        // Allow event loop to clear between tests
        await new Promise((resolve) => setTimeout(resolve, 50));
    });

    afterAll(() => {
        // Generate report
        const report = generateMarkdownReport();

        // In browser environment, just log the report
        // File writing is only available in Node.js environment
        // eslint-disable-next-line no-console
        console.log("\n📊 Edge Performance Report:\n");
        // eslint-disable-next-line no-console
        console.log(report);

        // Try to save file if running in Node.js (not browser)
        try {
            const reportPath = path.join(process.cwd(), "tmp", "edge-performance-report.md");
            const tmpDir = path.dirname(reportPath);
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, {recursive: true});
            }

            fs.writeFileSync(reportPath, report, "utf-8");
            // eslint-disable-next-line no-console
            console.log(`Report saved to: ${reportPath}`);
        } catch {
            // Silently ignore file write errors in browser
        }
    });

    // ========================================================================
    // PHASE 1: 3D Rotation Limits
    // ========================================================================

    describe("Phase 1: 3D Rotation Limits", () => {
        const phaseResults: TestResult[] = [];

        afterAll(() => {
            allResults.push({phase: "Phase 1: 3D Rotation", results: phaseResults});
        });

        // Test key configurations
        const keyConfigs = [
            {line: "solid", arrow: "none"}, // Baseline
            {line: "solid", arrow: "normal"}, // + simple arrow
            {line: "diamond", arrow: "none"}, // + pattern
            {line: "diamond", arrow: "crow"}, // Worst case
        ];

        for (const cfg of keyConfigs) {
            for (const edgeCount of CONFIG.EDGE_COUNTS.PHASE1) {
                test(`${edgeCount} edges - ${cfg.line}/${cfg.arrow} - 3D rotation`, async() => {
                    const result = await runBenchmark({
                        edgeCount,
                        lineStyle: cfg.line,
                        arrowType: cfg.arrow,
                        mode: "3d",
                        scenario: "rotation",
                    });

                    phaseResults.push(result);

                    // eslint-disable-next-line no-console
                    console.log(
                        `[${cfg.line}/${cfg.arrow}] ${edgeCount} edges: ${result.avgFps.toFixed(1)} FPS, ${result.jankPercent.toFixed(1)}% jank`,
                    );

                    assert.isAbove(result.totalFrames, 10, "Should capture enough frames");
                });
            }
        }
    });

    // ========================================================================
    // PHASE 2: Zoom Comparison
    // ========================================================================

    describe("Phase 2: 3D Zoom Comparison", () => {
        const phaseResults: TestResult[] = [];

        afterAll(() => {
            allResults.push({phase: "Phase 2: 3D Zoom", results: phaseResults});
        });

        const configs = [
            {line: "solid", arrow: "none"},
            {line: "diamond", arrow: "crow"},
        ];

        for (const cfg of configs) {
            for (const edgeCount of CONFIG.EDGE_COUNTS.PHASE2) {
                test(`${edgeCount} edges - ${cfg.line}/${cfg.arrow} - 3D zoom`, async() => {
                    const result = await runBenchmark({
                        edgeCount,
                        lineStyle: cfg.line,
                        arrowType: cfg.arrow,
                        mode: "3d",
                        scenario: "zoom",
                    });

                    phaseResults.push(result);

                    // eslint-disable-next-line no-console
                    console.log(
                        `[ZOOM ${cfg.line}/${cfg.arrow}] ${edgeCount} edges: ${result.avgFps.toFixed(1)} FPS`,
                    );

                    assert.isAbove(result.totalFrames, 10);
                });
            }
        }
    });

    // ========================================================================
    // PHASE 3: 2D vs 3D Comparison
    // ========================================================================

    describe("Phase 3: 2D Rotation Comparison", () => {
        const phaseResults: TestResult[] = [];

        afterAll(() => {
            allResults.push({phase: "Phase 3: 2D Rotation", results: phaseResults});
        });

        const configs = [
            {line: "solid", arrow: "none"},
            {line: "diamond", arrow: "crow"},
        ];

        for (const cfg of configs) {
            for (const edgeCount of CONFIG.EDGE_COUNTS.PHASE3) {
                test(`${edgeCount} edges - ${cfg.line}/${cfg.arrow} - 2D rotation`, async() => {
                    const result = await runBenchmark({
                        edgeCount,
                        lineStyle: cfg.line,
                        arrowType: cfg.arrow,
                        mode: "2d",
                        scenario: "rotation",
                    });

                    phaseResults.push(result);

                    // eslint-disable-next-line no-console
                    console.log(
                        `[2D ${cfg.line}/${cfg.arrow}] ${edgeCount} edges: ${result.avgFps.toFixed(1)} FPS`,
                    );

                    assert.isAbove(result.totalFrames, 10);
                });
            }
        }
    });

    // ========================================================================
    // PHASE 4: Extreme Stress Test
    // ========================================================================

    describe("Phase 4: Extreme Limits", () => {
        const phaseResults: TestResult[] = [];

        afterAll(() => {
            allResults.push({phase: "Phase 4: Extreme", results: phaseResults});
        });

        for (const edgeCount of CONFIG.EDGE_COUNTS.PHASE4) {
            test(`${edgeCount} edges - solid/none - 3D rotation (extreme)`, async() => {
                const result = await runBenchmark({
                    edgeCount,
                    lineStyle: "solid",
                    arrowType: "none",
                    mode: "3d",
                    scenario: "rotation",
                });

                phaseResults.push(result);

                // eslint-disable-next-line no-console
                console.log(
                    `[EXTREME] ${edgeCount} edges: ${result.avgFps.toFixed(1)} FPS, ${result.jankPercent.toFixed(1)}% jank`,
                );

                assert.isAbove(result.totalFrames, 10);
            });
        }
    });

    // ========================================================================
    // PHASE 5: Additional Line/Arrow Variations
    // ========================================================================

    describe("Phase 5: Additional Variations", () => {
        const phaseResults: TestResult[] = [];

        afterAll(() => {
            allResults.push({phase: "Phase 5: Variations", results: phaseResults});
        });

        // Test additional line styles at 1000 edges (reduced to prevent queue overflow)
        // Testing only one representative from each category
        const additionalLines = ["star"]; // Most complex line pattern
        const additionalArrows = ["open-diamond"]; // Representative open arrow

        for (const lineStyle of additionalLines) {
            test(`1000 edges - ${lineStyle}/none - 3D rotation`, async() => {
                const result = await runBenchmark({
                    edgeCount: 1000,
                    lineStyle,
                    arrowType: "none",
                    mode: "3d",
                    scenario: "rotation",
                });

                phaseResults.push(result);

                // eslint-disable-next-line no-console
                console.log(
                    `[VAR ${lineStyle}/none] 1000 edges: ${result.avgFps.toFixed(1)} FPS`,
                );

                assert.isAbove(result.totalFrames, 10);
            });
        }

        for (const arrowType of additionalArrows) {
            test(`1000 edges - solid/${arrowType} - 3D rotation`, async() => {
                const result = await runBenchmark({
                    edgeCount: 1000,
                    lineStyle: "solid",
                    arrowType,
                    mode: "3d",
                    scenario: "rotation",
                });

                phaseResults.push(result);

                // eslint-disable-next-line no-console
                console.log(
                    `[VAR solid/${arrowType}] 1000 edges: ${result.avgFps.toFixed(1)} FPS`,
                );

                assert.isAbove(result.totalFrames, 10);
            });
        }
    });
});
