# Interaction Testing Implementation Plan

## Overview

This document provides a detailed, step-by-step implementation plan for adding interaction testing to graphty-element based on the two-tier testing strategy outlined in the interaction testing plan. Each step includes specific implementation details, validation criteria, and anti-flakiness measures.

## Phase 1: Foundation (Weeks 1-2)

### Step 1.1: Create Input System Interface and Types

**What happens:**
- Define the core interface that both real and mock input systems will implement
- Create type definitions for all input events (pointer, touch, keyboard, wheel)
- Ensure compatibility with Babylon.js event types

**Implementation:**
```typescript
// src/graph/input/input-system.interface.ts
import { Observable } from '@babylonjs/core/Misc/observable';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';

export enum DeviceType {
  Mouse = 0,
  Touch = 1,
  Keyboard = 2
}

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}

export interface PointerInfo {
  x: number;
  y: number;
  button: MouseButton;
  deviceType: DeviceType;
  pointerId: number;
  isPrimary: boolean;
  pressure: number;
}

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  radiusX?: number;
  radiusY?: number;
  force?: number;
}

export interface WheelInfo {
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  deltaMode: number;
}

export interface KeyboardInfo {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface IInputSystem {
  // Observable events
  onPointerMove: Observable<PointerInfo>;
  onPointerDown: Observable<PointerInfo>;
  onPointerUp: Observable<PointerInfo>;
  onWheel: Observable<WheelInfo>;
  
  // Touch events
  onTouchStart: Observable<TouchPoint[]>;
  onTouchMove: Observable<TouchPoint[]>;
  onTouchEnd: Observable<number[]>; // Touch IDs that ended
  
  // Keyboard events
  onKeyDown: Observable<KeyboardInfo>;
  onKeyUp: Observable<KeyboardInfo>;
  
  // State queries
  getPointerPosition(): Vector2;
  isPointerDown(button?: MouseButton): boolean;
  getActiveTouches(): TouchPoint[];
  
  // Lifecycle
  attach(element: HTMLElement): void;
  detach(): void;
  dispose(): void;
}
```

**Validation:**
- TypeScript compilation succeeds with strict mode
- No circular dependencies
- All event types cover real browser event properties

**Anti-flakiness measures:**
- Use immutable event objects
- Avoid timing-dependent properties
- Provide default values for optional properties

### Step 1.2: Implement BabylonInputSystem Adapter

**What happens:**
- Create adapter that wraps Babylon.js input handling to implement IInputSystem
- Ensure existing input handling continues to work
- Add observable pattern for all input events

**Implementation:**
```typescript
// src/graph/input/babylon-input-system.ts
import { Scene, PointerEventTypes, KeyboardEventTypes } from '@babylonjs/core';
import { Observable } from '@babylonjs/core/Misc/observable';
import { IInputSystem, PointerInfo, TouchPoint, WheelInfo, KeyboardInfo, DeviceType, MouseButton } from './input-system.interface';

export class BabylonInputSystem implements IInputSystem {
  public onPointerMove = new Observable<PointerInfo>();
  public onPointerDown = new Observable<PointerInfo>();
  public onPointerUp = new Observable<PointerInfo>();
  public onWheel = new Observable<WheelInfo>();
  public onTouchStart = new Observable<TouchPoint[]>();
  public onTouchMove = new Observable<TouchPoint[]>();
  public onTouchEnd = new Observable<number[]>();
  public onKeyDown = new Observable<KeyboardInfo>();
  public onKeyUp = new Observable<KeyboardInfo>();

  private scene: Scene;
  private element: HTMLElement;
  private pointerPosition = new Vector2(0, 0);
  private pointerStates = new Map<MouseButton, boolean>();
  private activeTouches = new Map<number, TouchPoint>();

  constructor(scene: Scene) {
    this.scene = scene;
    this.setupObservers();
  }

  private setupObservers(): void {
    // Pointer events
    this.scene.onPointerObservable.add((pointerInfo) => {
      const info = this.convertPointerInfo(pointerInfo);
      
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERMOVE:
          this.pointerPosition.set(info.x, info.y);
          this.onPointerMove.notifyObservers(info);
          break;
        case PointerEventTypes.POINTERDOWN:
          this.pointerStates.set(info.button, true);
          this.onPointerDown.notifyObservers(info);
          break;
        case PointerEventTypes.POINTERUP:
          this.pointerStates.set(info.button, false);
          this.onPointerUp.notifyObservers(info);
          break;
        case PointerEventTypes.POINTERWHEEL:
          const wheelInfo = pointerInfo.event as WheelEvent;
          this.onWheel.notifyObservers({
            deltaX: wheelInfo.deltaX,
            deltaY: wheelInfo.deltaY,
            deltaZ: wheelInfo.deltaZ || 0,
            deltaMode: wheelInfo.deltaMode
          });
          break;
      }
    });

    // Handle touch events separately for better control
    if (this.element) {
      this.element.addEventListener('touchstart', this.handleTouchStart);
      this.element.addEventListener('touchmove', this.handleTouchMove);
      this.element.addEventListener('touchend', this.handleTouchEnd);
    }
  }

  private handleTouchStart = (event: TouchEvent): void => {
    const touches = this.extractTouches(event.touches);
    touches.forEach(touch => this.activeTouches.set(touch.id, touch));
    this.onTouchStart.notifyObservers(touches);
  };

  private handleTouchMove = (event: TouchEvent): void => {
    const touches = this.extractTouches(event.touches);
    touches.forEach(touch => this.activeTouches.set(touch.id, touch));
    this.onTouchMove.notifyObservers(touches);
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    const endedIds = Array.from(event.changedTouches).map(t => t.identifier);
    endedIds.forEach(id => this.activeTouches.delete(id));
    this.onTouchEnd.notifyObservers(endedIds);
  };

  // ... rest of implementation
}
```

**Validation:**
- All existing input handling continues to work
- Events fire in correct order
- State queries return accurate information
- Memory leaks are prevented (proper cleanup)

**Anti-flakiness measures:**
- Synchronous event handling
- State tracking prevents race conditions
- Defensive null checks on all browser APIs

### Step 1.3: Create MockDeviceInputSystem

**What happens:**
- Implement mock system that simulates all input types
- Add deterministic event generation
- Include state management for complex gestures

**Implementation:**
```typescript
// src/test/mock-device-input-system.ts
import { Observable } from '@babylonjs/core/Misc/observable';
import { Vector2 } from '@babylonjs/core/Maths/math.vector';
import { IInputSystem, PointerInfo, TouchPoint, WheelInfo, KeyboardInfo, DeviceType, MouseButton } from '../graph/input/input-system.interface';

export class MockDeviceInputSystem implements IInputSystem {
  public onPointerMove = new Observable<PointerInfo>();
  public onPointerDown = new Observable<PointerInfo>();
  public onPointerUp = new Observable<PointerInfo>();
  public onWheel = new Observable<WheelInfo>();
  public onTouchStart = new Observable<TouchPoint[]>();
  public onTouchMove = new Observable<TouchPoint[]>();
  public onTouchEnd = new Observable<number[]>();
  public onKeyDown = new Observable<KeyboardInfo>();
  public onKeyUp = new Observable<KeyboardInfo>();

  private pointerPosition = new Vector2(0, 0);
  private pointerStates = new Map<MouseButton, boolean>();
  private activeTouches = new Map<number, TouchPoint>();
  private activeKeys = new Set<string>();
  private nextPointerId = 1;
  private attached = false;

  // Device simulation
  public simulateMouseMove(x: number, y: number): void {
    if (!this.attached) throw new Error('Input system not attached');
    
    this.pointerPosition.set(x, y);
    const info: PointerInfo = {
      x,
      y,
      button: MouseButton.Left, // Default for move
      deviceType: DeviceType.Mouse,
      pointerId: 1,
      isPrimary: true,
      pressure: 0.5
    };
    
    this.onPointerMove.notifyObservers(info);
  }

  public simulateMouseDown(button: MouseButton = MouseButton.Left): void {
    if (!this.attached) throw new Error('Input system not attached');
    if (this.pointerStates.get(button)) return; // Already down
    
    this.pointerStates.set(button, true);
    const info: PointerInfo = {
      x: this.pointerPosition.x,
      y: this.pointerPosition.y,
      button,
      deviceType: DeviceType.Mouse,
      pointerId: 1,
      isPrimary: true,
      pressure: 1.0
    };
    
    this.onPointerDown.notifyObservers(info);
  }

  public simulateMouseUp(button: MouseButton = MouseButton.Left): void {
    if (!this.attached) throw new Error('Input system not attached');
    if (!this.pointerStates.get(button)) return; // Already up
    
    this.pointerStates.set(button, false);
    const info: PointerInfo = {
      x: this.pointerPosition.x,
      y: this.pointerPosition.y,
      button,
      deviceType: DeviceType.Mouse,
      pointerId: 1,
      isPrimary: true,
      pressure: 0
    };
    
    this.onPointerUp.notifyObservers(info);
  }

  public simulateWheel(deltaY: number, deltaX: number = 0): void {
    if (!this.attached) throw new Error('Input system not attached');
    
    const info: WheelInfo = {
      deltaX,
      deltaY,
      deltaZ: 0,
      deltaMode: 0 // DOM_DELTA_PIXEL
    };
    
    this.onWheel.notifyObservers(info);
  }

  public simulateTouchStart(touches: TouchPoint[]): void {
    if (!this.attached) throw new Error('Input system not attached');
    
    touches.forEach(touch => {
      this.activeTouches.set(touch.id, touch);
    });
    
    this.onTouchStart.notifyObservers(touches);
  }

  public simulateTouchMove(touches: TouchPoint[]): void {
    if (!this.attached) throw new Error('Input system not attached');
    
    // Validate all touches are active
    touches.forEach(touch => {
      if (!this.activeTouches.has(touch.id)) {
        throw new Error(`Touch ${touch.id} not started`);
      }
      this.activeTouches.set(touch.id, touch);
    });
    
    this.onTouchMove.notifyObservers(touches);
  }

  public simulateTouchEnd(touchIds: number[]): void {
    if (!this.attached) throw new Error('Input system not attached');
    
    // Validate touches exist
    touchIds.forEach(id => {
      if (!this.activeTouches.has(id)) {
        throw new Error(`Touch ${id} not active`);
      }
      this.activeTouches.delete(id);
    });
    
    this.onTouchEnd.notifyObservers(touchIds);
  }

  // Helper methods for common gestures
  public simulateDrag(startX: number, startY: number, endX: number, endY: number, steps: number = 10): void {
    this.simulateMouseMove(startX, startY);
    this.simulateMouseDown();
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      this.simulateMouseMove(x, y);
    }
    
    this.simulateMouseUp();
  }

  public simulatePinch(centerX: number, centerY: number, startDistance: number, endDistance: number, steps: number = 10): void {
    const startOffset = startDistance / 2;
    const endOffset = endDistance / 2;
    
    // Start touches
    this.simulateTouchStart([
      { id: 1, x: centerX - startOffset, y: centerY },
      { id: 2, x: centerX + startOffset, y: centerY }
    ]);
    
    // Animate pinch
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const offset = startOffset + (endOffset - startOffset) * t;
      
      this.simulateTouchMove([
        { id: 1, x: centerX - offset, y: centerY },
        { id: 2, x: centerX + offset, y: centerY }
      ]);
    }
    
    // End touches
    this.simulateTouchEnd([1, 2]);
  }

  // State queries
  public getPointerPosition(): Vector2 {
    return this.pointerPosition.clone();
  }

  public isPointerDown(button?: MouseButton): boolean {
    if (button === undefined) {
      return Array.from(this.pointerStates.values()).some(state => state);
    }
    return this.pointerStates.get(button) || false;
  }

  public getActiveTouches(): TouchPoint[] {
    return Array.from(this.activeTouches.values());
  }

  // Lifecycle
  public attach(element: HTMLElement): void {
    this.attached = true;
  }

  public detach(): void {
    this.attached = false;
    this.reset();
  }

  public dispose(): void {
    this.onPointerMove.clear();
    this.onPointerDown.clear();
    this.onPointerUp.clear();
    this.onWheel.clear();
    this.onTouchStart.clear();
    this.onTouchMove.clear();
    this.onTouchEnd.clear();
    this.onKeyDown.clear();
    this.onKeyUp.clear();
    this.reset();
  }

  public reset(): void {
    this.pointerPosition.set(0, 0);
    this.pointerStates.clear();
    this.activeTouches.clear();
    this.activeKeys.clear();
  }
}
```

**Validation:**
- All simulation methods produce valid events
- State management is consistent
- Error handling for invalid operations
- Helper methods produce realistic event sequences

**Anti-flakiness measures:**
- Deterministic event generation (no timestamps)
- State validation prevents impossible sequences
- Synchronous execution
- Clear error messages for debugging

### Step 1.4: Modify Graph Class to Accept Input System

**What happens:**
- Add optional inputSystem parameter to Graph constructor
- Refactor existing input handling to use IInputSystem
- Ensure backward compatibility

**Implementation:**
```typescript
// src/graph/graph.ts (modifications)
import { IInputSystem } from './input/input-system.interface';
import { BabylonInputSystem } from './input/babylon-input-system';

export class Graph {
  private inputSystem: IInputSystem;

  constructor(
    container: HTMLElement,
    config: GraphConfig,
    inputSystem?: IInputSystem
  ) {
    // ... existing initialization ...
    
    // Use provided input system or create default
    this.inputSystem = inputSystem || new BabylonInputSystem(this.scene);
    this.inputSystem.attach(container);
    
    // Setup input handlers
    this.setupInputHandlers();
  }

  private setupInputHandlers(): void {
    // Convert existing handlers to use IInputSystem
    this.inputSystem.onPointerDown.add((info) => {
      this.handlePointerDown(info);
    });
    
    this.inputSystem.onPointerMove.add((info) => {
      this.handlePointerMove(info);
    });
    
    this.inputSystem.onPointerUp.add((info) => {
      this.handlePointerUp(info);
    });
    
    // Touch handlers for gestures
    this.inputSystem.onTouchStart.add((touches) => {
      this.handleTouchStart(touches);
    });
    
    this.inputSystem.onTouchMove.add((touches) => {
      this.handleTouchMove(touches);
    });
    
    this.inputSystem.onTouchEnd.add((touchIds) => {
      this.handleTouchEnd(touchIds);
    });
    
    // Wheel for zoom
    this.inputSystem.onWheel.add((info) => {
      this.handleWheel(info);
    });
  }

  // Add methods to support testing
  public getInputSystem(): IInputSystem {
    return this.inputSystem;
  }

  public worldToScreen(worldPos: Vector3): Vector2 {
    const engine = this.scene.getEngine();
    const viewport = this.scene.activeCamera.viewport;
    const matrix = this.scene.getTransformMatrix();
    const screenPos = Vector3.Project(
      worldPos,
      matrix.world,
      matrix.view,
      matrix.projection,
      viewport
    );
    
    return new Vector2(
      screenPos.x * engine.getRenderWidth(),
      screenPos.y * engine.getRenderHeight()
    );
  }

  public screenToWorld(screenPos: Vector2): Vector3 | null {
    const pickInfo = this.scene.pick(screenPos.x, screenPos.y);
    return pickInfo?.pickedPoint || null;
  }

  dispose(): void {
    this.inputSystem.dispose();
    // ... existing disposal ...
  }
}
```

**Validation:**
- Existing functionality unchanged
- New input system properly integrated
- No memory leaks
- Helper methods work correctly

**Anti-flakiness measures:**
- Null checks on all operations
- Proper cleanup in dispose
- Event handler weak references

### Step 1.5: Create Test Infrastructure

**What happens:**
- Set up test directories and configuration
- Create test utilities and helpers
- Configure Vitest for both unit and integration tests

**Implementation:**
```typescript
// test/setup.ts
import { beforeEach, afterEach } from 'vitest';
import { MockDeviceInputSystem } from './mock-device-input-system';

// Global test utilities
export function createMockInputSystem(): MockDeviceInputSystem {
  return new MockDeviceInputSystem();
}

// Cleanup after each test
afterEach(() => {
  // Clean up any lingering canvases
  document.querySelectorAll('canvas').forEach(canvas => canvas.remove());
  
  // Reset body styles
  document.body.style.margin = '0';
  document.body.style.padding = '0';
});

// Test helpers
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  container.style.position = 'relative';
  document.body.appendChild(container);
  return container;
}

export function waitForGraph(graph: Graph): Promise<void> {
  return new Promise((resolve) => {
    if (graph.isReady) {
      resolve();
    } else {
      graph.onReady.addOnce(() => resolve());
    }
  });
}

// Assertion helpers
export function expectVector2Near(actual: Vector2, expected: Vector2, tolerance: number = 0.01): void {
  expect(Math.abs(actual.x - expected.x)).toBeLessThan(tolerance);
  expect(Math.abs(actual.y - expected.y)).toBeLessThan(tolerance);
}

export function expectVector3Near(actual: Vector3, expected: Vector3, tolerance: number = 0.01): void {
  expect(Math.abs(actual.x - expected.x)).toBeLessThan(tolerance);
  expect(Math.abs(actual.y - expected.y)).toBeLessThan(tolerance);
  expect(Math.abs(actual.z - expected.z)).toBeLessThan(tolerance);
}
```

```typescript
// vitest.config.ts (update)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: [
      'test/unit/**/*.test.ts',
      'test/integration/**/*.test.ts'
    ],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/test/**']
    },
    // Separate test runs for unit vs integration
    // Unit tests run in parallel, integration tests sequential
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        isolate: true
      }
    }
  }
});
```

**Validation:**
- Test utilities compile without errors
- Helper functions work as expected
- Test environment properly configured
- Cleanup prevents test interference

**Anti-flakiness measures:**
- Proper cleanup after each test
- Isolated test environments
- No shared state between tests
- Deterministic test container creation

## Phase 2: Unit Tests (Weeks 2-3)

### Step 2.1: Node Dragging Tests

**What happens:**
- Test single node dragging with pinOnDrag
- Test multi-node selection and dragging
- Test drag constraints and boundaries
- Performance test with many nodes

**Implementation:**
```typescript
// test/unit/interactions/node-drag.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { Graph } from '../../../src/graph/graph';
import { createMockInputSystem, createTestContainer, waitForGraph, expectVector3Near } from '../../setup';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

describe('Node Dragging', () => {
  let graph: Graph;
  let mockInput: MockDeviceInputSystem;
  let container: HTMLElement;

  beforeEach(async () => {
    container = createTestContainer();
    mockInput = createMockInputSystem();
    graph = new Graph(container, {
      nodes: [],
      edges: [],
      physics: { enabled: false }, // Disable physics for deterministic tests
      camera: { type: '2d' }
    }, mockInput);
    
    await waitForGraph(graph);
  });

  afterEach(() => {
    graph.dispose();
    container.remove();
  });

  test('respects pinOnDrag setting when enabled', async () => {
    // Configure graph
    graph.updateConfig({ pinOnDrag: true });
    
    // Add test node
    const nodeId = 'test-node';
    graph.addNode({
      id: nodeId,
      position: { x: 0, y: 0, z: 0 }
    });
    
    // Get node screen position
    const node = graph.getNode(nodeId);
    const startWorldPos = node.getPosition();
    const startScreenPos = graph.worldToScreen(startWorldPos);
    
    // Simulate drag
    mockInput.simulateDrag(
      startScreenPos.x,
      startScreenPos.y,
      startScreenPos.x + 100,
      startScreenPos.y + 50,
      5 // steps
    );
    
    // Allow one frame for update
    await new Promise(resolve => setTimeout(resolve, 16));
    
    // Verify node moved and is pinned
    const endWorldPos = node.getPosition();
    expect(node.isPinned()).toBe(true);
    expect(endWorldPos.x).toBeGreaterThan(startWorldPos.x);
    expect(endWorldPos.y).toBeGreaterThan(startWorldPos.y);
  });

  test('does not pin when pinOnDrag is disabled', async () => {
    graph.updateConfig({ pinOnDrag: false });
    
    const nodeId = 'test-node';
    graph.addNode({
      id: nodeId,
      position: { x: 0, y: 0, z: 0 }
    });
    
    const node = graph.getNode(nodeId);
    const startScreenPos = graph.worldToScreen(node.getPosition());
    
    mockInput.simulateDrag(
      startScreenPos.x,
      startScreenPos.y,
      startScreenPos.x + 100,
      startScreenPos.y + 50
    );
    
    await new Promise(resolve => setTimeout(resolve, 16));
    
    expect(node.isPinned()).toBe(false);
  });

  test('handles multi-node selection and drag', async () => {
    graph.updateConfig({ pinOnDrag: true });
    
    // Add multiple nodes
    const nodeIds = ['node1', 'node2', 'node3'];
    const nodes = nodeIds.map((id, i) => {
      graph.addNode({
        id,
        position: { x: i * 50, y: 0, z: 0 }
      });
      return graph.getNode(id);
    });
    
    // Select all nodes (simulate ctrl+click)
    nodes.forEach(node => {
      const pos = graph.worldToScreen(node.getPosition());
      mockInput.simulateMouseMove(pos.x, pos.y);
      mockInput.simulateKeyDown('Control');
      mockInput.simulateMouseDown();
      mockInput.simulateMouseUp();
    });
    mockInput.simulateKeyUp('Control');
    
    // Verify all selected
    nodes.forEach(node => {
      expect(node.isSelected()).toBe(true);
    });
    
    // Drag from first node
    const dragStart = graph.worldToScreen(nodes[0].getPosition());
    mockInput.simulateDrag(
      dragStart.x,
      dragStart.y,
      dragStart.x + 100,
      dragStart.y + 100
    );
    
    await new Promise(resolve => setTimeout(resolve, 16));
    
    // Verify all nodes moved together
    const positions = nodes.map(n => n.getPosition());
    expect(positions[1].x - positions[0].x).toBeCloseTo(50, 1);
    expect(positions[2].x - positions[1].x).toBeCloseTo(50, 1);
    expect(positions[0].y).toBeCloseTo(positions[1].y, 1);
    expect(positions[1].y).toBeCloseTo(positions[2].y, 1);
  });

  test('respects drag constraints', async () => {
    graph.updateConfig({
      pinOnDrag: true,
      dragConstraints: {
        minX: -100,
        maxX: 100,
        minY: -100,
        maxY: 100
      }
    });
    
    const nodeId = 'test-node';
    graph.addNode({
      id: nodeId,
      position: { x: 0, y: 0, z: 0 }
    });
    
    const node = graph.getNode(nodeId);
    const startPos = graph.worldToScreen(node.getPosition());
    
    // Try to drag beyond constraints
    mockInput.simulateDrag(
      startPos.x,
      startPos.y,
      startPos.x + 500, // Way beyond constraint
      startPos.y + 500
    );
    
    await new Promise(resolve => setTimeout(resolve, 16));
    
    // Verify position is constrained
    const finalPos = node.getPosition();
    expect(finalPos.x).toBeLessThanOrEqual(100);
    expect(finalPos.y).toBeLessThanOrEqual(100);
  });

  test('maintains performance with 1000 nodes', async () => {
    // Add many nodes
    const nodeCount = 1000;
    for (let i = 0; i < nodeCount; i++) {
      graph.addNode({
        id: `node-${i}`,
        position: {
          x: (i % 32) * 30,
          y: Math.floor(i / 32) * 30,
          z: 0
        }
      });
    }
    
    // Select a node in the middle
    const targetNode = graph.getNode('node-500');
    const screenPos = graph.worldToScreen(targetNode.getPosition());
    
    // Measure drag performance
    const startTime = performance.now();
    
    mockInput.simulateDrag(
      screenPos.x,
      screenPos.y,
      screenPos.x + 100,
      screenPos.y + 100,
      10 // steps
    );
    
    const dragTime = performance.now() - startTime;
    
    // Should complete drag in reasonable time
    expect(dragTime).toBeLessThan(100); // 100ms budget
    
    // Verify node actually moved
    await new Promise(resolve => setTimeout(resolve, 16));
    const endPos = targetNode.getPosition();
    expect(endPos.x).toBeGreaterThan(15); // Started at ~15
  });
});
```

**Validation:**
- Each test has clear pass/fail criteria
- Performance benchmarks are reasonable
- Edge cases are covered
- State changes are verified

**Anti-flakiness measures:**
- Physics disabled for deterministic behavior
- Fixed timing with setTimeout(16) for frame updates
- Tolerance in position comparisons
- No dependency on render loop timing

### Step 2.2: Camera Control Tests

**What happens:**
- Test 2D camera pan, zoom, keyboard navigation
- Test 3D camera orbit, pan, zoom
- Test camera limits and constraints
- Test smooth vs instant transitions

**Implementation:**
```typescript
// test/unit/interactions/camera-controls.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { Graph } from '../../../src/graph/graph';
import { createMockInputSystem, createTestContainer, waitForGraph, expectVector3Near } from '../../setup';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

describe('Camera Controls', () => {
  describe('2D Camera', () => {
    let graph: Graph;
    let mockInput: MockDeviceInputSystem;
    let container: HTMLElement;

    beforeEach(async () => {
      container = createTestContainer();
      mockInput = createMockInputSystem();
      graph = new Graph(container, {
        nodes: [],
        edges: [],
        camera: { type: '2d' }
      }, mockInput);
      
      await waitForGraph(graph);
    });

    afterEach(() => {
      graph.dispose();
      container.remove();
    });

    test('pans with right mouse button', async () => {
      const camera = graph.getCamera();
      const startPos = camera.position.clone();
      
      // Simulate right-click pan
      mockInput.simulateMouseMove(400, 300);
      mockInput.simulateMouseDown(MouseButton.Right);
      mockInput.simulateMouseMove(500, 400, 5); // 5 steps for smooth
      mockInput.simulateMouseUp(MouseButton.Right);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      const endPos = camera.position;
      expect(endPos.x).not.toBeCloseTo(startPos.x, 0.1);
      expect(endPos.y).not.toBeCloseTo(startPos.y, 0.1);
    });

    test('pans with middle mouse button', async () => {
      const camera = graph.getCamera();
      const startPos = camera.position.clone();
      
      mockInput.simulateMouseMove(400, 300);
      mockInput.simulateMouseDown(MouseButton.Middle);
      mockInput.simulateMouseMove(300, 200);
      mockInput.simulateMouseUp(MouseButton.Middle);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      const endPos = camera.position;
      expect(endPos.x).not.toBeCloseTo(startPos.x, 0.1);
    });

    test('zooms with mouse wheel', async () => {
      const camera = graph.getCamera();
      const startOrthoSize = camera.orthoTop - camera.orthoBottom;
      
      // Zoom in
      mockInput.simulateMouseMove(400, 300);
      mockInput.simulateWheel(-120); // Negative = zoom in
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      const endOrthoSize = camera.orthoTop - camera.orthoBottom;
      expect(endOrthoSize).toBeLessThan(startOrthoSize);
      
      // Zoom out
      mockInput.simulateWheel(240); // Positive = zoom out
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      const finalOrthoSize = camera.orthoTop - camera.orthoBottom;
      expect(finalOrthoSize).toBeGreaterThan(endOrthoSize);
    });

    test('navigates with keyboard arrows', async () => {
      const camera = graph.getCamera();
      const startPos = camera.position.clone();
      
      // Move right
      mockInput.simulateKeyDown('ArrowRight');
      await new Promise(resolve => setTimeout(resolve, 100)); // Hold key
      mockInput.simulateKeyUp('ArrowRight');
      
      expect(camera.position.x).toBeGreaterThan(startPos.x);
      
      // Move up
      mockInput.simulateKeyDown('ArrowUp');
      await new Promise(resolve => setTimeout(resolve, 100));
      mockInput.simulateKeyUp('ArrowUp');
      
      expect(camera.position.y).toBeGreaterThan(startPos.y);
    });

    test('respects zoom limits', async () => {
      graph.updateConfig({
        camera: {
          type: '2d',
          minZoom: 0.5,
          maxZoom: 2.0
        }
      });
      
      const camera = graph.getCamera();
      
      // Try to zoom beyond limits
      for (let i = 0; i < 20; i++) {
        mockInput.simulateWheel(-120); // Zoom in a lot
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      
      const orthoSize = camera.orthoTop - camera.orthoBottom;
      const expectedMinSize = 600 / 2.0; // viewport height / maxZoom
      expect(orthoSize).toBeGreaterThanOrEqual(expectedMinSize - 1);
    });
  });

  describe('3D Camera', () => {
    let graph: Graph;
    let mockInput: MockDeviceInputSystem;
    let container: HTMLElement;

    beforeEach(async () => {
      container = createTestContainer();
      mockInput = createMockInputSystem();
      graph = new Graph(container, {
        nodes: [],
        edges: [],
        camera: { type: '3d' }
      }, mockInput);
      
      await waitForGraph(graph);
    });

    afterEach(() => {
      graph.dispose();
      container.remove();
    });

    test('orbits with left mouse button', async () => {
      const camera = graph.getCamera() as ArcRotateCamera;
      const startAlpha = camera.alpha;
      const startBeta = camera.beta;
      
      // Simulate orbit
      mockInput.simulateMouseMove(400, 300);
      mockInput.simulateMouseDown(MouseButton.Left);
      mockInput.simulateMouseMove(500, 400, 10);
      mockInput.simulateMouseUp(MouseButton.Left);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      expect(camera.alpha).not.toBeCloseTo(startAlpha, 0.01);
      expect(camera.beta).not.toBeCloseTo(startBeta, 0.01);
    });

    test('pans with right mouse button', async () => {
      const camera = graph.getCamera() as ArcRotateCamera;
      const startTarget = camera.target.clone();
      
      mockInput.simulateMouseMove(400, 300);
      mockInput.simulateMouseDown(MouseButton.Right);
      mockInput.simulateMouseMove(300, 200);
      mockInput.simulateMouseUp(MouseButton.Right);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      expectVector3Near(camera.target, startTarget, 1); // Should move
      expect(camera.target.x).not.toBeCloseTo(startTarget.x, 0.1);
    });

    test('zooms with mouse wheel', async () => {
      const camera = graph.getCamera() as ArcRotateCamera;
      const startRadius = camera.radius;
      
      // Zoom in
      mockInput.simulateWheel(-240);
      await new Promise(resolve => setTimeout(resolve, 16));
      
      expect(camera.radius).toBeLessThan(startRadius);
      
      // Zoom out
      mockInput.simulateWheel(480);
      await new Promise(resolve => setTimeout(resolve, 16));
      
      expect(camera.radius).toBeGreaterThan(startRadius);
    });

    test('resets camera position', async () => {
      const camera = graph.getCamera() as ArcRotateCamera;
      
      // Move camera around
      mockInput.simulateDrag(400, 300, 500, 400);
      mockInput.simulateWheel(-240);
      await new Promise(resolve => setTimeout(resolve, 16));
      
      // Reset
      graph.resetCamera();
      await new Promise(resolve => setTimeout(resolve, 100)); // Animation
      
      // Should be back to defaults
      expect(camera.alpha).toBeCloseTo(Math.PI / 4, 0.1);
      expect(camera.beta).toBeCloseTo(Math.PI / 3, 0.1);
      expect(camera.radius).toBeCloseTo(50, 1);
    });
  });
});
```

**Validation:**
- Camera state changes are measurable
- Limits and constraints are enforced
- Different input methods work correctly
- Animation timing is accounted for

**Anti-flakiness measures:**
- Fixed wait times for animations
- Tolerance in floating point comparisons
- No dependency on frame rate
- Predictable initial camera states

### Step 2.3: Touch Gesture Tests

**What happens:**
- Test single touch pan
- Test pinch to zoom
- Test two-finger rotate (3D)
- Test gesture recognition accuracy

**Implementation:**
```typescript
// test/unit/interactions/touch-gestures.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { Graph } from '../../../src/graph/graph';
import { createMockInputSystem, createTestContainer, waitForGraph } from '../../setup';

describe('Touch Gestures', () => {
  let graph: Graph;
  let mockInput: MockDeviceInputSystem;
  let container: HTMLElement;

  beforeEach(async () => {
    container = createTestContainer();
    mockInput = createMockInputSystem();
  });

  afterEach(() => {
    graph?.dispose();
    container.remove();
  });

  describe('2D Touch Gestures', () => {
    beforeEach(async () => {
      graph = new Graph(container, {
        nodes: [],
        edges: [],
        camera: { type: '2d' }
      }, mockInput);
      await waitForGraph(graph);
    });

    test('single finger pans camera', async () => {
      const camera = graph.getCamera();
      const startPos = camera.position.clone();
      
      // Single touch drag
      mockInput.simulateTouchStart([{ id: 1, x: 400, y: 300 }]);
      mockInput.simulateTouchMove([{ id: 1, x: 300, y: 200 }]);
      mockInput.simulateTouchEnd([1]);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      expect(camera.position.x).not.toBeCloseTo(startPos.x, 0.1);
      expect(camera.position.y).not.toBeCloseTo(startPos.y, 0.1);
    });

    test('pinch gesture zooms', async () => {
      const camera = graph.getCamera();
      const startOrthoSize = camera.orthoTop - camera.orthoBottom;
      
      // Pinch out (zoom in)
      mockInput.simulatePinch(400, 300, 100, 200, 10);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      const midOrthoSize = camera.orthoTop - camera.orthoBottom;
      expect(midOrthoSize).toBeLessThan(startOrthoSize);
      
      // Pinch in (zoom out)
      mockInput.simulatePinch(400, 300, 200, 100, 10);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      const endOrthoSize = camera.orthoTop - camera.orthoBottom;
      expect(endOrthoSize).toBeGreaterThan(midOrthoSize);
    });

    test('distinguishes pinch from two-finger pan', async () => {
      const camera = graph.getCamera();
      const startPos = camera.position.clone();
      const startOrthoSize = camera.orthoTop - camera.orthoBottom;
      
      // Two fingers moving in same direction (pan)
      mockInput.simulateTouchStart([
        { id: 1, x: 350, y: 300 },
        { id: 2, x: 450, y: 300 }
      ]);
      
      mockInput.simulateTouchMove([
        { id: 1, x: 250, y: 200 },
        { id: 2, x: 350, y: 200 }
      ]);
      
      mockInput.simulateTouchEnd([1, 2]);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      // Should pan, not zoom
      expect(camera.position.x).not.toBeCloseTo(startPos.x, 0.1);
      const endOrthoSize = camera.orthoTop - camera.orthoBottom;
      expect(endOrthoSize).toBeCloseTo(startOrthoSize, 1);
    });
  });

  describe('3D Touch Gestures', () => {
    beforeEach(async () => {
      graph = new Graph(container, {
        nodes: [],
        edges: [],
        camera: { type: '3d' }
      }, mockInput);
      await waitForGraph(graph);
    });

    test('two-finger rotate orbits camera', async () => {
      const camera = graph.getCamera() as ArcRotateCamera;
      const startAlpha = camera.alpha;
      
      // Two fingers rotating around center
      const centerX = 400, centerY = 300;
      const radius = 100;
      
      mockInput.simulateTouchStart([
        { id: 1, x: centerX - radius, y: centerY },
        { id: 2, x: centerX + radius, y: centerY }
      ]);
      
      // Rotate 45 degrees
      const angle = Math.PI / 4;
      mockInput.simulateTouchMove([
        {
          id: 1,
          x: centerX + radius * Math.cos(Math.PI + angle),
          y: centerY + radius * Math.sin(Math.PI + angle)
        },
        {
          id: 2,
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        }
      ]);
      
      mockInput.simulateTouchEnd([1, 2]);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      
      expect(camera.alpha).not.toBeCloseTo(startAlpha, 0.01);
    });

    test('three-finger swipe resets camera', async () => {
      const camera = graph.getCamera() as ArcRotateCamera;
      
      // Move camera first
      mockInput.simulateDrag(400, 300, 500, 400);
      await new Promise(resolve => setTimeout(resolve, 16));
      
      // Three finger swipe up
      mockInput.simulateTouchStart([
        { id: 1, x: 300, y: 400 },
        { id: 2, x: 400, y: 400 },
        { id: 3, x: 500, y: 400 }
      ]);
      
      mockInput.simulateTouchMove([
        { id: 1, x: 300, y: 200 },
        { id: 2, x: 400, y: 200 },
        { id: 3, x: 500, y: 200 }
      ]);
      
      mockInput.simulateTouchEnd([1, 2, 3]);
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Reset animation
      
      // Should be reset
      expect(camera.alpha).toBeCloseTo(Math.PI / 4, 0.1);
      expect(camera.beta).toBeCloseTo(Math.PI / 3, 0.1);
    });
  });

  describe('Touch Gesture Recognition', () => {
    beforeEach(async () => {
      graph = new Graph(container, {
        nodes: [],
        edges: [],
        camera: { type: '3d' }
      }, mockInput);
      await waitForGraph(graph);
    });

    test('correctly identifies tap vs drag', async () => {
      let tapCount = 0;
      let dragCount = 0;
      
      graph.on('tap', () => tapCount++);
      graph.on('dragstart', () => dragCount++);
      
      // Quick tap
      mockInput.simulateTouchStart([{ id: 1, x: 400, y: 300 }]);
      await new Promise(resolve => setTimeout(resolve, 50));
      mockInput.simulateTouchEnd([1]);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      expect(tapCount).toBe(1);
      expect(dragCount).toBe(0);
      
      // Drag
      mockInput.simulateTouchStart([{ id: 1, x: 400, y: 300 }]);
      await new Promise(resolve => setTimeout(resolve, 50));
      mockInput.simulateTouchMove([{ id: 1, x: 450, y: 350 }]);
      mockInput.simulateTouchEnd([1]);
      
      await new Promise(resolve => setTimeout(resolve, 16));
      expect(tapCount).toBe(1); // No new tap
      expect(dragCount).toBe(1);
    });

    test('handles rapid gesture changes', async () => {
      const camera = graph.getCamera() as ArcRotateCamera;
      const startRadius = camera.radius;
      
      // Rapid pinch in/out
      for (let i = 0; i < 5; i++) {
        mockInput.simulatePinch(400, 300, 100, 150, 3);
        await new Promise(resolve => setTimeout(resolve, 16));
        mockInput.simulatePinch(400, 300, 150, 100, 3);
        await new Promise(resolve => setTimeout(resolve, 16));
      }
      
      // Camera should still be in valid state
      expect(camera.radius).toBeGreaterThan(0);
      expect(camera.radius).toBeLessThan(1000);
      
      // Should have changed from start
      expect(camera.radius).not.toBeCloseTo(startRadius, 0.1);
    });
  });
});
```

**Validation:**
- Gesture recognition is accurate
- Multi-touch handling is correct
- Gesture conflicts are resolved properly
- Edge cases handled gracefully

**Anti-flakiness measures:**
- Fixed timing for gesture recognition
- Clear gesture boundaries
- No reliance on touch event ordering
- Predictable gesture simulation

### Step 2.4: Keyboard Navigation Tests

**What happens:**
- Test arrow key camera movement
- Test zoom with +/- keys
- Test shortcuts (reset, fit to view)
- Test modifier key combinations

**Implementation:**
```typescript
// test/unit/interactions/keyboard-navigation.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { Graph } from '../../../src/graph/graph';
import { createMockInputSystem, createTestContainer, waitForGraph } from '../../setup';

describe('Keyboard Navigation', () => {
  let graph: Graph;
  let mockInput: MockDeviceInputSystem;
  let container: HTMLElement;

  beforeEach(async () => {
    container = createTestContainer();
    mockInput = createMockInputSystem();
    graph = new Graph(container, {
      nodes: [
        { id: 'node1', position: { x: 0, y: 0, z: 0 } },
        { id: 'node2', position: { x: 100, y: 100, z: 0 } }
      ],
      edges: [],
      camera: { type: '2d' }
    }, mockInput);
    
    await waitForGraph(graph);
  });

  afterEach(() => {
    graph.dispose();
    container.remove();
  });

  test('arrow keys move camera', async () => {
    const camera = graph.getCamera();
    const startX = camera.position.x;
    const startY = camera.position.y;
    
    // Test each arrow key
    const movements = [
      { key: 'ArrowRight', expectedX: x => x > startX, expectedY: y => y === startY },
      { key: 'ArrowLeft', expectedX: x => x < startX, expectedY: y => y === startY },
      { key: 'ArrowUp', expectedX: x => x === startX, expectedY: y => y > startY },
      { key: 'ArrowDown', expectedX: x => x === startX, expectedY: y => y < startY }
    ];
    
    for (const movement of movements) {
      // Reset camera
      camera.position.x = startX;
      camera.position.y = startY;
      
      mockInput.simulateKeyDown(movement.key);
      await new Promise(resolve => setTimeout(resolve, 100));
      mockInput.simulateKeyUp(movement.key);
      
      expect(movement.expectedX(camera.position.x)).toBe(true);
      expect(movement.expectedY(camera.position.y)).toBe(true);
    }
  });

  test('plus/minus keys zoom', async () => {
    const camera = graph.getCamera();
    const startOrthoSize = camera.orthoTop - camera.orthoBottom;
    
    // Zoom in with plus
    mockInput.simulateKeyDown('+');
    await new Promise(resolve => setTimeout(resolve, 50));
    mockInput.simulateKeyUp('+');
    
    await new Promise(resolve => setTimeout(resolve, 16));
    const zoomedInSize = camera.orthoTop - camera.orthoBottom;
    expect(zoomedInSize).toBeLessThan(startOrthoSize);
    
    // Zoom out with minus
    mockInput.simulateKeyDown('-');
    await new Promise(resolve => setTimeout(resolve, 50));
    mockInput.simulateKeyUp('-');
    
    await new Promise(resolve => setTimeout(resolve, 16));
    const zoomedOutSize = camera.orthoTop - camera.orthoBottom;
    expect(zoomedOutSize).toBeGreaterThan(zoomedInSize);
  });

  test('R key resets camera', async () => {
    const camera = graph.getCamera();
    
    // Move camera
    mockInput.simulateKeyDown('ArrowRight');
    await new Promise(resolve => setTimeout(resolve, 100));
    mockInput.simulateKeyUp('ArrowRight');
    
    const movedX = camera.position.x;
    
    // Reset with R
    mockInput.simulateKeyDown('r');
    mockInput.simulateKeyUp('r');
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Animation
    
    expect(camera.position.x).toBeCloseTo(0, 0.1);
    expect(camera.position.x).not.toBeCloseTo(movedX, 0.1);
  });

  test('F key fits graph to view', async () => {
    const camera = graph.getCamera();
    
    // Move camera away
    camera.position.set(1000, 1000, camera.position.z);
    
    // Fit to view
    mockInput.simulateKeyDown('f');
    mockInput.simulateKeyUp('f');
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Animation
    
    // Camera should frame both nodes
    const orthoSize = camera.orthoTop - camera.orthoBottom;
    expect(orthoSize).toBeGreaterThan(100); // Enough to see both nodes
    expect(orthoSize).toBeLessThan(500); // Not too far out
    
    // Should be centered between nodes
    expect(camera.position.x).toBeCloseTo(50, 10);
    expect(camera.position.y).toBeCloseTo(50, 10);
  });

  test('Tab key cycles through nodes', async () => {
    let selectedNode = null;
    graph.on('nodeSelected', (node) => {
      selectedNode = node;
    });
    
    // First tab
    mockInput.simulateKeyDown('Tab');
    mockInput.simulateKeyUp('Tab');
    await new Promise(resolve => setTimeout(resolve, 16));
    
    expect(selectedNode?.id).toBe('node1');
    
    // Second tab
    mockInput.simulateKeyDown('Tab');
    mockInput.simulateKeyUp('Tab');
    await new Promise(resolve => setTimeout(resolve, 16));
    
    expect(selectedNode?.id).toBe('node2');
    
    // Third tab (cycle back)
    mockInput.simulateKeyDown('Tab');
    mockInput.simulateKeyUp('Tab');
    await new Promise(resolve => setTimeout(resolve, 16));
    
    expect(selectedNode?.id).toBe('node1');
  });

  test('Shift+Tab cycles backwards', async () => {
    let selectedNode = null;
    graph.on('nodeSelected', (node) => {
      selectedNode = node;
    });
    
    // Select first node
    mockInput.simulateKeyDown('Tab');
    mockInput.simulateKeyUp('Tab');
    await new Promise(resolve => setTimeout(resolve, 16));
    
    // Shift+Tab to go backwards
    mockInput.simulateKeyDown('Shift');
    mockInput.simulateKeyDown('Tab');
    mockInput.simulateKeyUp('Tab');
    mockInput.simulateKeyUp('Shift');
    await new Promise(resolve => setTimeout(resolve, 16));
    
    expect(selectedNode?.id).toBe('node2');
  });

  test('Delete key removes selected node', async () => {
    // Select node
    graph.selectNode('node1');
    
    // Delete
    mockInput.simulateKeyDown('Delete');
    mockInput.simulateKeyUp('Delete');
    
    await new Promise(resolve => setTimeout(resolve, 16));
    
    expect(graph.getNode('node1')).toBeNull();
    expect(graph.getNodes().length).toBe(1);
  });

  test('Ctrl+A selects all nodes', async () => {
    mockInput.simulateKeyDown('Control');
    mockInput.simulateKeyDown('a');
    mockInput.simulateKeyUp('a');
    mockInput.simulateKeyUp('Control');
    
    await new Promise(resolve => setTimeout(resolve, 16));
    
    const nodes = graph.getNodes();
    expect(nodes.every(n => n.isSelected())).toBe(true);
  });

  test('Escape deselects all', async () => {
    // Select all first
    graph.selectAll();
    expect(graph.getSelectedNodes().length).toBe(2);
    
    // Escape
    mockInput.simulateKeyDown('Escape');
    mockInput.simulateKeyUp('Escape');
    
    await new Promise(resolve => setTimeout(resolve, 16));
    
    expect(graph.getSelectedNodes().length).toBe(0);
  });

  test('Space pauses/resumes physics', async () => {
    graph.updateConfig({ physics: { enabled: true } });
    
    expect(graph.isPhysicsEnabled()).toBe(true);
    
    // Pause
    mockInput.simulateKeyDown(' ');
    mockInput.simulateKeyUp(' ');
    
    await new Promise(resolve => setTimeout(resolve, 16));
    expect(graph.isPhysicsEnabled()).toBe(false);
    
    // Resume
    mockInput.simulateKeyDown(' ');
    mockInput.simulateKeyUp(' ');
    
    await new Promise(resolve => setTimeout(resolve, 16));
    expect(graph.isPhysicsEnabled()).toBe(true);
  });
});
```

**Validation:**
- Each key performs expected action
- Modifier keys work correctly
- Key repeat is handled properly
- State changes are verifiable

**Anti-flakiness measures:**
- Fixed timing for key repeat
- Clear state before each test
- No dependency on focus state
- Predictable initial conditions

## Phase 3: Integration Tests (Weeks 3-4)

### Step 3.1: Playwright Configuration

**What happens:**
- Set up Playwright projects for different scenarios
- Configure browser options for Canvas testing
- Set up trace and video recording
- Configure for headless server environment

**Implementation:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/integration',
  
  // Fail fast in CI
  fullyParallel: false, // Sequential for Canvas resource management
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for consistent Canvas performance
  
  // Test artifacts
  use: {
    baseURL: 'http://dev.ato.ms:9025', // Storybook on allowed port
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    
    // Viewport for consistent Canvas size
    viewport: { width: 1280, height: 720 },
    
    // Slow down actions for visual debugging
    actionTimeout: process.env.PWDEBUG ? 0 : 5000,
    
    // Canvas testing options
    launchOptions: {
      args: [
        '--use-gl=swiftshader', // Consistent WebGL rendering
        '--disable-gpu-sandbox',
        '--disable-dev-shm-usage', // Prevent OOM on CI
        '--no-sandbox' // Required for some CI environments
      ]
    }
  },
  
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        // Enable touch events for testing
        hasTouch: false,
        isMobile: false
      }
    },
    {
      name: 'desktop-chrome-touch',
      use: {
        ...devices['Desktop Chrome'],
        hasTouch: true, // Enable touch simulation
        isMobile: false
      }
    },
    {
      name: 'mobile-ios',
      use: {
        ...devices['iPhone 13'],
        // Real mobile viewport
      }
    },
    {
      name: 'mobile-android',
      use: {
        ...devices['Pixel 5']
      }
    }
  ],
  
  // Output configuration
  reporter: [
    ['html', { open: 'never' }], // Don't open on headless server
    ['json', { outputFile: 'test-results/integration-results.json' }],
    ['junit', { outputFile: 'test-results/integration-junit.xml' }]
  ],
  
  // Global setup/teardown
  globalSetup: require.resolve('./test/integration/global-setup'),
  globalTeardown: require.resolve('./test/integration/global-teardown'),
  
  // Timeout configuration
  timeout: 30000, // 30s per test
  expect: {
    timeout: 5000 // 5s for assertions
  }
});
```

```typescript
// test/integration/global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Ensure Storybook is running
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(config.projects[0].use.baseURL!);
    await page.waitForSelector('#storybook-root', { timeout: 5000 });
    console.log('✓ Storybook is running');
  } catch (error) {
    console.error('✗ Storybook is not running at', config.projects[0].use.baseURL);
    console.error('  Run: npm run storybook');
    process.exit(1);
  } finally {
    await browser.close();
  }
  
  // Set up test data server if needed
  if (process.env.TEST_DATA_SERVER) {
    // Start test data server on port 9051
  }
}

export default globalSetup;
```

**Validation:**
- Configuration works with headless server
- All projects run successfully
- Artifacts are generated correctly
- WebGL rendering is consistent

**Anti-flakiness measures:**
- Sequential execution for Canvas
- SwiftShader for consistent rendering
- Fixed viewport sizes
- Proper resource cleanup

### Step 3.2: CDP Touch Gesture Helpers

**What happens:**
- Create helper functions for complex touch gestures
- Implement pinch, rotate, multi-touch pan
- Add gesture validation utilities
- Create reusable gesture patterns

**Implementation:**
```typescript
// test/integration/helpers/touch-gestures.ts
import { Page, CDPSession } from '@playwright/test';

export class TouchGestureHelper {
  private page: Page;
  private cdpSession: CDPSession | null = null;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  async initialize(): Promise<void> {
    this.cdpSession = await this.page.context().newCDPSession(this.page);
  }
  
  async dispose(): Promise<void> {
    if (this.cdpSession) {
      await this.cdpSession.detach();
      this.cdpSession = null;
    }
  }
  
  async tap(x: number, y: number): Promise<void> {
    if (!this.cdpSession) throw new Error('Not initialized');
    
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y }],
      modifiers: 0,
      timestamp: Date.now()
    });
    
    await this.page.waitForTimeout(50); // Tap duration
    
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
      modifiers: 0,
      timestamp: Date.now()
    });
  }
  
  async swipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 300
  ): Promise<void> {
    if (!this.cdpSession) throw new Error('Not initialized');
    
    const steps = Math.ceil(duration / 16); // 60fps
    
    // Start
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: startX, y: startY }],
      modifiers: 0,
      timestamp: Date.now()
    });
    
    // Move
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      await this.cdpSession.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x, y }],
        modifiers: 0,
        timestamp: Date.now()
      });
      
      await this.page.waitForTimeout(16);
    }
    
    // End
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
      modifiers: 0,
      timestamp: Date.now()
    });
  }
  
  async pinch(
    centerX: number,
    centerY: number,
    startDistance: number,
    endDistance: number,
    duration: number = 300
  ): Promise<void> {
    if (!this.cdpSession) throw new Error('Not initialized');
    
    const steps = Math.ceil(duration / 16);
    const startRadius = startDistance / 2;
    const endRadius = endDistance / 2;
    
    // Start two touches
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: centerX - startRadius, y: centerY },
        { x: centerX + startRadius, y: centerY }
      ],
      modifiers: 0,
      timestamp: Date.now()
    });
    
    // Animate pinch
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const radius = startRadius + (endRadius - startRadius) * progress;
      
      await this.cdpSession.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          { x: centerX - radius, y: centerY },
          { x: centerX + radius, y: centerY }
        ],
        modifiers: 0,
        timestamp: Date.now()
      });
      
      await this.page.waitForTimeout(16);
    }
    
    // End
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
      modifiers: 0,
      timestamp: Date.now()
    });
  }
  
  async rotate(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    duration: number = 300
  ): Promise<void> {
    if (!this.cdpSession) throw new Error('Not initialized');
    
    const steps = Math.ceil(duration / 16);
    
    // Calculate initial positions
    const touch1Start = {
      x: centerX + radius * Math.cos(startAngle),
      y: centerY + radius * Math.sin(startAngle)
    };
    const touch2Start = {
      x: centerX + radius * Math.cos(startAngle + Math.PI),
      y: centerY + radius * Math.sin(startAngle + Math.PI)
    };
    
    // Start
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [touch1Start, touch2Start],
      modifiers: 0,
      timestamp: Date.now()
    });
    
    // Rotate
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const angle = startAngle + (endAngle - startAngle) * progress;
      
      await this.cdpSession.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          },
          {
            x: centerX + radius * Math.cos(angle + Math.PI),
            y: centerY + radius * Math.sin(angle + Math.PI)
          }
        ],
        modifiers: 0,
        timestamp: Date.now()
      });
      
      await this.page.waitForTimeout(16);
    }
    
    // End
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
      modifiers: 0,
      timestamp: Date.now()
    });
  }
  
  async multiTouchPan(
    touches: Array<{ startX: number; startY: number; endX: number; endY: number }>,
    duration: number = 300
  ): Promise<void> {
    if (!this.cdpSession) throw new Error('Not initialized');
    
    const steps = Math.ceil(duration / 16);
    
    // Start all touches
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: touches.map((t, i) => ({ x: t.startX, y: t.startY })),
      modifiers: 0,
      timestamp: Date.now()
    });
    
    // Move all touches
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      
      await this.cdpSession.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: touches.map(t => ({
          x: t.startX + (t.endX - t.startX) * progress,
          y: t.startY + (t.endY - t.startY) * progress
        })),
        modifiers: 0,
        timestamp: Date.now()
      });
      
      await this.page.waitForTimeout(16);
    }
    
    // End
    await this.cdpSession.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
      modifiers: 0,
      timestamp: Date.now()
    });
  }
}

// Helper to wait for Canvas to be ready
export async function waitForCanvas(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    
    // Check if something is rendered
    const pixels = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels[3] > 0; // Alpha > 0 means something rendered
  }, { timeout: 5000 });
}

// Helper to get Canvas center
export async function getCanvasCenter(page: Page): Promise<{ x: number; y: number }> {
  return await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) throw new Error('Canvas not found');
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  });
}
```

**Validation:**
- All gestures produce expected touch events
- CDP session management is correct
- Timing matches real device behavior
- Helper functions are reusable

**Anti-flakiness measures:**
- Fixed frame timing (16ms)
- Proper CDP session lifecycle
- Canvas readiness checks
- Coordinate validation

### Step 3.3: Integration Test Implementation

**What happens:**
- Create real browser tests for all interactions
- Test visual feedback and animations
- Validate cross-browser behavior
- Test mobile device interactions

**Implementation:**
```typescript
// test/integration/node-interaction.spec.ts
import { test, expect } from '@playwright/test';
import { TouchGestureHelper, waitForCanvas, getCanvasCenter } from './helpers/touch-gestures';

test.describe('Node Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/interactions--draggable-nodes');
    await waitForCanvas(page);
  });
  
  test('drags node with mouse', async ({ page }) => {
    // Get initial node position
    const initialPos = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const node = element.graph.getNode('node1');
      return element.graph.worldToScreen(node.position);
    });
    
    // Drag node
    const canvas = page.locator('canvas');
    const bounds = await canvas.boundingBox();
    
    await page.mouse.move(bounds.x + initialPos.x, bounds.y + initialPos.y);
    await page.mouse.down();
    
    // Verify drag started
    await expect(page).toHaveScreenshot('node-drag-start.png', {
      clip: bounds,
      maxDiffPixels: 100
    });
    
    // Drag
    await page.mouse.move(
      bounds.x + initialPos.x + 100,
      bounds.y + initialPos.y + 50,
      { steps: 10 }
    );
    
    await page.mouse.up();
    
    // Verify node moved
    const finalPos = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const node = element.graph.getNode('node1');
      return node.position;
    });
    
    expect(finalPos.x).toBeGreaterThan(0);
    expect(finalPos.y).toBeGreaterThan(0);
    
    // Visual verification
    await expect(page).toHaveScreenshot('node-drag-end.png', {
      clip: bounds,
      maxDiffPixels: 100
    });
  });
  
  test('selects multiple nodes with ctrl+click', async ({ page, browserName }) => {
    // Skip on Safari (different modifier key)
    test.skip(browserName === 'webkit', 'Safari uses Cmd instead of Ctrl');
    
    const canvas = page.locator('canvas');
    const bounds = await canvas.boundingBox();
    
    // Get node positions
    const nodePositions = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      return ['node1', 'node2', 'node3'].map(id => {
        const node = element.graph.getNode(id);
        return {
          id,
          screen: element.graph.worldToScreen(node.position)
        };
      });
    });
    
    // Select nodes with Ctrl+Click
    for (const { screen } of nodePositions) {
      await page.keyboard.down('Control');
      await page.mouse.click(bounds.x + screen.x, bounds.y + screen.y);
      await page.keyboard.up('Control');
    }
    
    // Verify all selected
    const selectedCount = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      return element.graph.getSelectedNodes().length;
    });
    
    expect(selectedCount).toBe(3);
    
    // Visual verification
    await expect(page).toHaveScreenshot('multi-select.png', {
      clip: bounds,
      maxDiffPixels: 100
    });
  });
});

test.describe('Touch Interactions', () => {
  test.use({ hasTouch: true });
  
  let touchHelper: TouchGestureHelper;
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/interactions--touch-enabled');
    await waitForCanvas(page);
    
    touchHelper = new TouchGestureHelper(page);
    await touchHelper.initialize();
  });
  
  test.afterEach(async () => {
    await touchHelper.dispose();
  });
  
  test('pinch to zoom on mobile', async ({ page }) => {
    const center = await getCanvasCenter(page);
    
    // Get initial zoom
    const initialZoom = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const camera = element.graph.getCamera();
      return camera.orthoTop - camera.orthoBottom;
    });
    
    // Pinch out (zoom in)
    await touchHelper.pinch(center.x, center.y, 100, 200, 300);
    
    // Wait for animation
    await page.waitForTimeout(100);
    
    // Verify zoom changed
    const zoomedIn = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const camera = element.graph.getCamera();
      return camera.orthoTop - camera.orthoBottom;
    });
    
    expect(zoomedIn).toBeLessThan(initialZoom);
    
    // Pinch in (zoom out)
    await touchHelper.pinch(center.x, center.y, 200, 100, 300);
    await page.waitForTimeout(100);
    
    const zoomedOut = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const camera = element.graph.getCamera();
      return camera.orthoTop - camera.orthoBottom;
    });
    
    expect(zoomedOut).toBeGreaterThan(zoomedIn);
  });
  
  test('two-finger rotate in 3D', async ({ page }) => {
    await page.goto('/?path=/story/camera--3d-camera');
    await waitForCanvas(page);
    
    const center = await getCanvasCenter(page);
    
    // Get initial camera angle
    const initialAlpha = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const camera = element.graph.getCamera();
      return camera.alpha;
    });
    
    // Rotate gesture
    await touchHelper.rotate(
      center.x,
      center.y,
      100, // radius
      0, // start angle
      Math.PI / 2, // end angle (90 degrees)
      500 // duration
    );
    
    await page.waitForTimeout(100);
    
    // Verify rotation
    const finalAlpha = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const camera = element.graph.getCamera();
      return camera.alpha;
    });
    
    expect(Math.abs(finalAlpha - initialAlpha)).toBeGreaterThan(0.5);
  });
});

test.describe('Performance', () => {
  test('handles rapid interactions without lag', async ({ page }) => {
    await page.goto('/?path=/story/performance--large-graph');
    await waitForCanvas(page);
    
    const canvas = page.locator('canvas');
    const bounds = await canvas.boundingBox();
    const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    
    // Measure interaction performance
    const metrics = await page.evaluate(async () => {
      const element = document.querySelector('graphty-element') as any;
      const timings = [];
      
      // Hook into render loop
      let lastTime = performance.now();
      const originalRender = element.graph.render.bind(element.graph);
      element.graph.render = function() {
        const now = performance.now();
        timings.push(now - lastTime);
        lastTime = now;
        return originalRender();
      };
      
      return new Promise<{ avgFrameTime: number; maxFrameTime: number }>(resolve => {
        setTimeout(() => {
          const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
          const max = Math.max(...timings);
          resolve({ avgFrameTime: avg, maxFrameTime: max });
        }, 2000);
      });
    });
    
    // Perform rapid interactions while measuring
    const interactions = Promise.all([
      // Rapid panning
      (async () => {
        for (let i = 0; i < 10; i++) {
          await page.mouse.move(center.x, center.y);
          await page.mouse.down({ button: 'right' });
          await page.mouse.move(center.x + 50, center.y + 50, { steps: 5 });
          await page.mouse.up({ button: 'right' });
        }
      })(),
      
      // Rapid zooming
      (async () => {
        for (let i = 0; i < 20; i++) {
          await page.mouse.wheel({ deltaY: i % 2 === 0 ? -100 : 100 });
          await page.waitForTimeout(50);
        }
      })()
    ]);
    
    await interactions;
    const perf = await metrics;
    
    // Performance assertions
    expect(perf.avgFrameTime).toBeLessThan(33); // 30fps average
    expect(perf.maxFrameTime).toBeLessThan(100); // No major hitches
  });
});
```

**Validation:**
- Visual regression with screenshots
- Performance metrics collected
- Cross-browser differences handled
- Touch and mouse interactions verified

**Anti-flakiness measures:**
- Wait for Canvas readiness
- Allow time for animations
- Flexible screenshot comparison
- Skip incompatible browser tests

### Step 3.4: Cross-Browser Testing

**What happens:**
- Run tests on Chrome, Firefox, Safari, Edge
- Handle browser-specific differences
- Test on real mobile devices
- Document browser limitations

**Implementation:**
```typescript
// test/integration/cross-browser.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('WebGL features work across browsers', async ({ page, browserName }) => {
    await page.goto('/?path=/story/rendering--webgl-features');
    
    // Check WebGL support
    const webglInfo = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (!gl) return { supported: false };
      
      return {
        supported: true,
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
      };
    });
    
    expect(webglInfo.supported).toBe(true);
    
    // Browser-specific checks
    if (browserName === 'webkit') {
      // Safari-specific limitations
      test.info().annotations.push({
        type: 'browser-limit',
        description: 'Safari may have different WebGL extensions'
      });
    }
    
    // Test rendering
    await page.waitForTimeout(1000); // Let scene render
    
    const screenshot = await page.locator('canvas').screenshot();
    expect(screenshot).toMatchSnapshot(`webgl-${browserName}.png`, {
      maxDiffPixels: 100 // Allow some browser differences
    });
  });
  
  test('touch events work on mobile browsers', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile only test');
    
    await page.goto('/?path=/story/interactions--touch-enabled');
    
    // Test touch support detection
    const touchSupported = await page.evaluate(() => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });
    
    expect(touchSupported).toBe(true);
    
    // Test actual touch interaction
    const canvas = page.locator('canvas');
    const bounds = await canvas.boundingBox();
    
    // Tap
    await page.tap(`canvas`);
    
    // Swipe
    await page.locator('canvas').swipe({
      startPosition: { x: 100, y: 100 },
      endPosition: { x: 200, y: 200 },
      steps: 10
    });
    
    // Verify interactions registered
    const interactionCount = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      return element.graph.getInteractionCount();
    });
    
    expect(interactionCount).toBeGreaterThan(0);
  });
  
  test('keyboard shortcuts use correct modifiers', async ({ page, browserName, platform }) => {
    await page.goto('/?path=/story/interactions--keyboard-shortcuts');
    
    // Determine correct modifier key
    const modifierKey = platform === 'darwin' ? 'Meta' : 'Control';
    
    // Test select all
    await page.keyboard.press(`${modifierKey}+a`);
    
    const selectedCount = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      return element.graph.getSelectedNodes().length;
    });
    
    expect(selectedCount).toBeGreaterThan(0);
    
    // Document platform difference
    test.info().annotations.push({
      type: 'platform-specific',
      description: `Uses ${modifierKey} key on ${platform}`
    });
  });
});

// Browser-specific test suites
test.describe('Chrome-specific features', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only');
  
  test('uses Chrome DevTools Protocol for advanced touch', async ({ page }) => {
    const client = await page.context().newCDPSession(page);
    
    // Test CDP availability
    await client.send('Runtime.enable');
    const { result } = await client.send('Runtime.evaluate', {
      expression: 'navigator.userAgent'
    });
    
    expect(result.value).toContain('Chrome');
    
    // Advanced touch through CDP
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 100, y: 100 }]
    });
    
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
  });
});

test.describe('Safari-specific handling', () => {
  test.skip(({ browserName }) => browserName !== 'webkit', 'Safari only');
  
  test('handles Safari touch event differences', async ({ page }) => {
    await page.goto('/?path=/story/interactions--touch-enabled');
    
    // Safari may handle touch events differently
    const touchHandling = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      
      // Check for Safari-specific touch handling
      const touchEvents = [];
      const originalAddEventListener = element.addEventListener;
      element.addEventListener = function(type: string, ...args: any[]) {
        if (type.startsWith('touch')) {
          touchEvents.push(type);
        }
        return originalAddEventListener.call(this, type, ...args);
      };
      
      // Trigger re-attachment
      element.graph.reattachInputHandlers();
      
      return touchEvents;
    });
    
    // Safari should still register touch events
    expect(touchHandling).toContain('touchstart');
    expect(touchHandling).toContain('touchmove');
    expect(touchHandling).toContain('touchend');
  });
});
```

**Validation:**
- Each browser runs successfully
- Platform differences documented
- Feature detection works correctly
- Visual differences are acceptable

**Anti-flakiness measures:**
- Feature detection before testing
- Platform-specific test skipping
- Flexible image comparison
- Browser capability checks

### Step 3.5: Performance Benchmarking

**What happens:**
- Create performance benchmarks for interactions
- Measure frame rates during interactions
- Test with large graphs (1000+ nodes)
- Set performance regression thresholds

**Implementation:**
```typescript
// test/integration/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Interaction Performance', () => {
  test('maintains 30fps during node dragging', async ({ page }) => {
    await page.goto('/?path=/story/performance--thousand-nodes');
    await page.waitForLoadState('networkidle');
    
    // Set up performance monitoring
    await page.evaluate(() => {
      window.performanceMetrics = {
        frameTimes: [],
        interactionTimes: [],
        lastFrameTime: performance.now()
      };
      
      // Hook into render loop
      const element = document.querySelector('graphty-element') as any;
      const originalRender = element.graph.render.bind(element.graph);
      
      element.graph.render = function() {
        const now = performance.now();
        const frameTime = now - window.performanceMetrics.lastFrameTime;
        window.performanceMetrics.frameTimes.push(frameTime);
        window.performanceMetrics.lastFrameTime = now;
        return originalRender();
      };
    });
    
    // Find a node to drag
    const nodePos = await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      const node = element.graph.getNodes()[500]; // Middle node
      return element.graph.worldToScreen(node.position);
    });
    
    const canvas = page.locator('canvas');
    const bounds = await canvas.boundingBox();
    
    // Start measuring
    await page.evaluate(() => {
      window.performanceMetrics.frameTimes = [];
      window.performanceMetrics.interactionStart = performance.now();
    });
    
    // Perform drag
    await page.mouse.move(bounds.x + nodePos.x, bounds.y + nodePos.y);
    await page.mouse.down();
    
    // Smooth drag
    for (let i = 0; i < 50; i++) {
      await page.mouse.move(
        bounds.x + nodePos.x + i * 2,
        bounds.y + nodePos.y + i,
        { steps: 1 }
      );
      await page.waitForTimeout(16); // One frame
    }
    
    await page.mouse.up();
    
    // Stop measuring
    const metrics = await page.evaluate(() => {
      window.performanceMetrics.interactionEnd = performance.now();
      
      const frameTimes = window.performanceMetrics.frameTimes;
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);
      const totalTime = window.performanceMetrics.interactionEnd - window.performanceMetrics.interactionStart;
      
      // Calculate percentiles
      frameTimes.sort((a, b) => a - b);
      const p95 = frameTimes[Math.floor(frameTimes.length * 0.95)];
      const p99 = frameTimes[Math.floor(frameTimes.length * 0.99)];
      
      return {
        avgFrameTime,
        maxFrameTime,
        p95FrameTime: p95,
        p99FrameTime: p99,
        totalTime,
        frameCount: frameTimes.length,
        fps: 1000 / avgFrameTime
      };
    });
    
    // Performance assertions
    expect(metrics.fps).toBeGreaterThan(30); // Average 30fps
    expect(metrics.p95FrameTime).toBeLessThan(50); // 95% under 50ms
    expect(metrics.maxFrameTime).toBeLessThan(100); // No major hitches
    
    // Log performance for tracking
    test.info().annotations.push({
      type: 'performance',
      description: JSON.stringify(metrics, null, 2)
    });
  });
  
  test('pinch zoom performs well with complex scene', async ({ page }) => {
    test.skip(!page.context()._browser._options.channel?.includes('chrome'), 'CDP required');
    
    await page.goto('/?path=/story/performance--complex-scene');
    await page.waitForLoadState('networkidle');
    
    const touchHelper = new TouchGestureHelper(page);
    await touchHelper.initialize();
    
    // Monitor performance
    await page.evaluate(() => {
      window.zoomMetrics = {
        startTime: 0,
        endTime: 0,
        frameCount: 0
      };
      
      const element = document.querySelector('graphty-element') as any;
      const originalRender = element.graph.render.bind(element.graph);
      
      element.graph.render = function() {
        if (window.zoomMetrics.startTime && !window.zoomMetrics.endTime) {
          window.zoomMetrics.frameCount++;
        }
        return originalRender();
      };
    });
    
    const center = await getCanvasCenter(page);
    
    // Start monitoring
    await page.evaluate(() => {
      window.zoomMetrics.startTime = performance.now();
    });
    
    // Perform pinch zoom
    await touchHelper.pinch(center.x, center.y, 200, 400, 1000); // 1 second
    
    // Stop monitoring
    const metrics = await page.evaluate(() => {
      window.zoomMetrics.endTime = performance.now();
      const duration = window.zoomMetrics.endTime - window.zoomMetrics.startTime;
      return {
        duration,
        frameCount: window.zoomMetrics.frameCount,
        fps: (window.zoomMetrics.frameCount / duration) * 1000
      };
    });
    
    expect(metrics.fps).toBeGreaterThan(30);
    
    await touchHelper.dispose();
  });
  
  test('measures input latency', async ({ page }) => {
    await page.goto('/?path=/story/performance--input-latency');
    
    // Set up latency measurement
    await page.evaluate(() => {
      window.latencyMeasurements = [];
      
      const element = document.querySelector('graphty-element') as any;
      
      // Override input handler to measure latency
      const originalPointerDown = element.graph.handlePointerDown;
      element.graph.handlePointerDown = function(info: any) {
        const startTime = performance.now();
        const result = originalPointerDown.call(this, info);
        const endTime = performance.now();
        
        window.latencyMeasurements.push({
          type: 'pointerDown',
          latency: endTime - startTime
        });
        
        return result;
      };
    });
    
    // Perform multiple interactions
    const canvas = page.locator('canvas');
    
    for (let i = 0; i < 20; i++) {
      await canvas.click({ position: { x: 100 + i * 10, y: 100 + i * 10 } });
      await page.waitForTimeout(50);
    }
    
    // Get latency metrics
    const latencies = await page.evaluate(() => window.latencyMeasurements);
    
    const avgLatency = latencies.reduce((sum, m) => sum + m.latency, 0) / latencies.length;
    const maxLatency = Math.max(...latencies.map(m => m.latency));
    
    expect(avgLatency).toBeLessThan(16); // Less than one frame
    expect(maxLatency).toBeLessThan(33); // Less than two frames
    
    test.info().annotations.push({
      type: 'latency',
      description: `Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms`
    });
  });
});

// Dedicated performance regression suite
test.describe('Performance Regression', () => {
  // Run against baseline
  const BASELINE_METRICS = {
    dragFps: 35,
    zoomFps: 40,
    panFps: 45,
    renderTime: 10
  };
  
  test('prevents performance regressions', async ({ page }) => {
    await page.goto('/?path=/story/performance--benchmark-scene');
    
    const results = await page.evaluate(async () => {
      const element = document.querySelector('graphty-element') as any;
      const graph = element.graph;
      
      // Benchmark different operations
      const benchmarks = {
        drag: async () => {
          // Simulate drag
          for (let i = 0; i < 60; i++) {
            graph.handlePointerMove({ x: i, y: i });
            await new Promise(r => requestAnimationFrame(r));
          }
        },
        zoom: async () => {
          // Simulate zoom
          for (let i = 0; i < 60; i++) {
            graph.handleWheel({ deltaY: -10 });
            await new Promise(r => requestAnimationFrame(r));
          }
        },
        pan: async () => {
          // Simulate pan
          for (let i = 0; i < 60; i++) {
            graph.camera.position.x += 1;
            await new Promise(r => requestAnimationFrame(r));
          }
        }
      };
      
      const results: any = {};
      
      for (const [name, benchmark] of Object.entries(benchmarks)) {
        const startTime = performance.now();
        await benchmark();
        const duration = performance.now() - startTime;
        results[name + 'Fps'] = (60 / duration) * 1000;
      }
      
      // Measure render time
      const renderTimes = [];
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        graph.render();
        renderTimes.push(performance.now() - start);
      }
      
      results.renderTime = renderTimes.reduce((a, b) => a + b) / renderTimes.length;
      
      return results;
    });
    
    // Compare against baseline
    expect(results.dragFps).toBeGreaterThan(BASELINE_METRICS.dragFps * 0.9);
    expect(results.zoomFps).toBeGreaterThan(BASELINE_METRICS.zoomFps * 0.9);
    expect(results.panFps).toBeGreaterThan(BASELINE_METRICS.panFps * 0.9);
    expect(results.renderTime).toBeLessThan(BASELINE_METRICS.renderTime * 1.1);
    
    // Save results for future comparison
    test.info().attachments.push({
      name: 'performance-metrics.json',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(results, null, 2))
    });
  });
});
```

**Validation:**
- FPS metrics are accurate
- Latency measurements are precise
- Regression thresholds are reasonable
- Results are saved for tracking

**Anti-flakiness measures:**
- Multiple measurement samples
- Statistical percentiles used
- Warm-up period before measuring
- Consistent test scenarios

## Phase 4: Advanced Features (Week 5+)

### Step 4.1: Selection System Tests

**What happens:**
- Test click to select node/edge
- Test box selection (drag to select)
- Test multi-select with modifiers
- Test selection state management

**Implementation will follow same pattern:**
- Unit tests with mock input system
- Integration tests with real browser
- Visual verification
- Performance validation

### Step 4.2: Hover and Tooltip Tests

**What happens:**
- Test hover state changes
- Test tooltip display timing
- Test hover performance with many elements
- Test touch-based hover alternatives

### Step 4.3: Context Menu Tests

**What happens:**
- Test right-click context menus
- Test long-press for touch devices
- Test menu positioning
- Test keyboard navigation in menus

### Step 4.4: Future-Proofing

**What happens:**
- Add WebXR input simulation stubs
- Create expandable test architecture
- Document extension points
- Prepare for new interaction types

## Validation Strategy

### Unit Test Validation
1. **Deterministic Behavior**: All tests produce same results every run
2. **Fast Execution**: Total suite runs in < 5 seconds
3. **Complete Coverage**: All interaction code paths tested
4. **Clear Failures**: Error messages pinpoint exact issues

### Integration Test Validation
1. **Visual Correctness**: Screenshots match expected results
2. **Cross-Browser**: Tests pass on all target browsers
3. **Performance**: No regression from baselines
4. **Real-World**: Tests reflect actual user interactions

### Anti-Flakiness Checklist
- [ ] No time-dependent assertions
- [ ] Proper wait strategies for animations
- [ ] Resource cleanup after each test
- [ ] Isolated test environments
- [ ] Deterministic initial states
- [ ] Flexible comparison thresholds
- [ ] Retry logic for network operations
- [ ] Clear error messages for debugging

## Success Criteria

1. **Test Suite Performance**
   - Unit tests: < 5 seconds total
   - Integration tests: < 30 seconds total
   - No flaky tests in CI

2. **Coverage Metrics**
   - Line coverage: > 80%
   - Branch coverage: > 75%
   - All user interactions tested

3. **Browser Support**
   - Chrome: 100% pass
   - Firefox: 100% pass
   - Safari: 95% pass (documented exceptions)
   - Edge: 100% pass

4. **Maintenance**
   - New tests easy to add
   - Clear patterns established
   - Well-documented helpers
   - Debugging tools available

## Conclusion

This implementation plan provides a complete roadmap for adding comprehensive interaction testing to graphty-element. The two-tier approach ensures both fast development cycles with unit tests and real-world validation with integration tests. Each step builds on the previous one, creating a robust and maintainable test suite that will catch regressions and ensure quality as the project evolves.