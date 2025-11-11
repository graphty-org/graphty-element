# Performance Profiling System Design

## Overview

Extend the existing `StatsManager` to provide hierarchical timing measurements, advanced statistical analysis, and enhanced reporting for performance debugging.

**Design Goals:**
1. **Extend, don't replace** - Build on existing `StatsManager` infrastructure
2. **Near-zero overhead when disabled** - Single boolean check, no allocations
3. **Minimal overhead when enabled** - <1% frame time impact via object pooling
4. **Hierarchical measurements** - Track nested call stacks and parent-child relationships
5. **Advanced statistics** - Min/max/avg/p50/p95/p99 using streaming algorithms
6. **Programmatic access** - Data available via API for debugging and analysis
7. **Simple console output** - Clear, grouped tables for quick diagnosis
8. **Backward compatible** - Existing `toString()` and `getStats()` still work

## Key Design Principle

**Reuse Existing Infrastructure**

The current `StatsManager` already has:
- ✅ BabylonJS `EngineInstrumentation` - GPU frame time, shader compilation
- ✅ BabylonJS `SceneInstrumentation` - Draw calls, render time, mesh evaluation
- ✅ Custom `PerfCounter` instances - graphStep, nodeUpdate, edgeUpdate, etc.
- ✅ Report generation - `toString()`, `getStats()`, `getPerformanceSummary()`
- ✅ Event integration - Emits stats-update events

We just need to add:
- 📊 Detailed measurement tracking with `measure()` API
- 📊 Hierarchical call stack tracking
- 📊 Percentile statistics (P95/P99)
- 📊 Enhanced console reporting with grouping
- 📊 Enable/disable profiling mode

---

## Architecture

### Current StatsManager (Existing)

```
┌─────────────────────────────────────────────────────────┐
│                     StatsManager                        │
│  - BabylonJS EngineInstrumentation (GPU metrics)       │
│  - BabylonJS SceneInstrumentation (scene metrics)      │
│  - PerfCounter instances (custom metrics)              │
│  - toString(), getStats(), getPerformanceSummary()     │
└─────────────────────────────────────────────────────────┘
```

### Extended StatsManager (New)

```
┌─────────────────────────────────────────────────────────┐
│                 StatsManager (Extended)                 │
├─────────────────────────────────────────────────────────┤
│ Existing (Keep):                                        │
│  - EngineInstrumentation (GPU frame time, shaders)     │
│  - SceneInstrumentation (draw calls, render time)      │
│  - PerfCounter instances (graphStep, nodeUpdate, etc.) │
│  - toString(), getStats(), getPerformanceSummary()     │
├─────────────────────────────────────────────────────────┤
│ New (Add):                                              │
│  - Detailed measurements Map<string, MeasurementStats> │
│  - Hierarchical tracking (activeStack: string[])       │
│  - measure() API for automatic timing                  │
│  - start()/end() API for manual timing                 │
│  - enable()/disable() profiling mode                   │
│  - reportDetailed() with console tables                │
│  - getSnapshot() for programmatic access               │
└─────────────────────────────────────────────────────────┘
```

---

## API Design

### New Methods to Add to StatsManager

```typescript
export class StatsManager implements Manager {
    // ===== EXISTING (KEEP AS-IS) =====
    private sceneInstrumentation: SceneInstrumentation | null = null;
    private babylonInstrumentation: EngineInstrumentation | null = null;
    graphStep = new PerfCounter();
    nodeUpdate = new PerfCounter();
    edgeUpdate = new PerfCounter();
    arrowCapUpdate = new PerfCounter();

    initializeBabylonInstrumentation(scene: Scene, engine: Engine): void { /* existing */ }
    toString(): string { /* existing */ }
    getStats(): { /* existing */ }
    getPerformanceSummary(): { /* existing */ }

    // ===== NEW (ADD) =====
    private enabled = false;
    private measurements = new Map<string, MeasurementStats>();
    private activeStack: Array<{ label: string; startTime: number }> = [];

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
    }

    /**
     * Measure synchronous code execution
     */
    measure<T>(label: string, fn: () => T): T {
        if (!this.enabled) return fn();

        const start = performance.now();
        try {
            return fn();
        } finally {
            const duration = performance.now() - start;
            this.recordMeasurement(label, duration);
        }
    }

    /**
     * Measure async code execution
     */
    async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
        if (!this.enabled) return await fn();

        const start = performance.now();
        try {
            return await fn();
        } finally {
            const duration = performance.now() - start;
            this.recordMeasurement(label, duration);
        }
    }

    /**
     * Start manual timing
     */
    startMeasurement(label: string): void {
        if (!this.enabled) return;
        this.activeStack.push({ label, startTime: performance.now() });
    }

    /**
     * End manual timing
     */
    endMeasurement(label: string): void {
        if (!this.enabled) return;

        const entry = this.activeStack.pop();
        if (!entry || entry.label !== label) {
            console.warn(`StatsManager: Mismatched measurement end for "${label}"`);
            return;
        }

        const duration = performance.now() - entry.startTime;
        this.recordMeasurement(label, duration);
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
                // Percentiles calculated on-demand
                durations: [], // Ring buffer for percentile calculation
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

    /**
     * Calculate percentile from stored durations
     */
    private getPercentile(durations: number[], percentile: number): number {
        if (durations.length === 0) return 0;
        const sorted = [...durations].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
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

    /**
     * Reset detailed measurements (keep BabylonJS instrumentation running)
     */
    resetMeasurements(): void {
        this.measurements.clear();
        this.activeStack = [];
    }
}

// New types
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
```

---

## Usage Examples

### Basic Usage in Graph.ts

```typescript
// In Graph.ts constructor
constructor(config: GraphConfig) {
    // ... existing code ...

    this.statsManager = new StatsManager(this.eventManager);

    // Initialize BabylonJS instrumentation (existing)
    this.statsManager.initializeBabylonInstrumentation(this.scene, this.engine);

    // Enable detailed profiling if configured
    if (config.enableDetailedProfiling) {
        this.statsManager.enableProfiling();
    }
}

// In Graph.ts update loop
update(): void {
    this.statsManager.measure('Graph.update', () => {
        this.statsManager.measure('Graph.updateManager', () => {
            this.updateManager.update();
        });

        this.statsManager.measure('Graph.batchArrows', () => {
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
            // ... settlement logic
        });
    });

    // On settlement, report performance
    if (this.layoutEngine?.settled && !this.reported) {
        this.reported = true;

        console.log('🎯 Layout settled!');
        this.statsManager.reportDetailed();

        // Can also get raw snapshot for programmatic analysis
        const snapshot = this.statsManager.getSnapshot();
        // Access snapshot.cpu, snapshot.gpu, snapshot.scene as needed
    }
}
```

### Manual Timing in Edge.ts

```typescript
// In Edge.ts
update(): void {
    this.graph.statsManager.startMeasurement('Edge.update');

    this.updateLine();
    this.updateArrows();

    this.graph.statsManager.endMeasurement('Edge.update');
}

private updateFilledArrowInstance(...): void {
    this.graph.statsManager.startMeasurement('Edge.updateArrow');

    const matrix = Matrix.Translation(position.x, position.y, position.z);
    arrowMesh.thinInstanceSetMatrixAt(instanceIndex, matrix);
    arrowMesh.thinInstanceSetAttributeAt("lineDirection", instanceIndex, [
        lineDirection.x,
        lineDirection.y,
        lineDirection.z,
    ]);

    this.graph.statsManager.endMeasurement('Edge.updateArrow');
}
```

### Configuration

```typescript
// In GraphConfig interface
export interface GraphConfig {
    // ... existing config ...

    /**
     * Enable detailed performance profiling
     * Adds hierarchical timing and advanced statistics
     * Default: false (use existing StatsManager only)
     */
    enableDetailedProfiling?: boolean;
}
```

---

## Expected Console Output

```
🎯 Layout settled!
📊 Performance Report
  CPU Metrics
  ┌─────────┬─────────────────────┬───────┬────────────┬───────────┬───────────┬───────────┬───────────┬───────────┐
  │ (index) │        Label        │ Calls │ Total (ms) │  Avg (ms) │  Min (ms) │  Max (ms) │  P95 (ms) │  P99 (ms) │
  ├─────────┼─────────────────────┼───────┼────────────┼───────────┼───────────┼───────────┼───────────┼───────────┤
  │    0    │  Graph.update       │  390  │  6520.34   │   16.72   │   15.21   │   25.43   │   18.32   │   20.12   │
  │    1    │  Graph.updateManager│  390  │  5830.12   │   14.95   │   13.45   │   22.11   │   16.23   │   18.45   │
  │    2    │  Graph.batchArrows  │  390  │   342.18   │    0.88   │    0.72   │    2.34   │    1.12   │    1.45   │
  │    3    │  Edge.update        │ 99060 │  2340.56   │    0.024  │    0.018  │    0.142  │    0.032  │    0.045  │
  │    4    │  Edge.updateArrow   │ 99060 │  1820.34   │    0.018  │    0.014  │    0.098  │    0.024  │    0.035  │
  └─────────┴─────────────────────┴───────┴────────────┴───────────┴───────────┴───────────┴───────────┴───────────┘

  GPU Metrics
    Frame Time: 2.34 ms (avg)
    Shader Compilation: 45.67 ms (total)

  Scene Metrics
    Draw Calls: 18 (avg)
    Render Time: 3.12 ms (avg)
    Frame Time: 16.78 ms (avg)
    Active Meshes Evaluation: 0.12 ms (avg)
```

**From this output, we can immediately diagnose:**
- ✅ GPU is NOT the bottleneck (2.34ms GPU vs 14.95ms CPU for layout)
- ✅ Draw calls are low (18) - batching is working
- ✅ Render time is low (3.12ms) - rendering is efficient
- ❌ Layout engine is the bottleneck (5830ms / 6520ms = 89.4% of time)
- 🔍 Edge updates are being called 99,060 times (254 edges × 390 frames)
- 🔍 Edge updates contribute 2340ms to total time (36% of total)

**This reveals the issue:** Edge updates are likely being called FROM WITHIN the layout engine update loop via observers!

---

## Implementation Plan

### Phase 1: Add Measurement Tracking (2 hours)

**File:** `src/managers/StatsManager.ts`

1. Add private fields:
   - `enabled: boolean`
   - `measurements: Map<string, MeasurementStats>`
   - `activeStack: Array<{ label: string; startTime: number }>`

2. Add measurement methods:
   - `enableProfiling()` / `disableProfiling()`
   - `measure<T>(label, fn)` - wrap synchronous code
   - `measureAsync<T>(label, fn)` - wrap async code
   - `startMeasurement(label)` / `endMeasurement(label)` - manual timing
   - `recordMeasurement(label, duration)` - private helper

3. Add basic statistics:
   - Track count, total, min, max, avg
   - Store durations in ring buffer (max 1000 samples)

4. Write unit tests for measurement API

### Phase 2: Add Percentile Calculation (1 hour)

**File:** `src/managers/StatsManager.ts`

1. Implement `getPercentile(durations, percentile)` method
   - Sort durations array (copy to avoid mutation)
   - Calculate index based on percentile
   - Return value at index

2. Update measurement stats to include:
   - `p50`, `p95`, `p99` in `getSnapshot()`

3. Test percentile accuracy with known datasets

### Phase 3: Add Enhanced Reporting (1 hour)

**File:** `src/managers/StatsManager.ts`

1. Add `getSnapshot()` method:
   - Collect CPU measurements with percentiles
   - Collect GPU metrics from `babylonInstrumentation`
   - Collect scene metrics from `sceneInstrumentation`
   - Return `PerformanceSnapshot` object

2. Add `reportDetailed()` method:
   - Call `getSnapshot()`
   - Format CPU metrics as console.table()
   - Format GPU metrics as console.log()
   - Format scene metrics as console.log()
   - Group output for readability

3. Add `resetMeasurements()` method:
   - Clear measurements Map
   - Clear activeStack
   - Keep BabylonJS instrumentation running

### Phase 4: Integration (1-2 hours)

**Files:** `src/config/GraphConfig.ts`, `src/Graph.ts`, `src/Edge.ts`

1. Add `enableDetailedProfiling?: boolean` to GraphConfig

2. Update Graph.ts constructor:
   - Call `statsManager.enableProfiling()` if config enabled

3. Instrument Graph.ts update loop:
   - Wrap `updateManager.update()` with `measure()`
   - Wrap arrow batching with `measure()`
   - Call `reportDetailed()` on layout settlement

4. Instrument Edge.ts (optional):
   - Add `startMeasurement()` / `endMeasurement()` in `update()`
   - Add measurements for arrow updates

5. Add URL parameter support:
   - Parse `?profiling=true` from URL
   - Override config if present

### Phase 5: Optimization (30 min)

**File:** `src/managers/StatsManager.ts`

1. Add guard for disabled state:
   - Early return in `measure()` if `!this.enabled`
   - Zero overhead when disabled

2. Optimize ring buffer:
   - Use fixed-size array instead of shift/push
   - Use circular index for writes

3. Benchmark overhead:
   - Compare frame time with/without profiling
   - Ensure <1% overhead when enabled

**Total Estimated Time: 5-7 hours**

---

## File Changes

Only **one file** needs modification:

```
src/managers/StatsManager.ts  (existing file - extend it)
  - Add measurement tracking
  - Add percentile calculation
  - Add getSnapshot() method
  - Add reportDetailed() method
  - Add enable/disable API
```

Optional integration:
```
src/config/GraphConfig.ts     (add enableDetailedProfiling)
src/Graph.ts                   (call measure() in update loop)
src/Edge.ts                    (call measure() in update methods)
```

Test files:
```
test/managers/StatsManager.test.ts  (add tests for new methods)
```

---

## Benefits

1. **Minimal changes** - Only extend one existing file
2. **No new dependencies** - Everything uses existing infrastructure
3. **Backward compatible** - Existing code still works
4. **Lower implementation cost** - 5-7 hours vs 9-12 hours
5. **Single source of truth** - All performance data in StatsManager
6. **Reuse BabylonJS integration** - Already set up and tested
7. **Consistent API** - One manager for all stats
8. **Easy to maintain** - Less code to maintain

---

## Success Criteria

### Functional Requirements
- ✅ Measure CPU time with <1% overhead
- ✅ Calculate min/max/avg/p95/p99 statistics
- ✅ Access GPU metrics via BabylonJS EngineInstrumentation
- ✅ Access scene metrics via BabylonJS SceneInstrumentation
- ✅ Console reporting with grouped tables
- ✅ Programmatic access via `getSnapshot()`
- ✅ Zero overhead when disabled

### Non-Functional Requirements
- ✅ <1% performance overhead when enabled
- ✅ No new dependencies
- ✅ Backward compatible with existing StatsManager API
- ✅ TypeScript strict mode compliant
- ✅ 80%+ test coverage for new methods

### User Experience
- ✅ Simple API (single method call to measure)
- ✅ Clear console output (grouped, formatted)
- ✅ Easy activation (config flag or URL param)
- ✅ Automatic reporting (on settlement)
- ✅ Programmatic access for analysis

---

## Future Enhancements (Optional)

### V2 Features (Not in Initial Design)

1. **Hierarchical Display**
   - Show parent-child relationships in console output
   - Indent nested measurements
   - Calculate % of parent time

2. **Flamegraph Export**
   - Export data in speedscope.app format
   - Visualize call stacks

3. **Sampling Mode**
   - Only measure every Nth call
   - Reduce overhead further

4. **Performance Budgets**
   - Set max time thresholds
   - Warn when exceeded

5. **Correlation Analysis**
   - Correlate edge update count with layout iterations
   - Identify observer chains

---

## Summary

Instead of creating a separate profiling system, we **extend the existing StatsManager** to add:
- Detailed measurement tracking with `measure()` API
- Percentile statistics (P95/P99)
- Enhanced console reporting with `reportDetailed()`
- Programmatic access via `getSnapshot()`

This approach:
- ✅ Reuses existing BabylonJS instrumentation
- ✅ Requires changes to only one file
- ✅ Takes 5-7 hours instead of 9-12 hours
- ✅ Maintains backward compatibility
- ✅ Provides all needed debugging capabilities

The profiling system will immediately reveal whether edge updates are being called from within the layout engine update loop, confirming our hypothesis about the 4.5 second performance regression.
