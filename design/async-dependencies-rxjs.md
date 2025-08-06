# Event-Driven Architecture with RxJS: No Dependency Sorting Required

## Date: August 5, 2025

## Key Insight

You're absolutely right - with a proper event-driven RxJS architecture, we don't need explicit dependency sorting at all. Instead, we can create reactive streams where operations naturally flow in the correct order based on events.

## Core Concept: Event-Driven Reactive Streams

Instead of:
```typescript
// Current approach - explicit dependencies
operations = [
  { category: 'style-init', dependsOn: [] },
  { category: 'data-add', dependsOn: ['style-init'] },
  { category: 'layout-update', dependsOn: ['data-add'] }
]
// Then sort by dependencies
```

We have:
```typescript
// RxJS approach - natural event flow
styleInitialized$ → triggers → dataOperations$
dataChanged$ → triggers → layoutUpdate$
layoutChanged$ → triggers → renderUpdate$
```

## Complete RxJS Design

### 1. Core Architecture

```typescript
import { Subject, BehaviorSubject, merge, filter, switchMap, 
         exhaustMap, debounceTime, share, takeUntil, tap,
         catchError, EMPTY, combineLatest, distinctUntilChanged } from 'rxjs';

export class RxGraphOperationManager {
  // Event streams
  private styleCommands$ = new Subject<StyleCommand>();
  private dataCommands$ = new Subject<DataCommand>();
  private layoutCommands$ = new Subject<LayoutCommand>();
  private renderCommands$ = new Subject<RenderCommand>();
  
  // State streams (current state)
  private styleState$ = new BehaviorSubject<StyleState | null>(null);
  private dataState$ = new BehaviorSubject<DataState>({ nodes: [], edges: [] });
  private layoutState$ = new BehaviorSubject<LayoutState | null>(null);
  
  // Cancellation
  private destroy$ = new Subject<void>();
  
  constructor(
    private styleManager: StyleManager,
    private dataManager: DataManager,
    private layoutManager: LayoutManager,
    private renderManager: RenderManager
  ) {
    this.setupReactivePipeline();
  }
  
  private setupReactivePipeline() {
    // Style operations stream
    const styleOperations$ = this.styleCommands$.pipe(
      exhaustMap(cmd => this.processStyleCommand(cmd)),
      tap(state => this.styleState$.next(state)),
      share()
    );
    
    // Data operations wait for style to be ready
    const dataOperations$ = this.dataCommands$.pipe(
      withLatestFrom(this.styleState$),
      filter(([_, styleState]) => styleState !== null), // Wait for style
      exhaustMap(([cmd, _]) => this.processDataCommand(cmd)),
      tap(state => this.dataState$.next(state)),
      share()
    );
    
    // Layout updates trigger automatically on data changes
    const layoutOperations$ = merge(
      // Explicit layout commands
      this.layoutCommands$,
      // Automatic triggers from data changes
      this.dataState$.pipe(
        distinctUntilChanged((a, b) => 
          a.nodes.length === b.nodes.length && 
          a.edges.length === b.edges.length
        ),
        filter(state => state.nodes.length > 0),
        map(() => ({ type: 'update' } as LayoutCommand))
      )
    ).pipe(
      debounceTime(0), // Batch within same tick
      withLatestFrom(this.layoutState$),
      exhaustMap(([cmd, currentLayout]) => {
        // Skip update if no layout engine set
        if (cmd.type === 'update' && !currentLayout) {
          return EMPTY;
        }
        return this.processLayoutCommand(cmd);
      }),
      tap(state => this.layoutState$.next(state)),
      share()
    );
    
    // Render updates trigger on any visual change
    const renderTriggers$ = merge(
      styleOperations$.pipe(map(() => 'style')),
      dataOperations$.pipe(map(() => 'data')),
      layoutOperations$.pipe(map(() => 'layout'))
    );
    
    const renderOperations$ = merge(
      this.renderCommands$,
      renderTriggers$.pipe(
        debounceTime(16), // ~60fps
        map(() => ({ type: 'update' } as RenderCommand))
      )
    ).pipe(
      exhaustMap(cmd => this.processRenderCommand(cmd)),
      share()
    );
    
    // Subscribe to all streams
    merge(
      styleOperations$,
      dataOperations$,
      layoutOperations$,
      renderOperations$
    ).pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('Operation error:', error);
        return EMPTY;
      })
    ).subscribe();
  }
  
  // Public API
  setStyleTemplate(template: StyleSchema) {
    this.styleCommands$.next({ type: 'init', template });
  }
  
  addNodes(nodes: any[]) {
    this.dataCommands$.next({ type: 'addNodes', nodes });
  }
  
  addEdges(edges: any[]) {
    this.dataCommands$.next({ type: 'addEdges', edges });
  }
  
  setLayout(type: string, options: any) {
    this.layoutCommands$.next({ type: 'set', layoutType: type, options });
  }
  
  dispose() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 2. Advanced Features

#### Batching Operations
```typescript
// Automatic batching within same event loop tick
const batchedDataCommands$ = this.dataCommands$.pipe(
  bufferTime(0), // Collect all commands in current tick
  filter(commands => commands.length > 0),
  map(commands => this.mergeDataCommands(commands))
);
```

#### Progress Tracking
```typescript
interface OperationWithProgress<T> {
  operation: Observable<T>;
  progress: Observable<number>;
}

private processDataCommandWithProgress(
  cmd: DataCommand
): OperationWithProgress<DataState> {
  const progress$ = new Subject<number>();
  
  const operation$ = defer(() => {
    let processed = 0;
    const total = cmd.nodes?.length || 0;
    
    return from(cmd.nodes || []).pipe(
      concatMap((node, index) => {
        return of(node).pipe(
          tap(() => {
            processed++;
            progress$.next((processed / total) * 100);
          }),
          map(() => this.dataManager.addNode(node))
        );
      }),
      toArray(),
      map(() => this.dataManager.getState()),
      tap(() => progress$.complete())
    );
  });
  
  return { operation: operation$, progress: progress$ };
}
```

#### Cancellation and Obsolescence

RxJS provides powerful operators for handling obsolescence patterns:

```typescript
// 1. switchMap - Cancels previous operation when new one arrives
const layoutOperations$ = this.layoutCommands$.pipe(
  switchMap(cmd => this.processLayoutCommand(cmd)) // Cancels previous
);

// 2. exhaustMap - Ignores new operations until current completes
const styleOperations$ = this.styleCommands$.pipe(
  exhaustMap(cmd => this.processStyleCommand(cmd)) // Ignores new until complete
);

// 3. mergeMap - Runs operations in parallel
const algorithmOperations$ = this.algorithmCommands$.pipe(
  mergeMap(cmd => this.processAlgorithmCommand(cmd)) // Runs in parallel
);

// 4. Advanced obsolescence patterns
class ObsolescencePatterns {
  // Pattern 1: Cancel running operations based on type
  private createObsolescenceStream() {
    // Data changes obsolete running layouts and algorithms
    const dataObsoletes$ = this.dataCommands$.pipe(
      map(() => ['layout-update', 'algorithm-run'])
    );
    
    // Layout changes obsolete only algorithms
    const layoutObsoletes$ = this.layoutCommands$.pipe(
      map(() => ['algorithm-run'])
    );
    
    // Combine all obsolescence rules
    return merge(dataObsoletes$, layoutObsoletes$).pipe(
      scan((acc, obsoletes) => [...acc, ...obsoletes], [] as string[])
    );
  }
  
  // Pattern 2: Conditional obsolescence
  private layoutWithObsolescence$ = this.layoutCommands$.pipe(
    withLatestFrom(this.runningOperations$),
    switchMap(([cmd, running]) => {
      // Cancel only if not almost done
      const currentLayout = running.find(op => op.type === 'layout');
      if (currentLayout && currentLayout.progress < 90) {
        currentLayout.cancel$.next(); // Cancel the operation
      }
      return this.processLayoutCommand(cmd);
    })
  );
  
  // Pattern 3: Race conditions - first to complete wins
  private competingOperations$ = race(
    this.quickLayout$.pipe(map(result => ({ type: 'quick', result }))),
    this.thoroughLayout$.pipe(map(result => ({ type: 'thorough', result })))
  );
  
  // Pattern 4: Timeout-based obsolescence
  private timedOperations$ = this.commands$.pipe(
    mergeMap(cmd => 
      this.processCommand(cmd).pipe(
        timeout(5000), // Obsolete after 5 seconds
        catchError(() => of({ error: 'Operation timed out' }))
      )
    )
  );
}

// 5. Smart obsolescence with takeUntil
interface CancellableOperation {
  execute$: Observable<any>;
  cancel$: Subject<void>;
}

class SmartObsolescence {
  private operations = new Map<string, CancellableOperation>();
  
  queueOperation(id: string, category: string, execute: () => Observable<any>) {
    // Cancel existing operation if needed
    this.cancelIfObsolete(category);
    
    const cancel$ = new Subject<void>();
    const execute$ = execute().pipe(
      takeUntil(cancel$), // Cancellable
      finalize(() => this.operations.delete(id))
    );
    
    this.operations.set(id, { execute$, cancel$ });
    
    return execute$.subscribe();
  }
  
  private cancelIfObsolete(newCategory: string) {
    const obsolescenceRules = {
      'data-add': ['layout-update', 'algorithm-run'],
      'layout-set': ['layout-update'],
      'style-init': ['style-apply']
    };
    
    const toCancel = obsolescenceRules[newCategory] || [];
    
    for (const [id, op] of this.operations) {
      const opCategory = this.getCategory(id);
      if (toCancel.includes(opCategory)) {
        op.cancel$.next(); // Cancel the operation
        op.cancel$.complete();
      }
    }
  }
}

// 6. Debounced operations with reset
const debouncedLayout$ = this.layoutCommands$.pipe(
  tap(() => this.cancelCurrentLayout()), // Cancel any running layout
  debounceTime(100), // Wait for rapid changes to settle
  switchMap(cmd => this.processLayoutCommand(cmd))
);

// 7. Priority-based obsolescence
interface PrioritizedCommand {
  command: any;
  priority: number;
}

const prioritizedOperations$ = this.commands$.pipe(
  scan((queue, cmd) => {
    // High priority commands obsolete lower priority ones
    const filtered = queue.filter(
      queued => queued.priority >= cmd.priority
    );
    return [...filtered, cmd].sort((a, b) => b.priority - a.priority);
  }, [] as PrioritizedCommand[]),
  concatMap(queue => {
    if (queue.length === 0) return EMPTY;
    const highest = queue[0];
    return of(highest).pipe(
      tap(() => queue.shift()) // Remove from queue
    );
  }),
  mergeMap(cmd => this.processCommand(cmd.command))
);
```

#### Reactive Dependency System
```typescript
// Instead of manual dependencies, use reactive state
export class ReactiveLayoutManager {
  private layout$ = new BehaviorSubject<LayoutEngine | null>(null);
  
  // Layout automatically reacts to data changes
  constructor(private dataManager: DataManager) {
    combineLatest([
      this.layout$,
      this.dataManager.nodes$,
      this.dataManager.edges$
    ]).pipe(
      filter(([layout]) => layout !== null),
      debounceTime(50), // Debounce rapid changes
      switchMap(([layout, nodes, edges]) => 
        this.updateLayout(layout!, nodes, edges)
      )
    ).subscribe();
  }
}
```

### 3. Integration with Babylon.js Observables

```typescript
import { Observable as BabylonObservable } from '@babylonjs/core';
import { Observable, fromEventPattern, share } from 'rxjs';

// Utility to convert Babylon.js Observable to RxJS Observable
export function fromBabylonObservable<T>(
  babylonObservable: BabylonObservable<T>
): Observable<T> {
  return fromEventPattern<T>(
    // Add handler
    (handler) => babylonObservable.add(handler),
    // Remove handler
    (handler) => babylonObservable.removeCallback(handler)
  ).pipe(
    share() // Share subscription among multiple observers
  );
}

// Example wrappers for common Babylon.js observables
export class BabylonRxBridge {
  // Scene observables
  static fromScene(scene: Scene) {
    return {
      beforeRender$: fromBabylonObservable(scene.onBeforeRenderObservable),
      afterRender$: fromBabylonObservable(scene.onAfterRenderObservable),
      ready$: fromBabylonObservable(scene.onReadyObservable),
      disposed$: fromBabylonObservable(scene.onDisposeObservable),
      pointerMove$: fromBabylonObservable(scene.onPointerObservable).pipe(
        filter(info => info.type === PointerEventTypes.POINTERMOVE)
      ),
      pointerPick$: fromBabylonObservable(scene.onPointerObservable).pipe(
        filter(info => info.type === PointerEventTypes.POINTERPICK)
      )
    };
  }
  
  // Mesh observables
  static fromMesh(mesh: Mesh) {
    return {
      disposed$: fromBabylonObservable(mesh.onDisposeObservable),
      materialChanged$: fromBabylonObservable(mesh.onMaterialChangedObservable),
      ready$: fromBabylonObservable(mesh.onMeshReadyObservable)
    };
  }
  
  // Camera observables
  static fromCamera(camera: Camera) {
    return {
      viewMatrixChanged$: fromBabylonObservable(camera.onViewMatrixChangedObservable),
      projectionMatrixChanged$: fromBabylonObservable(camera.onProjectionMatrixChangedObservable),
      afterCheckInputs$: fromBabylonObservable(camera.onAfterCheckInputsObservable)
    };
  }
}

// Integration in Graph class
export class RxGraphWithBabylon {
  private scene: Scene;
  private destroy$ = new Subject<void>();
  
  constructor(scene: Scene) {
    this.scene = scene;
    this.setupBabylonIntegration();
  }
  
  private setupBabylonIntegration() {
    const sceneEvents = BabylonRxBridge.fromScene(this.scene);
    
    // React to pointer events with RxJS operators
    const nodeHover$ = sceneEvents.pointerMove$.pipe(
      map(info => info.pickInfo),
      filter(pickInfo => pickInfo.hit && pickInfo.pickedMesh?.metadata?.isNode),
      distinctUntilChanged((a, b) => a.pickedMesh === b.pickedMesh),
      map(pickInfo => pickInfo.pickedMesh.metadata.nodeId)
    );
    
    // Debounced hover for tooltips
    const tooltipShow$ = nodeHover$.pipe(
      debounceTime(500),
      switchMap(nodeId => this.loadNodeDetails(nodeId))
    );
    
    // Camera updates trigger render optimization
    const cameraEvents = BabylonRxBridge.fromCamera(this.scene.activeCamera);
    
    const optimizedRender$ = merge(
      cameraEvents.viewMatrixChanged$,
      this.dataChanged$
    ).pipe(
      debounceTime(16), // 60fps max
      tap(() => this.updateLOD()),
      takeUntil(this.destroy$)
    );
    
    // Combine Babylon events with application events
    const allEvents$ = merge(
      sceneEvents.beforeRender$.pipe(map(() => ({ type: 'frame' }))),
      this.dataCommands$.pipe(map(cmd => ({ type: 'data', cmd }))),
      nodeHover$.pipe(map(nodeId => ({ type: 'hover', nodeId })))
    );
    
    // Process all events through a single pipeline
    allEvents$.pipe(
      scan((state, event) => this.reducer(state, event), initialState),
      distinctUntilChanged(),
      tap(state => this.applyState(state)),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  
  // Clean shutdown
  dispose() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 4. Advanced Babylon.js + RxJS Patterns

```typescript
// Pattern 1: Drag and Drop with RxJS
export class DragDropHandler {
  setupDragging(scene: Scene) {
    const pointerDown$ = fromBabylonObservable(scene.onPointerObservable).pipe(
      filter(info => info.type === PointerEventTypes.POINTERDOWN),
      filter(info => info.pickInfo.hit && info.pickInfo.pickedMesh?.metadata?.draggable)
    );
    
    const pointerMove$ = fromBabylonObservable(scene.onPointerObservable).pipe(
      filter(info => info.type === PointerEventTypes.POINTERMOVE)
    );
    
    const pointerUp$ = fromBabylonObservable(scene.onPointerObservable).pipe(
      filter(info => info.type === PointerEventTypes.POINTERUP)
    );
    
    // Drag stream
    const drag$ = pointerDown$.pipe(
      switchMap(downEvent => {
        const mesh = downEvent.pickInfo.pickedMesh;
        const startPos = mesh.position.clone();
        
        return pointerMove$.pipe(
          map(moveEvent => ({
            mesh,
            startPos,
            currentPos: moveEvent.pickInfo.pickedPoint
          })),
          takeUntil(pointerUp$)
        );
      })
    );
    
    return drag$;
  }
}

// Pattern 2: Performance monitoring
export class PerformanceMonitor {
  monitorFPS(engine: Engine) {
    return fromBabylonObservable(engine.onEndFrameObservable).pipe(
      bufferTime(1000), // Collect frames for 1 second
      map(frames => frames.length), // FPS
      distinctUntilChanged(),
      tap(fps => {
        if (fps < 30) {
          this.degradeQuality();
        } else if (fps > 55) {
          this.improveQuality();
        }
      })
    );
  }
}

// Pattern 3: Reactive animations
export class ReactiveAnimations {
  animateOnDataChange(mesh: Mesh, data$: Observable<any>) {
    return data$.pipe(
      // Smooth transitions between data updates
      switchMap(newData => {
        const targetScale = this.calculateScale(newData);
        return this.animateValue(
          mesh.scaling.x,
          targetScale,
          500 // 500ms animation
        );
      }),
      tap(scale => mesh.scaling.setAll(scale))
    );
  }
  
  private animateValue(from: number, to: number, duration: number) {
    const steps = 60 * (duration / 1000); // 60fps
    return interval(16.67).pipe( // ~60fps
      take(steps),
      map(i => {
        const progress = (i + 1) / steps;
        const eased = this.easeInOutCubic(progress);
        return from + (to - from) * eased;
      })
    );
  }
}
```

### 5. Integration with Graph Class

```typescript
export class Graph {
  private operations: RxGraphOperationManager;
  private babylonBridge: BabylonRxBridge;
  
  constructor() {
    this.operations = new RxGraphOperationManager(
      this.styleManager,
      this.dataManager,
      this.layoutManager,
      this.renderManager
    );
    
    // Bridge Babylon.js events to RxJS
    this.setupBabylonIntegration();
    
    // Expose state for UI
    this.operations.state$.subscribe(state => {
      this.eventManager.emit('state-changed', state);
    });
  }
  
  private setupBabylonIntegration() {
    // Convert existing event emitters to RxJS
    const nodeClicked$ = fromBabylonObservable(
      this.scene.onPointerObservable
    ).pipe(
      filter(info => info.type === PointerEventTypes.POINTERPICK),
      map(info => info.pickInfo),
      filter(pick => pick.hit && pick.pickedMesh?.metadata?.nodeId),
      map(pick => ({
        nodeId: pick.pickedMesh.metadata.nodeId,
        event: pick.event
      }))
    );
    
    // React to clicks with graph operations
    nodeClicked$.pipe(
      throttleTime(300), // Prevent double clicks
      tap(({ nodeId }) => this.selectNode(nodeId)),
      switchMap(({ nodeId }) => this.loadNodeConnections(nodeId))
    ).subscribe();
  }
  
  // Simple public API
  setStyleTemplate(template: StyleSchema) {
    this.operations.setStyleTemplate(template);
  }
  
  addNodes(nodes: any[]) {
    this.operations.addNodes(nodes);
  }
  
  // Batch operations naturally
  loadGraph(data: GraphData) {
    // These all happen in the same tick, automatically batched
    this.setStyleTemplate(data.style);
    this.addNodes(data.nodes);
    this.addEdges(data.edges);
    this.setLayout(data.layout);
  }
}
```

### 4. Benefits of Event-Driven RxJS Approach

#### No Dependency Management Needed
```typescript
// Dependencies are implicit in the reactive chain
styleReady$ → enablesDataOperations$
dataChanged$ → triggersLayoutUpdate$
layoutChanged$ → triggersRender$

// The system naturally flows in the correct order
```

#### Automatic Optimization
```typescript
// Automatic deduplication
const optimizedRender$ = renderTriggers$.pipe(
  distinctUntilChanged(),
  debounceTime(16), // Automatic frame rate limiting
  exhaustMap(() => this.render()) // Skip renders if one is running
);
```

#### Elegant Error Handling
```typescript
const resilientOperations$ = operations$.pipe(
  retry({ count: 3, delay: 1000 }),
  catchError(error => {
    this.showError(error);
    return EMPTY; // Continue stream
  })
);
```

### 5. Testing Benefits

```typescript
describe('RxJS Operations', () => {
  it('should automatically trigger layout on data change', () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
    
    scheduler.run(({ cold, expectObservable }) => {
      const dataChanges = cold('--a--b--c--|');
      const expected = '        --x--y--z--|';
      
      const layoutUpdates$ = dataChanges.pipe(
        map(() => 'layout-update')
      );
      
      expectObservable(layoutUpdates$).toBe(expected, {
        x: 'layout-update',
        y: 'layout-update',
        z: 'layout-update'
      });
    });
  });
});
```

## Comparison: Explicit Dependencies vs Event-Driven

### Explicit Dependencies (Current)
```typescript
// Must manually define dependencies
const DEPENDENCIES = {
  'data-add': ['style-init'],
  'layout-update': ['data-add'],
  'render': ['layout-update']
};

// Must sort operations
const sorted = topologicalSort(operations, DEPENDENCIES);

// Execute in order
for (const op of sorted) {
  await op.execute();
}
```

### Event-Driven (RxJS)
```typescript
// Operations naturally flow based on state
styleReady$.pipe(
  switchMap(() => dataOperations$),
  switchMap(() => layoutOperations$),
  switchMap(() => renderOperations$)
).subscribe();

// Or even simpler with automatic triggers
dataChanged$.subscribe(() => {
  // Layout automatically updates
  // Render automatically updates
});
```

## Migration Strategy

### Phase 1: Add RxJS Streams Alongside Current System
```typescript
class Graph {
  // Keep existing system
  private operationQueue: OperationQueueManager;
  
  // Add RxJS streams
  private styleChanged$ = new Subject();
  private dataChanged$ = new Subject();
  
  // Gradually migrate operations
}
```

### Phase 2: Replace Operation Categories with Streams
```typescript
// Instead of
this.operationQueue.queueOperation('data-add', () => {...});

// Use
this.dataCommands$.next({ type: 'add', nodes });
```

### Phase 3: Remove Dependency Management
- Remove topological sorting
- Remove dependency definitions
- Let natural event flow handle ordering

## Real-World Example: Complete Graph Update Flow

Here's how a typical graph update would work with RxJS obsolescence:

```typescript
class GraphOperationManager {
  // Track running operations for smart cancellation
  private runningOps = new Map<string, Subscription>();
  
  setupGraphUpdateFlow() {
    // User actions that trigger updates
    const userActions$ = merge(
      this.fileUpload$.pipe(map(file => ({ type: 'data', file }))),
      this.layoutSelect$.pipe(map(layout => ({ type: 'layout', layout }))),
      this.styleChange$.pipe(map(style => ({ type: 'style', style })))
    );
    
    // Smart routing with obsolescence
    userActions$.pipe(
      groupBy(action => action.type),
      mergeMap(group$ => {
        switch (group$.key) {
          case 'data':
            // Data changes cancel everything downstream
            return group$.pipe(
              tap(() => this.cancelOperations(['layout', 'render', 'algorithm'])),
              switchMap(action => this.loadData(action.file)),
              tap(() => this.triggerDownstream(['layout', 'render']))
            );
            
          case 'layout':
            // Layout changes only cancel algorithms and renders
            return group$.pipe(
              tap(() => this.cancelOperations(['algorithm', 'render'])),
              debounceTime(200), // Let user finish selecting
              switchMap(action => this.updateLayout(action.layout))
            );
            
          case 'style':
            // Style changes only cancel renders
            return group$.pipe(
              tap(() => this.cancelOperations(['render'])),
              throttleTime(100), // Limit rapid style changes
              switchMap(action => this.applyStyle(action.style))
            );
        }
      })
    ).subscribe();
  }
  
  private cancelOperations(types: string[]) {
    types.forEach(type => {
      this.runningOps.get(type)?.unsubscribe();
      this.runningOps.delete(type);
    });
  }
}
```

## Obsolescence Strategies Summary

### 1. **Automatic Cancellation (`switchMap`)**
Best for: Operations where only the latest matters
```typescript
searchResults$ = searchInput$.pipe(
  debounceTime(300),
  switchMap(query => this.search(query)) // Auto-cancels previous search
);
```

### 2. **Ignore Until Complete (`exhaustMap`)**
Best for: Critical operations that must complete
```typescript
saveOperation$ = saveButton$.pipe(
  exhaustMap(() => this.saveToServer()) // Ignores clicks while saving
);
```

### 3. **Conditional Cancellation (`takeUntil`)**
Best for: Fine-grained control over when to cancel
```typescript
longOperation$ = start$.pipe(
  switchMap(() => 
    this.longRunningTask().pipe(
      takeUntil(cancelButton$) // User-initiated cancel
    )
  )
);
```

### 4. **Smart Obsolescence (Custom Logic)**
Best for: Complex business rules
```typescript
operation$ = command$.pipe(
  mergeMap(cmd => {
    // Check if this obsoletes other operations
    if (cmd.obsoletes && this.shouldCancel(cmd)) {
      this.cancelRelatedOperations(cmd.obsoletes);
    }
    return this.execute(cmd);
  })
);
```

### 5. **Race Conditions (`race`)**
Best for: Multiple approaches to same goal
```typescript
fastestResult$ = race(
  this.cachedData$,
  this.fetchFromAPI$,
  this.computeLocally$
); // First to emit wins, others cancelled
```

## Critical Design Questions & Answers

### 1. How does this work with batched updates?

RxJS provides multiple batching strategies:

```typescript
// Strategy 1: Micro-task batching (same event loop tick)
const batchedCommands$ = this.commands$.pipe(
  bufferTime(0), // Collects all emissions in current tick
  filter(commands => commands.length > 0)
);

// Strategy 2: Time-window batching
const timeBatchedCommands$ = this.commands$.pipe(
  bufferTime(16), // Collect for 16ms (~60fps)
  filter(commands => commands.length > 0)
);

// Strategy 3: Count-based batching
const countBatchedCommands$ = this.commands$.pipe(
  bufferCount(100), // Batch every 100 commands
);

// Strategy 4: Smart batching with buffer toggle
const smartBatch$ = this.commands$.pipe(
  buffer(
    this.commands$.pipe(
      debounceTime(0) // Emit when commands stop coming
    )
  )
);

// Real-world example: Batching node additions
class BatchedDataManager {
  private nodeCommands$ = new Subject<AddNodeCommand>();
  
  constructor() {
    // Batch all node additions in same tick
    this.nodeCommands$.pipe(
      bufferTime(0),
      filter(nodes => nodes.length > 0),
      map(commands => this.mergeNodeCommands(commands)),
      exhaustMap(batch => this.processBatch(batch))
    ).subscribe();
  }
  
  addNodes(nodes: any[]) {
    // Each call adds to the batch
    nodes.forEach(node => 
      this.nodeCommands$.next({ type: 'add', node })
    );
  }
}
```

### 2. How does this handle changes while pipeline is running?

This depends on the operator you choose:

```typescript
// Option 1: Queue changes (concatMap) - preserves order
const queuedUpdates$ = this.updates$.pipe(
  concatMap(update => this.processUpdate(update)) // Waits for each to complete
);

// Option 2: Cancel previous (switchMap) - only latest matters
const latestOnly$ = this.updates$.pipe(
  switchMap(update => this.processUpdate(update)) // Cancels previous
);

// Option 3: Ignore while busy (exhaustMap) - drops intermediate
const skipWhileBusy$ = this.updates$.pipe(
  exhaustMap(update => this.processUpdate(update)) // Ignores new until done
);

// Option 4: Process in parallel (mergeMap) - concurrent execution
const parallel$ = this.updates$.pipe(
  mergeMap(update => this.processUpdate(update), 3) // Max 3 concurrent
);

// Real-world example: Layout updates during data loading
class SmartLayoutManager {
  private layoutQueue$ = new Subject<LayoutCommand>();
  
  constructor() {
    this.layoutQueue$.pipe(
      // Group by command type
      groupBy(cmd => cmd.type),
      mergeMap(group$ => {
        switch (group$.key) {
          case 'set-engine':
            // Only one engine change at a time, cancel previous
            return group$.pipe(
              switchMap(cmd => this.setLayoutEngine(cmd))
            );
            
          case 'update-positions':
            // Queue position updates
            return group$.pipe(
              bufferTime(0), // Batch in same tick
              filter(cmds => cmds.length > 0),
              concatMap(batch => this.updatePositions(batch))
            );
            
          case 'optimize':
            // Skip optimization if one is running
            return group$.pipe(
              exhaustMap(cmd => this.optimizeLayout(cmd))
            );
        }
      })
    ).subscribe();
  }
}
```

### 3. Centralized vs Distributed Event Management?

Both approaches have merit. Here's a comparison:

#### Option A: Centralized Event Bus
```typescript
// Centralized approach - Single source of truth
export class CentralEventBus {
  // All events flow through here
  private events$ = new Subject<GraphEvent>();
  
  // Typed event streams
  readonly dataChanged$ = this.events$.pipe(
    filter(e => e.type === 'data-changed'),
    map(e => e.payload as DataPayload)
  );
  
  readonly layoutChanged$ = this.events$.pipe(
    filter(e => e.type === 'layout-changed'),
    map(e => e.payload as LayoutPayload)
  );
  
  emit(event: GraphEvent) {
    this.events$.next(event);
  }
}

// Managers subscribe to central bus
class DataManager {
  constructor(private eventBus: CentralEventBus) {
    // Listen for style changes
    eventBus.styleChanged$.pipe(
      tap(() => this.reapplyStyles())
    ).subscribe();
  }
  
  addNodes(nodes: any[]) {
    // ... add nodes ...
    this.eventBus.emit({ type: 'data-changed', payload: { nodes } });
  }
}
```

#### Option B: Distributed Component Events
```typescript
// Distributed approach - Each component manages its events
class DataManager {
  // Own events
  private dataChanged$ = new Subject<DataChange>();
  
  // Expose as observable
  readonly dataChanges$ = this.dataChanged$.asObservable();
  
  addNodes(nodes: any[]) {
    // ... add nodes ...
    this.dataChanged$.next({ type: 'nodes-added', nodes });
  }
}

class LayoutManager {
  constructor(private dataManager: DataManager) {
    // Direct subscription to data manager
    dataManager.dataChanges$.pipe(
      debounceTime(50),
      tap(change => this.updateLayout(change))
    ).subscribe();
  }
}
```

#### Option C: Hybrid Approach (Recommended)
```typescript
// Best of both worlds
export class EventCoordinator {
  // High-level orchestration events
  private commands$ = new Subject<Command>();
  
  // Managers expose their own streams
  constructor(
    private dataManager: DataManager,
    private layoutManager: LayoutManager,
    private renderManager: RenderManager
  ) {
    this.setupOrchestration();
  }
  
  private setupOrchestration() {
    // Coordinate between managers
    this.dataManager.dataChanges$.pipe(
      // Smart batching and routing
      bufferTime(0),
      filter(changes => changes.length > 0),
      map(changes => ({ 
        type: 'update-layout', 
        reason: 'data-changed',
        changes 
      }))
    ).subscribe(cmd => this.layoutManager.execute(cmd));
    
    // High-level commands
    this.commands$.pipe(
      groupBy(cmd => cmd.type),
      mergeMap(group$ => this.routeCommand(group$))
    ).subscribe();
  }
}

// Managers still have autonomy
class DataManager {
  // Own internal events
  private internalChanges$ = new Subject();
  
  // Public events for coordination
  readonly dataChanges$ = this.internalChanges$.pipe(
    // Can add manager-specific logic
    distinctUntilChanged(),
    share()
  );
}
```

### Recommendation: Hybrid Approach

The hybrid approach is best because:

1. **Local autonomy**: Each manager handles its own concerns
2. **Global coordination**: High-level orchestration when needed
3. **Testability**: Can test managers in isolation
4. **Flexibility**: Can add cross-cutting concerns easily
5. **Performance**: Avoid unnecessary event propagation

```typescript
// Example implementation
export class GraphtyElement {
  private coordinator: EventCoordinator;
  
  constructor() {
    // Managers handle their own domains
    const dataManager = new DataManager();
    const layoutManager = new LayoutManager();
    const renderManager = new RenderManager();
    
    // Coordinator handles cross-cutting concerns
    this.coordinator = new EventCoordinator(
      dataManager,
      layoutManager,
      renderManager
    );
    
    // Public API triggers coordinator commands
    this.coordinator.commands$.next({ type: 'load-graph', data });
  }
}
```

## Conclusion

The RxJS event-driven approach eliminates the need for explicit dependency management entirely. Operations naturally flow in the correct order based on state changes and event emissions. This results in:

1. **Simpler code**: No dependency graphs or sorting algorithms
2. **More maintainable**: Dependencies are implicit in the reactive chain
3. **Better performance**: Automatic batching, deduplication, and cancellation
4. **More flexible**: Easy to add new operation types without updating dependency maps
5. **Natural parallelism**: Operations that can run in parallel do so automatically
6. **Elegant obsolescence**: Built-in operators handle cancellation patterns naturally

Key architectural decisions:
- **Batching**: Use `bufferTime(0)` for micro-task batching
- **Concurrency**: Choose operators based on desired behavior (switchMap, exhaustMap, concatMap)
- **Event Architecture**: Hybrid approach with local autonomy + global coordination

The reactive approach aligns perfectly with the graph's event-driven nature, making the code more intuitive and easier to reason about. Obsolescence becomes a natural part of the data flow rather than a complex state management problem.