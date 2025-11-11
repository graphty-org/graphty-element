import {afterEach, assert, beforeEach, describe, it, vi} from "vitest";

import {Graph} from "../../src/Graph";

describe("Graph - Profiling Integration", () => {
    let container: HTMLElement;
    let graph: Graph;

    beforeEach(async() => {
        container = document.createElement("div");
        container.style.width = "800px";
        container.style.height = "600px";
        document.body.appendChild(container);
        graph = new Graph(container);
        await graph.init();
    });

    afterEach(() => {
        graph.dispose();
        container.remove();
    });

    it("should enable profiling when manually enabled via statsManager", () => {
        // Enable profiling
        const statsManager = graph.getStatsManager();
        statsManager.enableProfiling();

        // Manually measure something to verify profiling works
        statsManager.measure("test-operation", () => {
            // Simulate some work
            let sum = 0;
            for (let i = 0; i < 100; i++) {
                sum += i;
            }
            return sum;
        });

        // Verify profiling was enabled
        const snapshot = statsManager.getSnapshot();

        // When profiling is enabled, measurements appear in cpu array
        assert.isArray(snapshot.cpu);
        assert.isAbove(snapshot.cpu.length, 0);

        // Find our test operation
        const testOp = snapshot.cpu.find((m) => m.label === "test-operation");
        assert.isDefined(testOp);
    });

    it("should have profiling disabled by default", () => {
        const statsManager = graph.getStatsManager();

        // Try to measure something without enabling profiling
        statsManager.measure("test-operation", () => {
            return 42;
        });

        const snapshot = statsManager.getSnapshot();

        // When profiling is disabled, cpu array should be empty
        assert.isArray(snapshot.cpu);
        assert.equal(snapshot.cpu.length, 0);
    });

    it("should measure operations when profiling is enabled", () => {
        const statsManager = graph.getStatsManager();
        statsManager.enableProfiling();

        // Manually measure something
        statsManager.measure("test-operation", () => {
            // Simulate some work
            let sum = 0;
            for (let i = 0; i < 1000; i++) {
                sum += i;
            }
            return sum;
        });

        const snapshot = statsManager.getSnapshot();

        assert.isArray(snapshot.cpu);
        assert.isAbove(snapshot.cpu.length, 0);

        // Find our test operation
        const testOp = snapshot.cpu.find((m) => m.label === "test-operation");
        assert.isDefined(testOp);
        assert.isNumber(testOp.total);
        // Duration may be very small (even 0 for fast operations), but it should be recorded
        assert.isAtLeast(testOp.total, 0);
        assert.equal(testOp.count, 1);
    });

    it("should not add overhead when profiling is disabled", () => {
        const statsManager = graph.getStatsManager();

        // Call measure without enabling profiling
        const result = statsManager.measure("test-operation", () => {
            return 42;
        });

        // Should still return the result
        assert.equal(result, 42);

        const snapshot = statsManager.getSnapshot();

        // Should have no measurements
        assert.isArray(snapshot.cpu);
        assert.equal(snapshot.cpu.length, 0);
    });

    it("should not print Performance Report when profiling is disabled", () => {
        const statsManager = graph.getStatsManager();

        // Spy on console.group to verify it's not called
        const consoleGroupSpy = vi.spyOn(console, "group");

        // Call reportDetailed without enabling profiling
        statsManager.reportDetailed();

        // Should not have called console.group at all
        assert.equal(consoleGroupSpy.mock.calls.length, 0);

        // Cleanup
        consoleGroupSpy.mockRestore();
    });

    it("should print Performance Report when profiling is enabled", () => {
        const statsManager = graph.getStatsManager();
        statsManager.enableProfiling();

        // Measure something to generate data
        statsManager.measure("test-operation", () => {
            return 42;
        });

        // Spy on console.group to verify it's called
        const consoleGroupSpy = vi.spyOn(console, "group");

        // Call reportDetailed
        statsManager.reportDetailed();

        // Should have called console.group for Performance Report
        assert.isAbove(consoleGroupSpy.mock.calls.length, 0);
        assert.include(consoleGroupSpy.mock.calls[0][0], "Performance Report");

        // Cleanup
        consoleGroupSpy.mockRestore();
    });

    // This test will be updated once we implement config-based profiling
    it.skip("should enable profiling via config option", () => {
        // Once we modify Graph constructor to accept GraphContextConfig
        // this test will verify that passing { enableDetailedProfiling: true }
        // automatically enables profiling

        // For now, this test is skipped because Graph constructor doesn't
        // yet accept a config parameter
    });
});
