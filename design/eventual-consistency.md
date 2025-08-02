# Web Component Property Initialization and Eventual Consistency Design

## Date: July 30, 2025

## Executive Summary

This document analyzes the property initialization order challenges in graphty-element and presents nine solution patterns for managing interdependent properties in web components. After comprehensive analysis, we recommend implementing a **Hybrid Reactive Batching with Dependency Graph** pattern that combines Lit's microtask batching with explicit dependency management to ensure predictable, efficient property updates.

## Problem Statement

### Current Challenges in graphty-element

The graphty-element web component faces significant challenges with property initialization order:

1. **Interdependent Properties**: Data, layout, and style properties have complex interdependencies
   - Setting `data` may require recalculating layout
   - Setting `style` may require re-rendering all nodes/edges
   - Setting `layout` may require updating styles
   - All three can be set simultaneously

2. **Unpredictable State**: The final state depends on the order properties are set:
   ```javascript
   // These should produce the same result but currently might not:
   
   // Order 1
   element.data = newData;
   element.layout = 'force-directed';
   element.styleTemplate = newStyles;
   
   // Order 2
   element.styleTemplate = newStyles;
   element.data = newData;
   element.layout = 'force-directed';
   ```

3. **Performance Issues**: Each property change triggers immediate updates, causing:
   - Multiple re-renders
   - Redundant calculations
   - Poor user experience with flickering

4. **Initialization Complexity**: As identified in the code review:
   - 11 managers with fragile initialization order
   - Circular dependencies between components
   - No compile-time safety for initialization order

## Solution Patterns Analysis

### Pattern 1: Lit-style Reactive Batching

**Description**: Use microtask queue to batch all property changes into a single update cycle.

**Implementation**:
```typescript
class GraphtyElement extends HTMLElement {
  private _updatePending = false;
  private _changedProperties = new Map<string, unknown>();
  
  set data(value: GraphData) {
    const oldValue = this._data;
    this._data = value;
    this.requestUpdate('data', oldValue);
  }
  
  requestUpdate(name?: string, oldValue?: unknown) {
    if (name !== undefined) {
      this._changedProperties.set(name, oldValue);
    }
    
    if (!this._updatePending) {
      this._updatePending = true;
      // Schedule update as microtask
      queueMicrotask(() => this.performUpdate());
    }
  }
  
  async performUpdate() {
    const changedProperties = this._changedProperties;
    this._changedProperties = new Map();
    this._updatePending = false;
    
    // Process all changes together
    await this.update(changedProperties);
  }
  
  async update(changedProperties: Map<string, unknown>) {
    // Apply changes in correct order
    if (changedProperties.has('styleTemplate')) {
      await this.applyStyles();
    }
    if (changedProperties.has('data')) {
      await this.applyData();
    }
    if (changedProperties.has('layout')) {
      await this.applyLayout();
    }
  }
}
```

**Pros**:
- ✅ Proven pattern used by Lit (millions of users)
- ✅ Automatic batching prevents multiple renders
- ✅ Excellent performance characteristics
- ✅ Simple mental model for developers
- ✅ Works well with async operations

**Cons**:
- ❌ Requires rewriting property setters
- ❌ Doesn't explicitly model dependencies
- ❌ Order still matters within update method

**Use Case**: Best for components with simple dependencies and high-frequency updates.

### Pattern 2: StencilJS-style @Watch and Lifecycle

**Description**: Use decorators to watch property changes and explicit lifecycle methods.

**Implementation**:
```typescript
class GraphtyElement {
  @Prop() data: GraphData;
  @Prop() layout: string;
  @Prop() styleTemplate: StyleTemplate;
  
  @Watch('data')
  dataChanged(newValue: GraphData, oldValue: GraphData) {
    this.scheduleDataUpdate();
  }
  
  @Watch('layout')
  layoutChanged(newValue: string) {
    this.scheduleLayoutUpdate();
  }
  
  @Watch('styleTemplate')
  styleChanged(newValue: StyleTemplate) {
    this.scheduleStyleUpdate();
  }
  
  componentWillUpdate() {
    // Determine update order based on what changed
    this.processScheduledUpdates();
  }
}
```

**Pros**:
- ✅ Clear, declarative property watching
- ✅ Explicit lifecycle hooks
- ✅ Good for debugging (clear flow)
- ✅ Built-in batching

**Cons**:
- ❌ Requires framework/transpilation
- ❌ Watch handlers can become complex
- ❌ Still need to manage update order manually

**Use Case**: Best when using StencilJS or similar framework with decorator support.

### Pattern 3: State Machine Pattern

**Description**: Model component states explicitly with defined transitions.

**Implementation**:
```typescript
type GraphState = 
  | 'idle'
  | 'updating-style'
  | 'updating-data'
  | 'updating-layout'
  | 'rendering';

class GraphtyElement {
  private state: GraphState = 'idle';
  private pendingUpdates = new Set<string>();
  
  set data(value: GraphData) {
    this._data = value;
    this.pendingUpdates.add('data');
    this.transition();
  }
  
  private transition() {
    switch (this.state) {
      case 'idle':
        if (this.pendingUpdates.has('styleTemplate')) {
          this.state = 'updating-style';
          this.updateStyle();
        } else if (this.pendingUpdates.has('data')) {
          this.state = 'updating-data';
          this.updateData();
        } else if (this.pendingUpdates.has('layout')) {
          this.state = 'updating-layout';
          this.updateLayout();
        }
        break;
        
      case 'updating-style':
        // After style, check for data updates
        if (this.pendingUpdates.has('data')) {
          this.state = 'updating-data';
          this.updateData();
        } else {
          this.complete();
        }
        break;
        
      // ... other state transitions
    }
  }
}
```

**Pros**:
- ✅ Explicit, debuggable state transitions
- ✅ Prevents invalid states
- ✅ Clear update order
- ✅ Easy to visualize and test

**Cons**:
- ❌ Verbose implementation
- ❌ Can become complex with many states
- ❌ Requires careful state design

**Use Case**: Best for components with complex state transitions and strict ordering requirements.

### Pattern 4: Command Queue Pattern

**Description**: Queue all property changes as commands and process in order.

**Implementation**:
```typescript
interface UpdateCommand {
  type: 'style' | 'data' | 'layout';
  value: any;
  timestamp: number;
}

class GraphtyElement {
  private commandQueue: UpdateCommand[] = [];
  private processing = false;
  
  set data(value: GraphData) {
    this.enqueueCommand({ 
      type: 'data', 
      value, 
      timestamp: Date.now() 
    });
  }
  
  private enqueueCommand(command: UpdateCommand) {
    this.commandQueue.push(command);
    if (!this.processing) {
      queueMicrotask(() => this.processQueue());
    }
  }
  
  private async processQueue() {
    this.processing = true;
    
    // Sort by priority (style -> data -> layout)
    const priorityOrder = { style: 0, data: 1, layout: 2 };
    this.commandQueue.sort((a, b) => 
      priorityOrder[a.type] - priorityOrder[b.type]
    );
    
    // Process commands
    for (const command of this.commandQueue) {
      await this.executeCommand(command);
    }
    
    this.commandQueue = [];
    this.processing = false;
  }
}
```

**Pros**:
- ✅ Guaranteed execution order
- ✅ Can implement undo/redo
- ✅ Good for complex sequences
- ✅ Audit trail of changes

**Cons**:
- ❌ Additional abstraction layer
- ❌ Memory overhead for queue
- ❌ Can introduce latency

**Use Case**: Best for applications needing undo/redo or audit trails.

### Pattern 5: Dirty Flag Pattern

**Description**: Mark properties as dirty and process during render cycle.

**Implementation**:
```typescript
class GraphtyElement {
  private dirtyFlags = {
    style: false,
    data: false,
    layout: false
  };
  
  set data(value: GraphData) {
    this._data = value;
    this.dirtyFlags.data = true;
    this.scheduleUpdate();
  }
  
  private updateScheduled = false;
  
  private scheduleUpdate() {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      requestAnimationFrame(() => this.performUpdate());
    }
  }
  
  private performUpdate() {
    // Process in dependency order
    if (this.dirtyFlags.style) {
      this.updateStyle();
      this.dirtyFlags.style = false;
    }
    
    if (this.dirtyFlags.data) {
      this.updateData();
      this.dirtyFlags.data = false;
    }
    
    if (this.dirtyFlags.layout) {
      this.updateLayout();
      this.dirtyFlags.layout = false;
    }
    
    this.updateScheduled = false;
  }
}
```

**Pros**:
- ✅ Simple to implement
- ✅ Minimal overhead
- ✅ Aligns with browser render cycle
- ✅ Clear what needs updating

**Cons**:
- ❌ Manual dependency management
- ❌ Can miss updates if not careful
- ❌ No automatic batching of multiple changes

**Use Case**: Best for simple components with clear update cycles.

### Pattern 6: Event-Driven Architecture

**Description**: Properties emit events, central coordinator manages order.

**Implementation**:
```typescript
class UpdateCoordinator extends EventTarget {
  private pendingUpdates = new Map<string, any>();
  
  scheduleUpdate(type: string, value: any) {
    this.pendingUpdates.set(type, value);
    
    if (this.pendingUpdates.size === 1) {
      queueMicrotask(() => this.processPendingUpdates());
    }
  }
  
  private async processPendingUpdates() {
    const updates = new Map(this.pendingUpdates);
    this.pendingUpdates.clear();
    
    // Process in dependency order
    if (updates.has('style')) {
      await this.processStyleUpdate(updates.get('style'));
    }
    
    if (updates.has('data')) {
      await this.processDataUpdate(updates.get('data'));
    }
    
    if (updates.has('layout')) {
      await this.processLayoutUpdate(updates.get('layout'));
    }
    
    this.dispatchEvent(new CustomEvent('updates-complete', {
      detail: { updates: Array.from(updates.keys()) }
    }));
  }
}

class GraphtyElement {
  private coordinator = new UpdateCoordinator();
  
  set data(value: GraphData) {
    this._data = value;
    this.coordinator.scheduleUpdate('data', value);
  }
}
```

**Pros**:
- ✅ Decoupled architecture
- ✅ Easy to extend
- ✅ Good for complex interactions
- ✅ Natural event flow

**Cons**:
- ❌ Additional complexity
- ❌ Event overhead
- ❌ Harder to debug

**Use Case**: Best for components that need to integrate with external systems.

### Pattern 7: Two-Phase Update Pattern

**Description**: Collect all changes, then apply in specific order.

**Implementation**:
```typescript
class GraphtyElement {
  private pendingChanges: Partial<{
    data: GraphData;
    layout: string;
    styleTemplate: StyleTemplate;
  }> = {};
  
  private updatePhase: 'collecting' | 'applying' = 'collecting';
  
  set data(value: GraphData) {
    if (this.updatePhase === 'collecting') {
      this.pendingChanges.data = value;
      this.scheduleApplyPhase();
    } else {
      // Direct update during apply phase
      this._data = value;
    }
  }
  
  private scheduleApplyPhase() {
    queueMicrotask(() => this.applyChanges());
  }
  
  private async applyChanges() {
    this.updatePhase = 'applying';
    
    // Apply in dependency order
    if (this.pendingChanges.styleTemplate) {
      this.styleTemplate = this.pendingChanges.styleTemplate;
    }
    
    if (this.pendingChanges.data) {
      this.data = this.pendingChanges.data;
    }
    
    if (this.pendingChanges.layout) {
      this.layout = this.pendingChanges.layout;
    }
    
    this.pendingChanges = {};
    this.updatePhase = 'collecting';
  }
}
```

**Pros**:
- ✅ Clear phases prevent recursion
- ✅ Simple mental model
- ✅ Guaranteed consistency

**Cons**:
- ❌ Extra complexity in setters
- ❌ Two different update paths
- ❌ Can be confusing during apply phase

**Use Case**: Best when updates can trigger other updates.

### Pattern 8: Dependency Graph Pattern

**Description**: Explicitly model dependencies and topologically sort updates.

**Implementation**:
```typescript
class DependencyGraph {
  private dependencies = new Map<string, Set<string>>();
  
  constructor() {
    // Define dependencies
    this.addDependency('layout', 'data');
    this.addDependency('layout', 'style');
  }
  
  addDependency(dependent: string, dependency: string) {
    if (!this.dependencies.has(dependent)) {
      this.dependencies.set(dependent, new Set());
    }
    this.dependencies.get(dependent)!.add(dependency);
  }
  
  getUpdateOrder(properties: Set<string>): string[] {
    // Topological sort
    const sorted: string[] = [];
    const visited = new Set<string>();
    
    const visit = (prop: string) => {
      if (visited.has(prop)) return;
      visited.add(prop);
      
      const deps = this.dependencies.get(prop) || new Set();
      for (const dep of deps) {
        if (properties.has(dep)) {
          visit(dep);
        }
      }
      
      sorted.push(prop);
    };
    
    for (const prop of properties) {
      visit(prop);
    }
    
    return sorted;
  }
}

class GraphtyElement {
  private depGraph = new DependencyGraph();
  private pendingUpdates = new Set<string>();
  
  set data(value: GraphData) {
    this._data = value;
    this.pendingUpdates.add('data');
    this.scheduleUpdate();
  }
  
  private async scheduleUpdate() {
    queueMicrotask(() => this.performUpdates());
  }
  
  private async performUpdates() {
    const updateOrder = this.depGraph.getUpdateOrder(this.pendingUpdates);
    
    for (const prop of updateOrder) {
      await this.updateProperty(prop);
    }
    
    this.pendingUpdates.clear();
  }
}
```

**Pros**:
- ✅ Explicit dependency management
- ✅ Automatically handles complex dependencies
- ✅ Extensible and maintainable
- ✅ Prevents circular dependencies

**Cons**:
- ❌ Requires dependency definition
- ❌ More complex implementation
- ❌ Overhead of graph traversal

**Use Case**: Best for components with complex, changing dependencies.

### Pattern 9: Eventual Consistency Pattern

**Description**: Accept temporary inconsistency, converge to consistent state through iterations.

**Implementation**:
```typescript
class GraphtyElement {
  private converging = false;
  private maxIterations = 3;
  
  set data(value: GraphData) {
    this._data = value;
    this.convergeToConsistentState();
  }
  
  private async convergeToConsistentState() {
    if (this.converging) return;
    
    this.converging = true;
    let iterations = 0;
    let stable = false;
    
    while (!stable && iterations < this.maxIterations) {
      const stateBefore = this.captureState();
      
      await this.updateAll();
      
      const stateAfter = this.captureState();
      stable = this.statesEqual(stateBefore, stateAfter);
      iterations++;
    }
    
    this.converging = false;
    
    if (!stable) {
      console.warn('Failed to reach consistent state');
    }
  }
  
  private captureState() {
    return {
      dataHash: this.hashData(this._data),
      layoutType: this._layout,
      styleHash: this.hashStyle(this._styleTemplate)
    };
  }
  
  private async updateAll() {
    // Update everything, let changes cascade
    await this.updateStyle();
    await this.updateData();
    await this.updateLayout();
  }
}
```

**Pros**:
- ✅ Handles complex cascading updates
- ✅ Self-healing behavior
- ✅ Works with unknown dependencies
- ✅ Resilient to edge cases

**Cons**:
- ❌ Non-deterministic update count
- ❌ Can be inefficient
- ❌ Harder to debug
- ❌ May not converge

**Use Case**: Best for systems with dynamic or unknown dependencies.

## Recommended Solution: Hybrid Reactive Batching with Dependency Graph

After analyzing all patterns, we recommend a hybrid approach that combines the best aspects of Patterns 1 (Reactive Batching) and 8 (Dependency Graph):

### Implementation

```typescript
interface PropertyUpdate {
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

class GraphtyElement extends HTMLElement {
  // Reactive batching infrastructure
  private _updatePending = false;
  private _pendingUpdates = new Map<string, PropertyUpdate>();
  
  // Dependency graph for ordering
  private static depGraph = new DependencyGraph([
    ['data', 'style'],      // data depends on style
    ['layout', 'data'],     // layout depends on data
    ['layout', 'style'],    // layout depends on style
  ]);
  
  // Properties with reactive setters
  private _data?: GraphData;
  private _layout?: string;
  private _styleTemplate?: StyleTemplate;
  
  set data(value: GraphData) {
    const oldValue = this._data;
    this._data = value;
    this.requestUpdate('data', oldValue, value);
  }
  
  set layout(value: string) {
    const oldValue = this._layout;
    this._layout = value;
    this.requestUpdate('layout', oldValue, value);
  }
  
  set styleTemplate(value: StyleTemplate) {
    const oldValue = this._styleTemplate;
    this._styleTemplate = value;
    this.requestUpdate('styleTemplate', oldValue, value);
  }
  
  private requestUpdate(property: string, oldValue: unknown, newValue: unknown) {
    this._pendingUpdates.set(property, { property, oldValue, newValue });
    
    if (!this._updatePending) {
      this._updatePending = true;
      queueMicrotask(() => this.performUpdate());
    }
  }
  
  private async performUpdate() {
    // Get updates and clear pending
    const updates = Array.from(this._pendingUpdates.values());
    this._pendingUpdates.clear();
    this._updatePending = false;
    
    // Sort updates by dependency order
    const sortedProperties = GraphtyElement.depGraph.sort(
      updates.map(u => u.property)
    );
    
    // Apply updates in dependency order
    for (const property of sortedProperties) {
      const update = updates.find(u => u.property === property);
      if (update) {
        await this.applyUpdate(update);
      }
    }
    
    // Notify update complete
    this.dispatchEvent(new CustomEvent('update-complete', {
      detail: { updates: sortedProperties }
    }));
  }
  
  private async applyUpdate(update: PropertyUpdate) {
    switch (update.property) {
      case 'styleTemplate':
        await this.applyStyleTemplate(update.newValue as StyleTemplate);
        break;
        
      case 'data':
        await this.applyData(update.newValue as GraphData);
        break;
        
      case 'layout':
        await this.applyLayout(update.newValue as string);
        break;
    }
  }
  
  // Public API for awaiting updates
  get updateComplete(): Promise<void> {
    if (!this._updatePending) {
      return Promise.resolve();
    }
    
    return new Promise(resolve => {
      this.addEventListener('update-complete', () => resolve(), { once: true });
    });
  }
}

// Dependency Graph Implementation
class DependencyGraph {
  private adjacencyList = new Map<string, Set<string>>();
  
  constructor(dependencies: Array<[string, string]>) {
    for (const [dependent, dependency] of dependencies) {
      this.addDependency(dependent, dependency);
    }
  }
  
  private addDependency(dependent: string, dependency: string) {
    if (!this.adjacencyList.has(dependency)) {
      this.adjacencyList.set(dependency, new Set());
    }
    this.adjacencyList.get(dependency)!.add(dependent);
  }
  
  sort(properties: string[]): string[] {
    const inDegree = new Map<string, number>();
    const queue: string[] = [];
    const result: string[] = [];
    
    // Initialize in-degree
    for (const prop of properties) {
      inDegree.set(prop, 0);
    }
    
    // Calculate in-degrees
    for (const prop of properties) {
      const dependents = this.adjacencyList.get(prop) || new Set();
      for (const dep of dependents) {
        if (inDegree.has(dep)) {
          inDegree.set(dep, inDegree.get(dep)! + 1);
        }
      }
    }
    
    // Find properties with no dependencies
    for (const [prop, degree] of inDegree) {
      if (degree === 0) {
        queue.push(prop);
      }
    }
    
    // Process queue
    while (queue.length > 0) {
      const prop = queue.shift()!;
      result.push(prop);
      
      const dependents = this.adjacencyList.get(prop) || new Set();
      for (const dep of dependents) {
        if (inDegree.has(dep)) {
          const newDegree = inDegree.get(dep)! - 1;
          inDegree.set(dep, newDegree);
          
          if (newDegree === 0) {
            queue.push(dep);
          }
        }
      }
    }
    
    return result;
  }
}
```

### Why This Solution?

1. **Automatic Batching**: Prevents multiple renders when properties are set together
2. **Explicit Dependencies**: Clear, maintainable dependency definitions
3. **Predictable Order**: Same result regardless of property setting order
4. **Performance**: Single update cycle for multiple changes
5. **Developer Experience**: Simple API with async support
6. **Extensible**: Easy to add new properties and dependencies

## How This Addresses Code Review Issues

### 1. Manager Initialization Order

The hybrid solution directly addresses the fragile initialization order identified in the code review:

**Before**: 11 managers initialized in specific order with hidden dependencies
```typescript
// From code review - fragile order
this.dataManager = new DataManager(this);
this.styleManager = new StyleManager(this);
this.layoutManager = new LayoutManager(this);
// ... 8 more managers
```

**After**: Explicit dependency graph ensures correct initialization
```typescript
// Clear dependencies
private static depGraph = new DependencyGraph([
  ['DataManager', 'EventManager'],
  ['StyleManager', 'EventManager'],
  ['LayoutManager', 'DataManager'],
  ['LayoutManager', 'StyleManager'],
  // ... explicit dependencies
]);
```

### 2. Circular Dependencies

The solution breaks circular dependencies by:
- Using unidirectional data flow
- Explicit dependency ordering prevents cycles
- Batching prevents cascading updates

### 3. Predictable State

The solution ensures predictable final state:
```typescript
// These now produce identical results:
element.data = newData;
element.layout = 'force';
element.style = newStyle;

// vs
element.style = newStyle;
element.data = newData;
element.layout = 'force';
```

### 4. Performance

Addresses performance issues identified:
- Single update cycle instead of 3 separate updates
- No forced re-renders (Edge.ts line 251 issue)
- Batching prevents style recalculation thrashing

## Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
1. Implement DependencyGraph class
2. Add reactive property system to GraphtyElement
3. Create unit tests for batching behavior

### Phase 2: Manager Integration (Week 2)
1. Refactor managers to use new update system
2. Define manager dependencies explicitly
3. Remove circular dependencies

### Phase 3: Migration (Week 3)
1. Update existing property setters
2. Migrate event handlers
3. Update documentation and examples

### Phase 4: Optimization (Week 4)
1. Performance profiling
2. Add debug mode for update tracking
3. Optimize dependency graph traversal

## Conclusion

The Hybrid Reactive Batching with Dependency Graph pattern provides the best balance of:
- **Correctness**: Predictable update order
- **Performance**: Batched updates
- **Maintainability**: Explicit dependencies
- **Developer Experience**: Simple API

This solution directly addresses the initialization order and circular dependency issues identified in the code review while providing a modern, efficient property management system suitable for a production web component library.