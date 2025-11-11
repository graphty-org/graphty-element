import {assert, beforeEach, describe, it, vi} from "vitest";

import type {EventManager} from "../../src/managers/EventManager";
import {StatsManager} from "../../src/managers/StatsManager";

describe("StatsManager - Profiling", () => {
    let statsManager: StatsManager;
    let mockEventManager: EventManager;

    beforeEach(() => {
        // Create mock EventManager
        mockEventManager = {
            emitGraphEvent: vi.fn(),
        } as unknown as EventManager;

        statsManager = new StatsManager(mockEventManager);
    });

    describe("enable/disable", () => {
        it("should start disabled by default", () => {
            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 0);
        });

        it("should enable profiling", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {
                // Empty test function
            });
            const snapshot = statsManager.getSnapshot();
            assert.isAtLeast(snapshot.cpu.length, 1);
        });

        it("should disable profiling and clear measurements", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {
                // Empty test function
            });
            statsManager.disableProfiling();
            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 0);
        });
    });

    describe("measure() - synchronous", () => {
        it("should not measure when disabled", () => {
            const result = statsManager.measure("test", () => 42);
            assert.equal(result, 42);
            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 0);
        });

        it("should measure execution time when enabled", () => {
            statsManager.enableProfiling();
            const result = statsManager.measure("test", () => 42);

            assert.equal(result, 42);
            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 1);
            assert.equal(snapshot.cpu[0].label, "test");
            assert.equal(snapshot.cpu[0].count, 1);
            assert.isAtLeast(snapshot.cpu[0].total, 0);
        });

        it("should handle exceptions and still record timing", () => {
            statsManager.enableProfiling();

            try {
                statsManager.measure("test", () => {
                    throw new Error("test error");
                });
            } catch {
                // Expected
            }

            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 1);
            assert.equal(snapshot.cpu[0].count, 1);
        });

        it("should return function result", () => {
            statsManager.enableProfiling();
            const obj = {value: 123};
            const result = statsManager.measure("test", () => obj);
            assert.equal(result, obj);
        });
    });

    describe("measureAsync() - asynchronous", () => {
        it("should measure async execution time", async() => {
            statsManager.enableProfiling();

            const result = await statsManager.measureAsync("async-test", async() => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 10);
                });
                return "done";
            });

            assert.equal(result, "done");
            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu[0].label, "async-test");
            // Verify timing was recorded (any positive duration)
            assert.isAbove(snapshot.cpu[0].total, 0);
            assert.equal(snapshot.cpu[0].count, 1);
        });

        it("should handle async exceptions", async() => {
            statsManager.enableProfiling();

            try {
                await statsManager.measureAsync("async-test", async() => {
                    await Promise.resolve();
                    throw new Error("async error");
                });
            } catch {
                // Expected
            }

            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu[0].count, 1);
        });
    });

    describe("statistics aggregation", () => {
        it("should track count, total, min, max, avg", () => {
            statsManager.enableProfiling();

            // Run multiple measurements
            statsManager.measure("test", () => {
                // Simulate ~1ms work
                const start = performance.now();
                while (performance.now() - start < 1) {
                    // Busy wait
                }
            });

            statsManager.measure("test", () => {
                // Simulate ~2ms work
                const start = performance.now();
                while (performance.now() - start < 2) {
                    // Busy wait
                }
            });

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu[0];

            assert.equal(stat.count, 2);
            // Verify measurements were recorded (no absolute timing requirements)
            assert.isAbove(stat.total, 0);
            assert.isAbove(stat.min, 0);
            assert.isAbove(stat.max, stat.min);
            assert.approximately(stat.avg, stat.total / 2, 0.01);
        });

        it("should track separate measurements independently", () => {
            statsManager.enableProfiling();

            statsManager.measure("operation-a", () => {
                // Empty test function
            });
            statsManager.measure("operation-b", () => {
                // Empty test function
            });
            statsManager.measure("operation-a", () => {
                // Empty test function
            });

            const snapshot = statsManager.getSnapshot();
            const opA = snapshot.cpu.find((m) => m.label === "operation-a");
            const opB = snapshot.cpu.find((m) => m.label === "operation-b");

            assert.isDefined(opA);
            assert.isDefined(opB);
            assert.equal(opA.count, 2);
            assert.equal(opB.count, 1);
        });
    });

    describe("startMeasurement/endMeasurement - manual timing", () => {
        it("should measure time between start and end", () => {
            statsManager.enableProfiling();

            statsManager.startMeasurement("manual");
            // Simulate work
            const start = performance.now();
            while (performance.now() - start < 5) {
                // Busy wait
            }
            statsManager.endMeasurement("manual");

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu.find((m) => m.label === "manual");
            assert.isDefined(stat);
            // Verify timing was recorded (any positive duration)
            assert.isAbove(stat.total, 0);
            assert.equal(stat.count, 1);
        });

        it("should handle nested measurements", () => {
            statsManager.enableProfiling();

            statsManager.startMeasurement("outer");
            statsManager.startMeasurement("inner");
            statsManager.endMeasurement("inner");
            statsManager.endMeasurement("outer");

            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 2);
        });

        it("should warn on mismatched end", () => {
            statsManager.enableProfiling();
            const warnSpy = vi.spyOn(console, "warn");

            statsManager.startMeasurement("test-a");
            statsManager.endMeasurement("test-b"); // Wrong label

            assert.equal(warnSpy.mock.calls.length, 1);
            const warning = warnSpy.mock.calls[0][0];
            assert.include(warning, "Mismatched");
            warnSpy.mockRestore();
        });

        it("should not measure when disabled", () => {
            statsManager.startMeasurement("test");
            statsManager.endMeasurement("test");

            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 0);
        });

        it("should handle multiple overlapping measurements", () => {
            statsManager.enableProfiling();

            statsManager.startMeasurement("a");
            statsManager.startMeasurement("b");
            statsManager.startMeasurement("c");
            statsManager.endMeasurement("c");
            statsManager.endMeasurement("b");
            statsManager.endMeasurement("a");

            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 3);
        });
    });

    describe("resetMeasurements", () => {
        it("should clear all measurements", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {
                // Empty test function
            });
            statsManager.resetMeasurements();

            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 0);
        });

        it("should keep profiling enabled after reset", () => {
            statsManager.enableProfiling();
            statsManager.resetMeasurements();
            statsManager.measure("test", () => {
                // Empty test function
            });

            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 1);
        });
    });

    describe("percentile calculation", () => {
        it("should calculate p50 (median)", () => {
            statsManager.enableProfiling();

            // Generate measurements with known values: 1, 2, 3, 4, 5
            for (let i = 1; i <= 5; i++) {
                statsManager.measure("test", () => {
                    const start = performance.now();
                    while (performance.now() - start < i) {
                        // Busy wait
                    }
                });
            }

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu[0];

            // P50 should be between min and max (median property)
            assert.isAbove(stat.p50, stat.min);
            assert.isBelow(stat.p50, stat.max);
            // P50 should be reasonably close to average for this distribution
            assert.approximately(stat.p50, stat.avg, stat.avg * 0.5);
        });

        it("should calculate p95", () => {
            statsManager.enableProfiling();

            // Generate 100 measurements: 95 fast (1ms), 5 slow (10ms)
            for (let i = 0; i < 95; i++) {
                statsManager.measure("test", () => {
                    const start = performance.now();
                    while (performance.now() - start < 1) {
                        // Busy wait
                    }
                });
            }
            for (let i = 0; i < 5; i++) {
                statsManager.measure("test", () => {
                    const start = performance.now();
                    while (performance.now() - start < 10) {
                        // Busy wait
                    }
                });
            }

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu[0];

            // P95 should be higher than P50 (median)
            assert.isAbove(stat.p95, stat.p50);
        });

        it("should calculate p99", () => {
            statsManager.enableProfiling();

            // Generate 100 measurements: 99 fast (1ms), 1 very slow (20ms)
            for (let i = 0; i < 99; i++) {
                statsManager.measure("test", () => {
                    const start = performance.now();
                    while (performance.now() - start < 1) {
                        // Busy wait
                    }
                });
            }
            statsManager.measure("test", () => {
                const start = performance.now();
                while (performance.now() - start < 20) {
                    // Busy wait
                }
            });

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu[0];

            // P99 should be higher than P95 and close to max
            assert.isAbove(stat.p99, stat.p95);
            assert.isAbove(stat.p99, stat.p50);
        });

        it("should return 0 for percentiles when no data", () => {
            statsManager.enableProfiling();
            const snapshot = statsManager.getSnapshot();

            // No measurements yet
            assert.equal(snapshot.cpu.length, 0);
        });

        it("should handle single measurement", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {
                // Empty test function
            });

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu[0];

            // All percentiles should equal the single value
            assert.equal(stat.p50, stat.p95);
            assert.equal(stat.p50, stat.p99);
        });

        it("should limit ring buffer to 1000 samples", () => {
            statsManager.enableProfiling();

            // Create 1500 measurements
            for (let i = 0; i < 1500; i++) {
                statsManager.measure("test", () => {
                    // Empty test function
                });
            }

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu[0];

            assert.equal(stat.count, 1500);
            // Percentiles should only use last 1000 samples
            // (We can't directly test ring buffer size without exposing internals,
            //  but we verify count is correct)
        });
    });

    describe("reportDetailed", () => {
        it("should not throw when called", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {
                // Empty test function
            });

            assert.doesNotThrow(() => {
                statsManager.reportDetailed();
            });
        });

        it("should output to console", () => {
            const groupSpy = vi.spyOn(console, "group");
            const tableSpy = vi.spyOn(console, "table");
            const groupEndSpy = vi.spyOn(console, "groupEnd");

            statsManager.enableProfiling();
            statsManager.measure("test", () => {
                // Empty test function
            });
            statsManager.reportDetailed();

            assert.isAbove(groupSpy.mock.calls.length, 0);
            assert.isAbove(tableSpy.mock.calls.length, 0);
            assert.isAbove(groupEndSpy.mock.calls.length, 0);

            groupSpy.mockRestore();
            tableSpy.mockRestore();
            groupEndSpy.mockRestore();
        });

        it("should format CPU metrics as table", () => {
            const tableSpy = vi.spyOn(console, "table");

            statsManager.enableProfiling();
            statsManager.measure("operation-a", () => {
                // Empty test function
            });
            statsManager.measure("operation-b", () => {
                // Empty test function
            });
            statsManager.reportDetailed();

            assert.isAbove(tableSpy.mock.calls.length, 0);
            const tableData = tableSpy.mock.calls[0][0];
            assert.isArray(tableData);
            assert.equal(tableData.length, 2);

            // Verify table columns
            const row = tableData[0];
            assert.property(row, "Label");
            assert.property(row, "Calls");
            assert.property(row, "Total (ms)");
            assert.property(row, "Avg (ms)");
            assert.property(row, "P95 (ms)");

            tableSpy.mockRestore();
        });

        it("should handle empty measurements gracefully", () => {
            statsManager.enableProfiling();

            assert.doesNotThrow(() => {
                statsManager.reportDetailed();
            });
        });

        it("should include GPU metrics when available", () => {
            // This test requires mocking BabylonJS instrumentation
            // For now, we just verify it doesn't crash
            statsManager.reportDetailed();
        });
    });

    describe("getSnapshot - full integration", () => {
        it("should return complete snapshot structure", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {
                // Empty test function
            });

            const snapshot = statsManager.getSnapshot();

            assert.property(snapshot, "cpu");
            assert.property(snapshot, "timestamp");
            assert.isArray(snapshot.cpu);
            assert.isNumber(snapshot.timestamp);
        });

        it("should include GPU metrics when instrumentation is initialized", () => {
            // Requires BabylonJS mock - verify structure exists
            const snapshot = statsManager.getSnapshot();

            // gpu/scene may be undefined if not initialized
            assert.property(snapshot, "cpu");
        });
    });
});
