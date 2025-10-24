# Dependency Management and Batching Implementation Design

## Date: August 5, 2025 (Updated)

## Overview

This document outlines the design for implementing a command batching and dependency management system using `p-queue` and `toposort`. The system will be implemented as a separate `OperationQueueManager` that integrates with existing managers to ensure deterministic execution order regardless of how methods are called.

## Dependencies

```json
{
  "dependencies": {
    "p-queue": "^8.0.0",
    "toposort": "^2.0.2"
  }
}
```

## Manager Dependencies Analysis

Based on the codebase analysis, here are the actual manager dependencies:

```typescript
// Current initialization order and dependencies:
EventManager()                                    // No dependencies
StyleManager(eventManager)                        // Depends on: EventManager
RenderManager(canvas, eventManager)               // Depends on: EventManager
StatsManager(eventManager)                        // Depends on: EventManager
DataManager(eventManager, styles)                 // Depends on: EventManager, Styles
LayoutManager(eventManager, dataManager, styles)  // Depends on: EventManager, DataManager, Styles
UpdateManager(eventManager, statsManager,         // Depends on: Multiple managers
              layoutManager, dataManager, 
              styleManager, camera, context)
AlgorithmManager(eventManager, graphContext)      // Depends on: EventManager, GraphContext
InputManager(scene, engine, canvas, eventManager) // Depends on: EventManager, Scene
LifecycleManager(managers, eventManager, order)   // Depends on: All managers
```

## Core Implementation

### 1. OperationQueueManager (New File: `src/managers/OperationQueueManager.ts`)

```typescript
import PQueue from 'p-queue';
import toposort from 'toposort';
import type { EventManager } from './EventManager';
import type { Manager } from './interfaces';

export interface ProgressContext {
    setProgress(percent: number): void;
    setMessage(message: string): void;
    setPhase(phase: string): void;
}

export interface OperationContext {
    signal: AbortSignal;
    progress: ProgressContext;
    id: string;
}

export interface Operation {
    id: string;
    category: OperationCategory;
    execute: (context: OperationContext) => Promise<void> | void;
    abortController?: AbortController;
    metadata?: {
        description?: string;
        timestamp?: number;
        source?: string;
        obsoletes?: OperationCategory[];
    };
}

export type OperationCategory = 
    | 'style-init'      // Initialize style template
    | 'style-apply'     // Apply styles to existing elements
    | 'data-add'        // Add nodes/edges
    | 'data-remove'     // Remove nodes/edges
    | 'data-update'     // Update node/edge properties
    | 'layout-set'      // Set layout engine
    | 'layout-update'   // Update layout positions
    | 'algorithm-run'   // Run graph algorithms
    | 'camera-update'   // Update camera position/mode
    | 'render-update';  // Update rendering settings

export interface OperationProgress {
    percent: number;
    message?: string;
    phase?: string;
    startTime: number;
    lastUpdate: number;
}

export type ObsolescenceRule = {
    obsoletes: OperationCategory[];
    obsoleteQueued?: boolean;
    shouldObsolete?: (existing: Operation, incoming: Operation) => boolean;
};

export const OBSOLESCENCE_RULES: Record<OperationCategory, ObsolescenceRule> = {
    'data-add': {
        obsoletes: ['layout-update', 'algorithm-run'],
        obsoleteQueued: true
    },
    'data-remove': {
        obsoletes: ['layout-update', 'algorithm-run'],
        obsoleteQueued: true
    },
    'layout-set': {
        obsoletes: ['layout-update'],
        obsoleteQueued: true
    },
    'style-init': {
        obsoletes: ['style-apply'],
        obsoleteQueued: false
    }
};

export class OperationQueueManager implements Manager {
    private queue: PQueue;
    private pendingOperations: Map<string, Operation> = new Map();
    private operationCounter = 0;
    private batchingEnabled = true;
    private currentBatch: Set<string> = new Set();
    
    // Progress tracking
    private operationProgress = new Map<string, OperationProgress>();
    
    // Obsolescence tracking
    private runningOperations = new Map<string, {
        category: OperationCategory,
        controller: AbortController,
        startTime: number
    }>();
    private queuedOperations = new Map<string, {
        category: OperationCategory,
        controller: AbortController
    }>();
    
    // Dependency graph based on actual manager dependencies
    private static readonly CATEGORY_DEPENDENCIES: Array<[OperationCategory, OperationCategory]> = [
        // Style must be initialized before applying
        ['style-apply', 'style-init'],
        
        // Data operations depend on style being ready
        ['data-add', 'style-init'],
        ['data-update', 'style-init'],
        
        // Layout depends on data existing
        ['layout-set', 'data-add'],
        ['layout-update', 'data-add'],
        
        // Algorithms depend on data
        ['algorithm-run', 'data-add'],
        
        // Camera updates may depend on layout for zoom-to-fit
        ['camera-update', 'layout-set'],
        
        // Render updates come last
        ['render-update', 'style-apply'],
        ['render-update', 'data-add'],
        ['render-update', 'layout-update'],
    ];
    
    constructor(
        private eventManager: EventManager,
        options: {
            concurrency?: number;
            autoStart?: boolean;
            intervalCap?: number;
            interval?: number;
        } = {}
    ) {
        this.queue = new PQueue({
            concurrency: options.concurrency || 1, // Sequential by default
            autoStart: options.autoStart ?? true,
            intervalCap: options.intervalCap,
            interval: options.interval,
        });
        
        // Listen for queue events
        this.queue.on('active', () => {
            this.eventManager.emitGraphEvent('operation-queue-active', {
                size: this.queue.size,
                pending: this.queue.pending,
            });
        });
        
        this.queue.on('idle', () => {
            this.eventManager.emitGraphEvent('operation-queue-idle', {});
        });
    }
    
    async init(): Promise<void> {
        // No initialization needed
    }
    
    dispose(): void {
        this.queue.clear();
        this.pendingOperations.clear();
    }
    
    /**
     * Queue an operation for execution
     */
    queueOperation(
        category: OperationCategory,
        execute: (context: OperationContext) => Promise<void> | void,
        options?: {
            description?: string;
            customObsolescence?: ObsolescenceRule;
        }
    ): string {
        const id = `op-${this.operationCounter++}`;
        const controller = new AbortController();
        
        // Apply obsolescence rules
        const obsolescenceRule = options?.customObsolescence || OBSOLESCENCE_RULES[category];
        if (obsolescenceRule) {
            this.applyObsolescenceRules(category, obsolescenceRule);
        }
        
        // Initialize progress tracking
        this.operationProgress.set(id, {
            percent: 0,
            startTime: Date.now(),
            lastUpdate: Date.now()
        });
        
        // Create progress context
        const progressContext: ProgressContext = {
            setProgress: (percent: number) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.percent = percent;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            },
            setMessage: (message: string) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.message = message;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            },
            setPhase: (phase: string) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.phase = phase;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            }
        };
        
        const operation: Operation = {
            id,
            category,
            execute: async (ctx) => {
                await execute(ctx);
            },
            abortController: controller,
            metadata: {
                description: options?.description,
                timestamp: Date.now(),
                obsoletes: obsolescenceRule?.obsoletes
            },
        };
        
        // Track as queued
        this.queuedOperations.set(id, { category, controller });
        
        this.pendingOperations.set(id, operation);
        this.currentBatch.add(id);
        
        // Schedule batch execution on next microtask
        if (this.batchingEnabled && this.currentBatch.size === 1) {
            queueMicrotask(() => this.executeBatch());
        }
        
        return id;
    }
    
    /**
     * Execute all operations in the current batch
     */
    private async executeBatch(): Promise<void> {
        // Get all operations in current batch
        const batchIds = Array.from(this.currentBatch);
        this.currentBatch.clear();
        
        const operations = batchIds
            .map(id => this.pendingOperations.get(id))
            .filter((op): op is Operation => op !== undefined);
        
        // Remove from pending
        batchIds.forEach(id => this.pendingOperations.delete(id));
        
        if (operations.length === 0) return;
        
        // Sort operations by dependency order
        const sortedOperations = this.sortOperations(operations);
        
        // Add to queue with p-queue's signal support
        for (const operation of sortedOperations) {
            const promise = this.queue.add(
                async ({ signal }) => {
                    // Move from queued to running
                    this.queuedOperations.delete(operation.id);
                    this.runningOperations.set(operation.id, {
                        category: operation.category,
                        controller: operation.abortController!,
                        startTime: Date.now()
                    });
                    
                    try {
                        const context: OperationContext = {
                            signal,
                            progress: this.createProgressContext(operation.id, operation.category),
                            id: operation.id
                        };
                        await this.executeOperation(operation, context);
                    } finally {
                        this.runningOperations.delete(operation.id);
                        // Cleanup progress after delay
                        setTimeout(() => {
                            this.operationProgress.delete(operation.id);
                        }, 1000);
                    }
                },
                { 
                    signal: operation.abortController?.signal
                }
            );
            
            // Handle cancellation
            promise.catch(error => {
                if (error.name === 'AbortError') {
                    this.eventManager.emitGraphEvent('operation-obsoleted', {
                        id: operation.id,
                        category: operation.category,
                        reason: 'Obsoleted by newer operation'
                    });
                }
            });
        }
        
        // Emit batch complete event after all operations
        this.eventManager.emitGraphEvent('operation-batch-complete', {
            operationCount: sortedOperations.length,
            operations: sortedOperations.map(op => ({
                id: op.id,
                category: op.category,
                description: op.metadata?.description,
            })),
        });
    }
    
    /**
     * Sort operations based on category dependencies
     */
    private sortOperations(operations: Operation[]): Operation[] {
        // Group by category
        const operationsByCategory = new Map<OperationCategory, Operation[]>();
        operations.forEach(op => {
            const ops = operationsByCategory.get(op.category) || [];
            ops.push(op);
            operationsByCategory.set(op.category, ops);
        });
        
        // Get unique categories
        const categories = Array.from(operationsByCategory.keys());
        
        // Build dependency edges for toposort
        const edges: Array<[OperationCategory, OperationCategory]> = [];
        OperationQueueManager.CATEGORY_DEPENDENCIES.forEach(([dependent, dependency]) => {
            if (categories.includes(dependent) && categories.includes(dependency)) {
                edges.push([dependency, dependent]); // toposort expects [from, to]
            }
        });
        
        // Sort categories
        let sortedCategories: OperationCategory[];
        try {
            sortedCategories = toposort.array(categories, edges) as OperationCategory[];
        } catch (error) {
            // Circular dependency detected
            console.error('Circular dependency detected:', error);
            sortedCategories = categories; // Fallback to original order
        }
        
        // Flatten operations in sorted category order
        const sortedOperations: Operation[] = [];
        sortedCategories.forEach(category => {
            const categoryOps = operationsByCategory.get(category) || [];
            sortedOperations.push(...categoryOps);
        });
        
        return sortedOperations;
    }
    
    /**
     * Execute a single operation
     */
    private async executeOperation(operation: Operation, context: OperationContext): Promise<void> {
        this.eventManager.emitGraphEvent('operation-start', {
            id: operation.id,
            category: operation.category,
            description: operation.metadata?.description,
        });
        
        const startTime = performance.now();
        
        try {
            await operation.execute(context);
            
            // Mark as complete
            context.progress.setProgress(100);
            
            const duration = performance.now() - startTime;
            this.eventManager.emitGraphEvent('operation-complete', {
                id: operation.id,
                category: operation.category,
                duration,
            });
        } catch (error) {
            if (error.name === 'AbortError') {
                throw error; // Let p-queue handle abort errors
            }
            this.handleOperationError(operation, error);
        }
    }
    
    /**
     * Create progress context for an operation
     */
    private createProgressContext(id: string, category: OperationCategory): ProgressContext {
        return {
            setProgress: (percent: number) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.percent = percent;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            },
            setMessage: (message: string) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.message = message;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            },
            setPhase: (phase: string) => {
                const progress = this.operationProgress.get(id);
                if (progress) {
                    progress.phase = phase;
                    progress.lastUpdate = Date.now();
                    this.emitProgressUpdate(id, category, progress);
                }
            }
        };
    }
    
    /**
     * Emit progress update event
     */
    private emitProgressUpdate(id: string, category: OperationCategory, progress: OperationProgress): void {
        this.eventManager.emitGraphEvent('operation-progress', {
            id,
            category,
            progress: progress.percent,
            message: progress.message,
            phase: progress.phase,
            duration: Date.now() - progress.startTime
        });
    }
    
    /**
     * Apply obsolescence rules
     */
    private applyObsolescenceRules(
        incomingCategory: OperationCategory,
        rule: ObsolescenceRule
    ): void {
        // Cancel running operations
        for (const [id, op] of this.runningOperations) {
            if (rule.obsoletes.includes(op.category)) {
                if (!rule.shouldObsolete || rule.shouldObsolete(
                    { id, category: op.category } as Operation,
                    { category: incomingCategory } as Operation
                )) {
                    console.log(`Cancelling running operation ${id} (${op.category}) due to ${incomingCategory}`);
                    op.controller.abort();
                }
            }
        }
        
        // Cancel queued operations if specified
        if (rule.obsoleteQueued) {
            for (const [id, op] of this.queuedOperations) {
                if (rule.obsoletes.includes(op.category)) {
                    console.log(`Cancelling queued operation ${id} (${op.category}) due to ${incomingCategory}`);
                    op.controller.abort();
                }
            }
        }
    }
    
    /**
     * Handle operation errors
     */
    private handleOperationError(operation: Operation, error: unknown): void {
        this.eventManager.emitGraphError(
            null,
            error instanceof Error ? error : new Error(String(error)),
            'operation-execution',
            {
                operationId: operation.id,
                category: operation.category,
                description: operation.metadata?.description,
            }
        );
    }
    
    /**
     * Wait for all queued operations to complete
     */
    async waitForCompletion(): Promise<void> {
        // First, ensure any pending batch is queued
        if (this.currentBatch.size > 0) {
            await this.executeBatch();
        }
        
        // Then wait for queue to be idle
        await this.queue.onIdle();
    }
    
    /**
     * Get queue statistics
     */
    getStats(): {
        pending: number;
        size: number;
        isPaused: boolean;
    } {
        return {
            pending: this.queue.pending,
            size: this.queue.size,
            isPaused: this.queue.isPaused,
        };
    }
    
    /**
     * Pause/resume queue execution
     */
    pause(): void {
        this.queue.pause();
    }
    
    resume(): void {
        this.queue.start();
    }
    
    /**
     * Clear all pending operations
     */
    clear(): void {
        this.queue.clear();
        this.pendingOperations.clear();
        this.currentBatch.clear();
    }
    
    /**
     * Disable batching (execute operations immediately)
     */
    disableBatching(): void {
        this.batchingEnabled = false;
    }
    
    enableBatching(): void {
        this.batchingEnabled = true;
    }
}
```

### 2. Integration with Graph Class

```typescript
// In Graph.ts
import { OperationQueueManager, type OperationCategory } from './managers/OperationQueueManager';

export class Graph implements GraphContext {
    // ... existing properties ...
    
    private operationQueue: OperationQueueManager;
    
    constructor(element: Element | string, useMockInput = false) {
        // Initialize EventManager first
        this.eventManager = new EventManager();
        
        // Initialize OperationQueueManager early
        this.operationQueue = new OperationQueueManager(this.eventManager, {
            concurrency: 1, // Sequential execution
        });
        
        // ... rest of initialization ...
    }
    
    // Modified public methods to use operation queue
    async setStyleTemplate(template: StyleSchema): Promise<Styles> {
        const operationId = this.operationQueue.queueOperation(
            'style-init',
            async () => {
                // Existing setStyleTemplate logic
                await this.internalSetStyleTemplate(template);
            },
            { description: 'Set style template' }
        );
        
        await this.operationQueue.waitForCompletion();
        return this.styles;
    }
    
    addNodes(nodes: Record<string | number, unknown>[], idPath?: string): void {
        this.operationQueue.queueOperation(
            'data-add',
            () => {
                this.dataManager.addNodes(nodes, idPath);
            },
            { description: `Add ${nodes.length} nodes` }
        );
    }
    
    addEdges(edges: Record<string | number, unknown>[], srcIdPath?: string, dstIdPath?: string): void {
        this.operationQueue.queueOperation(
            'data-add',
            () => {
                this.dataManager.addEdges(edges, srcIdPath, dstIdPath);
            },
            { description: `Add ${edges.length} edges` }
        );
    }
    
    async setLayout(type: string, opts: object = {}): Promise<void> {
        this.operationQueue.queueOperation(
            'layout-set',
            async () => {
                await this.layoutManager.setLayout(type, opts);
            },
            { description: `Set layout to ${type}` }
        );
        
        await this.operationQueue.waitForCompletion();
    }
    
    // New method for explicit batching
    async batchOperations<T>(callback: () => T): Promise<T> {
        // Execute callback (which queues operations)
        const result = callback();
        
        // Wait for all operations to complete
        await this.operationQueue.waitForCompletion();
        
        return result;
    }
    
    // Expose operation queue stats
    getOperationQueueStats() {
        return this.operationQueue.getStats();
    }
}
```

## Progress Tracking and Obsolescence

### Progress Tracking

The system provides detailed progress tracking for long-running operations:

```typescript
// Example: Layout operation with progress
class LayoutManager {
    async setLayout(
        type: string, 
        opts: object, 
        context?: OperationContext
    ): Promise<void> {
        const engine = LayoutEngine.get(type, opts);
        
        context?.progress.setPhase('Initializing layout engine');
        await engine.init();
        
        context?.progress.setProgress(10);
        context?.progress.setPhase('Adding nodes to layout');
        
        // Add nodes with progress updates
        const nodes = [...this.dataManager.nodes.values()];
        for (let i = 0; i < nodes.length; i++) {
            if (context?.signal.aborted) throw new Error('Layout cancelled');
            
            engine.addNode(nodes[i]);
            
            if (i % 100 === 0) {
                const percent = 10 + (20 * i / nodes.length);
                context?.progress.setProgress(percent);
                context?.progress.setMessage(`Added ${i} of ${nodes.length} nodes`);
            }
        }
        
        context?.progress.setProgress(30);
        context?.progress.setPhase('Running layout algorithm');
        
        // Run layout with cancellation checks
        let step = 0;
        while (!engine.isSettled && step < 1000) {
            if (context?.signal.aborted) throw new Error('Layout cancelled');
            
            engine.step();
            step++;
            
            if (step % 10 === 0) {
                const percent = 30 + (60 * step / 1000);
                context?.progress.setProgress(percent);
            }
            
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        context?.progress.setProgress(100);
        context?.progress.setMessage('Layout complete');
    }
}
```

### Obsolescence Rules

Operations can automatically cancel obsolete operations:

```typescript
// Predefined obsolescence rules
export const OBSOLESCENCE_RULES: Record<OperationCategory, ObsolescenceRule> = {
    'data-add': {
        obsoletes: ['layout-update', 'algorithm-run'],
        obsoleteQueued: true  // Cancel queued operations too
    },
    'layout-set': {
        obsoletes: ['layout-update'],
        obsoleteQueued: true
    },
    'style-init': {
        obsoletes: ['style-apply'],
        obsoleteQueued: false  // Let running style applications finish
    }
};

// Custom obsolescence logic
const customRule: ObsolescenceRule = {
    obsoletes: ['algorithm-run'],
    shouldObsolete: (existing, incoming) => {
        // Don't cancel if algorithm is almost done
        const progress = this.operationProgress.get(existing.id);
        return !progress || progress.percent < 90;
    }
};

// Usage
this.operationQueue.queueOperation(
    'data-add',
    async (context) => {
        await loadData(context);
    },
    { customObsolescence: customRule }
);
```

### Integration Example

```typescript
// In Graph class - expose progress to UI
export class Graph {
    // Subscribe to progress updates
    onOperationProgress(callback: (event: OperationProgressEvent) => void): void {
        this.eventManager.addListener('operation-progress', callback);
    }
    
    // Example: Loading large dataset with progress
    async loadLargeDataset(url: string): Promise<void> {
        await this.operationQueue.queueOperation(
            'data-add',
            async (context) => {
                // Download with progress
                context.progress.setPhase('Downloading data');
                const response = await fetch(url);
                const reader = response.body!.getReader();
                const contentLength = +response.headers.get('Content-Length')!;
                
                let received = 0;
                const chunks: Uint8Array[] = [];
                
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    chunks.push(value);
                    received += value.length;
                    
                    context.progress.setProgress(50 * received / contentLength);
                    context.progress.setMessage(`${(received/1024/1024).toFixed(1)}MB downloaded`);
                    
                    if (context.signal.aborted) {
                        throw new Error('Download cancelled');
                    }
                }
                
                // Parse with progress
                context.progress.setPhase('Parsing data');
                context.progress.setProgress(50);
                
                const data = await parseData(chunks);
                
                // Add nodes with progress
                context.progress.setPhase('Adding nodes');
                for (let i = 0; i < data.nodes.length; i += 100) {
                    if (context.signal.aborted) throw new Error('Cancelled');
                    
                    const batch = data.nodes.slice(i, i + 100);
                    this.dataManager.addNodes(batch);
                    
                    const percent = 50 + (50 * i / data.nodes.length);
                    context.progress.setProgress(percent);
                }
            },
            { 
                description: 'Load large dataset'
            }
        );
    }
}
```

## Automatic Layout Triggers

### The Problem

When new data is loaded, the layout needs to be updated even if the layout algorithm hasn't changed. This ensures that new nodes and edges are properly positioned.

### Solution: Post-Execution Triggers

Add a trigger system that automatically queues follow-up operations:

```typescript
export class OperationQueueManager {
    // Define post-execution triggers
    private static readonly POST_EXECUTION_TRIGGERS: Record<OperationCategory, OperationCategory[]> = {
        'data-add': ['layout-update'],     // After adding data, update layout
        'data-remove': ['layout-update'],  // After removing data, update layout
        'layout-set': ['layout-update'],   // After setting new layout engine, run it
    };
    
    // Enhanced metadata to support triggers
    export interface OperationMetadata {
        description?: string;
        timestamp?: number;
        obsoletes?: OperationCategory[];
        triggers?: OperationCategory[];    // Operations to run after this one
        triggeredBy?: string;              // ID of operation that triggered this
        skipTriggers?: boolean;            // Skip automatic triggers for bulk operations
    }
    
    private async executeOperation(operation: Operation, context: OperationContext): Promise<void> {
        // ... existing execution code ...
        
        try {
            await operation.execute(context);
            context.progress.setProgress(100);
            
            // After successful execution, queue triggered operations
            if (!operation.metadata?.skipTriggers) {
                const triggers = operation.metadata?.triggers || 
                                OperationQueueManager.POST_EXECUTION_TRIGGERS[operation.category];
                if (triggers) {
                    for (const triggerCategory of triggers) {
                        this.queueTriggeredOperation(triggerCategory, operation);
                    }
                }
            }
            
            // ... rest of method
        } catch (error) {
            // ... error handling
        }
    }
    
    private queueTriggeredOperation(category: OperationCategory, sourceOperation: Operation): void {
        // Check if we need to queue this trigger
        if (category === 'layout-update' && !this.layoutManager?.hasLayoutEngine()) {
            return; // No layout engine set yet
        }
        
        // Queue the triggered operation
        this.queueOperation(
            category,
            async (context) => {
                switch (category) {
                    case 'layout-update':
                        context.progress.setPhase('Updating layout for new data');
                        await this.layoutManager.updatePositions(context);
                        break;
                    // ... other triggered operations
                }
            },
            {
                description: `Auto-triggered ${category} after ${sourceOperation.category}`,
                triggeredBy: sourceOperation.id
            }
        );
    }
}

// In LayoutManager
class LayoutManager {
    hasLayoutEngine(): boolean {
        return !!this.layoutEngine;
    }
    
    async updatePositions(context?: OperationContext): Promise<void> {
        if (!this.layoutEngine) return;
        
        context?.progress.setPhase('Synchronizing nodes with layout engine');
        
        // Add new nodes to layout
        const engineNodes = new Set(this.layoutEngine.getNodeIds());
        const dataNodes = new Set(this.dataManager.nodes.keys());
        
        // Add missing nodes
        let added = 0;
        for (const nodeId of dataNodes) {
            if (!engineNodes.has(nodeId)) {
                const node = this.dataManager.nodes.get(nodeId)!;
                this.layoutEngine.addNode(node);
                added++;
                
                if (added % 100 === 0) {
                    context?.progress.setMessage(`Added ${added} new nodes`);
                }
            }
        }
        
        // Remove deleted nodes
        let removed = 0;
        for (const nodeId of engineNodes) {
            if (!dataNodes.has(nodeId)) {
                this.layoutEngine.removeNode(nodeId);
                removed++;
            }
        }
        
        context?.progress.setPhase('Running layout algorithm');
        context?.progress.setProgress(20);
        
        // Run layout steps
        await this.runLayoutSteps(context);
        
        context?.progress.setProgress(100);
        context?.progress.setMessage(`Layout updated: ${added} added, ${removed} removed`);
    }
}
```

### Usage Patterns

#### Basic Usage (Automatic Triggers)

```typescript
// These automatically trigger layout updates
graph.addNodes(nodes);        // Triggers layout-update
graph.addEdges(edges);        // Triggers layout-update
graph.setLayout('circular');  // Triggers layout-update with new engine

// The layout updates are queued and executed in order
```

#### Bulk Operations (Skip Triggers)

```typescript
// For bulk operations, skip intermediate triggers
await graph.batchOperations(() => {
    // Skip layout updates for each add
    graph.addNodes(nodes1, { skipTriggers: true });
    graph.addNodes(nodes2, { skipTriggers: true });
    graph.addEdges(edges, { skipTriggers: true });
    
    // Manually trigger one layout update at the end
    graph.updateLayout();
});
```

#### Custom Triggers

```typescript
// Define custom triggers for specific operations
this.operationQueue.queueOperation(
    'custom-import',
    async (context) => {
        await importCustomData(context);
    },
    {
        description: 'Import custom data',
        triggers: ['layout-update', 'style-apply', 'camera-update']
    }
);
```

### Alternative Approaches (Not Recommended)

For completeness, here are other approaches that were considered:

1. **State Tracking in DataManager**: Track when layout needs updating with a dirty flag
2. **Layout Version Tracking**: Compare data version with layout version
3. **Manual Coupling**: Have DataManager directly call LayoutManager

These approaches create tighter coupling and are harder to maintain than the trigger system.

### Benefits of Trigger System

1. **Declarative**: Clear rules about what triggers what
2. **Flexible**: Can skip triggers for bulk operations
3. **Extensible**: Easy to add new trigger relationships
4. **Debuggable**: Triggered operations show their source
5. **Decoupled**: Managers don't need to know about each other

## Handling Concurrent Updates

### Scenario: New updates while processing

When new operations are queued while a batch is being processed:

```typescript
// Example scenario:
graph.addNodes(initialNodes);      // Batch 1
graph.setLayout('force-directed'); // Batch 1
graph.setStyleTemplate(style);     // Batch 1

// While Batch 1 is processing...
setTimeout(() => {
    graph.addNodes(moreNodes);     // Batch 2
    graph.updateLayout();          // Batch 2
}, 10);
```

### How it works:

1. **Batch 1** is collected in the current microtask
2. On next microtask, Batch 1 starts executing
3. New operations arriving during Batch 1 execution are collected into **Batch 2**
4. Batch 2 executes after Batch 1 completes
5. Operations within each batch are dependency-sorted

### Queue Behavior:

```typescript
private async executeBatch(): Promise<void> {
    // This ensures that operations arriving during execution
    // are collected into a new batch
    const batchIds = Array.from(this.currentBatch);
    this.currentBatch.clear(); // New operations go to a new batch
    
    // ... rest of batch execution ...
}
```

### Guarantees:

1. **Order Preservation**: Operations are processed in dependency order within each batch
2. **No Operation Loss**: All operations are executed, even if queued during processing
3. **Batch Isolation**: Each batch is independent and processed sequentially
4. **Deterministic Results**: Same operations always produce same final state

## Usage Examples

### Basic Usage

```typescript
// Operations are automatically batched and ordered
graph.addNodes(nodes);
graph.addEdges(edges);
graph.setLayout('force-directed');
graph.setStyleTemplate(darkTheme);
// All execute in correct dependency order
```

### Explicit Batching

```typescript
await graph.batchOperations(() => {
    graph.setStyleTemplate(newStyle);
    graph.addNodes(nodes);
    graph.addEdges(edges);
    graph.setLayout('hierarchical');
    graph.runAlgorithm('clustering', 'louvain');
});
// All operations complete before continuing
```

### Handling Async Data

```typescript
// Load data from multiple sources
await graph.batchOperations(async () => {
    const nodes = await fetchNodes();
    const edges = await fetchEdges();
    
    graph.addNodes(nodes);
    graph.addEdges(edges);
    graph.setLayout('force-directed');
});
```

### Conditional Operations

```typescript
graph.batchOperations(() => {
    graph.addNodes(baseNodes);
    
    if (config.includeEdges) {
        graph.addEdges(edges);
    }
    
    graph.setLayout(config.layout || 'ngraph');
    
    if (config.runAnalysis) {
        graph.runAlgorithm('analysis', 'pagerank');
    }
});
```

## Benefits

### 1. **Uses Proven Libraries**
- `p-queue`: Battle-tested queue management (8M weekly downloads)
- `toposort`: Simple, reliable topological sorting (500K weekly downloads)
- Built-in AbortSignal support for cancellation

### 2. **Clean Separation of Concerns**
- OperationQueueManager handles all queuing logic
- Graph class remains focused on graph operations
- Managers don't need modification

### 3. **Flexible and Extensible**
- Easy to add new operation categories
- Can adjust concurrency for parallel operations
- Dependency-based ordering ensures correct execution sequence
- Custom obsolescence rules per operation

### 4. **Observable and Debuggable**
- Events for operation lifecycle
- Queue statistics available
- Clear operation metadata
- Real-time progress tracking with phases and messages

### 5. **Handles Edge Cases**
- Circular dependencies detected and handled
- Operations during processing are queued
- Errors don't block subsequent operations
- Long-running operations can be cancelled
- Smart obsolescence prevents wasted computation

### 6. **Enhanced User Experience**
- Progress bars for long operations
- Cancellable operations
- Automatic cleanup of obsolete work
- Dependency-based execution order

## Migration Strategy

### Phase 1: Add OperationQueueManager
1. Install dependencies: `npm install p-queue toposort`
2. Create `OperationQueueManager.ts`
3. Add to Graph constructor

### Phase 2: Migrate High-Impact Methods
1. `setStyleTemplate` - Critical for initialization
2. `addNodes` / `addEdges` - Core data operations
3. `setLayout` - Layout engine changes

### Phase 3: Extend Coverage
1. Add more operation categories as needed
2. Convert remaining methods
3. Optimize operation batching and coalescing

### Phase 4: Optimization
1. Enable parallel operations where safe
2. Add operation coalescing (merge similar operations)
3. Implement operation cancellation

## Comparison with Previous Design

| Aspect | Previous (Custom) | Current (p-queue + toposort) |
|--------|------------------|------------------------------|
| Dependencies | None | p-queue, toposort |
| Code Size | ~200 lines | ~300 lines |
| Complexity | Medium | Low |
| Battle-tested | No | Yes |
| Features | Basic | Rich (cancellation, events, stats) |
| Debugging | Custom | Built-in events and stats |
| Maintenance | Higher | Lower |

## p-queue Features vs Custom Implementation

### What p-queue Provides:
- ✅ Queue management with concurrency control
- ✅ Dependency-based ordering via toposort
- ✅ AbortSignal/cancellation support
- ✅ Events (active, idle, completed, error)
- ✅ Pause/resume functionality
- ✅ Queue statistics (size, pending)

### What We Build on Top:
- 📦 Dependency-based operation ordering (using toposort)
- 📦 Progress tracking with phases and messages
- 📦 Obsolescence rules and automatic cancellation
- 📦 Operation batching per microtask
- 📦 Smart dependency resolution
- 📦 Integration with existing manager architecture

## Conclusion

This design leverages well-tested npm packages to provide a robust operation queuing system that ensures deterministic execution order while maintaining flexibility and debuggability. The combination of p-queue's solid queue management with our custom progress tracking and obsolescence rules creates a powerful system for managing complex graph operations. The separation into OperationQueueManager keeps the solution modular and easy to test independently.