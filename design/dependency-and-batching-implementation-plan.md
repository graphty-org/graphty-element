# Implementation Plan for Dependency Management and Batching System

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

### Phase 7: Documentation and Migration Support
**Objective**: Complete documentation, migration guides, and developer tools
**Duration**: 1 day

**Tests to Write First**:
- `test/examples/queue-examples.test.ts`: Usage examples
  ```typescript
  describe('Queue Usage Examples', () => {
    it('should demonstrate basic usage');
    it('should show bulk operations pattern');
    it('should illustrate progress tracking');
    it('should show cancellation patterns');
  });
  ```

**Implementation**:
- Create `docs/queue-system.md`: Complete documentation
- Create `examples/queue-progress.html`: Interactive progress example
- Update `MIGRATION.md`: Migration guide from old patterns
- Add debug utilities in `src/utils/queue-debug.ts`:
  ```typescript
  // Queue visualization helpers
  // Operation history tracking
  // Performance profiling tools
  ```

**Dependencies**: 
- External: None
- Internal: All previous phases

**Verification**:
1. Run all examples successfully
2. Documentation review by team
3. Successful migration of existing codebase

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

## Success Metrics
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