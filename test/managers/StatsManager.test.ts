import {assert} from "chai";
import {beforeEach, describe, it, vi} from "vitest";

import {StatsManager} from "../../src/managers/StatsManager";
import type {Stats} from "../../src/Stats";

describe("StatsManager", () => {
    let statsManager: StatsManager;
    let mockStats: Stats;

    beforeEach(() => {
        // Create mock Stats
        mockStats = {
            nodeUpdate: {beginMonitoring: vi.fn(), endMonitoring: vi.fn()},
            edgeUpdate: {beginMonitoring: vi.fn(), endMonitoring: vi.fn()},
            layoutUpdate: {beginMonitoring: vi.fn(), endMonitoring: vi.fn()},
            graphStep: {beginMonitoring: vi.fn(), endMonitoring: vi.fn()},
            step: vi.fn(),
            nodeCount: 0,
            edgeCount: 0,
            cacheHits: 0,
            cacheMisses: 0,
        } as Stats;

        statsManager = new StatsManager(mockStats);
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

    describe("stats delegation", () => {
        it("should delegate step to stats", () => {
            statsManager.step();
            assert.isTrue(mockStats.step.calledOnce);
        });

        it("should provide access to nodeUpdate instrumentation", () => {
            const {nodeUpdate} = statsManager;
            assert.equal(nodeUpdate, mockStats.nodeUpdate);
        });

        it("should provide access to edgeUpdate instrumentation", () => {
            const {edgeUpdate} = statsManager;
            assert.equal(edgeUpdate, mockStats.edgeUpdate);
        });

        it("should provide access to layoutUpdate instrumentation", () => {
            const {layoutUpdate} = statsManager;
            assert.equal(layoutUpdate, mockStats.layoutUpdate);
        });

        it("should provide access to graphStep instrumentation", () => {
            const {graphStep} = statsManager;
            assert.equal(graphStep, mockStats.graphStep);
        });
    });

    describe("count updates", () => {
        it("should update node and edge counts", () => {
            statsManager.updateCounts(10, 20);

            assert.equal(mockStats.nodeCount, 10);
            assert.equal(mockStats.edgeCount, 20);
        });

        it("should handle zero counts", () => {
            statsManager.updateCounts(0, 0);

            assert.equal(mockStats.nodeCount, 0);
            assert.equal(mockStats.edgeCount, 0);
        });

        it("should handle large counts", () => {
            statsManager.updateCounts(1000000, 2000000);

            assert.equal(mockStats.nodeCount, 1000000);
            assert.equal(mockStats.edgeCount, 2000000);
        });
    });

    describe("cache statistics", () => {
        it("should update cache hits and misses", () => {
            statsManager.updateCacheStats(100, 25);

            assert.equal(mockStats.cacheHits, 100);
            assert.equal(mockStats.cacheMisses, 25);
        });

        it("should handle zero cache stats", () => {
            statsManager.updateCacheStats(0, 0);

            assert.equal(mockStats.cacheHits, 0);
            assert.equal(mockStats.cacheMisses, 0);
        });

        it("should calculate cache hit rate correctly", () => {
            statsManager.updateCacheStats(75, 25);

            const hitRate = Number(mockStats.cacheHits) / (Number(mockStats.cacheHits) + Number(mockStats.cacheMisses));
            assert.equal(hitRate, 0.75);
        });
    });

    describe("instrumentation usage", () => {
        it("should allow monitoring node updates", () => {
            statsManager.nodeUpdate.beginMonitoring();
            // Simulate some work
            statsManager.nodeUpdate.endMonitoring();

            assert.isTrue(mockStats.nodeUpdate.beginMonitoring.calledOnce);
            assert.isTrue(mockStats.nodeUpdate.endMonitoring.calledOnce);
        });

        it("should allow monitoring edge updates", () => {
            statsManager.edgeUpdate.beginMonitoring();
            // Simulate some work
            statsManager.edgeUpdate.endMonitoring();

            assert.isTrue(mockStats.edgeUpdate.beginMonitoring.calledOnce);
            assert.isTrue(mockStats.edgeUpdate.endMonitoring.calledOnce);
        });

        it("should allow monitoring layout updates", () => {
            statsManager.layoutUpdate.beginMonitoring();
            // Simulate some work
            statsManager.layoutUpdate.endMonitoring();

            assert.isTrue(mockStats.layoutUpdate.beginMonitoring.calledOnce);
            assert.isTrue(mockStats.layoutUpdate.endMonitoring.calledOnce);
        });

        it("should allow monitoring graph steps", () => {
            statsManager.graphStep.beginMonitoring();
            // Simulate some work
            statsManager.graphStep.endMonitoring();

            assert.isTrue(mockStats.graphStep.beginMonitoring.calledOnce);
            assert.isTrue(mockStats.graphStep.endMonitoring.calledOnce);
        });
    });

    describe("stats object access", () => {
        it("should provide access to underlying stats object", () => {
            const stats = statsManager.getStats();
            assert.equal(stats, mockStats);
        });
    });

    describe("performance tracking patterns", () => {
        it("should support nested monitoring", () => {
            // Start graph step
            statsManager.graphStep.beginMonitoring();

            // Within graph step, monitor node updates
            statsManager.nodeUpdate.beginMonitoring();
            statsManager.nodeUpdate.endMonitoring();

            // Also monitor edge updates
            statsManager.edgeUpdate.beginMonitoring();
            statsManager.edgeUpdate.endMonitoring();

            // End graph step
            statsManager.graphStep.endMonitoring();

            assert.equal(mockStats.graphStep.beginMonitoring.callCount, 1);
            assert.equal(mockStats.graphStep.endMonitoring.callCount, 1);
            assert.equal(mockStats.nodeUpdate.beginMonitoring.callCount, 1);
            assert.equal(mockStats.nodeUpdate.endMonitoring.callCount, 1);
            assert.equal(mockStats.edgeUpdate.beginMonitoring.callCount, 1);
            assert.equal(mockStats.edgeUpdate.endMonitoring.callCount, 1);
        });

        it("should handle multiple step calls", () => {
            for (let i = 0; i < 10; i++) {
                statsManager.step();
            }

            assert.equal(mockStats.step.callCount, 10);
        });
    });
});
