# Implementation Plan for Dependency Management and Batching System

## Change Summary - 2025-10-26

### New Requirements Added:
- **Phase 7 Simplification**: Remove migration guides and user documentation - this is an internal feature not exposed to external users
- **Determinism Testing**: Add comprehensive Storybook stories to verify property setting order independence

### Sections Modified:
- **Phase 7 (Documentation and Migration Support)**: Removed migration guides and user documentation tasks; refocused on internal documentation and debug tools only
- **Phase 7 (NEW)**: Added new section for determinism testing with Storybook stories
- **Success Metrics**: Removed migration-related metrics; added determinism verification metric

### Impact Assessment:
- Breaking changes: No - these are additive/reductive changes to implementation plan only
- Implementation effort: Reduced overall (less documentation), but added focused testing effort (~1 day for new stories)
- Risk factors: None - simplification reduces scope and testing stories increase confidence in core functionality

## Overview
Build a robust command batching and dependency management system using `p-queue` and `toposort` libraries to ensure deterministic execution order of graph operations regardless of how they're called. The system will be implemented as a separate `OperationQueueManager` that integrates seamlessly with existing managers.

## Critical Design Decision: Deferred Promise Resolution for Batching

### The Problem
The Graph API methods (like `addNodes`, `setLayout`) return Promises that resolve when operations complete. However, in a batched system, operations shouldn't execute until the entire batch is ready. This creates a deadlock when using `await` inside batch callbacks:

```typescript
// DEADLOCK SCENARIO (without deferred promises):
await graph.batchOperations(async () => {
  await graph.addNodes([{id: "1"}]); // Waits for operation to complete
                                      // But operation won't run until batch ends
                                      // But batch won't end until this resolves
                                      // DEADLOCK!
});
```

### The Solution: Deferred Promise Resolution
We implement a two-phase approach:
1. **Queue Phase (Batch Mode)**: Operations are queued and return deferred promises immediately
2. **Execution Phase**: Operations execute in dependency order, then promises resolve

This allows natural `await` syntax while maintaining proper batching:

```typescript
// WORKS with deferred promises:
await graph.batchOperations(async () => {
  await graph.addNodes([{id: "1"}]);     // Returns deferred promise immediately
  await graph.setLayout("ngraph");       // Returns deferred promise immediately
  await graph.setStyleTemplate({...});   // Returns deferred promise immediately
});
// After callback completes:
// 1. Operations are sorted by dependency (style → data → layout)
// 2. Operations execute in correct order
// 3. Promises resolve in dependency order
```

### Key Benefits
- **No API Changes**: Existing code continues to work
- **Natural Async/Await**: Developers can use familiar patterns
- **Proper Ordering**: Operations execute in dependency order, not call order
- **Atomic Batches**: All operations in a batch succeed or fail together
- **Performance**: Obsolescence rules and coalescing still apply

## Phase Breakdown

### Phase 1: Core Queue Infrastructure with Deferred Promise Resolution
**Objective**: Establish the foundation with basic queue management, dependency ordering, and deferred promise resolution for proper batching
**Duration**: 2-3 days

**Tests to Write First**:
- `test/managers/OperationQueueManager.test.ts`: Core queue functionality
  ```typescript
  describe('OperationQueueManager', () => {
    it('should queue and execute operations in dependency order');
    it('should batch operations queued in same microtask');
    it('should handle circular dependencies gracefully');
    it('should emit lifecycle events (start, complete, error)');
    it('should provide queue statistics');
  });
  ```

- `test/managers/OperationQueueManager.dependency.test.ts`: Dependency sorting
  ```typescript
  describe('Dependency Ordering', () => {
    it('should order style-init before style-apply');
    it('should order data-add before layout operations');
    it('should handle operations with no dependencies');
    it('should sort multiple operation categories correctly');
  });
  ```

- `test/managers/OperationQueueManager.batching.test.ts`: Deferred promise batching
  ```typescript
  describe('Deferred Promise Batching', () => {
    it('should defer promise resolution when in batch mode');
    it('should resolve promises after batch execution in dependency order');
    it('should handle promise rejection for failed operations');
    it('should clean up deferred promises after batch completion');
    it('should allow await within batchOperations callbacks');
  });
  ```

**Implementation**:
- `src/managers/OperationQueueManager.ts`: Core queue manager with deferred promises
  ```typescript
  // Core interfaces: Operation, OperationCategory, OperationContext
  // Basic queue with p-queue, dependency sorting with toposort
  // Event emission for operation lifecycle
  
  // NEW: Deferred promise resolution for batching
  interface DeferredPromise {
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason?: any) => void;
    operationId: string;
  }
  
  class OperationQueueManager {
    private batchMode = false;
    private deferredPromises = new Map<string, DeferredPromise>();
    private batchOperations = new Set<string>();
    
    queueOperation(category, execute, options): Promise<void> {
      const id = `op-${this.operationCounter++}`;
      
      if (this.batchMode) {
        // In batch mode: queue but defer execution
        this.pendingOperations.set(id, operation);
        this.batchOperations.add(id);
        
        // Return deferred promise
        return new Promise((resolve, reject) => {
          this.deferredPromises.set(id, { resolve, reject, operationId: id });
        });
      } else {
        // Normal mode: execute in next microtask
        this.currentBatch.add(id);
        if (this.currentBatch.size === 1) {
          queueMicrotask(() => this.executeBatch());
        }
        // Return promise that resolves when operation completes
        return operation.promise;
      }
    }
    
    enterBatchMode(): void {
      this.batchMode = true;
      this.batchOperations.clear();
    }
    
    exitBatchMode(): void {
      this.batchMode = false;
      // Execute all batched operations in dependency order
      this.executeBatchedOperations();
    }
    
    private executeBatchedOperations(): void {
      const operations = Array.from(this.batchOperations)
        .map(id => this.pendingOperations.get(id))
        .filter(op => op !== undefined);
      
      // Sort by dependency order
      const sorted = this.sortOperations(operations);
      
      // Execute and resolve deferred promises
      sorted.forEach(op => {
        this.executeOperation(op).then(() => {
          const deferred = this.deferredPromises.get(op.id);
          if (deferred) {
            deferred.resolve();
            this.deferredPromises.delete(op.id);
          }
        }).catch(error => {
          const deferred = this.deferredPromises.get(op.id);
          if (deferred) {
            deferred.reject(error);
            this.deferredPromises.delete(op.id);
          }
        });
      });
      
      this.batchOperations.clear();
    }
  }
  ```

- `src/managers/interfaces.ts`: Update with queue-aware interfaces
  ```typescript
  interface QueueableManager extends Manager {
    queueOperation?(category: OperationCategory, fn: Function): string;
  }
  ```

**Dependencies**: 
- External: `p-queue@^8.0.0`, `toposort@^2.0.2`
- Internal: EventManager

**Verification**:
1. Run: `npm test -- OperationQueueManager`
2. Expected: All tests pass, operations execute in correct order
3. Check: Queue events are emitted properly

### Phase 2: Progress Tracking and Cancellation
**Objective**: Add progress tracking, cancellation support, and operation metadata
**Duration**: 2 days

**Tests to Write First**:
- `test/managers/OperationQueueManager.progress.test.ts`: Progress tracking
  ```typescript
  describe('Progress Tracking', () => {
    it('should track operation progress with percent, message, and phase');
    it('should emit progress events during execution');
    it('should cleanup progress after completion');
    it('should handle progress for cancelled operations');
  });
  ```

- `test/managers/OperationQueueManager.cancellation.test.ts`: Cancellation
  ```typescript
  describe('Operation Cancellation', () => {
    it('should cancel operations via AbortController');
    it('should handle signal.aborted checks in operations');
    it('should cleanup cancelled operations properly');
    it('should emit cancellation events');
  });
  ```

**Implementation**:
- Enhance `src/managers/OperationQueueManager.ts`:
  ```typescript
  // Add ProgressContext interface and implementation
  // Integrate AbortController for each operation
  // Add progress tracking Map and event emission
  // Implement cancellation handling in executeOperation
  ```

- Create `src/types/operations.ts`: Operation type definitions
  ```typescript
  export interface OperationProgress {
    percent: number;
    message?: string;
    phase?: string;
    startTime: number;
  }
  ```

**Dependencies**: 
- External: None (uses built-in AbortController)
- Internal: Phase 1 implementation

**Verification**:
1. Run: `npm test -- progress`
2. Create test HTML with progress bar visualization
3. Expected: Progress updates visible, operations cancellable

### Phase 3: Obsolescence Rules and Smart Cancellation
**Objective**: Implement obsolescence rules to automatically cancel outdated operations
**Duration**: 2 days

**Tests to Write First**:
- `test/managers/OperationQueueManager.obsolescence.test.ts`: Obsolescence rules
  ```typescript
  describe('Obsolescence Rules', () => {
    it('should cancel layout-update when new data-add arrives');
    it('should cancel algorithm-run when data changes');
    it('should apply custom obsolescence rules');
    it('should track running vs queued operations separately');
    it('should allow conditional obsolescence with shouldObsolete');
  });
  ```

- `test/integration/obsolescence-scenarios.test.ts`: Real scenarios
  ```typescript
  describe('Obsolescence Scenarios', () => {
    it('should handle rapid data updates efficiently');
    it('should not cancel near-complete operations (>90% progress)');
    it('should cancel cascading obsolete operations');
  });
  ```

**Implementation**:
- Extend `src/managers/OperationQueueManager.ts`:
  ```typescript
  // Add OBSOLESCENCE_RULES constant
  // Implement applyObsolescenceRules method
  // Track running and queued operations separately
  // Add custom obsolescence support in queueOperation
  ```

- Create `src/constants/obsolescence-rules.ts`:
  ```typescript
  export const OBSOLESCENCE_RULES: Record<OperationCategory, ObsolescenceRule>;
  // Define which operations obsolete others
  ```

**Dependencies**: 
- External: None
- Internal: Phase 1 & 2 implementations

**Verification**:
1. Run: `npm test -- obsolescence`
2. Test with rapid UI interactions (multiple layout changes)
3. Expected: Only latest relevant operations execute

### Phase 4: Graph Integration - Core Methods
**Objective**: Integrate queue with Graph class core methods (data, layout, styles) using deferred promise pattern
**Duration**: 2-3 days

**Tests to Write First**:
- `test/graph/graph-queue-integration.test.ts`: Basic integration
  ```typescript
  describe('Graph Queue Integration', () => {
    it('should queue addNodes operations');
    it('should queue setLayout operations');
    it('should ensure style-init before data operations');
    it('should handle batchOperations method');
    it('should maintain backwards compatibility');
  });
  ```

- `test/integration/operation-ordering.test.ts`: Order verification with batching
  ```typescript
  describe('Operation Ordering', () => {
    it('should execute styles → data → layout → render');
    it('should handle interleaved operations correctly');
    it('should process multiple batches sequentially');
    // NEW: Test deferred promise resolution
    it('should allow await inside batchOperations callback');
    it('should resolve promises in dependency order, not call order');
    it('should maintain operation atomicity within batch');
  });
  ```

**Implementation**:
- Update `src/graph/graph.ts`:
  ```typescript
  // Initialize OperationQueueManager in constructor
  // Wrap public methods with queue operations:
  // - setStyleTemplate → style-init
  // - addNodes/addEdges → data-add
  // - setLayout → layout-set
  
  // NEW: batchOperations with deferred promise support
  async batchOperations(fn: () => Promise<void> | void): Promise<void> {
    // Enter batch mode - operations will queue but not execute
    this.operationQueue.enterBatchMode();
    
    try {
      // Execute callback - operations return deferred promises
      const result = fn();
      if (result instanceof Promise) {
        await result; // Wait for all operations to be queued
      }
    } finally {
      // Exit batch mode - executes all operations in dependency order
      // and resolves deferred promises
      this.operationQueue.exitBatchMode();
      
      // Wait for all operations in the batch to complete
      await this.operationQueue.waitForBatchCompletion();
    }
  }
  
  // Example of wrapped method that works with deferred promises:
  async addNodes(nodes: any[], idPath?: string): Promise<void> {
    return this.operationQueue.queueOperation(
      'data-add',
      (context) => {
        // Original addNodes logic
        this.dataManager.addNodes(nodes, idPath);
      },
      {
        description: `Adding ${nodes.length} nodes`,
        skipQueue: options?.skipQueue
      }
    );
    // Returns immediately with deferred promise in batch mode,
    // or executes and returns completion promise in normal mode
  }
  ```

- Create migration helpers in `src/utils/queue-migration.ts`:
  ```typescript
  // Helper functions to wrap existing methods
  // Maintain backwards compatibility
  ```

**Dependencies**: 
- External: None
- Internal: Phase 1-3, all existing managers

**Verification**:
1. Run: `npm run test:all`
2. Load Storybook examples - all should work unchanged
3. Expected: Deterministic execution regardless of call order

### Phase 5: Automatic Triggers and Layout Updates
**Objective**: Implement automatic operation triggers (e.g., layout update after data changes)
**Duration**: 2 days

**Tests to Write First**:
- `test/managers/OperationQueueManager.triggers.test.ts`: Trigger system
  ```typescript
  describe('Operation Triggers', () => {
    it('should trigger layout-update after data-add');
    it('should skip triggers when skipTriggers flag is set');
    it('should handle custom triggers');
    it('should not trigger if prerequisites missing (no layout engine)');
  });
  ```

- `test/integration/auto-layout.test.ts`: Automatic layout scenarios
  ```typescript
  describe('Automatic Layout Updates', () => {
    it('should update layout when nodes added to existing layout');
    it('should not update if no layout engine set');
    it('should batch layout updates for multiple data operations');
  });
  ```

**Implementation**:
- Enhance `src/managers/OperationQueueManager.ts`:
  ```typescript
  // Add POST_EXECUTION_TRIGGERS constant
  // Implement queueTriggeredOperation method
  // Add trigger support in executeOperation
  // Add skipTriggers flag to metadata
  ```

- Update `src/managers/LayoutManager.ts`:
  ```typescript
  // Add hasLayoutEngine() method
  // Implement updatePositions() for incremental updates
  // Handle addition/removal of nodes in existing layout
  ```

**Dependencies**: 
- External: None
- Internal: Phase 1-4

**Verification**:
1. Run: `npm test -- triggers`
2. Test: Add nodes after layout is set - should auto-position
3. Expected: New nodes automatically positioned without manual layout call

### Phase 6: Advanced Features and Optimization
**Objective**: Add operation coalescing and performance optimizations
**Duration**: 2 days

**Tests to Write First**:
- `test/managers/OperationQueueManager.coalescing.test.ts`: Operation coalescing
  ```typescript
  describe('Operation Coalescing', () => {
    it('should merge multiple data-add operations in same batch');
    it('should combine consecutive style-apply operations');
    it('should preserve order while coalescing');
    it('should not coalesce operations of different categories');
  });
  ```

- `test/performance/queue-performance.test.ts`: Performance benchmarks
  ```typescript
  describe('Queue Performance', () => {
    it('should handle 1000+ operations efficiently');
    it('should coalesce similar operations to reduce work');
    it('should maintain <10ms overhead per operation');
    it('should use dependency graph for all ordering');
  });
  ```

**Implementation**:
- Final enhancements to `src/managers/OperationQueueManager.ts`:
  ```typescript
  // Implement operation coalescing for similar operations
  // Add performance monitoring
  // Optimize batch processing with dependency-only ordering
  // Remove any priority-based logic
  ```

- Create `src/utils/operation-coalescing.ts`:
  ```typescript
  // Logic to merge similar operations (e.g., multiple data-add)
  // Combine payloads while preserving execution order
  // Reduce redundant work
  ```

**Dependencies**: 
- External: None
- Internal: All previous phases

**Verification**:
1. Run: `npm run benchmark`
2. Test with large dataset (10k+ nodes)
3. Expected: Smooth performance, operations complete in dependency order

### Phase 7: Internal Documentation and Determinism Testing **[UPDATED]**
**Objective**: Complete internal documentation, debug tools, and comprehensive determinism verification
**Duration**: 2 days

**Rationale for Changes**:
- Removed migration guides and user documentation since this is an internal feature
- Added extensive determinism testing to verify core requirement: operations should converge to same result regardless of call order

**Tests to Write First**:
- `test/examples/queue-examples.test.ts`: Internal usage examples
  ```typescript
  describe('Queue Usage Examples - Internal', () => {
    it('should demonstrate basic queue integration');
    it('should show bulk operations pattern');
    it('should illustrate progress tracking for debugging');
    it('should show cancellation patterns');
  });
  ```

**[NEW] Storybook Determinism Stories**:
- Create `stories/Determinism.stories.ts`: Property order independence verification
  ```typescript
  /**
   * Stories that verify graph operations produce identical results
   * regardless of the order properties are set.
   *
   * Each story tests the same final state achieved through different
   * property setting orders. Visual regression tests will verify
   * all variants produce identical output.
   */

  describe('Property Order Independence', () => {
    // Test scenario 1: Layout → Styles → Data vs Data → Layout → Styles
    it('layout-styles-data order produces same result');
    it('data-layout-styles order produces same result');
    it('styles-data-layout order produces same result');

    // Test scenario 2: Multiple property types interleaved
    it('layout→camera→styles→data→algorithm produces same result');
    it('data→algorithm→camera→layout→styles produces same result');
    it('camera→styles→algorithm→data→layout produces same result');

    // Test scenario 3: Partial updates in different orders
    it('partial style update before layout produces same result');
    it('partial style update after layout produces same result');

    // Test scenario 4: Complex scenarios
    it('all properties set simultaneously produces same result');
    it('properties set sequentially in various orders produce same result');
  });

  // Story structure example:
  export const LayoutStylesData = {
    render: () => {
      const graph = document.createElement('graphty-element');
      await graph.setLayout('ngraph');
      await graph.setStyleTemplate({ nodeSize: 10 });
      await graph.addNodes([{id: '1'}, {id: '2'}]);
      return graph;
    }
  };

  export const DataLayoutStyles = {
    render: () => {
      const graph = document.createElement('graphty-element');
      await graph.addNodes([{id: '1'}, {id: '2'}]);
      await graph.setLayout('ngraph');
      await graph.setStyleTemplate({ nodeSize: 10 });
      return graph;
    }
  };

  // Both stories should produce visually identical output
  ```

**Implementation**:
- Create `docs/internal/queue-system.md`: Internal documentation for maintainers **[UPDATED]**
  ```markdown
  # Queue System Internal Documentation

  This document describes the internal operation queue system.
  NOT for external user consumption.

  ## Architecture
  ## Operation Categories and Dependencies
  ## Deferred Promise Resolution
  ## Debugging and Troubleshooting
  ```

- Create `examples/queue-progress.html`: Interactive progress example for testing/debugging
- Add debug utilities in `src/utils/queue-debug.ts`:
  ```typescript
  // Queue visualization helpers for internal debugging
  // Operation history tracking
  // Performance profiling tools
  // Determinism verification helpers
  ```

- **[NEW]** Create comprehensive determinism test suite in `stories/Determinism.stories.ts`:
  - Test all combinations of property setting orders
  - Each story variant should produce identical visual output
  - Use visual regression tests to verify pixel-perfect matching
  - Cover: layout, styles, data, camera, algorithms, and their combinations
  - Include edge cases: empty graph, single node, large graphs (100+ nodes)

**Dependencies**:
- External: None
- Internal: All previous phases

**Verification**:
1. Run all internal examples successfully
2. **[NEW]** Run visual regression tests on all Determinism stories - all variants must match
3. **[NEW]** Verify determinism with: `npm run test:storybook -- Determinism`
4. Internal code review by maintainers
5. Performance profiling shows no regression

## Common Utilities Needed
- **Dependency Graph Builder**: Convert category dependencies to toposort format
- **Progress Formatter**: Consistent progress message formatting
- **Operation Logger**: Debug logging for operation flow
- **Performance Timer**: Measure operation durations
- **Event Type Guards**: Type-safe event handling

## External Libraries Assessment
- **p-queue**: Use for robust queue management with built-in concurrency control, cancellation (AbortSignal), and events. Dependency graph determines ordering, not priorities
- **toposort**: Use for ALL operation ordering based on dependency graph - simple, reliable, well-tested
- Consider **eventemitter3** if current EventManager needs performance boost
- Avoid custom implementations where proven libraries exist

## Risk Mitigation
- **Circular Dependencies**: Toposort will detect these; fall back to original order with warning
- **Memory Leaks**: Implement cleanup for progress tracking and completed operations
- **Performance Degradation**: Add operation coalescing to reduce redundant work
- **Breaking Changes**: Maintain backwards compatibility with optional queue bypass
- **Complex Debugging**: Add comprehensive logging and queue visualization tools
- **Long-Running Operations**: Implement chunking for operations over 1000 items

### Phase 8: Eventual Consistency and Reactive Property Updates **[NEW]**
**Objective**: Enable properties to be set at any time (including after initialization) and eventually converge to the specified configuration
**Duration**: 2-3 days

**Architectural Principle**:
The Graph class and its managers must handle all batching and dependency ordering logic. The web component (`graphty-element`) should be a thin, framework-agnostic wrapper that simply forwards property changes to the Graph. This ensures the system can work with any web component framework (or no framework at all) in the future.

**Problem Statement**:
Currently, `graphty-element.ts` only processes properties during `firstUpdated()` lifecycle. Properties set after initialization (e.g., via `setTimeout` or async user code) are not applied to the Graph instance. This breaks the determinism stories Variants 3-6 (async variants) and prevents users from dynamically updating graph properties.

**Root Cause**:
- The web component uses Lit's `@property` decorator which only triggers `firstUpdated()` once
- Subsequent property changes on the web component are not forwarded to Graph methods
- Need property setters on the web component that forward to Graph at any time
- Graph already has methods (addNodes, setLayout, etc.) that use the operation queue
- The forwarding mechanism needs to work continuously, not just during initialization

**Tests to Write First**:
- `test/graphty-element/reactive-updates.test.ts`: Reactive property handling
  ```typescript
  describe('Reactive Property Updates', () => {
    it('should apply nodeData set after initialization');
    it('should apply styleTemplate set after initialization');
    it('should apply layout changes after initialization');
    it('should handle multiple sequential property updates');
    it('should handle rapid property changes (debouncing)');
    it('should maintain state during async property updates');
  });
  ```

- `test/graphty-element/eventual-consistency.test.ts`: Convergence verification
  ```typescript
  describe('Eventual Consistency', () => {
    it('should converge to same state regardless of timing');
    it('should handle properties set via setTimeout');
    it('should handle properties set via Promise.then');
    it('should handle interleaved sync and async updates');
    it('should complete all operations before firing settled event');
  });
  ```

- `test/integration/async-property-scenarios.test.ts`: Real-world async scenarios
  ```typescript
  describe('Async Property Scenarios', () => {
    it('should handle data loaded from fetch API');
    it('should handle user-triggered property changes');
    it('should handle multiple components with async updates');
    it('should handle property updates during animation');
  });
  ```

**Implementation**:

**Key Insight**: Graph already has the correct methods (from Phase 4):
- `this.#graph.addNodes(data)` - queues data-add operation
- `this.#graph.addEdges(data)` - queues data-add operation
- `this.#graph.setLayout(type, config)` - queues layout-set operation
- `this.#graph.setStyleTemplate(template)` - queues style-init operation

**The Problem**: Currently these methods are ONLY called from `asyncFirstUpdated()` lifecycle. When properties change later (e.g., via setTimeout), Lit detects the change but there's no code path that calls the Graph methods again.

**The Solution**: Add custom property setters that call the existing Graph methods immediately when properties change.

- Update `src/graphty-element.ts` with custom property setters:
  ```typescript
  /**
   * Add custom getters/setters for reactive properties.
   * Setters forward to existing Graph methods immediately.
   * No changes needed to Graph - its methods already queue operations correctly.
   */

  // Private backing fields
  #nodeData?: Record<string, unknown>[];
  #edgeData?: Record<string, unknown>[];
  #styleTemplate?: StyleSchema;
  #layout?: string;
  #layoutConfig?: Record<string, unknown>;

  // Custom setter for nodeData - forwards to existing Graph.addNodes() method
  @property({attribute: "node-data"})
  get nodeData(): Record<string, unknown>[] | undefined {
    return this.#nodeData;
  }
  set nodeData(value: Record<string, unknown>[] | undefined) {
    const oldValue = this.#nodeData;
    this.#nodeData = value;

    // Call existing Graph method (which already queues operation)
    if (value && Array.isArray(value)) {
      void this.#graph.addNodes(value);  // Graph.addNodes already exists and queues correctly
    }

    this.requestUpdate('nodeData', oldValue);
  }

  // Custom setter for edgeData - forwards to existing Graph.addEdges() method
  @property({attribute: "edge-data"})
  get edgeData(): Record<string, unknown>[] | undefined {
    return this.#edgeData;
  }
  set edgeData(value: Record<string, unknown>[] | undefined) {
    const oldValue = this.#edgeData;
    this.#edgeData = value;

    // Call existing Graph method (which already queues operation)
    if (value && Array.isArray(value)) {
      void this.#graph.addEdges(value);  // Graph.addEdges already exists and queues correctly
    }

    this.requestUpdate('edgeData', oldValue);
  }

  // Custom setter for styleTemplate - forwards to existing Graph.setStyleTemplate() method
  @property({attribute: "style-template"})
  get styleTemplate(): StyleSchema | undefined {
    return this.#styleTemplate;
  }
  set styleTemplate(value: StyleSchema | undefined) {
    const oldValue = this.#styleTemplate;
    this.#styleTemplate = value;

    // Call existing Graph method (which already queues operation)
    if (value) {
      void this.#graph.setStyleTemplate(value);  // Graph.setStyleTemplate already exists and queues correctly
    }

    this.requestUpdate('styleTemplate', oldValue);
  }

  // Custom setter for layout - forwards to existing Graph.setLayout() method
  @property()
  get layout(): string | undefined {
    return this.#layout;
  }
  set layout(value: string | undefined) {
    const oldValue = this.#layout;
    this.#layout = value;

    // Call existing Graph method (which already queues operation)
    if (value) {
      const templateLayoutOptions = this.#graph.styles?.config.graph.layoutOptions ?? {};
      const mergedConfig = {...templateLayoutOptions, ...(this.#layoutConfig ?? {})};
      void this.#graph.setLayout(value, mergedConfig);  // Graph.setLayout already exists and queues correctly
    }

    this.requestUpdate('layout', oldValue);
  }

  // Add similar custom setters for:
  // - layoutConfig → Graph.setLayout()
  // - layout2d → setDeep(this.#graph.styles.config, "graph.twoD", value)
  // - dataSource → Graph.addDataFromSource()
  // - nodeIdPath, edgeSrcIdPath, edgeDstIdPath → setDeep() calls
  ```

- Simplify `asyncFirstUpdated` in `src/graphty-element.ts`:
  ```typescript
  /**
   * First update only needs to:
   * 1. Set up event forwarding
   * 2. Initialize the graph
   *
   * Property forwarding now happens automatically via custom setters above,
   * not in this lifecycle method.
   */
  async asyncFirstUpdated(changedProperties: Map<string, unknown>): Promise<void> {
    // Forward internal graph events as DOM events
    this.#graph.addListener("graph-settled", (event) => {
      this.dispatchEvent(new CustomEvent("graph-settled", {
        detail: event,
        bubbles: true,
        composed: true,
      }));
    });

    this.#graph.addListener("skybox-loaded", (event) => {
      this.dispatchEvent(new CustomEvent("skybox-loaded", {
        detail: event,
        bubbles: true,
        composed: true,
      }));
    });

    // Initialize the graph (only needs to happen once)
    await this.#graph.init();

    // Wait for first render frame to ensure graph is visible
    await new Promise((resolve) => requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    }));

    this.#graph.engine.resize();
  }
  ```

- **No changes needed to `src/Graph.ts`**:
  ```typescript
  // Graph methods already exist and already queue operations (from Phase 4)
  // Custom setters above simply call these existing methods

  async addNodes(nodes: any[], idPath?: string): Promise<void> {
    // ✅ Already implemented, already uses operation queue
    return this.operationQueue.queueOperation('data-add', ...);
  }

  async setLayout(layoutType: string, config?: any): Promise<void> {
    // ✅ Already implemented, already uses operation queue
    return this.operationQueue.queueOperation('layout-set', ...);
  }

  async setStyleTemplate(template: StyleSchema): Promise<void> {
    // ✅ Already implemented, already uses operation queue
    return this.operationQueue.queueOperation('style-init', ...);
  }

  // NO CHANGES NEEDED - methods already queue operations correctly
  ```

**Dependencies**:
- External: None
- Internal: Phase 1-7 (requires operation queue system)

**Verification**:
1. Run: `npm test -- reactive-updates`
2. Run: `npm test -- eventual-consistency`
3. **Critical**: Re-run all Determinism stories - Variants 3-6 should now PASS
4. Run: `npm run test:storybook -- Determinism`
5. Expected: All 6 determinism variants produce identical visual output
6. Test interactive property changes in Storybook
7. Verify no performance regression with rapid property updates
8. Test that Graph methods work identically whether called directly or via web component properties

**Edge Cases to Handle**:
- Properties set before Graph.init() completes (Graph should queue operations)
- Multiple rapid property changes (Graph's operation queue handles this automatically)
- Properties set while previous operations are still executing (queued automatically)
- Graph disposed while property updates are in flight (cleanup in Graph.shutdown())
- Properties reverted before operations complete (newest operation obsoletes older ones via Phase 3 rules)

**Key Simplification**:
Unlike the original approach, there's no need for Lit lifecycle management of batching/ordering. The web component is now truly a thin wrapper:
- Custom property setters forward to Graph methods immediately
- Graph methods automatically queue operations (from Phase 4)
- Operation queue handles all dependency ordering and batching (from Phase 1-3)
- No framework-specific lifecycle dependency for core logic

**Breaking Changes**: None (purely additive)

**Success Criteria**:
- ✅ All Determinism story variants (1-6) pass visual regression tests
- ✅ Properties can be set via setTimeout and work correctly
- ✅ Async data loading scenarios work
- ✅ Graph converges to correct state regardless of property timing
- ✅ No memory leaks from pending operations
- ✅ Performance remains within acceptable bounds (<10ms overhead per update)

## Success Metrics **[UPDATED]**
- All existing tests pass without modification
- Operation execution order is deterministic
- <10ms overhead per operation
- 100% test coverage for queue system
- Zero breaking changes for existing code
- Performance benchmarks show no regression
- Progress tracking works for all long operations
- Obsolescence rules reduce unnecessary computation by 50%+
- **Batching works correctly**: Operations can be awaited inside `batchOperations` callbacks
- **Dependency ordering maintained**: Operations execute in dependency order regardless of call order
- **No deadlocks**: Deferred promise resolution prevents await deadlocks in batch callbacks
- **[NEW] Determinism verified**: All Determinism.stories.ts variants produce pixel-perfect identical visual output regardless of property setting order
- **[NEW] Comprehensive order testing**: Minimum 12 story variants covering different property setting order combinations all pass visual regression
- **[PHASE 8] Eventual consistency**: Properties can be set at any time (sync or async) and graph converges to correct state
- **[PHASE 8] Reactive updates**: All property changes after initialization are applied correctly via operation queue
