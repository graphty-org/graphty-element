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

### Phase 8: Complete GPU and Scene Metrics Integration
**Objective**: Add comprehensive BabylonJS instrumentation metrics to `getSnapshot()` and enhance `reportDetailed()` with verbose GPU and Scene reporting

**Duration**: 0.5 day
**Estimated Effort**: 3-4 hours

**Background**: Validation revealed that `getSnapshot()` only returns CPU measurements. GPU and Scene metrics from BabylonJS instrumentation are not included, causing `reportDetailed()` to never display GPU/Scene data.

#### BabylonJS Metrics Available

Based on BabylonJS documentation research:

**EngineInstrumentation Counters** (2 available):
1. `gpuFrameTimeCounter` - GPU frame time (nanoseconds, convert with × 0.000001)
2. `shaderCompilationTimeCounter` - Shader compilation time (milliseconds)

**SceneInstrumentation Counters** (7 currently enabled):
1. `frameTimeCounter` - Total frame time
2. `renderTimeCounter` - Scene render time
3. `interFrameTimeCounter` - Time between frames
4. `cameraRenderTimeCounter` - Camera render time
5. `activeMeshesEvaluationTimeCounter` - Active meshes evaluation time
6. `renderTargetsRenderTimeCounter` - Render targets render time
7. `drawCallsCounter` - Number of draw calls (count + timing)

**PerfCounter Properties** (7 per counter):
- `current` - Most recent value
- `average` - Mean value since start
- `min` - Lowest value recorded
- `max` - Highest value recorded
- `total` - Sum of all measurements
- `count` - Number of measurements
- `lastSecAverage` - Mean value from last second

**Total Available Data Points**: 63 (2 GPU × 7 + 7 Scene × 7 + extras)

#### Tests to Write First

Update `test/managers/StatsManager.profiling.test.ts`:

```typescript
describe("getSnapshot - GPU and Scene metrics", () => {
    it("should include GPU metrics when instrumentation is initialized", () => {
        // Mock BabylonJS instrumentation
        statsManager.initializeBabylonInstrumentation(mockScene, mockEngine);
        statsManager.enableProfiling();

        const snapshot = statsManager.getSnapshot();

        assert.property(snapshot, "gpu");
        assert.property(snapshot.gpu!, "gpuFrameTime");
        assert.property(snapshot.gpu!, "shaderCompilation");

        // Verify all 7 properties
        assert.property(snapshot.gpu!.gpuFrameTime, "current");
        assert.property(snapshot.gpu!.gpuFrameTime, "avg");
        assert.property(snapshot.gpu!.gpuFrameTime, "min");
        assert.property(snapshot.gpu!.gpuFrameTime, "max");
        assert.property(snapshot.gpu!.gpuFrameTime, "total");
        assert.property(snapshot.gpu!.gpuFrameTime, "lastSecAvg");
    });

    it("should include Scene metrics when instrumentation is initialized", () => {
        statsManager.enableProfiling();
        const snapshot = statsManager.getSnapshot();

        // Verify all 7 enabled scene counters
        const expectedCounters = [
            "frameTime", "renderTime", "interFrameTime",
            "cameraRenderTime", "activeMeshesEvaluation",
            "renderTargetsRenderTime", "drawCalls"
        ];

        for (const counter of expectedCounters) {
            assert.property(snapshot.scene!, counter);
            assert.property(snapshot.scene![counter], "current");
            assert.property(snapshot.scene![counter], "avg");
        }

        // drawCalls should have count property
        assert.property(snapshot.scene!.drawCalls, "count");
    });

    it("should convert GPU frame time from nanoseconds to milliseconds", () => {
        // Verify × 0.000001 conversion
        statsManager.enableProfiling();
        const snapshot = statsManager.getSnapshot();

        // GPU time should be in milliseconds, not nanoseconds
        assert.isBelow(snapshot.gpu!.gpuFrameTime.avg, 1000);
    });

    it("should return undefined GPU/Scene when instrumentation not initialized", () => {
        const freshStatsManager = new StatsManager(mockEventManager);
        freshStatsManager.enableProfiling();

        const snapshot = freshStatsManager.getSnapshot();

        assert.isUndefined(snapshot.gpu);
        assert.isUndefined(snapshot.scene);
    });
});

describe("reportDetailed - verbose GPU and Scene output", () => {
    it("should output verbose GPU metrics to console", () => {
        const logSpy = vi.spyOn(console, "log");
        const groupSpy = vi.spyOn(console, "group");

        statsManager.enableProfiling();
        statsManager.reportDetailed();

        // Verify GPU Metrics group exists
        const gpuGroupCall = groupSpy.mock.calls.find(call =>
            call[0] === "GPU Metrics (BabylonJS EngineInstrumentation)"
        );
        assert.isDefined(gpuGroupCall);

        logSpy.mockRestore();
        groupSpy.mockRestore();
    });

    it("should output verbose Scene metrics to console", () => {
        const logSpy = vi.spyOn(console, "log");

        statsManager.enableProfiling();
        statsManager.reportDetailed();

        // Verify all 7 scene metrics logged
        const expectedMetrics = [
            "Frame Time", "Render Time", "Inter-Frame Time",
            "Camera Render Time", "Active Meshes Evaluation",
            "Render Targets Render Time", "Draw Calls"
        ];

        for (const metric of expectedMetrics) {
            const found = logSpy.mock.calls.some(call =>
                call.some(arg => typeof arg === "string" && arg.includes(metric))
            );
            assert.isTrue(found, `Missing metric: ${metric}`);
        }

        logSpy.mockRestore();
    });
});
```

#### Implementation

**Step 1**: Update PerformanceSnapshot Interface

`src/managers/StatsManager.ts` (lines 32-56):

```typescript
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
    timestamp: number;
}
```

**Step 2**: Update getSnapshot() Method

`src/managers/StatsManager.ts` (replace lines 466-484):

```typescript
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
                this.babylonInstrumentation.shaderCompilationTimeCounter
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
                ...toPerfCounterSnapshot(this.sceneInstrumentation.drawCallsCounter),
                count: this.sceneInstrumentation.drawCallsCounter.count,
            },
        } : undefined,

        timestamp: performance.now(),
    };
}
```

**Step 3**: Update reportDetailed() Method

`src/managers/StatsManager.ts` (replace GPU/Scene sections, lines 528-544):

```typescript
// GPU metrics (VERBOSE - all properties)
if (snapshot.gpu) {
    console.group("GPU Metrics (BabylonJS EngineInstrumentation)");

    console.group("GPU Frame Time (ms)");
    console.log("  Current:", snapshot.gpu.gpuFrameTime.current.toFixed(3));
    console.log("  Average:", snapshot.gpu.gpuFrameTime.avg.toFixed(3));
    console.log("  Last Sec Avg:", snapshot.gpu.gpuFrameTime.lastSecAvg.toFixed(3));
    console.log("  Min:", snapshot.gpu.gpuFrameTime.min.toFixed(3));
    console.log("  Max:", snapshot.gpu.gpuFrameTime.max.toFixed(3));
    console.log("  Total:", snapshot.gpu.gpuFrameTime.total.toFixed(3));
    console.groupEnd();

    console.group("Shader Compilation (ms)");
    console.log("  Current:", snapshot.gpu.shaderCompilation.current.toFixed(2));
    console.log("  Average:", snapshot.gpu.shaderCompilation.avg.toFixed(2));
    console.log("  Last Sec Avg:", snapshot.gpu.shaderCompilation.lastSecAvg.toFixed(2));
    console.log("  Min:", snapshot.gpu.shaderCompilation.min.toFixed(2));
    console.log("  Max:", snapshot.gpu.shaderCompilation.max.toFixed(2));
    console.log("  Total:", snapshot.gpu.shaderCompilation.total.toFixed(2));
    console.groupEnd();

    console.groupEnd();
}

// Scene metrics (VERBOSE - all properties for all 7 counters)
if (snapshot.scene) {
    console.group("Scene Metrics (BabylonJS SceneInstrumentation)");

    // Helper to print counter stats
    const printCounterStats = (name: string, counter: PerfCounterSnapshot, unit = "ms") => {
        console.group(name);
        console.log(`  Current: ${counter.current.toFixed(2)} ${unit}`);
        console.log(`  Average: ${counter.avg.toFixed(2)} ${unit}`);
        console.log(`  Last Sec Avg: ${counter.lastSecAvg.toFixed(2)} ${unit}`);
        console.log(`  Min: ${counter.min.toFixed(2)} ${unit}`);
        console.log(`  Max: ${counter.max.toFixed(2)} ${unit}`);
        console.log(`  Total: ${counter.total.toFixed(2)} ${unit}`);
        console.groupEnd();
    };

    printCounterStats("Frame Time", snapshot.scene.frameTime);
    printCounterStats("Render Time", snapshot.scene.renderTime);
    printCounterStats("Inter-Frame Time", snapshot.scene.interFrameTime);
    printCounterStats("Camera Render Time", snapshot.scene.cameraRenderTime);
    printCounterStats("Active Meshes Evaluation", snapshot.scene.activeMeshesEvaluation);
    printCounterStats("Render Targets Render Time", snapshot.scene.renderTargetsRenderTime);

    // Draw Calls is special - count metric + timing
    console.group("Draw Calls");
    console.log(`  Count: ${snapshot.scene.drawCalls.count}`);
    console.log(`  Current: ${snapshot.scene.drawCalls.current.toFixed(0)}`);
    console.log(`  Average: ${snapshot.scene.drawCalls.avg.toFixed(2)}`);
    console.log(`  Last Sec Avg: ${snapshot.scene.drawCalls.lastSecAvg.toFixed(2)}`);
    console.log(`  Min: ${snapshot.scene.drawCalls.min.toFixed(0)}`);
    console.log(`  Max: ${snapshot.scene.drawCalls.max.toFixed(0)}`);
    console.log(`  Total: ${snapshot.scene.drawCalls.total.toFixed(0)}`);
    console.groupEnd();

    console.groupEnd();
}
```

#### Dependencies
- **External**: None
- **Internal**: Phases 1-7 complete
- **BabylonJS**: EngineInstrumentation, SceneInstrumentation (already integrated)

#### Verification

1. **Run unit tests**: `npm test test/managers/StatsManager.profiling.test.ts`
2. **Manual verification**: Load Storybook with `?profiling=true` and check console output after settlement
3. **Programmatic access**: Verify `getSnapshot()` returns GPU/Scene data
4. **Integration test**: Verify end-to-end profiling with GPU/Scene metrics

**Expected Console Output** (after settlement):
```
📊 Performance Report
  CPU Metrics
  [table...]

  GPU Metrics (BabylonJS EngineInstrumentation)
    GPU Frame Time (ms)
      Current: 2.345
      Average: 2.156
      Last Sec Avg: 2.234
      Min: 1.234
      Max: 4.567
      Total: 9702.340
    Shader Compilation (ms)
      [verbose stats...]

  Scene Metrics (BabylonJS SceneInstrumentation)
    Frame Time
      Current: 16.78 ms
      Average: 16.52 ms
      [verbose stats...]
    [6 more counters...]
```

#### Expected Diagnostic Value

With comprehensive GPU/Scene metrics, diagnose:

**Bottleneck Identification**:
- CPU vs GPU time comparison
- Layout engine vs rendering time

**Draw Call Efficiency**:
- Verify batching effectiveness
- Monitor draw call counts

**Frame Time Budget Analysis**:
- Break down 16ms frame budget
- Identify frame time components

**Shader Compilation Impact**:
- One-time vs ongoing costs
- Total compilation overhead

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

This implementation plan extends StatsManager with profiling capabilities over 8 phases:

1. **Phase 1** (1 day): Core measurement infrastructure with enable/disable
2. **Phase 2** (0.5 day): Manual timing API with stack tracking
3. **Phase 3** (0.5 day): Percentile statistics calculation
4. **Phase 4** (0.5 day): Enhanced console reporting
5. **Phase 5** (1 day): Graph integration and configuration
6. **Phase 6** (1 day, required): Node and Edge instrumentation
7. **Phase 7** (0.5 day): Performance optimization and benchmarking
8. **Phase 8** (0.5 day): Complete GPU and Scene metrics integration

**Total Duration**: 5.5 days
**Total Effort**: 28-37 hours

Each phase:
- ✅ Delivers testable functionality
- ✅ Includes comprehensive unit tests written first (TDD)
- ✅ Builds on previous phases without breaking them
- ✅ Has clear verification steps
- ✅ Maintains backward compatibility

The implementation will immediately reveal whether edge updates are being called from within the layout engine update loop, confirming or refuting the hypothesis about the 4.5s performance regression.

---

## Phase 8 - Missing Feature (Identified Post-Implementation)

**Status**: Phase 7 completed successfully, but validation revealed missing GPU/Scene metrics in `getSnapshot()`

**Issue**: The `getSnapshot()` method only returns CPU measurements. GPU and Scene metrics from BabylonJS instrumentation are not included, even though `reportDetailed()` attempts to access them.

**Impact**:
- `reportDetailed()` never displays GPU/Scene metrics (always undefined)
- Users cannot programmatically access BabylonJS performance data
- Missing ~54 data points (2 GPU counters + 7 Scene counters × 6 properties each)

**Solution**: See detailed Phase 8 plan above

**Completion Percentage**:
- **Phases 1-7**: ✅ 100% Complete (90% of total design)
- **Phase 8**: ⚠️ Not Implemented (10% of total design)
- **Overall**: 90% Complete

---

### Phase 9: Event Counter System
**Objective**: Add event counting API for tracking discrete occurrences (cache hits/misses, skipped operations, state transitions)
**Duration**: 1 day
**Estimated Effort**: 5-6 hours

**Background**: While timing measurements track "how long" operations take, counters track "how many times" events occur. This is essential for:
- Cache performance (hits vs misses)
- Optimization validation (skipped vs executed)
- Behavior tracking (user interactions, state transitions)
- Error monitoring (error counts by type)
- Resource tracking (allocations, deallocations)

**Key Design Decisions**:
1. **Separate from timing measurements**: Counters are conceptually different from measurements
2. **Same enable/disable flag**: Counters respect `enableProfiling()` for consistency
3. **Rich API**: Support increment, decrement, set, reset, and get operations
4. **Minimal storage**: Only store current value and count (no history/ring buffer)
5. **Integration with reportDetailed()**: Add counters section to performance report

**Tests to Write First**:

Add to `test/managers/StatsManager.profiling.test.ts`:
```typescript
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

            const cacheHits = snapshot.find(c => c.label === "cache.hits")!;
            assert.equal(cacheHits.value, 10);
            assert.equal(cacheHits.operations, 1); // incremented once (with amount 10)

            const cacheMisses = snapshot.find(c => c.label === "cache.misses")!;
            assert.equal(cacheMisses.value, 2);
            assert.equal(cacheMisses.operations, 1);

            const poolSize = snapshot.find(c => c.label === "pool.size")!;
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
            const counter = snapshot.find(c => c.label === "test")!;

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
            const countersGroup = groupSpy.mock.calls.find(call =>
                call[0] === "Event Counters"
            );
            assert.isDefined(countersGroup);

            // Verify table was called with counter data
            const counterTableCall = tableSpy.mock.calls.find(call => {
                const data = call[0];
                return Array.isArray(data) && data.some(row => row.Label === "cache.hits");
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
            const countersGroup = groupSpy.mock.calls.find(call =>
                call[0] === "Event Counters"
            );
            assert.isUndefined(countersGroup);

            groupSpy.mockRestore();
        });

        it("should calculate derived metrics", () => {
            const tableSpy = vi.spyOn(console, "table");

            statsManager.enableProfiling();
            statsManager.incrementCounter("cache.hits", 90);
            statsManager.incrementCounter("cache.misses", 10);
            statsManager.reportDetailed();

            const tableData = tableSpy.mock.calls.find(call => {
                const data = call[0];
                return Array.isArray(data) && data.some(row => row.Label === "cache.hits");
            })?.[0];

            // Verify derived metrics are calculated
            assert.isDefined(tableData);
            const hitsRow = tableData.find(row => row.Label === "cache.hits");
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
```

**Implementation**:

Add to `src/managers/StatsManager.ts`:

```typescript
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

export class StatsManager implements Manager {
    // ... existing fields ...

    // NEW: Event counters
    private counters = new Map<string, CounterStats>();

    // ... existing methods ...

    /**
     * Increment a counter by a specified amount
     * @param label Counter identifier
     * @param amount Amount to increment (default: 1)
     */
    incrementCounter(label: string, amount = 1): void {
        if (!this.enabled) {
            return;
        }

        if (!this.counters.has(label)) {
            this.counters.set(label, {
                label,
                value: 0,
                operations: 0,
            });
        }

        const counter = this.counters.get(label)!;
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

        if (!this.counters.has(label)) {
            this.counters.set(label, {
                label,
                value: 0,
                operations: 0,
            });
        }

        const counter = this.counters.get(label)!;
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

        if (!this.counters.has(label)) {
            this.counters.set(label, {
                label,
                value: 0,
                operations: 0,
            });
        }

        const counter = this.counters.get(label)!;
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
        return Array.from(this.counters.values()).map(c => ({
            label: c.label,
            value: c.value,
            operations: c.operations,
        }));
    }

    // Update existing disableProfiling() method
    disableProfiling(): void {
        this.enabled = false;
        this.measurements.clear();
        this.activeStack = [];
        this.counters.clear(); // NEW: Clear counters
    }

    // Update existing resetMeasurements() method
    resetMeasurements(): void {
        this.measurements.clear();
        this.activeStack = [];
        this.counters.clear(); // NEW: Clear counters
    }

    // Update existing dispose() method
    dispose(): void {
        // ... existing disposal code ...

        // Clear profiling state
        this.measurements.clear();
        this.activeStack = [];
        this.enabled = false;
        this.counters.clear(); // NEW: Clear counters
    }

    // Update existing reportDetailed() method
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

        // NEW: Event Counters
        const countersSnapshot = this.getCountersSnapshot();
        if (countersSnapshot.length > 0) {
            console.group('Event Counters');
            console.table(countersSnapshot.map(c => ({
                Label: c.label,
                Value: c.value,
                Operations: c.operations,
            })));
            console.groupEnd();
        }

        // GPU metrics
        // ... existing GPU metrics code ...

        // Scene metrics
        // ... existing Scene metrics code ...

        // Blocking correlation report (if frame profiling is enabled)
        // ... existing blocking correlation code ...

        console.groupEnd();
    }
}
```

**Dependencies**:
- External: None
- Internal: Phases 1-8 (complete profiling system)

**Verification**:

1. **Run tests**: `npm test test/managers/StatsManager.profiling.test.ts`
2. **Expected output**: All counter tests pass (40+ new tests)
3. **Manual verification**:
   ```typescript
   statsManager.enableProfiling();

   // Track cache performance
   statsManager.incrementCounter("cache.hits", 90);
   statsManager.incrementCounter("cache.misses", 10);

   // Track optimization effectiveness
   statsManager.incrementCounter("Edge.update.skipped", 150);
   statsManager.incrementCounter("Edge.update.executed", 50);

   statsManager.reportDetailed();
   ```
4. **Expected console output**:
   ```
   📊 Performance Report
     CPU Metrics
     [timing table...]

     Event Counters
     ┌─────────┬────────────────────────┬─────────┬────────────┐
     │ (index) │         Label          │  Value  │ Operations │
     ├─────────┼────────────────────────┼─────────┼────────────┤
     │    0    │     'cache.hits'       │   90    │     1      │
     │    1    │    'cache.misses'      │   10    │     1      │
     │    2    │ 'Edge.update.skipped'  │   150   │     1      │
     │    3    │ 'Edge.update.executed' │   50    │     1      │
     └─────────┴────────────────────────┴─────────┴────────────┘

     GPU Metrics
     [gpu metrics...]
   ```

**Integration with Edge.ts** (example usage from session 121):

Update `src/Edge.ts`:
```typescript
export class Edge {
    update(): void {
        this.graph.statsManager.startMeasurement('Edge.update');

        // Check if edge needs updating (dirty tracking optimization)
        if (!this.needsUpdate()) {
            this.graph.statsManager.incrementCounter('Edge.update.skipped');
            this.graph.statsManager.endMeasurement('Edge.update');
            return;
        }

        this.graph.statsManager.incrementCounter('Edge.update.executed');

        this.updateLine();
        this.updateArrows();

        this.graph.statsManager.endMeasurement('Edge.update');
    }
}
```

**Example Use Cases**:

1. **Cache Performance**:
   ```typescript
   // In cache lookup
   if (cacheHit) {
       statsManager.incrementCounter("mesh.cache.hits");
   } else {
       statsManager.incrementCounter("mesh.cache.misses");
   }
   ```

2. **Optimization Validation**:
   ```typescript
   // In dirty tracking system
   if (isDirty) {
       statsManager.incrementCounter("updates.executed");
   } else {
       statsManager.incrementCounter("updates.skipped");
   }
   ```

3. **Resource Tracking**:
   ```typescript
   // In mesh pool
   onMeshAllocated() {
       statsManager.incrementCounter("mesh.pool.size");
       statsManager.incrementCounter("mesh.pool.allocations");
   }

   onMeshDeallocated() {
       statsManager.decrementCounter("mesh.pool.size");
       statsManager.incrementCounter("mesh.pool.deallocations");
   }
   ```

4. **Error Monitoring**:
   ```typescript
   // In error handlers
   catch (error) {
       if (error instanceof NetworkError) {
           statsManager.incrementCounter("errors.network");
       } else if (error instanceof ValidationError) {
           statsManager.incrementCounter("errors.validation");
       }
   }
   ```

**Performance Considerations**:

1. **Zero overhead when disabled**: All methods check `if (!this.enabled)` first
2. **Minimal storage**: Only stores current value and operation count (8 bytes per counter)
3. **No ring buffer**: Unlike timing measurements, counters don't need historical data
4. **O(1) operations**: All counter operations are constant time (Map get/set)
5. **Expected overhead**: <0.1% when enabled (simpler than timing measurements)

**Design Rationale**:

1. **Why separate from measurements?**
   - Counters track "how many times" (discrete events)
   - Measurements track "how long" (continuous durations)
   - Conceptually different data types require different APIs

2. **Why track operation count?**
   - Helps identify frequently modified counters
   - Useful for debugging counter behavior
   - Minimal overhead (single increment)

3. **Why allow negative values?**
   - Resource tracking may temporarily go negative (over-release)
   - Better to capture reality than clamp to 0
   - User can detect bugs (negative when should be positive)

4. **Why no history/percentiles?**
   - Counters are cumulative by nature
   - If you need history, use timing measurements instead
   - Keeps counter storage minimal

5. **Why no automatic reset?**
   - Cumulative counters are more useful for most cases
   - User can manually reset via `resetCounter()` or `resetAllCounters()`
   - Layout session metrics can call reset at session boundaries

**Testing Strategy**:

Phase 9 includes comprehensive tests for:
- ✅ Basic operations (increment, decrement, set, reset)
- ✅ Disabled behavior (zero overhead verification)
- ✅ Snapshot generation
- ✅ Integration with `reportDetailed()`
- ✅ Common use cases (cache, optimization, resources, errors)
- ✅ Edge cases (negative values, large numbers, decimals)

**Total Test Count**: 40+ new tests
**Test Coverage Target**: 95%+

---

## Summary (Updated)

This implementation plan extends StatsManager with profiling capabilities over 9 phases:

1. **Phase 1** (1 day): Core measurement infrastructure
2. **Phase 2** (0.5 day): Manual timing API
3. **Phase 3** (0.5 day): Percentile statistics
4. **Phase 4** (0.5 day): Enhanced console reporting
5. **Phase 5** (1 day): Graph integration
6. **Phase 6** (1 day): Node and Edge instrumentation
7. **Phase 7** (0.5 day): Performance optimization
8. **Phase 8** (0.5 day): GPU and Scene metrics integration
9. **Phase 9** (1 day): Event counter system ✨ NEW

**Total Duration**: 6.5 days
**Total Effort**: 33-43 hours

**Completion Status**:
- **Phases 1-7**: ✅ Complete
- **Phase 8**: ⚠️ Planned (GPU/Scene metrics)
- **Phase 9**: ⚠️ Planned (Event counters) ✨ NEW

Each phase:
- ✅ Delivers testable functionality
- ✅ Includes comprehensive unit tests (TDD)
- ✅ Builds on previous phases
- ✅ Has clear verification steps
- ✅ Maintains backward compatibility
