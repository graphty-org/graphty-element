# RxJS Implementation Plan

## Date: August 5, 2025

## Overview

This plan outlines a step-by-step implementation of the RxJS event-driven architecture from `async-dependencies-rxjs.md`. Each step includes implementation details, verification methods, and testing strategies.

## Phase 1: Foundation Setup (Steps 1-4)

### Step 1: Install RxJS and Create Basic Infrastructure

**Implementation:**
1. Install RxJS: `npm install rxjs`
2. Create directory structure:
   ```
   src/rx/
   ├── index.ts
   ├── operators/
   │   └── index.ts
   ├── bridges/
   │   └── babylon-bridge.ts
   └── coordinators/
       └── event-coordinator.ts
   ```

3. Create base types in `src/rx/index.ts`:
   ```typescript
   export interface Command<T = unknown> {
     type: string;
     payload?: T;
     metadata?: {
       timestamp: number;
       source?: string;
       priority?: number;
     };
   }
   
   export interface StateChange<T = unknown> {
     previous: T;
     current: T;
     trigger: string;
   }
   ```

**Verification:**
- Run `npm run typecheck` to ensure TypeScript compilation
- Create a simple test file that imports from 'rxjs'
- Verify directory structure exists

**Testing:**
```typescript
// test/rx/setup.test.ts
import { assert } from 'vitest';
import { Subject, BehaviorSubject } from 'rxjs';

test('RxJS is properly installed', () => {
  const subject = new Subject();
  assert.isDefined(subject);
  assert.isFunction(subject.next);
});
```

### Step 2: Create Babylon.js Observable Bridge

**Implementation:**
Create `src/rx/bridges/babylon-bridge.ts`:
```typescript
import { Observable as BabylonObservable } from '@babylonjs/core';
import { Observable, fromEventPattern, share } from 'rxjs';

export function fromBabylonObservable<T>(
  babylonObservable: BabylonObservable<T>
): Observable<T> {
  return fromEventPattern<T>(
    (handler) => babylonObservable.add(handler),
    (handler) => babylonObservable.removeCallback(handler)
  ).pipe(share());
}
```

**Verification:**
- Create a mock Babylon.js observable
- Convert it to RxJS observable
- Verify emissions work correctly

**Testing:**
```typescript
// test/rx/babylon-bridge.test.ts
import { assert } from 'vitest';
import { Observable as BabylonObservable } from '@babylonjs/core';
import { fromBabylonObservable } from '../../src/rx/bridges/babylon-bridge';
import { take, toArray } from 'rxjs/operators';

test('converts Babylon observable to RxJS', async () => {
  const babylonObs = new BabylonObservable();
  const rxObs = fromBabylonObservable(babylonObs);
  
  const promise = rxObs.pipe(take(3), toArray()).toPromise();
  
  babylonObs.notifyObservers(1);
  babylonObs.notifyObservers(2);
  babylonObs.notifyObservers(3);
  
  const result = await promise;
  assert.deepEqual(result, [1, 2, 3]);
});
```

### Step 3: Create Simple Event Coordinator

**Implementation:**
Create `src/rx/coordinators/event-coordinator.ts`:
```typescript
import { Subject, merge, filter, map, share, takeUntil } from 'rxjs';
import type { Command } from '../index';

export class SimpleEventCoordinator {
  private commands$ = new Subject<Command>();
  private destroy$ = new Subject<void>();
  
  // Typed command streams
  readonly dataCommands$ = this.commands$.pipe(
    filter(cmd => cmd.type.startsWith('data:')),
    share()
  );
  
  readonly styleCommands$ = this.commands$.pipe(
    filter(cmd => cmd.type.startsWith('style:')),
    share()
  );
  
  emit(command: Command): void {
    command.metadata = {
      ...command.metadata,
      timestamp: Date.now()
    };
    this.commands$.next(command);
  }
  
  dispose(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Verification:**
- Create coordinator instance
- Emit different command types
- Verify filtered streams receive correct commands

**Testing:**
```typescript
// test/rx/event-coordinator.test.ts
test('filters commands by type', () => {
  const coordinator = new SimpleEventCoordinator();
  const dataCommands: Command[] = [];
  const styleCommands: Command[] = [];
  
  coordinator.dataCommands$.subscribe(cmd => dataCommands.push(cmd));
  coordinator.styleCommands$.subscribe(cmd => styleCommands.push(cmd));
  
  coordinator.emit({ type: 'data:add' });
  coordinator.emit({ type: 'style:init' });
  coordinator.emit({ type: 'data:remove' });
  
  assert.equal(dataCommands.length, 2);
  assert.equal(styleCommands.length, 1);
});
```

### Step 4: Test Batching Strategies

**Implementation:**
Create `src/rx/operators/batching.ts`:
```typescript
import { pipe, bufferTime, filter, map } from 'rxjs';

export function batchInTick<T>() {
  return pipe(
    bufferTime(0),
    filter((items: T[]) => items.length > 0)
  );
}

export function batchByTime<T>(ms: number) {
  return pipe(
    bufferTime(ms),
    filter((items: T[]) => items.length > 0)
  );
}

export function batchByCount<T>(count: number) {
  return pipe(
    bufferCount(count)
  );
}
```

**Verification:**
- Test each batching strategy
- Verify micro-task batching works correctly
- Test edge cases (empty batches, single items)

**Testing:**
```typescript
// test/rx/batching.test.ts
test('batchInTick collects all sync emissions', async () => {
  const source$ = new Subject<number>();
  const batches: number[][] = [];
  
  source$.pipe(batchInTick()).subscribe(batch => batches.push(batch));
  
  // All sync emissions
  source$.next(1);
  source$.next(2);
  source$.next(3);
  
  // Wait for micro-task
  await Promise.resolve();
  
  assert.equal(batches.length, 1);
  assert.deepEqual(batches[0], [1, 2, 3]);
});
```

## Phase 2: Manager Integration (Steps 5-8)

### Step 5: Create RxJS-Enabled DataManager

**Implementation:**
Create a parallel RxJS version first:
```typescript
// src/managers/RxDataManager.ts
export class RxDataManager {
  // State
  private nodesSubject$ = new BehaviorSubject<Map<string, Node>>(new Map());
  private edgesSubject$ = new BehaviorSubject<Map<string, Edge>>(new Map());
  
  // Public observables
  readonly nodes$ = this.nodesSubject$.asObservable();
  readonly edges$ = this.edgesSubject$.asObservable();
  
  // Change notifications
  private changes$ = new Subject<DataChange>();
  readonly dataChanges$ = this.changes$.asObservable();
  
  addNodes(nodes: any[]): void {
    const currentNodes = new Map(this.nodesSubject$.value);
    const added: string[] = [];
    
    for (const node of nodes) {
      currentNodes.set(node.id, node);
      added.push(node.id);
    }
    
    this.nodesSubject$.next(currentNodes);
    this.changes$.next({
      type: 'nodes-added',
      nodeIds: added,
      timestamp: Date.now()
    });
  }
}
```

**Verification:**
- Add nodes and verify state updates
- Subscribe to changes and verify emissions
- Test with existing DataManager side-by-side

**Testing:**
```typescript
test('RxDataManager emits changes on node addition', () => {
  const manager = new RxDataManager();
  const changes: DataChange[] = [];
  
  manager.dataChanges$.subscribe(change => changes.push(change));
  manager.addNodes([{ id: '1' }, { id: '2' }]);
  
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, 'nodes-added');
  assert.deepEqual(changes[0].nodeIds, ['1', '2']);
});
```

### Step 6: Create Event-Driven Layout Coordination

**Implementation:**
Create layout coordination that reacts to data changes:
```typescript
// src/rx/coordinators/layout-coordinator.ts
export class LayoutCoordinator {
  private destroy$ = new Subject<void>();
  
  constructor(
    private dataManager: RxDataManager,
    private layoutManager: LayoutManager
  ) {
    this.setupAutoLayout();
  }
  
  private setupAutoLayout(): void {
    // Auto-trigger layout on data changes
    this.dataManager.dataChanges$.pipe(
      filter(change => 
        change.type === 'nodes-added' || 
        change.type === 'edges-added'
      ),
      debounceTime(50), // Batch rapid changes
      switchMap(() => this.updateLayout()),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  
  private updateLayout(): Observable<void> {
    return defer(() => {
      if (!this.layoutManager.hasEngine()) {
        return EMPTY;
      }
      return from(this.layoutManager.updatePositions());
    });
  }
}
```

**Verification:**
- Add nodes to data manager
- Verify layout update is triggered automatically
- Test debouncing of rapid additions

**Testing:**
```typescript
test('auto-triggers layout on data change', async () => {
  const dataManager = new RxDataManager();
  const layoutManager = new MockLayoutManager();
  const coordinator = new LayoutCoordinator(dataManager, layoutManager);
  
  let layoutUpdateCount = 0;
  layoutManager.onUpdate = () => layoutUpdateCount++;
  
  // Add nodes rapidly
  dataManager.addNodes([{ id: '1' }]);
  dataManager.addNodes([{ id: '2' }]);
  dataManager.addNodes([{ id: '3' }]);
  
  // Wait for debounce
  await delay(100);
  
  // Should batch into single update
  assert.equal(layoutUpdateCount, 1);
});
```

### Step 7: Implement Cancellation Patterns

**Implementation:**
Test different operators for cancellation:
```typescript
// src/rx/operators/cancellation.ts
export class CancellationTester {
  testSwitchMap(): void {
    const trigger$ = new Subject<number>();
    let completeCount = 0;
    
    trigger$.pipe(
      switchMap(n => this.longOperation(n).pipe(
        finalize(() => completeCount++)
      ))
    ).subscribe();
    
    trigger$.next(1); // Start op 1
    trigger$.next(2); // Cancel op 1, start op 2
    trigger$.next(3); // Cancel op 2, start op 3
    
    // Only op 3 should complete
  }
  
  testExhaustMap(): void {
    const trigger$ = new Subject<number>();
    
    trigger$.pipe(
      exhaustMap(n => this.longOperation(n))
    ).subscribe();
    
    trigger$.next(1); // Start op 1
    trigger$.next(2); // Ignored
    trigger$.next(3); // Ignored
    // Only op 1 executes
  }
  
  private longOperation(n: number): Observable<void> {
    return timer(100).pipe(
      map(() => console.log(`Operation ${n} complete`))
    );
  }
}
```

**Verification:**
- Run each cancellation pattern
- Verify correct operations are cancelled
- Test with actual graph operations

**Testing:**
```typescript
test('switchMap cancels previous operations', async () => {
  const operations: string[] = [];
  const trigger$ = new Subject<string>();
  
  trigger$.pipe(
    switchMap(op => timer(50).pipe(
      map(() => {
        operations.push(op);
        return op;
      })
    ))
  ).subscribe();
  
  trigger$.next('op1');
  await delay(10);
  trigger$.next('op2'); // Should cancel op1
  await delay(60);
  
  assert.deepEqual(operations, ['op2']);
});
```

### Step 8: Create Progress Tracking System

**Implementation:**
```typescript
// src/rx/progress/progress-tracker.ts
export interface ProgressInfo {
  operationId: string;
  percent: number;
  message?: string;
  phase?: string;
}

export class ProgressTracker {
  private progress$ = new Subject<ProgressInfo>();
  readonly progressUpdates$ = this.progress$.asObservable();
  
  trackOperation<T>(
    operationId: string,
    operation$: Observable<T>
  ): Observable<T> {
    const progressSubject = new Subject<number>();
    
    // Emit progress updates
    progressSubject.pipe(
      map(percent => ({
        operationId,
        percent,
        phase: this.getPhase(percent)
      }))
    ).subscribe(info => this.progress$.next(info));
    
    // Wrap operation with progress
    return operation$.pipe(
      tap({
        next: () => progressSubject.next(50),
        complete: () => {
          progressSubject.next(100);
          progressSubject.complete();
        }
      })
    );
  }
  
  private getPhase(percent: number): string {
    if (percent < 30) return 'initializing';
    if (percent < 70) return 'processing';
    return 'finalizing';
  }
}
```

**Verification:**
- Track a long operation
- Verify progress emissions
- Test with multiple concurrent operations

**Testing:**
```typescript
test('tracks operation progress', async () => {
  const tracker = new ProgressTracker();
  const updates: ProgressInfo[] = [];
  
  tracker.progressUpdates$.subscribe(update => updates.push(update));
  
  const operation$ = timer(0, 50).pipe(
    take(3),
    map((i) => i * 33)
  );
  
  await tracker.trackOperation('test-op', operation$).toPromise();
  
  assert.equal(updates.length >= 3, true);
  assert.equal(updates[updates.length - 1].percent, 100);
});
```

## Phase 3: Full Integration (Steps 9-12)

### Step 9: Create Complete RxGraphOperationManager

**Implementation:**
Implement the full manager from the design:
```typescript
// src/rx/RxGraphOperationManager.ts
export class RxGraphOperationManager {
  // Command streams
  private styleCommands$ = new Subject<StyleCommand>();
  private dataCommands$ = new Subject<DataCommand>();
  private layoutCommands$ = new Subject<LayoutCommand>();
  
  // State streams
  private styleState$ = new BehaviorSubject<StyleState | null>(null);
  private dataState$ = new BehaviorSubject<DataState>({ nodes: [], edges: [] });
  private layoutState$ = new BehaviorSubject<LayoutState | null>(null);
  
  private destroy$ = new Subject<void>();
  private progressTracker = new ProgressTracker();
  
  constructor(
    private styleManager: StyleManager,
    private dataManager: DataManager,
    private layoutManager: LayoutManager,
    private renderManager: RenderManager
  ) {
    this.setupReactivePipeline();
  }
  
  private setupReactivePipeline(): void {
    // Implement full pipeline from design
    // ... (copy from design doc)
  }
}
```

**Verification:**
- Test complete flow: style → data → layout → render
- Verify automatic triggers work
- Test state consistency

**Testing:**
```typescript
test('complete operation flow', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  const events: string[] = [];
  
  // Track all operations
  manager.allOperations$.subscribe(op => events.push(op.type));
  
  // Trigger full flow
  manager.setStyleTemplate(mockStyle);
  manager.addNodes(mockNodes);
  
  await delay(100);
  
  // Verify order
  assert.equal(events[0], 'style:init');
  assert.equal(events[1], 'data:add');
  assert.equal(events[2], 'layout:update'); // Auto-triggered
  assert.equal(events[3], 'render:update'); // Auto-triggered
});
```

### Step 10: Implement Obsolescence Rules

**Implementation:**
Create smart obsolescence handling:
```typescript
// src/rx/obsolescence/obsolescence-manager.ts
export class ObsolescenceManager {
  private runningOps = new Map<string, {
    type: string;
    subscription: Subscription;
    startTime: number;
  }>();
  
  private obsolescenceRules: Record<string, string[]> = {
    'data:add': ['layout:update', 'algorithm:run'],
    'layout:set': ['layout:update'],
    'style:init': ['style:apply']
  };
  
  executeWithObsolescence<T>(
    id: string,
    type: string,
    operation$: Observable<T>
  ): Observable<T> {
    // Cancel obsolete operations
    this.cancelObsoleteOperations(type);
    
    // Track this operation
    const subscription = new Subscription();
    this.runningOps.set(id, {
      type,
      subscription,
      startTime: Date.now()
    });
    
    return operation$.pipe(
      finalize(() => {
        this.runningOps.delete(id);
        subscription.unsubscribe();
      })
    );
  }
  
  private cancelObsoleteOperations(incomingType: string): void {
    const toCancel = this.obsolescenceRules[incomingType] || [];
    
    for (const [id, op] of this.runningOps) {
      if (toCancel.includes(op.type)) {
        console.log(`Cancelling ${op.type} due to ${incomingType}`);
        op.subscription.unsubscribe();
        this.runningOps.delete(id);
      }
    }
  }
}
```

**Verification:**
- Start a layout operation
- Trigger data add (should cancel layout)
- Verify cancellation occurs

**Testing:**
```typescript
test('obsolescence cancels running operations', async () => {
  const manager = new ObsolescenceManager();
  let layoutCompleted = false;
  let dataCompleted = false;
  
  // Start layout operation
  const layout$ = timer(100).pipe(
    tap(() => layoutCompleted = true)
  );
  
  manager.executeWithObsolescence('layout-1', 'layout:update', layout$)
    .subscribe();
  
  await delay(50); // Layout still running
  
  // Data operation should cancel layout
  const data$ = of(true).pipe(
    tap(() => dataCompleted = true)
  );
  
  await manager.executeWithObsolescence('data-1', 'data:add', data$)
    .toPromise();
  
  await delay(100);
  
  assert.equal(dataCompleted, true);
  assert.equal(layoutCompleted, false); // Cancelled
});
```

### Step 11: Test Edge Cases

**Implementation:**
Create comprehensive edge case tests:
```typescript
// test/rx/edge-cases.test.ts
describe('RxJS Edge Cases', () => {
  test('handles rapid successive operations', async () => {
    const manager = new RxGraphOperationManager();
    
    // Rapid fire operations
    for (let i = 0; i < 100; i++) {
      manager.addNodes([{ id: `node-${i}` }]);
    }
    
    // Should batch efficiently
    const operations = await manager.getExecutedOperations();
    assert.equal(operations.length < 100, true); // Batched
  });
  
  test('handles errors without breaking stream', async () => {
    const manager = new RxGraphOperationManager();
    const errors: Error[] = [];
    
    manager.errors$.subscribe(err => errors.push(err));
    
    // Inject error
    manager.addNodes([{ id: null }]); // Invalid node
    
    // Stream should continue
    manager.addNodes([{ id: 'valid' }]);
    
    await delay(100);
    
    assert.equal(errors.length, 1);
    assert.equal(manager.getNodeCount(), 1); // Valid node added
  });
  
  test('handles memory leaks on disposal', () => {
    const manager = new RxGraphOperationManager();
    
    // Create many subscriptions
    const subs: Subscription[] = [];
    for (let i = 0; i < 100; i++) {
      subs.push(manager.allOperations$.subscribe());
    }
    
    // Dispose
    manager.dispose();
    
    // All subscriptions should be closed
    subs.forEach(sub => assert.equal(sub.closed, true));
  });
  
  test('handles concurrent modifications', async () => {
    const manager = new RxGraphOperationManager();
    
    // Concurrent operations on same data
    await Promise.all([
      manager.updateNode('1', { x: 100 }),
      manager.updateNode('1', { y: 200 }),
      manager.updateNode('1', { z: 300 })
    ]);
    
    const node = manager.getNode('1');
    assert.isDefined(node);
    // Last update should win or all should merge
  });
});
```

### Step 12: Integration with Existing Graph Class

**Implementation:**
Create adapter to integrate with existing Graph class:
```typescript
// src/rx/GraphRxAdapter.ts
export class GraphRxAdapter {
  private rxManager: RxGraphOperationManager;
  
  constructor(private graph: Graph) {
    this.rxManager = new RxGraphOperationManager(
      graph.styleManager,
      graph.dataManager,
      graph.layoutManager,
      graph.renderManager
    );
    
    this.setupMethodInterception();
  }
  
  private setupMethodInterception(): void {
    // Intercept Graph methods to use RxJS
    const originalAddNodes = this.graph.addNodes.bind(this.graph);
    
    this.graph.addNodes = (nodes: any[]) => {
      // Use RxJS path
      this.rxManager.addNodes(nodes);
    };
    
    // Provide fallback
    this.graph.addNodesLegacy = originalAddNodes;
  }
  
  enableRxJS(): void {
    this.graph.useRxJS = true;
  }
  
  disableRxJS(): void {
    this.graph.useRxJS = false;
  }
}
```

**Verification:**
- Run existing Graph tests with RxJS enabled
- Compare performance and behavior
- Ensure no regressions

**Testing:**
```typescript
test('RxJS adapter works with existing Graph', async () => {
  const graph = new Graph();
  const adapter = new GraphRxAdapter(graph);
  
  adapter.enableRxJS();
  
  // Use existing API
  graph.addNodes([{ id: '1' }, { id: '2' }]);
  graph.setLayout('force');
  
  await delay(100);
  
  // Verify same results
  assert.equal(graph.nodes.size, 2);
  assert.isDefined(graph.layoutEngine);
});
```

## Phase 4: Performance & Monitoring (Steps 13-15)

### Step 13: Add Performance Monitoring

**Implementation:**
```typescript
// src/rx/monitoring/performance-monitor.ts
export class RxPerformanceMonitor {
  private metrics$ = new Subject<PerformanceMetric>();
  
  measureOperation<T>(
    name: string,
    operation$: Observable<T>
  ): Observable<T> {
    const startTime = performance.now();
    
    return operation$.pipe(
      finalize(() => {
        const duration = performance.now() - startTime;
        this.metrics$.next({
          name,
          duration,
          timestamp: Date.now()
        });
      })
    );
  }
  
  getAverageTime(operationType: string): Observable<number> {
    return this.metrics$.pipe(
      filter(m => m.name === operationType),
      bufferTime(1000),
      map(metrics => {
        if (metrics.length === 0) return 0;
        const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
        return sum / metrics.length;
      })
    );
  }
}
```

### Step 14: Memory Leak Detection

**Implementation:**
```typescript
// src/rx/monitoring/memory-monitor.ts
export class MemoryLeakDetector {
  private subscriptions = new WeakMap<object, Set<Subscription>>();
  
  trackSubscription(owner: object, subscription: Subscription): void {
    if (!this.subscriptions.has(owner)) {
      this.subscriptions.set(owner, new Set());
    }
    this.subscriptions.get(owner)!.add(subscription);
  }
  
  checkLeaks(owner: object): number {
    const subs = this.subscriptions.get(owner);
    if (!subs) return 0;
    
    const activeCount = Array.from(subs)
      .filter(sub => !sub.closed)
      .length;
    
    if (activeCount > 10) {
      console.warn(`Potential memory leak: ${activeCount} active subscriptions`);
    }
    
    return activeCount;
  }
}
```

### Step 15: Production Readiness

**Final Checklist:**

1. **Error Boundaries:**
   ```typescript
   const safeOperation$ = operation$.pipe(
     catchError(err => {
       logger.error('Operation failed', err);
       return EMPTY;
     })
   );
   ```

2. **Debugging Tools:**
   ```typescript
   // Add debug operator
   operation$.pipe(
     tap({
       next: v => console.log('Next:', v),
       error: e => console.error('Error:', e),
       complete: () => console.log('Complete')
     })
   );
   ```

3. **Performance Benchmarks:**
   ```typescript
   test('RxJS vs current performance', async () => {
     const iterations = 1000;
     
     // Current approach
     const currentTime = await benchmarkCurrent(iterations);
     
     // RxJS approach
     const rxTime = await benchmarkRxJS(iterations);
     
     console.log(`Current: ${currentTime}ms, RxJS: ${rxTime}ms`);
     assert.equal(rxTime < currentTime * 1.5, true); // Allow 50% overhead max
   });
   ```

## Testing Strategy

### Unit Tests
- Test each operator in isolation
- Test each coordinator separately
- Mock dependencies

### Integration Tests
- Test full operation flows
- Test with real managers
- Verify state consistency

### Performance Tests
- Benchmark against current implementation
- Memory usage comparison
- CPU profiling

### Edge Case Tests
- Rapid operations
- Concurrent modifications
- Error recovery
- Memory leaks
- Disposal/cleanup

### Stress Tests
```typescript
test('handles 10k rapid operations', async () => {
  const manager = new RxGraphOperationManager();
  
  const start = performance.now();
  
  for (let i = 0; i < 10000; i++) {
    manager.addNodes([{ id: `node-${i}` }]);
  }
  
  await manager.waitForIdle();
  
  const duration = performance.now() - start;
  console.log(`10k operations completed in ${duration}ms`);
  
  assert.equal(manager.getNodeCount(), 10000);
  assert.equal(duration < 5000, true); // Should complete in < 5s
});
```

## Migration Strategy

1. **Parallel Implementation**: Keep existing system while building RxJS version
2. **Feature Flag**: Add flag to switch between implementations
3. **Gradual Migration**: Migrate one manager at a time
4. **A/B Testing**: Run both systems in parallel and compare
5. **Rollback Plan**: Easy switch back to original if issues arise

## Success Criteria

1. All existing tests pass with RxJS implementation
2. No performance regression > 20%
3. Memory usage remains stable
4. Error handling is robust
5. Code is more maintainable and easier to understand
6. Automatic operation flow works correctly
7. Cancellation and obsolescence work as designed

## Timeline Estimate

- Phase 1 (Foundation): 2-3 days
- Phase 2 (Manager Integration): 3-4 days
- Phase 3 (Full Integration): 4-5 days
- Phase 4 (Performance & Polish): 2-3 days
- **Total**: 11-15 days

## Risk Mitigation

1. **Performance Risk**: Profile early and often
2. **Complexity Risk**: Keep escape hatch to current implementation
3. **Learning Curve**: Document patterns and provide examples
4. **Integration Risk**: Extensive testing at each phase
5. **Memory Leak Risk**: Use WeakMap for tracking, proper disposal patterns