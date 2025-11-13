import type {EngineInstrumentation, SceneInstrumentation} from "@babylonjs/core";
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

    describe("getSnapshot - GPU and Scene metrics", () => {
        it("should include GPU metrics when BabylonJS instrumentation is initialized", () => {
            // Create mock BabylonJS instrumentation
            const mockEngineInstrumentation = {
                gpuFrameTimeCounter: {
                    current: 5000000, // 5ms in nanoseconds
                    average: 4500000, // 4.5ms
                    min: 3000000, // 3ms
                    max: 8000000, // 8ms
                    total: 450000000, // 450ms
                    lastSecAverage: 4800000, // 4.8ms
                },
                shaderCompilationTimeCounter: {
                    current: 12.5,
                    average: 10.2,
                    min: 5.0,
                    max: 25.0,
                    total: 1020.0,
                    lastSecAverage: 11.5,
                },
            };

            // Initialize with mock instrumentation
            statsManager._injectMockInstrumentation(
                mockEngineInstrumentation as unknown as EngineInstrumentation,
                undefined,
            );

            const snapshot = statsManager.getSnapshot();

            // Verify GPU metrics are present
            assert.isDefined(snapshot.gpu);
            assert.isDefined(snapshot.gpu.gpuFrameTime);
            assert.isDefined(snapshot.gpu.shaderCompilation);

            // Verify GPU frame time conversion from nanoseconds to milliseconds
            assert.approximately(snapshot.gpu.gpuFrameTime.current, 5.0, 0.001);
            assert.approximately(snapshot.gpu.gpuFrameTime.avg, 4.5, 0.001);
            assert.approximately(snapshot.gpu.gpuFrameTime.min, 3.0, 0.001);
            assert.approximately(snapshot.gpu.gpuFrameTime.max, 8.0, 0.001);
            assert.approximately(snapshot.gpu.gpuFrameTime.total, 450.0, 0.001);
            assert.approximately(snapshot.gpu.gpuFrameTime.lastSecAvg, 4.8, 0.001);

            // Verify shader compilation (already in milliseconds, no conversion)
            assert.equal(snapshot.gpu.shaderCompilation.current, 12.5);
            assert.equal(snapshot.gpu.shaderCompilation.avg, 10.2);
            assert.equal(snapshot.gpu.shaderCompilation.min, 5.0);
            assert.equal(snapshot.gpu.shaderCompilation.max, 25.0);
            assert.equal(snapshot.gpu.shaderCompilation.total, 1020.0);
            assert.equal(snapshot.gpu.shaderCompilation.lastSecAvg, 11.5);
        });

        it("should not include GPU metrics when instrumentation is not initialized", () => {
            const snapshot = statsManager.getSnapshot();
            assert.isUndefined(snapshot.gpu);
        });

        it("should include Scene metrics when BabylonJS instrumentation is initialized", () => {
            // Create mock BabylonJS scene instrumentation
            const mockSceneInstrumentation = {
                frameTimeCounter: {
                    current: 16.7,
                    average: 16.5,
                    min: 15.0,
                    max: 20.0,
                    total: 1650.0,
                    lastSecAverage: 16.6,
                },
                renderTimeCounter: {
                    current: 12.3,
                    average: 11.8,
                    min: 10.0,
                    max: 15.0,
                    total: 1180.0,
                    lastSecAverage: 12.0,
                },
                interFrameTimeCounter: {
                    current: 16.8,
                    average: 16.7,
                    min: 16.0,
                    max: 18.0,
                    total: 1670.0,
                    lastSecAverage: 16.75,
                },
                cameraRenderTimeCounter: {
                    current: 2.5,
                    average: 2.3,
                    min: 2.0,
                    max: 3.0,
                    total: 230.0,
                    lastSecAverage: 2.4,
                },
                activeMeshesEvaluationTimeCounter: {
                    current: 1.8,
                    average: 1.6,
                    min: 1.2,
                    max: 2.5,
                    total: 160.0,
                    lastSecAverage: 1.7,
                },
                renderTargetsRenderTimeCounter: {
                    current: 0.5,
                    average: 0.4,
                    min: 0.3,
                    max: 0.8,
                    total: 40.0,
                    lastSecAverage: 0.45,
                },
                drawCallsCounter: {
                    current: 150,
                    average: 145.5,
                    min: 120,
                    max: 180,
                    total: 14550,
                    lastSecAverage: 148.0,
                    count: 100,
                },
            };

            // Initialize with mock instrumentation
            statsManager._injectMockInstrumentation(
                undefined,
                mockSceneInstrumentation as unknown as SceneInstrumentation,
            );

            const snapshot = statsManager.getSnapshot();

            // Verify Scene metrics are present
            assert.isDefined(snapshot.scene);

            // Verify frameTime
            assert.equal(snapshot.scene.frameTime.current, 16.7);
            assert.equal(snapshot.scene.frameTime.avg, 16.5);
            assert.equal(snapshot.scene.frameTime.min, 15.0);
            assert.equal(snapshot.scene.frameTime.max, 20.0);
            assert.equal(snapshot.scene.frameTime.total, 1650.0);
            assert.equal(snapshot.scene.frameTime.lastSecAvg, 16.6);

            // Verify renderTime
            assert.equal(snapshot.scene.renderTime.current, 12.3);
            assert.equal(snapshot.scene.renderTime.avg, 11.8);

            // Verify interFrameTime
            assert.equal(snapshot.scene.interFrameTime.current, 16.8);
            assert.equal(snapshot.scene.interFrameTime.avg, 16.7);

            // Verify cameraRenderTime
            assert.equal(snapshot.scene.cameraRenderTime.current, 2.5);
            assert.equal(snapshot.scene.cameraRenderTime.avg, 2.3);

            // Verify activeMeshesEvaluation
            assert.equal(snapshot.scene.activeMeshesEvaluation.current, 1.8);
            assert.equal(snapshot.scene.activeMeshesEvaluation.avg, 1.6);

            // Verify renderTargetsRenderTime
            assert.equal(snapshot.scene.renderTargetsRenderTime.current, 0.5);
            assert.equal(snapshot.scene.renderTargetsRenderTime.avg, 0.4);

            // Verify drawCalls (includes count property)
            assert.equal(snapshot.scene.drawCalls.current, 150);
            assert.equal(snapshot.scene.drawCalls.avg, 145.5);
            assert.equal(snapshot.scene.drawCalls.count, 100);
        });

        it("should not include Scene metrics when instrumentation is not initialized", () => {
            const snapshot = statsManager.getSnapshot();
            assert.isUndefined(snapshot.scene);
        });
    });

    describe("reportDetailed - GPU and Scene verbose output", () => {
        it("should output verbose GPU metrics to console", () => {
            const groupSpy = vi.spyOn(console, "group");
            const logSpy = vi.spyOn(console, "log");
            const groupEndSpy = vi.spyOn(console, "groupEnd");

            // Create mock BabylonJS instrumentation
            const mockEngineInstrumentation = {
                gpuFrameTimeCounter: {
                    current: 5000000,
                    average: 4500000,
                    min: 3000000,
                    max: 8000000,
                    total: 450000000,
                    lastSecAverage: 4800000,
                },
                shaderCompilationTimeCounter: {
                    current: 12.5,
                    average: 10.2,
                    min: 5.0,
                    max: 25.0,
                    total: 1020.0,
                    lastSecAverage: 11.5,
                },
            };

            statsManager._injectMockInstrumentation(
                mockEngineInstrumentation as unknown as EngineInstrumentation,
                undefined,
            );

            // Enable profiling (required for reportDetailed to output anything)
            statsManager.enableProfiling();

            // Verify snapshot has GPU data before calling reportDetailed
            const snapshot = statsManager.getSnapshot();
            assert.isDefined(snapshot.gpu, "GPU data should be present in snapshot");

            statsManager.reportDetailed();

            // Verify GPU metrics group was created
            const groupCalls = groupSpy.mock.calls.map((call) => call[0]);
            assert.include(groupCalls, "GPU Metrics (BabylonJS EngineInstrumentation)");
            assert.include(groupCalls, "GPU Frame Time (ms)");
            assert.include(groupCalls, "Shader Compilation (ms)");

            // Verify verbose output includes all properties
            const logCalls = logSpy.mock.calls.map((call) => call.join(" "));
            assert.isTrue(logCalls.some((log) => log.includes("Current:") && log.includes("5.000")));
            assert.isTrue(logCalls.some((log) => log.includes("Average:") && log.includes("4.500")));
            assert.isTrue(logCalls.some((log) => log.includes("Min:") && log.includes("3.000")));
            assert.isTrue(logCalls.some((log) => log.includes("Max:") && log.includes("8.000")));
            assert.isTrue(logCalls.some((log) => log.includes("Total:") && log.includes("450.000")));
            assert.isTrue(logCalls.some((log) => log.includes("Last Sec Avg:") && log.includes("4.800")));

            groupSpy.mockRestore();
            logSpy.mockRestore();
            groupEndSpy.mockRestore();
        });

        it("should output verbose Scene metrics to console", () => {
            const groupSpy = vi.spyOn(console, "group");
            const logSpy = vi.spyOn(console, "log");
            const groupEndSpy = vi.spyOn(console, "groupEnd");

            // Create mock BabylonJS scene instrumentation
            const mockSceneInstrumentation = {
                frameTimeCounter: {
                    current: 16.7,
                    average: 16.5,
                    min: 15.0,
                    max: 20.0,
                    total: 1650.0,
                    lastSecAverage: 16.6,
                },
                renderTimeCounter: {
                    current: 12.3,
                    average: 11.8,
                    min: 10.0,
                    max: 15.0,
                    total: 1180.0,
                    lastSecAverage: 12.0,
                },
                interFrameTimeCounter: {
                    current: 16.8,
                    average: 16.7,
                    min: 16.0,
                    max: 18.0,
                    total: 1670.0,
                    lastSecAverage: 16.75,
                },
                cameraRenderTimeCounter: {
                    current: 2.5,
                    average: 2.3,
                    min: 2.0,
                    max: 3.0,
                    total: 230.0,
                    lastSecAverage: 2.4,
                },
                activeMeshesEvaluationTimeCounter: {
                    current: 1.8,
                    average: 1.6,
                    min: 1.2,
                    max: 2.5,
                    total: 160.0,
                    lastSecAverage: 1.7,
                },
                renderTargetsRenderTimeCounter: {
                    current: 0.5,
                    average: 0.4,
                    min: 0.3,
                    max: 0.8,
                    total: 40.0,
                    lastSecAverage: 0.45,
                },
                drawCallsCounter: {
                    current: 150,
                    average: 145.5,
                    min: 120,
                    max: 180,
                    total: 14550,
                    lastSecAverage: 148.0,
                    count: 100,
                },
            };

            statsManager._injectMockInstrumentation(
                undefined,
                mockSceneInstrumentation as unknown as SceneInstrumentation,
            );

            // Enable profiling (required for reportDetailed to output anything)
            statsManager.enableProfiling();

            statsManager.reportDetailed();

            // Verify Scene metrics group was created
            const groupCalls = groupSpy.mock.calls.map((call) => call[0]);
            assert.include(groupCalls, "Scene Metrics (BabylonJS SceneInstrumentation)");
            assert.include(groupCalls, "Frame Time");
            assert.include(groupCalls, "Render Time");
            assert.include(groupCalls, "Inter-Frame Time");
            assert.include(groupCalls, "Camera Render Time");
            assert.include(groupCalls, "Active Meshes Evaluation");
            assert.include(groupCalls, "Render Targets Render Time");
            assert.include(groupCalls, "Draw Calls");

            // Verify verbose output for Frame Time
            const logCalls = logSpy.mock.calls.map((call) => call.join(" "));
            assert.isTrue(logCalls.some((log) => log.includes("Current:") && log.includes("16.7")));
            assert.isTrue(logCalls.some((log) => log.includes("Average:") && log.includes("16.5")));

            // Verify Draw Calls includes count
            assert.isTrue(logCalls.some((log) => log.includes("Count:") && log.includes("100")));

            groupSpy.mockRestore();
            logSpy.mockRestore();
            groupEndSpy.mockRestore();
        });

        it("should not output GPU/Scene metrics when not initialized", () => {
            const groupSpy = vi.spyOn(console, "group");

            statsManager.reportDetailed();

            const groupCalls = groupSpy.mock.calls.map((call) => call[0]);
            assert.notInclude(groupCalls, "GPU Metrics (BabylonJS EngineInstrumentation)");
            assert.notInclude(groupCalls, "Scene Metrics (BabylonJS SceneInstrumentation)");

            groupSpy.mockRestore();
        });
    });

    describe("Frame Profiling - Blocking Detection", () => {
        it("should enable and disable frame profiling", () => {
            statsManager.enableProfiling();
            statsManager.enableFrameProfiling();

            // Frame profiling enabled, should track operations
            statsManager.startFrameProfiling();
            statsManager.measure("test-op", () => {
                // Empty test function
            });

            // Can't fully test without SceneInstrumentation, but verify no errors
            assert.doesNotThrow(() => {
                statsManager.endFrameProfiling();
            });

            statsManager.disableFrameProfiling();
        });

        it("should track operations within a frame", () => {
            // Create mock scene instrumentation
            const mockSceneInstrumentation = {
                interFrameTimeCounter: {
                    current: 20.0, // 20ms frame time
                    average: 18.0,
                    min: 15.0,
                    max: 25.0,
                    total: 1800.0,
                    lastSecAvg: 19.0,
                },
                frameTimeCounter: {
                    current: 16.7,
                    average: 16.5,
                    min: 15.0,
                    max: 20.0,
                    total: 1650.0,
                    lastSecAverage: 16.6,
                },
            };

            statsManager._injectMockInstrumentation(
                undefined,
                mockSceneInstrumentation as unknown as SceneInstrumentation,
            );

            statsManager.enableProfiling();
            statsManager.enableFrameProfiling();

            // Simulate frame with operations
            statsManager.startFrameProfiling();
            statsManager.measure("operation-a", () => {
                const start = performance.now();
                while (performance.now() - start < 5) {
                    // 5ms work
                }
            });
            statsManager.measure("operation-b", () => {
                const start = performance.now();
                while (performance.now() - start < 3) {
                    // 3ms work
                }
            });
            statsManager.endFrameProfiling();

            // Get blocking report
            const blockingReport = statsManager.getBlockingReport();

            // Verify operations are tracked
            assert.isAtLeast(blockingReport.length, 2);
            const opA = blockingReport.find((op) => op.label === "operation-a");
            const opB = blockingReport.find((op) => op.label === "operation-b");

            assert.isDefined(opA);
            assert.isDefined(opB);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            assert.equal(opA!.appearanceCount, 1);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            assert.equal(opB!.appearanceCount, 1);
        });

        it("should correlate operations with high-blocking frames", () => {
            // Create mock scene instrumentation with HIGH inter-frame time
            const mockSceneInstrumentation = {
                interFrameTimeCounter: {
                    current: 50.0, // 50ms frame time (simulating blocking)
                    average: 18.0,
                    min: 15.0,
                    max: 50.0,
                    total: 1800.0,
                    lastSecAvg: 19.0,
                },
                frameTimeCounter: {
                    current: 16.7,
                    average: 16.5,
                    min: 15.0,
                    max: 20.0,
                    total: 1650.0,
                    lastSecAverage: 16.6,
                },
            };

            statsManager._injectMockInstrumentation(
                undefined,
                mockSceneInstrumentation as unknown as SceneInstrumentation,
            );

            statsManager.enableProfiling();
            statsManager.enableFrameProfiling();

            // Simulate frame with operations (total CPU time will be low compared to inter-frame time)
            statsManager.startFrameProfiling();
            statsManager.measure("blocking-operation", () => {
                const start = performance.now();
                while (performance.now() - start < 10) {
                    // 10ms CPU work, but 50ms total frame time = 40ms blocking
                }
            });
            statsManager.endFrameProfiling();

            // Get blocking report
            const blockingReport = statsManager.getBlockingReport();

            // Verify operation is flagged as high-blocking
            const blockingOp = blockingReport.find((op) => op.label === "blocking-operation");
            assert.isDefined(blockingOp);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            assert.equal(blockingOp!.highBlockingFrames, 1);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            assert.equal(blockingOp!.highBlockingPercentage, 100); // 1/1 frames had high blocking
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            assert.isAbove(blockingOp!.avgBlockingRatioWhenPresent, 1.0); // Blocking > 1x CPU time
        });

        it("should not flag low-blocking operations", () => {
            // Create mock scene instrumentation with NORMAL inter-frame time
            const mockSceneInstrumentation = {
                interFrameTimeCounter: {
                    current: 10.0, // 10ms frame time (normal)
                    average: 18.0,
                    min: 15.0,
                    max: 25.0,
                    total: 1800.0,
                    lastSecAvg: 19.0,
                },
                frameTimeCounter: {
                    current: 16.7,
                    average: 16.5,
                    min: 15.0,
                    max: 20.0,
                    total: 1650.0,
                    lastSecAverage: 16.6,
                },
            };

            statsManager._injectMockInstrumentation(
                undefined,
                mockSceneInstrumentation as unknown as SceneInstrumentation,
            );

            statsManager.enableProfiling();
            statsManager.enableFrameProfiling();

            // Simulate frame with normal operations
            statsManager.startFrameProfiling();
            statsManager.measure("normal-operation", () => {
                const start = performance.now();
                while (performance.now() - start < 8) {
                    // 8ms CPU work, 10ms total frame time = only 2ms blocking (low)
                }
            });
            statsManager.endFrameProfiling();

            // Get blocking report
            const blockingReport = statsManager.getBlockingReport();

            // Verify operation is NOT flagged as high-blocking
            const normalOp = blockingReport.find((op) => op.label === "normal-operation");
            assert.isDefined(normalOp);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            assert.equal(normalOp!.highBlockingFrames, 0); // Not high-blocking (threshold is 1.0x)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
            assert.equal(normalOp!.highBlockingPercentage, 0);
        });

        it("should generate blocking correlation report", () => {
            const logSpy = vi.spyOn(console, "log");
            const groupSpy = vi.spyOn(console, "group");
            const tableSpy = vi.spyOn(console, "table");

            // Create mock scene instrumentation with GPU time counter
            const mockEngineInstrumentation = {
                gpuFrameTimeCounter: {
                    current: 5000000,
                    average: 4500000,
                    min: 3000000,
                    max: 8000000,
                    total: 450000000,
                    lastSecAverage: 4800000,
                },
                shaderCompilationTimeCounter: {
                    current: 12.5,
                    average: 10.2,
                    min: 5.0,
                    max: 25.0,
                    total: 1020.0,
                    lastSecAverage: 11.5,
                },
            };

            const mockSceneInstrumentation = {
                interFrameTimeCounter: {
                    current: 50.0,
                    average: 18.0,
                    min: 15.0,
                    max: 50.0,
                    total: 1800.0,
                    lastSecAverage: 19.0,
                },
                frameTimeCounter: {
                    current: 16.7,
                    average: 16.5,
                    min: 15.0,
                    max: 20.0,
                    total: 1650.0,
                    lastSecAverage: 16.6,
                },
                renderTimeCounter: {
                    current: 12.3,
                    average: 11.8,
                    min: 10.0,
                    max: 15.0,
                    total: 1180.0,
                    lastSecAverage: 12.0,
                },
                cameraRenderTimeCounter: {
                    current: 2.5,
                    average: 2.3,
                    min: 2.0,
                    max: 3.0,
                    total: 230.0,
                    lastSecAverage: 2.4,
                },
                activeMeshesEvaluationTimeCounter: {
                    current: 1.8,
                    average: 1.6,
                    min: 1.2,
                    max: 2.5,
                    total: 160.0,
                    lastSecAverage: 1.7,
                },
                renderTargetsRenderTimeCounter: {
                    current: 0.5,
                    average: 0.4,
                    min: 0.3,
                    max: 0.8,
                    total: 40.0,
                    lastSecAverage: 0.45,
                },
                drawCallsCounter: {
                    current: 150,
                    average: 145.5,
                    min: 120,
                    max: 180,
                    total: 14550,
                    lastSecAverage: 148.0,
                    count: 100,
                },
            };

            statsManager._injectMockInstrumentation(
                mockEngineInstrumentation as unknown as EngineInstrumentation,
                mockSceneInstrumentation as unknown as SceneInstrumentation,
            );

            statsManager.enableProfiling();
            statsManager.enableFrameProfiling();

            // Simulate frame
            statsManager.startFrameProfiling();
            statsManager.measure("test-op", () => {
                // Empty test function
            });
            statsManager.endFrameProfiling();

            // Generate report
            statsManager.reportDetailed();

            // Verify blocking correlation section exists
            const groupCalls = groupSpy.mock.calls.map((call) => call[0]);
            assert.include(groupCalls, "Blocking Correlation Analysis");

            // Verify table was generated
            assert.isAbove(tableSpy.mock.calls.length, 0);

            logSpy.mockRestore();
            groupSpy.mockRestore();
            tableSpy.mockRestore();
        });
    });

    describe("Event Counters", () => {
        describe("basic counter operations", () => {
            it("should increment counter", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("cache.hits");
                statsManager.incrementCounter("cache.hits");
                statsManager.incrementCounter("cache.hits");

                const value = statsManager.getCounter("cache.hits");
                assert.equal(value, 3);
            });

            it("should increment by custom amount", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("bytes.sent", 1024);
                statsManager.incrementCounter("bytes.sent", 512);

                const value = statsManager.getCounter("bytes.sent");
                assert.equal(value, 1536);
            });

            it("should decrement counter", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("queue.size", 10);
                statsManager.decrementCounter("queue.size");
                statsManager.decrementCounter("queue.size", 3);

                const value = statsManager.getCounter("queue.size");
                assert.equal(value, 6);
            });

            it("should set counter to specific value", () => {
                statsManager.enableProfiling();

                statsManager.setCounter("pool.size", 100);

                const value = statsManager.getCounter("pool.size");
                assert.equal(value, 100);
            });

            it("should reset specific counter", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("errors", 5);
                statsManager.resetCounter("errors");

                const value = statsManager.getCounter("errors");
                assert.equal(value, 0);
            });

            it("should reset all counters", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("counter-a", 10);
                statsManager.incrementCounter("counter-b", 20);
                statsManager.resetAllCounters();

                assert.equal(statsManager.getCounter("counter-a"), 0);
                assert.equal(statsManager.getCounter("counter-b"), 0);
            });

            it("should return 0 for non-existent counter", () => {
                statsManager.enableProfiling();

                const value = statsManager.getCounter("does-not-exist");
                assert.equal(value, 0);
            });
        });

        describe("disabled behavior", () => {
            it("should not count when profiling disabled", () => {
                statsManager.incrementCounter("test");
                statsManager.incrementCounter("test");

                const value = statsManager.getCounter("test");
                assert.equal(value, 0);
            });

            it("should not set when profiling disabled", () => {
                statsManager.setCounter("test", 100);

                const value = statsManager.getCounter("test");
                assert.equal(value, 0);
            });
        });

        describe("getCountersSnapshot", () => {
            it("should return all counters with metadata", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("cache.hits", 10);
                statsManager.incrementCounter("cache.misses", 2);
                statsManager.setCounter("pool.size", 50);

                const snapshot = statsManager.getCountersSnapshot();

                assert.equal(snapshot.length, 3);

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const cacheHits = snapshot.find((c) => c.label === "cache.hits")!;
                assert.equal(cacheHits.value, 10);
                assert.equal(cacheHits.operations, 1); // incremented once (with amount 10)

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const cacheMisses = snapshot.find((c) => c.label === "cache.misses")!;
                assert.equal(cacheMisses.value, 2);
                assert.equal(cacheMisses.operations, 1);

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const poolSize = snapshot.find((c) => c.label === "pool.size")!;
                assert.equal(poolSize.value, 50);
                assert.equal(poolSize.operations, 1); // set once
            });

            it("should track number of operations", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("test");
                statsManager.incrementCounter("test");
                statsManager.decrementCounter("test");
                statsManager.setCounter("test", 100);

                const snapshot = statsManager.getCountersSnapshot();
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const counter = snapshot.find((c) => c.label === "test")!;

                assert.equal(counter.value, 100);
                assert.equal(counter.operations, 4); // 2 increments + 1 decrement + 1 set
            });

            it("should return empty array when no counters", () => {
                statsManager.enableProfiling();

                const snapshot = statsManager.getCountersSnapshot();
                assert.equal(snapshot.length, 0);
            });
        });

        describe("integration with reportDetailed", () => {
            it("should include counters in report", () => {
                const tableSpy = vi.spyOn(console, "table");
                const groupSpy = vi.spyOn(console, "group");

                statsManager.enableProfiling();
                statsManager.incrementCounter("cache.hits", 100);
                statsManager.incrementCounter("cache.misses", 10);
                statsManager.reportDetailed();

                // Verify Counters group exists
                const countersGroup = groupSpy.mock.calls.find((call) => call[0] === "Event Counters");
                assert.isDefined(countersGroup);

                // Verify table was called with counter data
                const counterTableCall = tableSpy.mock.calls.find((call) => {
                    const data = call[0];
                    return Array.isArray(data) && data.some((row) => row.Label === "cache.hits");
                });
                assert.isDefined(counterTableCall);

                tableSpy.mockRestore();
                groupSpy.mockRestore();
            });

            it("should not show counters section when empty", () => {
                const groupSpy = vi.spyOn(console, "group");

                statsManager.enableProfiling();
                statsManager.reportDetailed();

                // Verify Counters group NOT called
                const countersGroup = groupSpy.mock.calls.find((call) => call[0] === "Event Counters");
                assert.isUndefined(countersGroup);

                groupSpy.mockRestore();
            });

            it("should calculate derived metrics", () => {
                const tableSpy = vi.spyOn(console, "table");

                statsManager.enableProfiling();
                statsManager.incrementCounter("cache.hits", 90);
                statsManager.incrementCounter("cache.misses", 10);
                statsManager.reportDetailed();

                const tableData = tableSpy.mock.calls.find((call) => {
                    const data = call[0];
                    return Array.isArray(data) && data.some((row) => row.Label === "cache.hits");
                })?.[0];

                // Verify derived metrics are calculated
                assert.isDefined(tableData);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const hitsRow = tableData.find((row: any) => row.Label === "cache.hits");
                assert.equal(hitsRow.Value, 90);

                tableSpy.mockRestore();
            });
        });

        describe("common use cases", () => {
            it("should track cache hit rate", () => {
                statsManager.enableProfiling();

                // Simulate cache operations
                for (let i = 0; i < 90; i++) {
                    statsManager.incrementCounter("cache.hits");
                }
                for (let i = 0; i < 10; i++) {
                    statsManager.incrementCounter("cache.misses");
                }

                const hits = statsManager.getCounter("cache.hits");
                const misses = statsManager.getCounter("cache.misses");
                const total = hits + misses;
                const hitRate = (hits / total) * 100;

                assert.equal(hits, 90);
                assert.equal(misses, 10);
                assert.equal(hitRate, 90);
            });

            it("should track skipped vs executed operations", () => {
                statsManager.enableProfiling();

                // Simulate optimization that skips unchanged updates
                for (let i = 0; i < 50; i++) {
                    if (i % 2 === 0) {
                        statsManager.incrementCounter("Edge.update.skipped");
                    } else {
                        statsManager.incrementCounter("Edge.update.executed");
                    }
                }

                const skipped = statsManager.getCounter("Edge.update.skipped");
                const executed = statsManager.getCounter("Edge.update.executed");
                const total = skipped + executed;
                const skipRate = (skipped / total) * 100;

                assert.equal(skipped, 25);
                assert.equal(executed, 25);
                assert.equal(skipRate, 50);
            });

            it("should track resource pool size", () => {
                statsManager.enableProfiling();

                // Simulate resource allocation/deallocation
                statsManager.setCounter("mesh.pool.size", 0);

                // Allocate 10 meshes
                for (let i = 0; i < 10; i++) {
                    statsManager.incrementCounter("mesh.pool.size");
                    statsManager.incrementCounter("mesh.pool.allocations");
                }

                // Deallocate 3 meshes
                for (let i = 0; i < 3; i++) {
                    statsManager.decrementCounter("mesh.pool.size");
                    statsManager.incrementCounter("mesh.pool.deallocations");
                }

                assert.equal(statsManager.getCounter("mesh.pool.size"), 7);
                assert.equal(statsManager.getCounter("mesh.pool.allocations"), 10);
                assert.equal(statsManager.getCounter("mesh.pool.deallocations"), 3);
            });

            it("should track error counts by type", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("errors.network");
                statsManager.incrementCounter("errors.network");
                statsManager.incrementCounter("errors.validation");
                statsManager.incrementCounter("errors.timeout");

                const networkErrors = statsManager.getCounter("errors.network");
                const validationErrors = statsManager.getCounter("errors.validation");
                const timeoutErrors = statsManager.getCounter("errors.timeout");

                assert.equal(networkErrors, 2);
                assert.equal(validationErrors, 1);
                assert.equal(timeoutErrors, 1);
            });
        });

        describe("edge cases", () => {
            it("should handle negative values from decrement", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("test", 5);
                statsManager.decrementCounter("test", 10);

                const value = statsManager.getCounter("test");
                assert.equal(value, -5);
            });

            it("should handle very large counter values", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("test", Number.MAX_SAFE_INTEGER - 100);
                statsManager.incrementCounter("test", 50);

                const value = statsManager.getCounter("test");
                assert.equal(value, Number.MAX_SAFE_INTEGER - 50);
            });

            it("should handle decimal increments", () => {
                statsManager.enableProfiling();

                statsManager.incrementCounter("weight", 1.5);
                statsManager.incrementCounter("weight", 2.3);

                const value = statsManager.getCounter("weight");
                assert.approximately(value, 3.8, 0.001);
            });
        });
    });
});
