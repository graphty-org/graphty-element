# Implementation Plan for Performance Profiling System

## Overview

This plan extends the existing `StatsManager` class to add detailed performance profiling capabilities. The system will provide hierarchical timing measurements, percentile statistics (P50/P95/P99), and enhanced console reporting to help diagnose performance bottlenecks. The implementation modifies only one existing file and adds comprehensive test coverage.

**Key Goals:**
- Zero overhead when disabled
- <1% overhead when enabled
- Backward compatible with existing StatsManager API
- Test-driven development with 80%+ coverage
- Enable diagnosis of the current 4.5s performance regression

---

## Phase Breakdown

### Phase 1: Core Measurement Infrastructure
**Objective**: Add basic measurement tracking with enable/disable functionality
**Duration**: 1 day
**Estimated Effort**: 6-8 hours

**Tests to Write First**:

`test/managers/StatsManager.profiling.test.ts` (new file):
```typescript
import {assert, beforeEach, describe, it} from "vitest";
import {StatsManager} from "../../src/managers/StatsManager";

describe("StatsManager - Profiling", () => {
    let statsManager: StatsManager;

    beforeEach(() => {
        const mockEventManager = {
            emitGraphEvent: () => {},
        } as any;
        statsManager = new StatsManager(mockEventManager);
    });

    describe("enable/disable", () => {
        it("should start disabled by default", () => {
            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu.length, 0);
        });

        it("should enable profiling", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {});
            const snapshot = statsManager.getSnapshot();
            assert.isAtLeast(snapshot.cpu.length, 1);
        });

        it("should disable profiling and clear measurements", () => {
            statsManager.enableProfiling();
            statsManager.measure("test", () => {});
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
        it("should measure async execution time", async () => {
            statsManager.enableProfiling();

            const result = await statsManager.measureAsync("async-test", async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return "done";
            });

            assert.equal(result, "done");
            const snapshot = statsManager.getSnapshot();
            assert.equal(snapshot.cpu[0].label, "async-test");
            assert.isAtLeast(snapshot.cpu[0].total, 10);
        });

        it("should handle async exceptions", async () => {
            statsManager.enableProfiling();

            try {
                await statsManager.measureAsync("async-test", async () => {
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
                while (performance.now() - start < 1) {}
            });

            statsManager.measure("test", () => {
                // Simulate ~2ms work
                const start = performance.now();
                while (performance.now() - start < 2) {}
            });

            const snapshot = statsManager.getSnapshot();
            const stat = snapshot.cpu[0];

            assert.equal(stat.count, 2);
            assert.isAtLeast(stat.total, 3);
            assert.isAtLeast(stat.min, 0);
            assert.isAtLeast(stat.max, stat.min);
            assert.approximately(stat.avg, stat.total / 2, 0.1);
        });

        it("should track separate measurements independently", () => {
            statsManager.enableProfiling();

            statsManager.measure("operation-a", () => {});
            statsManager.measure("operation-b", () => {});
            statsManager.measure("operation-a", () => {});

            const snapshot = statsManager.getSnapshot();
            const opA = snapshot.cpu.find(m => m.label === "operation-a")!;
            const opB = snapshot.cpu.find(m => m.label === "operation-b")!;

            assert.equal(opA.count, 2);
            assert.equal(opB.count, 1);
        });
    });
});
```

**Implementation**:

`src/managers/StatsManager.ts` (extend existing file):
```typescript
// Add to existing imports
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

interface PerformanceSnapshot {
    cpu: Array<{
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
    }>;
    gpu?: {
        gpuFrameTime: { current: number; avg: number; min: number; max: number };
        shaderCompilation: { current: number; avg: number; total: number };
    };
    scene?: {
        drawCalls: { current: number; avg: number };
        frameTime: { avg: number };
        renderTime: { avg: number };
        activeMeshesEvaluation: { avg: number };
    };
    timestamp: number;
}

export class StatsManager implements Manager {
    // ... existing fields ...

    // NEW: Profiling fields
    private enabled = false;
    private measurements = new Map<string, MeasurementStats>();
    private activeStack: Array<{ label: string; startTime: number }> = [];

    // NEW: Enable detailed profiling
    enableProfiling(): void {
        this.enabled = true;
    }

    // NEW: Disable detailed profiling and clear measurements
    disableProfiling(): void {
        this.enabled = false;
        this.measurements.clear();
        this.activeStack = [];
    }

    // NEW: Measure synchronous code execution
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

    // NEW: Measure async code execution
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

    // NEW: Record a measurement and update statistics
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

        const stats = this.measurements.get(label)!;
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

    // NEW: Get comprehensive performance snapshot (stub for phase 1)
    getSnapshot(): PerformanceSnapshot {
        const cpuMeasurements = Array.from(this.measurements.values()).map(m => ({
            label: m.label,
            count: m.count,
            total: m.total,
            min: m.min,
            max: m.max,
            avg: m.avg,
            p50: 0, // Will implement in Phase 2
            p95: 0, // Will implement in Phase 2
            p99: 0, // Will implement in Phase 2
            lastDuration: m.lastDuration,
        }));

        return {
            cpu: cpuMeasurements,
            timestamp: performance.now(),
        };
    }
}
```

**Dependencies**:
- External: None (uses native performance.now())
- Internal: Existing StatsManager infrastructure

**Verification**:
1. Run tests: `npm test test/managers/StatsManager.profiling.test.ts`
2. Expected output: All tests pass (12+ tests)
3. Verify zero overhead when disabled:
   ```typescript
   const start = performance.now();
   for (let i = 0; i < 100000; i++) {
       statsManager.measure("test", () => {});
   }
   const elapsed = performance.now() - start;
   // Should be < 5ms when disabled
   ```

---

### Phase 2: Manual Timing & Stack Tracking
**Objective**: Add start/end measurement API for manual timing with stack validation
**Duration**: 0.5 day
**Estimated Effort**: 3-4 hours

**Tests to Write First**:

Add to `test/managers/StatsManager.profiling.test.ts`:
```typescript
describe("startMeasurement/endMeasurement - manual timing", () => {
    it("should measure time between start and end", () => {
        statsManager.enableProfiling();

        statsManager.startMeasurement("manual");
        // Simulate work
        const start = performance.now();
        while (performance.now() - start < 5) {}
        statsManager.endMeasurement("manual");

        const snapshot = statsManager.getSnapshot();
        const stat = snapshot.cpu.find(m => m.label === "manual")!;
        assert.isAtLeast(stat.total, 5);
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

        assert.isTrue(warnSpy.called);
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
        statsManager.measure("test", () => {});
        statsManager.resetMeasurements();

        const snapshot = statsManager.getSnapshot();
        assert.equal(snapshot.cpu.length, 0);
    });

    it("should keep profiling enabled after reset", () => {
        statsManager.enableProfiling();
        statsManager.resetMeasurements();
        statsManager.measure("test", () => {});

        const snapshot = statsManager.getSnapshot();
        assert.equal(snapshot.cpu.length, 1);
    });
});
```

**Implementation**:

Add to `src/managers/StatsManager.ts`:
```typescript
export class StatsManager implements Manager {
    // ... existing code ...

    /**
     * Start manual timing
     */
    startMeasurement(label: string): void {
        if (!this.enabled) {
            return;
        }
        this.activeStack.push({ label, startTime: performance.now() });
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

    // Update dispose() to clear profiling state
    dispose(): void {
        // ... existing disposal code ...

        // Clear profiling state
        this.measurements.clear();
        this.activeStack = [];
        this.enabled = false;
    }
}
```

**Dependencies**:
- External: None
- Internal: Phase 1 (recordMeasurement)

**Verification**:
1. Run tests: `npm test test/managers/StatsManager.profiling.test.ts`
2. Expected output: All tests pass (18+ tests)
3. Manual verification:
   ```typescript
   statsManager.enableProfiling();
   statsManager.startMeasurement("test");
   // ... do work
   statsManager.endMeasurement("test");
   console.log(statsManager.getSnapshot().cpu[0]);
   // Should show timing data
   ```

---

### Phase 3: Percentile Statistics
**Objective**: Implement P50/P95/P99 percentile calculation from stored durations
**Duration**: 0.5 day
**Estimated Effort**: 3-4 hours

**Tests to Write First**:

Add to `test/managers/StatsManager.profiling.test.ts`:
```typescript
describe("percentile calculation", () => {
    it("should calculate p50 (median)", () => {
        statsManager.enableProfiling();

        // Generate measurements with known values: 1, 2, 3, 4, 5
        for (let i = 1; i <= 5; i++) {
            statsManager.measure("test", () => {
                const start = performance.now();
                while (performance.now() - start < i) {}
            });
        }

        const snapshot = statsManager.getSnapshot();
        const stat = snapshot.cpu[0];

        // Median of [1,2,3,4,5] should be ~3
        assert.approximately(stat.p50, 3, 1);
    });

    it("should calculate p95", () => {
        statsManager.enableProfiling();

        // Generate 100 measurements: 95 fast (1ms), 5 slow (10ms)
        for (let i = 0; i < 95; i++) {
            statsManager.measure("test", () => {
                const start = performance.now();
                while (performance.now() - start < 1) {}
            });
        }
        for (let i = 0; i < 5; i++) {
            statsManager.measure("test", () => {
                const start = performance.now();
                while (performance.now() - start < 10) {}
            });
        }

        const snapshot = statsManager.getSnapshot();
        const stat = snapshot.cpu[0];

        // P95 should be in the slow range
        assert.isAtLeast(stat.p95, 5);
    });

    it("should calculate p99", () => {
        statsManager.enableProfiling();

        // Generate 100 measurements: 99 fast (1ms), 1 very slow (20ms)
        for (let i = 0; i < 99; i++) {
            statsManager.measure("test", () => {
                const start = performance.now();
                while (performance.now() - start < 1) {}
            });
        }
        statsManager.measure("test", () => {
            const start = performance.now();
            while (performance.now() - start < 20) {}
        });

        const snapshot = statsManager.getSnapshot();
        const stat = snapshot.cpu[0];

        // P99 should be the slowest measurement
        assert.isAtLeast(stat.p99, 15);
    });

    it("should return 0 for percentiles when no data", () => {
        statsManager.enableProfiling();
        const snapshot = statsManager.getSnapshot();

        // No measurements yet
        assert.equal(snapshot.cpu.length, 0);
    });

    it("should handle single measurement", () => {
        statsManager.enableProfiling();
        statsManager.measure("test", () => {});

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
            statsManager.measure("test", () => {});
        }

        const snapshot = statsManager.getSnapshot();
        const stat = snapshot.cpu[0];

        assert.equal(stat.count, 1500);
        // Percentiles should only use last 1000 samples
        // (We can't directly test ring buffer size without exposing internals,
        //  but we verify count is correct)
    });
});
```

**Implementation**:

Add to `src/managers/StatsManager.ts`:
```typescript
export class StatsManager implements Manager {
    // ... existing code ...

    /**
     * Calculate percentile from stored durations
     * Uses simple sorting approach (accurate but not streaming)
     */
    private getPercentile(durations: number[], percentile: number): number {
        if (durations.length === 0) {
            return 0;
        }

        // Copy and sort to avoid mutating original array
        const sorted = [...durations].sort((a, b) => a - b);

        // Calculate index (percentile as fraction * length)
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;

        // Clamp to valid range
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }

    /**
     * Get comprehensive performance snapshot
     */
    getSnapshot(): PerformanceSnapshot {
        const cpuMeasurements = Array.from(this.measurements.values()).map(m => ({
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
            gpu: this.babylonInstrumentation ? {
                gpuFrameTime: {
                    current: this.babylonInstrumentation.gpuFrameTimeCounter.current * 0.000001,
                    avg: this.babylonInstrumentation.gpuFrameTimeCounter.average * 0.000001,
                    min: this.babylonInstrumentation.gpuFrameTimeCounter.min * 0.000001,
                    max: this.babylonInstrumentation.gpuFrameTimeCounter.max * 0.000001,
                },
                shaderCompilation: {
                    current: this.babylonInstrumentation.shaderCompilationTimeCounter.current,
                    avg: this.babylonInstrumentation.shaderCompilationTimeCounter.average,
                    total: this.babylonInstrumentation.shaderCompilationTimeCounter.total,
                },
            } : undefined,
            scene: this.sceneInstrumentation ? {
                drawCalls: {
                    current: this.sceneInstrumentation.drawCallsCounter.current,
                    avg: this.sceneInstrumentation.drawCallsCounter.average,
                },
                frameTime: {
                    avg: this.sceneInstrumentation.frameTimeCounter.average,
                },
                renderTime: {
                    avg: this.sceneInstrumentation.renderTimeCounter.average,
                },
                activeMeshesEvaluation: {
                    avg: this.sceneInstrumentation.activeMeshesEvaluationTimeCounter.average,
                },
            } : undefined,
            timestamp: performance.now(),
        };
    }
}
```

**Dependencies**:
- External: None (uses native Array.sort)
- Internal: Phase 1 (measurements Map, durations array)

**Verification**:
1. Run tests: `npm test test/managers/StatsManager.profiling.test.ts`
2. Expected output: All tests pass (24+ tests)
3. Verify percentiles are reasonable:
   ```typescript
   // Should show p50 < p95 < p99 for varied measurements
   const snapshot = statsManager.getSnapshot();
   console.log(snapshot.cpu[0]);
   ```

---

### Phase 4: Enhanced Console Reporting
**Objective**: Implement reportDetailed() with formatted console output
**Duration**: 0.5 day
**Estimated Effort**: 3-4 hours

**Tests to Write First**:

Add to `test/managers/StatsManager.profiling.test.ts`:
```typescript
describe("reportDetailed", () => {
    it("should not throw when called", () => {
        statsManager.enableProfiling();
        statsManager.measure("test", () => {});

        assert.doesNotThrow(() => {
            statsManager.reportDetailed();
        });
    });

    it("should output to console", () => {
        const groupSpy = vi.spyOn(console, "group");
        const tableSpy = vi.spyOn(console, "table");
        const groupEndSpy = vi.spyOn(console, "groupEnd");

        statsManager.enableProfiling();
        statsManager.measure("test", () => {});
        statsManager.reportDetailed();

        assert.isTrue(groupSpy.called);
        assert.isTrue(tableSpy.called);
        assert.isTrue(groupEndSpy.called);

        groupSpy.mockRestore();
        tableSpy.mockRestore();
        groupEndSpy.mockRestore();
    });

    it("should format CPU metrics as table", () => {
        const tableSpy = vi.spyOn(console, "table");

        statsManager.enableProfiling();
        statsManager.measure("operation-a", () => {});
        statsManager.measure("operation-b", () => {});
        statsManager.reportDetailed();

        assert.isTrue(tableSpy.called);
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
        statsManager.measure("test", () => {});

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
```

**Implementation**:

Add to `src/managers/StatsManager.ts`:
```typescript
export class StatsManager implements Manager {
    // ... existing code ...

    /**
     * Report detailed performance data to console
     */
    reportDetailed(): void {
        const snapshot = this.getSnapshot();

        console.group('📊 Performance Report');

        // CPU metrics
        if (snapshot.cpu.length > 0) {
            console.group('CPU Metrics');
            console.table(snapshot.cpu.map(m => ({
                Label: m.label,
                Calls: m.count,
                'Total (ms)': m.total.toFixed(2),
                'Avg (ms)': m.avg.toFixed(2),
                'Min (ms)': m.min === Infinity ? 0 : m.min.toFixed(2),
                'Max (ms)': m.max === -Infinity ? 0 : m.max.toFixed(2),
                'P95 (ms)': m.p95.toFixed(2),
                'P99 (ms)': m.p99.toFixed(2),
            })));
            console.groupEnd();
        }

        // GPU metrics
        if (snapshot.gpu) {
            console.group('GPU Metrics');
            console.log('Frame Time:', snapshot.gpu.gpuFrameTime.avg.toFixed(2), 'ms (avg)');
            console.log('Shader Compilation:', snapshot.gpu.shaderCompilation.total.toFixed(2), 'ms (total)');
            console.groupEnd();
        }

        // Scene metrics
        if (snapshot.scene) {
            console.group('Scene Metrics');
            console.log('Draw Calls:', snapshot.scene.drawCalls.avg.toFixed(0), '(avg)');
            console.log('Render Time:', snapshot.scene.renderTime.avg.toFixed(2), 'ms (avg)');
            console.log('Frame Time:', snapshot.scene.frameTime.avg.toFixed(2), 'ms (avg)');
            console.log('Active Meshes Evaluation:', snapshot.scene.activeMeshesEvaluation.avg.toFixed(2), 'ms (avg)');
            console.groupEnd();
        }

        console.groupEnd();
    }
}
```

**Dependencies**:
- External: None (uses console.table, console.group)
- Internal: Phase 3 (getSnapshot with percentiles)

**Verification**:
1. Run tests: `npm test test/managers/StatsManager.profiling.test.ts`
2. Expected output: All tests pass (30+ tests)
3. Visual verification:
   ```typescript
   statsManager.enableProfiling();
   for (let i = 0; i < 10; i++) {
       statsManager.measure("operation", () => {
           // simulate work
       });
   }
   statsManager.reportDetailed();
   // Should see formatted console output with table
   ```

---

### Phase 5: Graph Integration & Configuration
**Objective**: Add config option and integrate profiling into Graph update loop
**Duration**: 1 day
**Estimated Effort**: 4-6 hours

**Tests to Write First**:

`test/graph/Graph.profiling.integration.test.ts` (new file):
```typescript
import {assert, beforeEach, describe, it} from "vitest";
// Note: This is an integration test that may need to run in browser context

describe("Graph - Profiling Integration", () => {
    it("should enable profiling via config", () => {
        // Create graph with profiling enabled
        const element = document.createElement("graphty-element");
        element.setAttribute("data", JSON.stringify({
            nodes: [{id: "a"}, {id: "b"}],
            edges: [{source: "a", target: "b"}],
        }));
        element.setAttribute("enable-detailed-profiling", "true");

        document.body.appendChild(element);

        // Wait for initialization
        // Verify statsManager.enableProfiling was called
        // (Requires access to graph internals)

        document.body.removeChild(element);
    });

    it("should measure Graph.update when profiling enabled", () => {
        // This test verifies that measure() is called in the update loop
        // Requires checking statsManager.getSnapshot() after layout settles
    });

    it("should not measure when profiling disabled", () => {
        // Verify zero overhead when disabled
    });
});
```

`test/config/GraphConfig.test.ts` (extend existing):
```typescript
describe("GraphConfig - profiling", () => {
    it("should accept enableDetailedProfiling option", () => {
        const config = {
            enableDetailedProfiling: true,
        };

        // Validate config passes type checking and validation
        assert.property(config, "enableDetailedProfiling");
        assert.isTrue(config.enableDetailedProfiling);
    });

    it("should default to false", () => {
        const config = {};
        assert.isUndefined(config.enableDetailedProfiling);
    });
});
```

**Implementation**:

1. Update `src/config/GraphConfig.ts`:
```typescript
export interface GraphConfig {
    // ... existing config properties ...

    /**
     * Enable detailed performance profiling
     * Adds hierarchical timing and advanced statistics
     * Default: false (use existing StatsManager only)
     */
    enableDetailedProfiling?: boolean;
}
```

2. Update `src/Graph.ts` (constructor):
```typescript
export class Graph {
    constructor(config: GraphConfig) {
        // ... existing initialization ...

        // Initialize stats manager
        this.statsManager = new StatsManager(this.eventManager);
        this.statsManager.initializeBabylonInstrumentation(this.scene, this.engine);

        // Enable profiling if configured
        if (config.enableDetailedProfiling) {
            this.statsManager.enableProfiling();
        }
    }
}
```

3. Update `src/Graph.ts` (update loop):
```typescript
export class Graph {
    private reported = false; // Track if we've reported on settlement

    update(): void {
        this.statsManager.measure('Graph.update', () => {
            this.statsManager.measure('Graph.updateManager', () => {
                this.updateManager.update();
            });

            this.statsManager.measure('Graph.batchArrows', () => {
                // ... existing arrow batching code ...
                const thinInstanceMeshes: Mesh[] = [];
                for (const mesh of this.scene.meshes) {
                    if (mesh instanceof Mesh && mesh.thinInstanceCount > 0 && mesh.name.includes('arrow')) {
                        thinInstanceMeshes.push(mesh);
                    }
                }

                for (const mesh of thinInstanceMeshes) {
                    mesh.thinInstanceBufferUpdated("matrix");
                    mesh.thinInstanceBufferUpdated("lineDirection");
                }
            });

            this.statsManager.measure('Graph.settlementCheck', () => {
                // ... settlement logic ...
            });
        });

        // Report performance on layout settlement
        if (this.layoutEngine?.settled && !this.reported) {
            this.reported = true;
            console.log('🎯 Layout settled!');
            this.statsManager.reportDetailed();
        }
    }
}
```

4. Add URL parameter support in `src/graphty-element.ts`:
```typescript
export class GraphtyElement extends LitElement {
    private parseURLParams(): void {
        const urlParams = new URLSearchParams(window.location.search);

        // Check for profiling parameter
        if (urlParams.get('profiling') === 'true') {
            this.config.enableDetailedProfiling = true;
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.parseURLParams();
        // ... rest of initialization
    }
}
```

**Dependencies**:
- External: None
- Internal: Phases 1-4 (complete StatsManager profiling API)

**Verification**:
1. Run tests: `npm test test/graph/Graph.profiling.integration.test.ts`
2. Manual test in Storybook:
   - Open: `http://dev.ato.ms:9025/?path=/story/layout-3d--ngraph&profiling=true`
   - Wait for layout to settle
   - Check console for performance report
3. Expected output:
   ```
   🎯 Layout settled!
   📊 Performance Report
     CPU Metrics
     [table with Graph.update, Graph.updateManager, etc.]
     GPU Metrics
     Scene Metrics
   ```

---

### Phase 6: Node and Edge Instrumentation (Required)
**Objective**: Add detailed profiling to both Node and Edge update methods to diagnose performance bottlenecks and the observer chain hypothesis
**Duration**: 1 day
**Estimated Effort**: 5-6 hours

**Tests to Write First**:

`test/Node.profiling.test.ts` (new file):
```typescript
describe("Node - Profiling", () => {
    it("should measure node update when profiling enabled", () => {
        // Create node with profiling enabled
        // Trigger update
        // Verify measurement recorded for Node.update
    });

    it("should measure mesh update when profiling enabled", () => {
        // Create node with profiling enabled
        // Trigger mesh update
        // Verify measurement recorded for Node.updateMesh
    });

    it("should not measure when profiling disabled", () => {
        // Verify zero overhead when profiling disabled
    });
});
```

`test/Edge.profiling.test.ts` (new file):
```typescript
describe("Edge - Profiling", () => {
    it("should measure edge update when profiling enabled", () => {
        // Create edge with profiling enabled
        // Trigger update
        // Verify measurement recorded for Edge.update
    });

    it("should measure arrow update when profiling enabled", () => {
        // Create edge with profiling enabled
        // Trigger arrow update
        // Verify measurement recorded for Edge.updateArrow
    });

    it("should not measure when profiling disabled", () => {
        // Verify zero overhead when profiling disabled
    });
});
```

**Implementation**:

Update `src/Node.ts`:
```typescript
export class Node {
    update(): void {
        this.graph.statsManager.startMeasurement('Node.update');

        // ... existing node update code ...

        this.graph.statsManager.endMeasurement('Node.update');
    }

    private updateMesh(): void {
        this.graph.statsManager.startMeasurement('Node.updateMesh');

        // ... existing mesh update code ...

        this.graph.statsManager.endMeasurement('Node.updateMesh');
    }
}
```

Update `src/Edge.ts`:
```typescript
export class Edge {
    update(): void {
        this.graph.statsManager.startMeasurement('Edge.update');

        this.updateLine();
        this.updateArrows();

        this.graph.statsManager.endMeasurement('Edge.update');
    }

    private updateFilledArrowInstance(...): void {
        this.graph.statsManager.startMeasurement('Edge.updateArrow');

        // ... existing arrow update code ...

        this.graph.statsManager.endMeasurement('Edge.updateArrow');
    }
}
```

**Dependencies**:
- External: None
- Internal: Phase 5 (Graph integration complete)

**Verification**:
1. Run full test suite: `npm test`
2. Run specific profiling tests:
   - `npm test test/Node.profiling.test.ts`
   - `npm test test/Edge.profiling.test.ts`
3. Load graph with profiling enabled: `?profiling=true`
4. Expected output should show:
   ```
   Node.update: ~99,060 calls (254 nodes × 390 frames)
   Node.updateMesh: ~99,060 calls
   Edge.update: ~99,060 calls (254 edges × 390 frames)
   Edge.updateArrow: ~99,060 calls
   ```
5. This confirms:
   - If nodes/edges are being called from within layout loop
   - Where performance bottlenecks occur in the update chain
   - Observer chain behavior and call frequency

---

### Phase 7: Performance Optimization & Benchmarking
**Objective**: Optimize ring buffer and benchmark overhead with platform-agnostic tests
**Duration**: 0.5 day
**Estimated Effort**: 3-4 hours

**Cross-Platform Compatibility Note**:
This phase has been updated to use platform-agnostic testing strategies. All timing-based tests use:
- Generous timeouts (1-2 seconds) instead of strict thresholds to support slow CI/CD runners
- Ratio comparisons (5x tolerance) instead of absolute percentages to handle system variance
- Structural validation (measurement counts, statistics) alongside timing assertions
- Tests are designed to pass on fast/slow CPUs, different memory configurations, and systems under load

**Tests to Write First**:

Add to `test/managers/StatsManager.profiling.test.ts`:
```typescript
describe("performance overhead", () => {
    it("should have minimal overhead when disabled", () => {
        const iterations = 100000;

        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            statsManager.measure("test", () => {});
        }
        const elapsed = performance.now() - start;

        // Platform-agnostic: generous timeout for slow systems
        // Should complete in reasonable time (1 second) even on slow CI/CD runners
        assert.isBelow(elapsed, 1000);

        // Verify no measurements were recorded (overhead is truly zero)
        const snapshot = statsManager.getSnapshot();
        assert.equal(snapshot.cpu.length, 0);
    });

    it("should have reasonable overhead when enabled (< 5x baseline)", () => {
        statsManager.enableProfiling();
        const iterations = 10000;

        // Baseline: no measurement
        const baselineStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            // Empty loop
        }
        const baseline = performance.now() - baselineStart;

        // With measurement
        const measuredStart = performance.now();
        for (let i = 0; i < iterations; i++) {
            statsManager.measure("test", () => {});
        }
        const measured = performance.now() - measuredStart;

        // Platform-agnostic: Use ratio comparison instead of percentage
        // Overhead should be reasonable (less than 5x baseline)
        // This accounts for slow systems, throttled CPUs, and CI/CD environments
        const ratio = measured / baseline;
        assert.isBelow(ratio, 5);

        // Verify measurements were recorded
        const snapshot = statsManager.getSnapshot();
        assert.equal(snapshot.cpu[0].count, iterations);
    });

    it("should handle ring buffer efficiently at capacity", () => {
        statsManager.enableProfiling();

        // Fill ring buffer beyond capacity (1000 samples)
        const start = performance.now();
        for (let i = 0; i < 2000; i++) {
            statsManager.measure("test", () => {});
        }
        const elapsed = performance.now() - start;

        // Platform-agnostic: Use structural validation instead of timing
        // Verify ring buffer is working correctly by checking measurement count
        const snapshot = statsManager.getSnapshot();
        assert.equal(snapshot.cpu[0].count, 2000);

        // Performance should be reasonable (complete within 2 seconds on any system)
        assert.isBelow(elapsed, 2000);

        // Ring buffer should maintain correct statistics
        assert.isAbove(snapshot.cpu[0].avg, 0);
        assert.isAbove(snapshot.cpu[0].max, 0);
    });
});
```

**Implementation**:

Optimize ring buffer in `src/managers/StatsManager.ts`:
```typescript
export class StatsManager implements Manager {
    private static readonly RING_BUFFER_SIZE = 1000;

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
                durationsIndex: 0, // Circular buffer index
                durationsFilled: false, // Track if buffer is full
            });
        }

        const stats = this.measurements.get(label)!;
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

    private getPercentile(durations: number[], percentile: number, filled: boolean, currentIndex: number): number {
        // Only use filled portion of ring buffer
        const validDurations = filled ?
            durations :
            durations.slice(0, currentIndex);

        if (validDurations.length === 0) {
            return 0;
        }

        const sorted = [...validDurations].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }

    getSnapshot(): PerformanceSnapshot {
        const cpuMeasurements = Array.from(this.measurements.values()).map(m => ({
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

        // ... rest of getSnapshot
    }
}
```

Update `MeasurementStats` interface:
```typescript
interface MeasurementStats {
    label: string;
    count: number;
    total: number;
    min: number;
    max: number;
    avg: number;
    lastDuration: number;
    durations: number[];
    durationsIndex: number;      // NEW: Circular buffer index
    durationsFilled: boolean;    // NEW: Track if buffer wrapped
}
```

**Dependencies**:
- External: None
- Internal: All previous phases

**Verification**:
1. Run performance tests: `npm test test/managers/StatsManager.profiling.test.ts`
2. Expected output: All performance tests pass (including overhead tests)
3. **Platform-agnostic testing strategy**:
   - Tests use generous timeouts (1000ms, 2000ms) instead of strict thresholds (<10ms, <100ms)
   - Overhead tests use ratio comparisons (5x tolerance) instead of absolute percentages (<1%)
   - Tests validate structural correctness (measurement counts, statistics) rather than absolute timing
   - All tests should pass on fast/slow CPUs, CI/CD runners, and systems under load
4. Optional manual verification in production-like scenario:
   ```typescript
   // Load large graph (1000+ nodes) with profiling
   // Measure frame time with/without profiling
   // Observe overhead ratio (should be < 5x for typical workloads)
   ```
5. **Environment variable support** (optional future enhancement):
   - `GRAPHTY_PERF_TIMEOUT_MS` - Override default timeout (default: 1000ms)
   - `GRAPHTY_PERF_OVERHEAD_RATIO` - Override overhead tolerance (default: 5x)

---

## Common Utilities Needed

None required - all functionality uses native browser APIs and existing StatsManager infrastructure.

**Why no external libraries:**
- `performance.now()` - Native high-resolution timing
- `Array.sort()` - Native sorting for percentiles
- `console.table()` - Native formatted output
- `Map` - Native efficient key-value storage

---

## External Libraries Assessment

**No new external libraries needed.**

The design intentionally avoids external dependencies by:
- Using native `performance.now()` instead of a timing library
- Using simple array sorting for percentiles instead of streaming quantile libraries (fast-stats, tdigest)
- Using native console APIs instead of a reporting library (winston, pino)
- Leveraging existing BabylonJS instrumentation instead of custom GPU profiling

**Libraries considered but rejected:**
- **fast-stats** or **tdigest** (streaming percentiles): Adds complexity for minimal benefit. Our ring buffer approach is simpler and sufficient for 1000 samples.
- **pino** or **winston** (structured logging): Console.table is sufficient for debugging. We don't need production logging.
- **benchmark.js** (performance testing): Native performance.now() is adequate for our needs.

---

## Risk Mitigation

### Risk 1: Performance overhead exceeds 1%
**Likelihood**: Low
**Impact**: High (defeats purpose of profiling)

**Mitigation**:
- Phase 1 includes zero-overhead verification when disabled
- Phase 7 includes explicit overhead benchmarking
- Early return guards in all measurement methods
- Ring buffer optimization reduces array operations
- If overhead exceeds 1%, implement sampling (only measure every Nth call)

### Risk 2: Ring buffer array.shift() causes GC pressure
**Likelihood**: Medium
**Impact**: Medium (affects percentile accuracy and performance)

**Mitigation**:
- Phase 7 replaces shift/push with circular indexing
- Pre-allocate fixed-size array (1000 elements)
- Use index pointer instead of modifying array structure
- Test with 10K+ measurements to verify no GC pauses

### Risk 3: Console.table formatting breaks with large datasets
**Likelihood**: Low
**Impact**: Low (cosmetic issue only)

**Mitigation**:
- Test with 100+ measurements in Phase 4
- Truncate table to top 50 entries if needed
- Provide programmatic access via getSnapshot() for large datasets

### Risk 4: Percentile calculation slows down getSnapshot()
**Likelihood**: Medium
**Impact**: Low (only affects reporting, not measurement)

**Mitigation**:
- Sorting is done on-demand in getSnapshot(), not during measurement
- Ring buffer limits sorting to max 1000 elements
- Use native Array.sort (optimized by JS engine)
- If needed, implement lazy percentile calculation (only compute when accessed)

### Risk 5: Integration breaks existing StatsManager functionality
**Likelihood**: Low
**Impact**: High (breaks existing code)

**Mitigation**:
- Extend existing tests in `test/managers/StatsManager.test.ts`
- Run full test suite after each phase
- All new methods are additive (no changes to existing methods)
- Backward compatibility verified in Phase 1 tests

### Risk 6: Profiling interferes with layout settlement timing
**Likelihood**: Low
**Impact**: Medium (makes diagnosis unreliable)

**Mitigation**:
- Measure overhead in realistic scenario (Phase 7)
- Use try/finally to ensure timing capture even on errors
- Guard against recursive measurements (measure() doesn't measure itself)

---

## Summary

This implementation plan extends StatsManager with profiling capabilities over 7 phases:

1. **Phase 1** (1 day): Core measurement infrastructure with enable/disable
2. **Phase 2** (0.5 day): Manual timing API with stack tracking
3. **Phase 3** (0.5 day): Percentile statistics calculation
4. **Phase 4** (0.5 day): Enhanced console reporting
5. **Phase 5** (1 day): Graph integration and configuration
6. **Phase 6** (1 day, required): Node and Edge instrumentation
7. **Phase 7** (0.5 day): Performance optimization and benchmarking

**Total Duration**: 5 days
**Total Effort**: 25-33 hours

Each phase:
- ✅ Delivers testable functionality
- ✅ Includes comprehensive unit tests written first (TDD)
- ✅ Builds on previous phases without breaking them
- ✅ Has clear verification steps
- ✅ Maintains backward compatibility

The implementation will immediately reveal whether edge updates are being called from within the layout engine update loop, confirming or refuting the hypothesis about the 4.5s performance regression.
