import {assert, beforeEach, describe, it, vi} from "vitest";

import type {EventManager} from "../../src/managers/EventManager";
import {StatsManager} from "../../src/managers/StatsManager";

describe("StatsManager", () => {
    let statsManager: StatsManager;
    let mockEventManager: EventManager;

    beforeEach(() => {
        // Create mock EventManager
        mockEventManager = {
            emitGraphEvent: vi.fn(),
        } as unknown as EventManager;

        statsManager = new StatsManager(mockEventManager);
    });

    describe("initialization", () => {
        it("should initialize without errors", async() => {
            await statsManager.init();
            assert.isNotNull(statsManager);
        });

        it("should dispose without errors", () => {
            statsManager.dispose();
            assert.isNotNull(statsManager);
        });
    });

    describe("stats functionality", () => {
        it("should increment totalUpdates on step", () => {
            statsManager.step();
            const stats = statsManager.getStats();
            assert.equal(stats.totalUpdates, 1);
        });

        it("should provide access to nodeUpdate PerfCounter", () => {
            const {nodeUpdate} = statsManager;
            assert.isDefined(nodeUpdate);
            assert.isDefined(nodeUpdate.beginMonitoring);
            assert.isDefined(nodeUpdate.endMonitoring);
        });

        it("should provide access to edgeUpdate PerfCounter", () => {
            const {edgeUpdate} = statsManager;
            assert.isDefined(edgeUpdate);
            assert.isDefined(edgeUpdate.beginMonitoring);
            assert.isDefined(edgeUpdate.endMonitoring);
        });

        it("should provide access to graphStep PerfCounter", () => {
            const {graphStep} = statsManager;
            assert.isDefined(graphStep);
            assert.isDefined(graphStep.beginMonitoring);
            assert.isDefined(graphStep.endMonitoring);
        });

        it("should provide access to arrowCapUpdate PerfCounter", () => {
            const {arrowCapUpdate} = statsManager;
            assert.isDefined(arrowCapUpdate);
            assert.isDefined(arrowCapUpdate.beginMonitoring);
            assert.isDefined(arrowCapUpdate.endMonitoring);
        });

        it("should provide access to intersectCalc PerfCounter", () => {
            const {intersectCalc} = statsManager;
            assert.isDefined(intersectCalc);
            assert.isDefined(intersectCalc.beginMonitoring);
            assert.isDefined(intersectCalc.endMonitoring);
        });

        it("should provide access to loadTime PerfCounter", () => {
            const {loadTime} = statsManager;
            assert.isDefined(loadTime);
            assert.isDefined(loadTime.beginMonitoring);
            assert.isDefined(loadTime.endMonitoring);
        });
    });

    describe("cache statistics", () => {
        it("should update cache stats", () => {
            statsManager.updateCacheStats(100, 20);
            const stats = statsManager.getStats();
            assert.equal(stats.meshCacheHits, 100);
            assert.equal(stats.meshCacheMisses, 20);
        });
    });

    describe("node/edge counts", () => {
        it("should update node and edge counts", () => {
            statsManager.updateCounts(50, 75);
            const stats = statsManager.getStats();
            assert.equal(stats.numNodes, 50);
            assert.equal(stats.numEdges, 75);
        });
    });

    describe("stats reporting", () => {
        it("should return comprehensive stats object", () => {
            statsManager.updateCounts(10, 20);
            statsManager.updateCacheStats(5, 2);
            statsManager.step();

            const stats = statsManager.getStats();

            assert.equal(stats.numNodes, 10);
            assert.equal(stats.numEdges, 20);
            assert.equal(stats.totalUpdates, 1);
            assert.equal(stats.meshCacheHits, 5);
            assert.equal(stats.meshCacheMisses, 2);
            assert.isDefined(stats.nodeUpdateCount);
            assert.isDefined(stats.edgeUpdateCount);
            assert.isDefined(stats.arrowCapUpdateCount);
        });

        it("should emit stats-update event every 60 steps", () => {
            // First 59 steps should not emit
            for (let i = 0; i < 59; i++) {
                statsManager.step();
            }
            assert.equal(vi.mocked(mockEventManager.emitGraphEvent).mock.calls.length, 0);

            // 60th step should emit
            statsManager.step();
            assert.equal(vi.mocked(mockEventManager.emitGraphEvent).mock.calls.length, 1);
            assert.equal(vi.mocked(mockEventManager.emitGraphEvent).mock.calls[0][0], "stats-update");
            assert.equal(vi.mocked(mockEventManager.emitGraphEvent).mock.calls[0][1].totalUpdates, 60);
        });
    });

    describe("reset functionality", () => {
        it("should reset all counters", () => {
            // Set some values
            statsManager.updateCounts(10, 20);
            statsManager.step();
            statsManager.step();

            // Reset
            statsManager.reset();

            const stats = statsManager.getStats();
            assert.equal(stats.totalUpdates, 0);
            // Note: node/edge counts are not reset by reset()
        });
    });

    describe("performance monitoring", () => {
        it("should allow monitoring node updates", () => {
            statsManager.nodeUpdate.beginMonitoring();
            // Simulate some work
            statsManager.nodeUpdate.endMonitoring();

            // PerfCounter should track the call
            assert.equal(statsManager.nodeUpdate.count, 1);
        });

        it("should allow monitoring edge updates", () => {
            statsManager.edgeUpdate.beginMonitoring();
            // Simulate some work
            statsManager.edgeUpdate.endMonitoring();

            // PerfCounter should track the call
            assert.equal(statsManager.edgeUpdate.count, 1);
        });

        it("should allow monitoring graph steps", () => {
            statsManager.graphStep.beginMonitoring();
            // Simulate some work
            statsManager.graphStep.endMonitoring();

            // PerfCounter should track the call
            assert.equal(statsManager.graphStep.count, 1);
        });
    });

    describe("toString output", () => {
        it("should generate human-readable stats report", () => {
            statsManager.updateCounts(10, 20);
            statsManager.updateCacheStats(100, 20);
            statsManager.step();

            const report = statsManager.toString();

            assert.isTrue(report.includes("Graph"));
            assert.isTrue(report.includes("Num Nodes: 10"));
            assert.isTrue(report.includes("Num Edges: 20"));
            assert.isTrue(report.includes("Total Updates: 1"));
            assert.isTrue(report.includes("Mesh Cache Hits: 100"));
            assert.isTrue(report.includes("Mesh Cache Misses: 20"));
            assert.isTrue(report.includes("Graph Engine Performance"));
        });
    });

    describe("performance summary", () => {
        it("should return default values when instrumentation not initialized", () => {
            const summary = statsManager.getPerformanceSummary();

            assert.equal(summary.fps, 0);
            assert.equal(summary.frameTime, 0);
            assert.equal(summary.renderTime, 0);
            assert.equal(summary.gpuTime, 0);
            assert.equal(summary.drawCalls, 0);
        });
    });
});
