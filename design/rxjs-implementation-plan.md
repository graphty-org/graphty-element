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

**Important Note on Style Updates:**
When styles change, we do NOT need to:
- Reload data
- Recalculate layout positions
- Re-run layout algorithms

Instead, style changes only trigger:
- Recomputation of computed styles for affected elements
- Recreation/update of meshes (shapes, colors, textures) based on new styles
- Render updates to display the new meshes

This ensures that position information is preserved when only visual properties change.

**Operation Priority and Dependencies:**
When multiple operations are triggered in the same tick, they are processed in this order:
1. **Style changes** (priority 1) - Ensures new nodes/edges use correct styles
2. **Data changes** (priority 2) - Creates nodes/edges with current styles
3. **Layout changes** (priority 3) - Positions the nodes/edges

This priority system ensures:
- When style and data are updated simultaneously, nodes and edges are created with the new styles rather than being created with old styles and then immediately updated.
- When data and layout are specified together, data loading completes fully (including async operations) before layout calculations begin.
- The system uses `concat` operator to ensure each phase completes before the next begins, while using `forkJoin` within each phase for parallel processing of similar operations.

**Data Loading Cancellation:**
- When a new data source is specified while previous data is still loading, the system automatically cancels the in-progress load.
- This prevents race conditions where old data might arrive after new data has been requested.
- The cancellation is implemented using RxJS's `switchMap` operator on a dedicated data loading stream.
- Any dependent operations (layout, render) associated with the cancelled data load are also cancelled.

**Layout Cancellation:**
- Layout calculations can be expensive and long-running, especially for force-directed layouts.
- When new data arrives or a different layout is requested, any in-progress layout calculation is immediately cancelled.
- This ensures responsive UI where users don't have to wait for old layouts to complete before seeing new ones.
- Cancellation scenarios:
  - New data load → cancels current layout (data has changed, layout needs recalculation)
  - New layout type → cancels current layout (user wants different algorithm)
  - New data addition → cancels current layout (graph structure has changed)
- Implemented using a dedicated `currentLayout$` stream with `switchMap` for automatic cancellation.
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
      // Always ensure a layout engine is set, default to ngraph
      if (!this.layoutManager.hasEngine()) {
        this.layoutManager.setLayout('ngraph');
      }
      return from(this.layoutManager.updatePositions());
    });
  }
}
```

**Verification:**
- Add nodes to data manager
- Verify layout update is triggered automatically with ngraph as default
- Test debouncing of rapid additions
- Verify ngraph is set if no layout engine exists

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

test('sets ngraph as default layout when none exists', async () => {
  const dataManager = new RxDataManager();
  const layoutManager = new MockLayoutManager();
  const coordinator = new LayoutCoordinator(dataManager, layoutManager);
  
  // Initially no layout engine
  assert.equal(layoutManager.hasEngine(), false);
  
  // Add nodes to trigger layout
  dataManager.addNodes([{ id: '1' }]);
  
  // Wait for debounce
  await delay(100);
  
  // Should have set ngraph as default
  assert.equal(layoutManager.getEngineType(), 'ngraph');
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
    this.setupCancellationStreams();
  }
  
  private setupReactivePipeline(): void {
    // Merge all commands with priority ordering
    const prioritizedCommands$ = merge(
      this.styleCommands$.pipe(map(cmd => ({ ...cmd, priority: 1, type: cmd.type }))),
      this.dataCommands$.pipe(map(cmd => ({ ...cmd, priority: 2, type: cmd.type }))),
      this.layoutCommands$.pipe(map(cmd => ({ ...cmd, priority: 3, type: cmd.type })))
    ).pipe(
      // Buffer commands in the same tick
      bufferTime(0),
      filter(commands => commands.length > 0),
      // Process batched commands with dependency awareness
      concatMap(commands => this.processBatchedCommands(commands)),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  
  private processBatchedCommands(commands: Array<Command & { priority: number }>): Observable<void> {
    // Sort by priority
    const sorted = commands.sort((a, b) => a.priority - b.priority);
    
    // Group by type
    const groups = {
      style: sorted.filter(cmd => cmd.type.startsWith('style:')),
      data: sorted.filter(cmd => cmd.type.startsWith('data:')),
      layout: sorted.filter(cmd => cmd.type.startsWith('layout:'))
    };
    
    // Process in dependency order with proper completion handling
    return concat(
      // First: all style commands (in parallel)
      groups.style.length > 0 
        ? forkJoin(groups.style.map(cmd => this.processStyleCommand(cmd))).pipe(map(() => void 0))
        : of(void 0),
      
      // Second: all data commands (must complete before layout)
      groups.data.length > 0
        ? forkJoin(groups.data.map(cmd => this.processDataCommand(cmd))).pipe(map(() => void 0))
        : of(void 0),
      
      // Third: layout commands (only after data is fully loaded)
      groups.layout.length > 0
        ? forkJoin(groups.layout.map(cmd => this.processLayoutCommand(cmd))).pipe(map(() => void 0))
        : of(void 0)
    );
  }
  
  private processStyleCommand(cmd: Command): Observable<void> {
    return this.updateStyles(cmd).pipe(
      switchMap(() => this.updateMeshes())
    );
  }
  
  // Track current operations for cancellation
  private currentDataLoad$ = new Subject<Observable<void>>();
  private currentLayout$ = new Subject<Observable<void>>();
  
  private processDataCommand(cmd: Command): Observable<void> {
    // Cancel any in-progress data loading AND layout
    const dataLoad$ = this.updateData(cmd).pipe(
      // Note: Layout update happens separately if layout command exists
      // Otherwise, auto-trigger layout after data load
      switchMap(() => {
        // Check if layout command exists in current batch
        // This info would be passed via context in real implementation
        return this.shouldAutoTriggerLayout() 
          ? this.triggerLayout()
          : this.updateRender();
      }),
      // Share to prevent multiple executions
      share()
    );
    
    // Push to subject to enable cancellation
    this.currentDataLoad$.next(dataLoad$);
    return dataLoad$;
  }
  
  private processLayoutCommand(cmd: Command): Observable<void> {
    const layout$ = this.updateLayout(cmd).pipe(
      switchMap(() => this.updateRender()),
      share()
    );
    
    // Push to subject to enable cancellation
    this.currentLayout$.next(layout$);
    return layout$;
  }
  
  private triggerLayout(): Observable<void> {
    const layout$ = this.updateLayout().pipe(
      switchMap(() => this.updateRender()),
      share()
    );
    
    // Push to subject to enable cancellation
    this.currentLayout$.next(layout$);
    return layout$;
  }
  
  private setupCancellationStreams(): void {
    // Cancel previous data loads when new data arrives
    this.currentDataLoad$.pipe(
      switchMap(dataLoad$ => dataLoad$),
      takeUntil(this.destroy$)
    ).subscribe();
    
    // Cancel previous layouts when new layout or data arrives
    merge(
      this.currentLayout$,
      this.currentDataLoad$.pipe(map(() => EMPTY)) // Data changes cancel layout
    ).pipe(
      switchMap(layout$ => layout$),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  
  private updateStyles(cmd: StyleCommand): Observable<void> {
    return defer(() => {
      this.styleManager.applyStyle(cmd.payload);
      this.styleState$.next({ template: cmd.payload });
      return of(void 0);
    });
  }
  
  private updateMeshes(): Observable<void> {
    return defer(() => {
      // Update all node and edge meshes based on new styles
      const updates: Observable<void>[] = [];
      
      // Update node meshes
      for (const node of this.dataManager.getNodes()) {
        const style = this.styleManager.getComputedStyle(node);
        updates.push(from(node.updateMesh(style)));
      }
      
      // Update edge meshes
      for (const edge of this.dataManager.getEdges()) {
        const style = this.styleManager.getComputedStyle(edge);
        updates.push(from(edge.updateMesh(style)));
      }
      
      return forkJoin(updates).pipe(map(() => void 0));
    });
  }
}
```

**Verification:**
- Test style changes only update meshes, not layout
- Test data changes trigger layout and render
- Test layout changes trigger render only

**Testing:**
```typescript
test('style changes only update meshes', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  // First add some nodes
  manager.addNodes([{ id: '1' }, { id: '2' }]);
  await delay(100);
  
  const events: string[] = [];
  manager.allOperations$.subscribe(op => events.push(op.type));
  
  // Change style
  manager.setStyleTemplate(newMockStyle);
  
  await delay(100);
  
  // Should only update meshes, not trigger layout
  assert.equal(events.includes('style:init'), true);
  assert.equal(events.includes('mesh:update'), true);
  assert.equal(events.includes('layout:update'), false);
});

test('data changes trigger full pipeline', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  const events: string[] = [];
  manager.allOperations$.subscribe(op => events.push(op.type));
  
  // Add nodes
  manager.addNodes(mockNodes);
  
  await delay(100);
  
  // Verify order
  assert.equal(events[0], 'data:add');
  assert.equal(events[1], 'layout:update'); // Auto-triggered
  assert.equal(events[2], 'render:update'); // Auto-triggered
});

test('style changes are processed before data changes', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  const events: string[] = [];
  manager.allOperations$.subscribe(op => events.push(op.type));
  
  // Emit both style and data changes in the same tick
  manager.setStyleTemplate(newMockStyle);
  manager.addNodes(mockNodes);
  
  await delay(100);
  
  // Verify style operations happen first
  const styleIndex = events.findIndex(e => e.includes('style'));
  const dataIndex = events.findIndex(e => e.includes('data'));
  
  assert.equal(styleIndex < dataIndex, true, 'Style should be processed before data');
  
  // Verify that nodes were created with the new style
  const nodeStyles = mockDataManager.getCreatedNodeStyles();
  assert.equal(nodeStyles[0], newMockStyle.nodeStyle);
});

test('data loading completes before layout starts', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  const events: { type: string, timestamp: number }[] = [];
  manager.allOperations$.subscribe(op => 
    events.push({ type: op.type, timestamp: Date.now() })
  );
  
  // Simulate async data loading
  let dataLoadComplete = false;
  mockDataManager.loadData = () => {
    return timer(50).pipe(
      tap(() => dataLoadComplete = true),
      map(() => mockNodes)
    );
  };
  
  // Emit both data and layout changes in the same tick
  manager.loadData('remote-source');
  manager.setLayout('force');
  
  await delay(150);
  
  // Find when operations completed
  const dataComplete = events.find(e => e.type === 'data:loaded');
  const layoutStart = events.find(e => e.type === 'layout:start');
  
  assert.isDefined(dataComplete);
  assert.isDefined(layoutStart);
  assert.equal(dataComplete.timestamp < layoutStart.timestamp, true, 
    'Data loading should complete before layout starts');
  assert.equal(dataLoadComplete, true, 'Data load should have completed');
});

test('new data load cancels previous data load', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  const loadedFiles: string[] = [];
  let firstLoadCancelled = false;
  
  // Simulate slow async data loading
  mockDataManager.loadData = (file: string) => {
    return timer(100).pipe(
      tap(() => loadedFiles.push(file)),
      finalize(() => {
        if (file === 'first-file.json' && loadedFiles.length === 0) {
          firstLoadCancelled = true;
        }
      }),
      map(() => mockNodes)
    );
  };
  
  // Start loading first file
  manager.loadData('first-file.json');
  
  // After 50ms, request a different file (should cancel first)
  await delay(50);
  manager.loadData('second-file.json');
  
  // Wait for operations to complete
  await delay(200);
  
  // Verify only second file was loaded
  assert.equal(loadedFiles.length, 1);
  assert.equal(loadedFiles[0], 'second-file.json');
  assert.equal(firstLoadCancelled, true, 'First load should have been cancelled');
});

test('layout operations are cancelled when new data or layout arrives', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  const layoutsCompleted: string[] = [];
  let forceLayoutCancelled = false;
  
  // Simulate slow layout calculations
  mockLayoutManager.runLayout = (type: string) => {
    return timer(100).pipe(
      tap(() => layoutsCompleted.push(type)),
      finalize(() => {
        if (type === 'force' && !layoutsCompleted.includes('force')) {
          forceLayoutCancelled = true;
        }
      }),
      map(() => ({ positions: {} }))
    );
  };
  
  // Add some initial data
  manager.addNodes([{ id: '1' }, { id: '2' }]);
  await delay(10);
  
  // Start force layout
  manager.setLayout('force');
  
  // After 50ms, change to circular layout (should cancel force)
  await delay(50);
  manager.setLayout('circular');
  
  await delay(200);
  
  // Verify force was cancelled and circular completed
  assert.equal(layoutsCompleted.length, 1);
  assert.equal(layoutsCompleted[0], 'circular');
  assert.equal(forceLayoutCancelled, true);
});

test('new data cancels in-progress layout', async () => {
  const manager = new RxGraphOperationManager(
    mockStyleManager,
    mockDataManager,
    mockLayoutManager,
    mockRenderManager
  );
  
  let layoutCancelled = false;
  let layoutCompleted = false;
  
  // Simulate slow layout
  mockLayoutManager.runLayout = () => {
    return timer(100).pipe(
      tap(() => layoutCompleted = true),
      finalize(() => {
        if (!layoutCompleted) layoutCancelled = true;
      }),
      map(() => ({ positions: {} }))
    );
  };
  
  // Add initial data and start layout
  manager.addNodes([{ id: '1' }]);
  
  // After 50ms, add new data (should cancel layout)
  await delay(50);
  manager.addNodes([{ id: '2' }]);
  
  await delay(200);
  
  // Verify first layout was cancelled
  assert.equal(layoutCancelled, true, 'First layout should have been cancelled');
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
    'data:load': ['data:load', 'layout:update', 'algorithm:run'],  // New data cancels previous data load and layout
    'data:add': ['layout:update', 'algorithm:run'],  // Data changes cancel in-progress layout
    'layout:set': ['layout:update'],  // New layout cancels previous layout
    'layout:update': ['layout:update'],  // Layout updates cancel previous layout updates
    'style:init': ['mesh:update'],  // Style changes cancel mesh updates
    'mesh:update': []  // Mesh updates don't cancel anything
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