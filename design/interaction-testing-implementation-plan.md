# Interaction Testing Implementation Plan

## Overview

This document provides a detailed implementation plan for testing the actual input handling features in graphty-element. Based on code analysis, we will test the following implemented features:

1. **Node behaviors** - SixDofDragBehavior and double-click expansion
2. **2D camera controls** - Mouse pan/zoom, keyboard WASD/QE/+-, touch gestures  
3. **3D camera controls** - Mouse orbit, keyboard arrows/WASD, touch pinch/rotate
4. **Input system architecture** - BabylonInputSystem and MockDeviceInputSystem

## Phase 1: Fix Existing Test Infrastructure

### Step 1.1: Remove Non-Existent Feature Tests

**What to remove:**
- Tests for `graph.getCamera()`, `graph.updateConfig()`, `graph.getNode()` methods that don't exist
- Tests for keyboard shortcuts not implemented (Delete, Ctrl+A, Escape, Space, Tab)
- Tests for features like selection, pinning, drag constraints that aren't implemented

**Files to update:**
```bash
# Remove these test files that test non-existent features
rm test/browser/interactions/node-drag.test.ts
rm test/browser/interactions/camera-controls.test.ts  
rm test/browser/interactions/touch-gestures.test.ts
rm test/browser/interactions/keyboard-navigation.test.ts
```

### Step 1.2: Update Graph Test Helpers

**Update `src/Graph.ts` helper methods:**
```typescript
// Remove these temporary methods added for non-existent features
// - getCamera()
// - updateConfig() 
// - getNode()
// - addData()
// - initWithConfig()
// - setCameraTarget()

// Keep only methods that exist or add minimal helpers:
getCameraController(): TwoDCameraController | OrbitCameraController {
  return this.cameraManager.activeController;
}

getNodeMesh(nodeId: string): AbstractMesh | null {
  const node = this.dataManager.nodes.get(nodeId);
  return node?.mesh || null;
}
```

## Phase 2: Create Input Manager

### Step 2.1: Create Input System Directory Structure

**Create directory structure:**
```bash
mkdir -p src/input
mv src/graph/input/input-system.interface.ts src/input/
mv src/graph/input/babylon-input-system.ts src/input/
mv src/test/mock-device-input-system.ts src/input/
```

### Step 2.2: Create InputManager

**File:** `src/managers/InputManager.ts`

```typescript
import {Vector2} from "@babylonjs/core/Maths/math.vector";
import {Observable} from "@babylonjs/core/Misc/observable";

import {BabylonInputSystem} from "../input/babylon-input-system";
import {MockDeviceInputSystem} from "../input/mock-device-input-system";
import {
    DeviceType,
    KeyboardInfo,
    MouseButton,
    PointerInfo,
    TouchPoint,
    WheelInfo,
} from "../input/input-system.interface";
import type {EventManager} from "./EventManager";
import type {Manager, ManagerContext} from "./interfaces";

/**
 * Configuration options for InputManager
 */
export interface InputManagerConfig {
    /**
     * Whether to use mock input system for testing
     */
    useMockInput?: boolean;

    /**
     * Whether touch input is enabled
     */
    touchEnabled?: boolean;

    /**
     * Whether keyboard input is enabled
     */
    keyboardEnabled?: boolean;

    /**
     * Whether pointer lock is enabled for FPS-style controls
     */
    pointerLockEnabled?: boolean;

    /**
     * Input recording/playback for automation
     */
    recordInput?: boolean;
    playbackFile?: string;
}

/**
 * Manages all user input for the graph
 * Provides a unified interface for mouse, keyboard, and touch input
 */
export class InputManager implements Manager {
    // Observable events (exposed for backward compatibility)
    public readonly onPointerMove: Observable<PointerInfo>;
    public readonly onPointerDown: Observable<PointerInfo>;
    public readonly onPointerUp: Observable<PointerInfo>;
    public readonly onWheel: Observable<WheelInfo>;
    public readonly onTouchStart: Observable<TouchPoint[]>;
    public readonly onTouchMove: Observable<TouchPoint[]>;
    public readonly onTouchEnd: Observable<number[]>;
    public readonly onKeyDown: Observable<KeyboardInfo>;
    public readonly onKeyUp: Observable<KeyboardInfo>;

    private inputSystem: BabylonInputSystem | MockDeviceInputSystem;
    private enabled = true;
    private recordedEvents: Array<{timestamp: number; type: string; data: any}> = [];
    private playbackIndex = 0;
    private playbackStartTime = 0;

    constructor(
        private context: ManagerContext,
        private config: InputManagerConfig = {},
    ) {
        // Create appropriate input system based on config
        this.inputSystem = this.config.useMockInput
            ? new MockDeviceInputSystem()
            : new BabylonInputSystem(this.context.scene);

        // Expose observables from the input system
        this.onPointerMove = this.inputSystem.onPointerMove;
        this.onPointerDown = this.inputSystem.onPointerDown;
        this.onPointerUp = this.inputSystem.onPointerUp;
        this.onWheel = this.inputSystem.onWheel;
        this.onTouchStart = this.inputSystem.onTouchStart;
        this.onTouchMove = this.inputSystem.onTouchMove;
        this.onTouchEnd = this.inputSystem.onTouchEnd;
        this.onKeyDown = this.inputSystem.onKeyDown;
        this.onKeyUp = this.inputSystem.onKeyUp;
    }

    async init(): Promise<void> {
        try {
            // Attach input system to canvas
            this.inputSystem.attach(this.context.canvas);

            // Set up event bridges to EventManager
            this.setupEventBridges();

            // Load playback file if specified
            if (this.config.playbackFile) {
                await this.loadPlaybackFile(this.config.playbackFile);
            }

            // Emit initialization event
            this.context.eventManager.emitGraphEvent("input-initialized", {
                inputManager: this,
                config: this.config,
            });
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.context.eventManager.emitGraphError(
                null,
                err,
                "init",
                {component: "InputManager"},
            );
            throw new Error(`Failed to initialize InputManager: ${err.message}`);
        }
    }

    dispose(): void {
        // Save recorded events if recording
        if (this.config.recordInput && this.recordedEvents.length > 0) {
            this.saveRecordedEvents();
        }

        // Dispose input system
        this.inputSystem.dispose();

        // Clear references
        this.recordedEvents = [];
    }

    /**
     * Enable or disable all input
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        
        if (!enabled && this.inputSystem instanceof BabylonInputSystem) {
            // Clear any active states when disabling
            this.inputSystem.detach();
        } else if (enabled && this.inputSystem instanceof BabylonInputSystem) {
            this.inputSystem.attach(this.context.canvas);
        }

        this.context.eventManager.emitGraphEvent("input-enabled-changed", {enabled});
    }

    /**
     * Get the current pointer position
     */
    getPointerPosition(): Vector2 {
        return this.inputSystem.getPointerPosition();
    }

    /**
     * Check if a pointer button is currently down
     */
    isPointerDown(button?: MouseButton): boolean {
        return this.inputSystem.isPointerDown(button);
    }

    /**
     * Get all active touch points
     */
    getActiveTouches(): TouchPoint[] {
        return this.inputSystem.getActiveTouches();
    }

    /**
     * Get the mock input system for testing
     * @throws Error if not using mock input
     */
    getMockInputSystem(): MockDeviceInputSystem {
        if (!(this.inputSystem instanceof MockDeviceInputSystem)) {
            throw new Error("Not using mock input system");
        }
        return this.inputSystem;
    }

    /**
     * Start recording input events
     */
    startRecording(): void {
        this.config.recordInput = true;
        this.recordedEvents = [];
        this.context.eventManager.emitGraphEvent("input-recording-started", {});
    }

    /**
     * Stop recording input events
     */
    stopRecording(): Array<{timestamp: number; type: string; data: any}> {
        this.config.recordInput = false;
        this.context.eventManager.emitGraphEvent("input-recording-stopped", {
            eventCount: this.recordedEvents.length,
        });
        return [...this.recordedEvents];
    }

    /**
     * Start playback of recorded events
     */
    async startPlayback(events?: Array<{timestamp: number; type: string; data: any}>): Promise<void> {
        if (events) {
            this.recordedEvents = events;
        }

        if (this.recordedEvents.length === 0) {
            throw new Error("No events to playback");
        }

        // Switch to mock input for playback
        if (!(this.inputSystem instanceof MockDeviceInputSystem)) {
            this.inputSystem.dispose();
            this.inputSystem = new MockDeviceInputSystem();
            this.inputSystem.attach(this.context.canvas);
            this.setupEventBridges();
        }

        this.playbackIndex = 0;
        this.playbackStartTime = Date.now();

        // Start playback loop
        this.runPlayback();
    }

    /**
     * Set up bridges between input system and event manager
     */
    private setupEventBridges(): void {
        // Only bridge events if enabled
        const createBridge = <T>(
            observable: Observable<T>,
            eventName: string,
            shouldRecord = true,
        ) => {
            observable.add((data) => {
                if (!this.enabled) return;

                // Record event if recording
                if (this.config.recordInput && shouldRecord) {
                    this.recordedEvents.push({
                        timestamp: Date.now(),
                        type: eventName,
                        data: this.serializeEventData(data),
                    });
                }

                // Emit through event manager
                this.context.eventManager.emitGraphEvent(eventName, data);
            });
        };

        // Bridge all input events
        createBridge(this.onPointerMove, "input:pointer-move");
        createBridge(this.onPointerDown, "input:pointer-down");
        createBridge(this.onPointerUp, "input:pointer-up");
        createBridge(this.onWheel, "input:wheel");
        createBridge(this.onTouchStart, "input:touch-start");
        createBridge(this.onTouchMove, "input:touch-move");
        createBridge(this.onTouchEnd, "input:touch-end");
        createBridge(this.onKeyDown, "input:key-down");
        createBridge(this.onKeyUp, "input:key-up");

        // Special handling for keyboard shortcuts
        this.onKeyDown.add((info) => {
            if (!this.enabled) return;

            // Emit specific shortcut events
            if (info.ctrlKey && info.key === "z") {
                this.context.eventManager.emitGraphEvent("input:undo", {});
            } else if (info.ctrlKey && info.key === "y") {
                this.context.eventManager.emitGraphEvent("input:redo", {});
            } else if (info.ctrlKey && info.key === "a") {
                this.context.eventManager.emitGraphEvent("input:select-all", {});
            }
            // Add more shortcuts as needed
        });
    }

    /**
     * Serialize event data for recording
     */
    private serializeEventData(data: any): any {
        // Handle Vector2 objects
        if (data && typeof data.x === "number" && typeof data.y === "number") {
            return {x: data.x, y: data.y};
        }
        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(item => this.serializeEventData(item));
        }
        // Handle objects
        if (data && typeof data === "object") {
            const serialized: any = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    serialized[key] = this.serializeEventData(data[key]);
                }
            }
            return serialized;
        }
        // Primitives
        return data;
    }

    /**
     * Run playback of recorded events
     */
    private async runPlayback(): Promise<void> {
        const mockSystem = this.inputSystem as MockDeviceInputSystem;

        while (this.playbackIndex < this.recordedEvents.length) {
            const event = this.recordedEvents[this.playbackIndex];
            const elapsed = Date.now() - this.playbackStartTime;
            const eventTime = event.timestamp - this.recordedEvents[0].timestamp;

            // Wait until it's time for this event
            if (elapsed < eventTime) {
                await new Promise(resolve => setTimeout(resolve, eventTime - elapsed));
            }

            // Replay the event
            switch (event.type) {
                case "input:pointer-move":
                    mockSystem.simulateMouseMove(event.data.x, event.data.y);
                    break;
                case "input:pointer-down":
                    mockSystem.simulateMouseDown(event.data.button);
                    break;
                case "input:pointer-up":
                    mockSystem.simulateMouseUp(event.data.button);
                    break;
                case "input:wheel":
                    mockSystem.simulateWheel(event.data.deltaY, event.data.deltaX);
                    break;
                case "input:touch-start":
                    mockSystem.simulateTouchStart(event.data);
                    break;
                case "input:touch-move":
                    mockSystem.simulateTouchMove(event.data);
                    break;
                case "input:touch-end":
                    mockSystem.simulateTouchEnd(event.data);
                    break;
                case "input:key-down":
                    mockSystem.simulateKeyDown(event.data.key, event.data);
                    break;
                case "input:key-up":
                    mockSystem.simulateKeyUp(event.data.key);
                    break;
            }

            this.playbackIndex++;
        }

        this.context.eventManager.emitGraphEvent("input-playback-completed", {});
    }

    /**
     * Load playback file
     */
    private async loadPlaybackFile(filename: string): Promise<void> {
        try {
            const response = await fetch(filename);
            const data = await response.json();
            this.recordedEvents = data.events || [];
        } catch (error) {
            console.warn(`Failed to load playback file: ${filename}`, error);
        }
    }

    /**
     * Save recorded events (implementation depends on environment)
     */
    private saveRecordedEvents(): void {
        const data = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            events: this.recordedEvents,
        };

        // In browser, download as file
        if (typeof window !== "undefined" && window.document) {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `input-recording-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<InputManagerConfig>): void {
        Object.assign(this.config, config);

        // Handle specific config changes
        if ("touchEnabled" in config || "keyboardEnabled" in config) {
            // These would affect input system behavior
            this.context.eventManager.emitGraphEvent("input-config-updated", config);
        }
    }

    /**
     * Enable pointer lock for FPS-style controls
     */
    async requestPointerLock(): Promise<void> {
        if (this.config.pointerLockEnabled) {
            try {
                await this.context.canvas.requestPointerLock();
                this.context.eventManager.emitGraphEvent("input-pointer-lock-changed", {
                    locked: true,
                });
            } catch (error) {
                console.warn("Failed to request pointer lock:", error);
            }
        }
    }

    /**
     * Exit pointer lock
     */
    exitPointerLock(): void {
        if (document.pointerLockElement === this.context.canvas) {
            document.exitPointerLock();
            this.context.eventManager.emitGraphEvent("input-pointer-lock-changed", {
                locked: false,
            });
        }
    }
}
```

### Step 2.3: Update Manager Exports

**Update `src/managers/index.ts`:**
```typescript
export * from "./AlgorithmManager";
export * from "./DataManager";
export * from "./EventManager";
export * from "./GraphContext";
export * from "./InputManager";  // Add this line
export * from "./LayoutManager";
export * from "./LifecycleManager";
export * from "./RenderManager";
export * from "./StatsManager";
export * from "./StyleManager";
export * from "./UpdateManager";
export * from "./interfaces";
```

### Step 2.4: Remove IInputSystem Interface

With the InputManager in place, we no longer need the IInputSystem interface. The InputManager provides all the necessary abstraction:

**File to remove:** `src/input/input-system.interface.ts` (keep only the event data types)

**New file:** `src/input/types.ts`
```typescript
import {Vector2} from "@babylonjs/core/Maths/math.vector";

export enum DeviceType {
    Mouse = 0,
    Touch = 1,
    Keyboard = 2,
}

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
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
```

### Step 2.5: Update Graph.ts Integration

**Update `src/Graph.ts`:**
```typescript
import {InputManager, InputManagerConfig} from "./managers/InputManager";

export class Graph {
    private inputManager: InputManager;

    constructor(config: GraphConfig) {
        // ... existing code ...

        // Create input manager
        const inputConfig: InputManagerConfig = {
            useMockInput: config.useMockInput ?? false,
            touchEnabled: config.touchEnabled ?? true,
            keyboardEnabled: config.keyboardEnabled ?? true,
            pointerLockEnabled: config.pointerLockEnabled ?? false,
            recordInput: config.recordInput ?? false,
            playbackFile: config.playbackFile,
        };

        this.inputManager = new InputManager(
            {
                scene: this.scene,
                engine: this.engine,
                canvas: this.canvas,
                eventManager: this.eventManager,
            },
            inputConfig
        );

        // Add to lifecycle manager
        this.lifecycleManager.registerManager("input", this.inputManager);
    }

    /**
     * Get the input manager
     */
    get input(): InputManager {
        return this.inputManager;
    }

    /**
     * Enable or disable input
     */
    setInputEnabled(enabled: boolean): void {
        this.inputManager.setEnabled(enabled);
    }

    /**
     * Start recording input for testing/automation
     */
    startInputRecording(): void {
        this.inputManager.startRecording();
    }

    /**
     * Stop recording and get recorded events
     */
    stopInputRecording(): Array<{timestamp: number; type: string; data: any}> {
        return this.inputManager.stopRecording();
    }
}
```

## Phase 3: Unit Tests for Real Features

### Step 3.1: Node Behavior Tests

**File:** `test/unit/node-behavior.test.ts`

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { Scene, Engine, NullEngine } from '@babylonjs/core';
import { Node } from '../../src/Node';
import { NodeBehavior } from '../../src/NodeBehavior';

describe('Node Behavior', () => {
  let scene: Scene;
  let engine: Engine;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
  });

  test('drag behavior with pinOnDrag enabled', () => {
    const node = new Node(mockGraph, 'test-node', 1, {});
    NodeBehavior.addDefaultBehaviors(node, { pinOnDrag: true });
    
    expect(node.meshDragBehavior).toBeDefined();
    expect(node.pinOnDrag).toBe(true);
    
    // Simulate drag start
    node.meshDragBehavior.onDragStartObservable.notifyObservers({});
    expect(node.dragging).toBe(true);
    
    // Simulate drag end
    node.meshDragBehavior.onDragEndObservable.notifyObservers({});
    expect(node.dragging).toBe(false);
    
    // Node should call pin() method
    expect(node.pin).toHaveBeenCalled();
  });

  test('double-click expansion triggers fetch', () => {
    const fetchNodes = jest.fn().mockReturnValue([]);
    const fetchEdges = jest.fn().mockReturnValue([]);
    const mockGraph = { fetchNodes, fetchEdges, ...mockGraphContext };
    
    const node = new Node(mockGraph, 'test-node', 1, {});
    NodeBehavior.addDefaultBehaviors(node);
    
    // Trigger double-click action
    const action = node.mesh.actionManager.actions.find(
      a => a.trigger === ActionManager.OnDoublePickTrigger
    );
    action._action();
    
    expect(fetchEdges).toHaveBeenCalledWith(node, mockGraph);
    expect(fetchNodes).toHaveBeenCalled();
  });
});
```

### Step 2.2: 2D Camera Controller Tests

**File:** `test/unit/2d-camera-controls.test.ts`

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { Scene, Engine, NullEngine } from '@babylonjs/core';
import { TwoDCameraController } from '../../src/cameras/TwoDCameraController';
import { TwoDInputController } from '../../src/cameras/TwoDInputController';

describe('2D Camera Controls', () => {
  let scene: Scene;
  let canvas: HTMLCanvasElement;
  let controller: TwoDCameraController;
  let inputController: TwoDInputController;

  beforeEach(() => {
    const engine = new NullEngine();
    scene = new Scene(engine);
    canvas = document.createElement('canvas');
    
    controller = new TwoDCameraController(scene, canvas, {
      panSpeed: 1,
      zoomSpeed: 0.1,
      mousePanScale: 1,
      mouseWheelZoomSpeed: 1.1
    });
    
    inputController = controller.inputController;
  });

  test('mouse pan updates camera position', () => {
    const initialPos = { ...controller.camera.position };
    
    // Simulate mouse pan via scene observables
    scene.onPointerObservable.notifyObservers({
      type: PointerEventTypes.POINTERDOWN,
      event: { clientX: 100, clientY: 100, buttons: 1 }
    });
    
    scene.onPointerObservable.notifyObservers({
      type: PointerEventTypes.POINTERMOVE,  
      event: { clientX: 200, clientY: 150, buttons: 1 }
    });
    
    scene.onPointerObservable.notifyObservers({
      type: PointerEventTypes.POINTERUP,
      event: {}
    });
    
    expect(controller.camera.position.x).not.toBe(initialPos.x);
    expect(controller.camera.position.y).not.toBe(initialPos.y);
  });

  test('keyboard WASD controls velocity', () => {
    // Simulate W key press
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    inputController.applyKeyboardInertia();
    
    expect(controller.velocity.y).toBeGreaterThan(0);
    
    // Simulate S key press
    canvas.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }));
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
    inputController.applyKeyboardInertia();
    
    expect(controller.velocity.y).toBeLessThan(0);
  });

  test('mouse wheel zooms camera', () => {
    const initialZoom = controller.camera.orthoTop - controller.camera.orthoBottom;
    
    // Simulate wheel event
    scene.onPrePointerObservable.notifyObservers({
      type: PointerEventTypes.POINTERWHEEL,
      event: { deltaY: -100, preventDefault: () => {} }
    });
    
    const newZoom = controller.camera.orthoTop - controller.camera.orthoBottom;
    expect(newZoom).toBeLessThan(initialZoom); // Zoomed in
  });

  test('Q/E keys rotate camera', () => {
    const initialRotation = controller.parent.rotation.z;
    
    // Simulate Q key
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }));
    inputController.applyKeyboardInertia();
    controller.applyInertia();
    
    expect(controller.velocity.rotate).toBeGreaterThan(0);
  });
});
```

### Step 2.3: 3D Camera Controller Tests

**File:** `test/unit/3d-camera-controls.test.ts`

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { Scene, Engine, NullEngine } from '@babylonjs/core';
import { OrbitCameraController } from '../../src/cameras/OrbitCameraController';
import { OrbitInputController } from '../../src/cameras/OrbitInputController';

describe('3D Camera Controls', () => {
  let scene: Scene;
  let canvas: HTMLCanvasElement;
  let controller: OrbitCameraController;
  let inputController: OrbitInputController;

  beforeEach(() => {
    const engine = new NullEngine();
    scene = new Scene(engine);
    canvas = document.createElement('canvas');
    
    controller = new OrbitCameraController(scene, canvas, {
      trackballRotationSpeed: 1,
      keyboardRotationSpeed: 0.1,
      keyboardZoomSpeed: 0.1,
      inertiaDamping: 0.9
    });
    
    inputController = controller.inputController;
    inputController.enable();
  });

  test('mouse drag orbits camera', () => {
    const initialAlpha = controller.camera.alpha;
    const initialBeta = controller.camera.beta;
    
    // Simulate mouse orbit
    canvas.dispatchEvent(new PointerEvent('pointerdown', {
      clientX: 100, clientY: 100, button: 0
    }));
    
    canvas.dispatchEvent(new PointerEvent('pointermove', {
      clientX: 200, clientY: 150
    }));
    
    canvas.dispatchEvent(new PointerEvent('pointerup'));
    
    controller.rotate(100, 50); // Apply the rotation
    
    expect(controller.camera.alpha).not.toBe(initialAlpha);
    expect(controller.camera.beta).not.toBe(initialBeta);
  });

  test('arrow keys rotate with velocity', () => {
    // Simulate arrow key press
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    
    inputController.update();
    
    // Check rotation velocity was applied
    expect(inputController.rotationVelocityY).toBeGreaterThan(0);
  });

  test('W/S keys zoom camera', () => {
    const initialRadius = controller.camera.radius;
    
    // Simulate W key (zoom in)
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
    inputController.update();
    
    expect(controller.camera.radius).toBeLessThan(initialRadius);
  });
});
```

### Step 3.4: Input Manager Tests

**File:** `test/unit/input-manager.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Scene, Engine, NullEngine } from '@babylonjs/core';
import { EventManager } from '../../src/managers/EventManager';
import { InputManager, InputManagerConfig } from '../../src/managers/InputManager';
import { MouseButton, DeviceType } from '../../src/input/types';

describe('InputManager', () => {
  let scene: Scene;
  let engine: Engine;
  let canvas: HTMLCanvasElement;
  let eventManager: EventManager;
  let inputManager: InputManager;

  beforeEach(() => {
    engine = new NullEngine();
    scene = new Scene(engine);
    canvas = document.createElement('canvas');
    eventManager = new EventManager();
    
    const context = { scene, engine, canvas, eventManager };
    inputManager = new InputManager(context, { useMockInput: true });
  });

  afterEach(() => {
    inputManager.dispose();
  });

  test('initializes with mock input system', async () => {
    await inputManager.init();
    
    const mockSystem = inputManager.getMockInputSystem();
    expect(mockSystem).toBeDefined();
  });

  test('bridges input events to event manager', async () => {
    await inputManager.init();
    
    const eventSpy = vi.fn();
    eventManager.onGraphEvent.add((event) => {
      if (event.type === 'input:pointer-move') {
        eventSpy(event.data);
      }
    });
    
    const mockSystem = inputManager.getMockInputSystem();
    mockSystem.simulateMouseMove(100, 200);
    
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        x: 100,
        y: 200,
        deviceType: DeviceType.Mouse
      })
    );
  });

  test('can enable/disable input', async () => {
    await inputManager.init();
    
    let eventReceived = false;
    eventManager.onGraphEvent.add((event) => {
      if (event.type === 'input:pointer-move') {
        eventReceived = true;
      }
    });
    
    // Disable input
    inputManager.setEnabled(false);
    
    const mockSystem = inputManager.getMockInputSystem();
    mockSystem.simulateMouseMove(100, 200);
    
    expect(eventReceived).toBe(false);
    
    // Re-enable input
    inputManager.setEnabled(true);
    mockSystem.simulateMouseMove(200, 300);
    
    expect(eventReceived).toBe(true);
  });

  test('records and plays back input events', async () => {
    await inputManager.init();
    
    // Start recording
    inputManager.startRecording();
    
    const mockSystem = inputManager.getMockInputSystem();
    mockSystem.simulateMouseMove(100, 200);
    mockSystem.simulateMouseDown(MouseButton.Left);
    mockSystem.simulateMouseUp(MouseButton.Left);
    
    // Stop recording
    const recordedEvents = inputManager.stopRecording();
    expect(recordedEvents.length).toBe(3);
    
    // Clear state
    mockSystem.reset();
    
    // Playback
    const playbackEvents = [];
    eventManager.onGraphEvent.add((event) => {
      if (event.type.startsWith('input:')) {
        playbackEvents.push(event.type);
      }
    });
    
    await inputManager.startPlayback(recordedEvents);
    
    // Wait for playback to complete
    await new Promise(resolve => {
      eventManager.onGraphEvent.add((event) => {
        if (event.type === 'input-playback-completed') {
          resolve(undefined);
        }
      });
    });
    
    expect(playbackEvents).toContain('input:pointer-move');
    expect(playbackEvents).toContain('input:pointer-down');
    expect(playbackEvents).toContain('input:pointer-up');
  });

  test('emits keyboard shortcut events', async () => {
    await inputManager.init();
    
    const shortcuts = [];
    eventManager.onGraphEvent.add((event) => {
      if (event.type.startsWith('input:') && 
          !event.type.includes('key')) {
        shortcuts.push(event.type);
      }
    });
    
    const mockSystem = inputManager.getMockInputSystem();
    
    // Test Ctrl+Z (undo)
    mockSystem.simulateKeyDown('z', { ctrlKey: true });
    expect(shortcuts).toContain('input:undo');
    
    // Test Ctrl+Y (redo)
    mockSystem.simulateKeyDown('y', { ctrlKey: true });
    expect(shortcuts).toContain('input:redo');
    
    // Test Ctrl+A (select all)
    mockSystem.simulateKeyDown('a', { ctrlKey: true });
    expect(shortcuts).toContain('input:select-all');
  });

  test('state queries work correctly', async () => {
    await inputManager.init();
    
    const mockSystem = inputManager.getMockInputSystem();
    
    // Test pointer position
    mockSystem.simulateMouseMove(150, 250);
    const pos = inputManager.getPointerPosition();
    expect(pos.x).toBe(150);
    expect(pos.y).toBe(250);
    
    // Test pointer down state
    expect(inputManager.isPointerDown()).toBe(false);
    mockSystem.simulateMouseDown(MouseButton.Left);
    expect(inputManager.isPointerDown()).toBe(true);
    expect(inputManager.isPointerDown(MouseButton.Left)).toBe(true);
    expect(inputManager.isPointerDown(MouseButton.Right)).toBe(false);
    
    // Test touch state
    mockSystem.simulateTouchStart([
      { id: 1, x: 100, y: 100 },
      { id: 2, x: 200, y: 200 }
    ]);
    
    const touches = inputManager.getActiveTouches();
    expect(touches.length).toBe(2);
    expect(touches[0].id).toBe(1);
    expect(touches[1].id).toBe(2);
  });
});
```

## Phase 3: Integration Tests with Playwright

### Step 3.1: Test Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/integration',
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--use-gl=swiftshader']
        }
      }
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        hasTouch: true
      }
    }
  ],
  use: {
    baseURL: 'http://dev.ato.ms:9025',
    trace: 'on-first-retry',
    video: 'on-first-retry'
  }
});
```

### Step 3.2: Node Dragging Integration Test

**File:** `test/integration/node-dragging.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Node Dragging', () => {
  test('drag node with SixDofDragBehavior', async ({ page }) => {
    await page.goto('/?path=/story/interactions--draggable-nodes');
    
    // Wait for graph to initialize
    await page.waitForFunction(() => {
      const graph = document.querySelector('graphty-element')?.graph;
      return graph?.initialized && graph?.scene?.isReady();
    });
    
    // Get initial node position
    const initialPos = await page.evaluate(() => {
      const graph = document.querySelector('graphty-element').graph;
      const node = graph.dataManager.nodes.get('node1');
      return {
        x: node.mesh.position.x,
        y: node.mesh.position.y,
        z: node.mesh.position.z
      };
    });
    
    // Drag the node
    const canvas = page.locator('canvas');
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 400, y: 300 },
      targetPosition: { x: 500, y: 400 }
    });
    
    // Verify node moved
    const finalPos = await page.evaluate(() => {
      const graph = document.querySelector('graphty-element').graph;
      const node = graph.dataManager.nodes.get('node1');
      return {
        x: node.mesh.position.x,
        y: node.mesh.position.y,
        z: node.mesh.position.z,
        isPinned: !node.meshDragBehavior.enabled
      };
    });
    
    expect(finalPos.x).not.toBe(initialPos.x);
    expect(finalPos.y).not.toBe(initialPos.y);
    expect(finalPos.isPinned).toBe(true); // pinOnDrag default
  });

  test('double-click expands node', async ({ page }) => {
    await page.goto('/?path=/story/interactions--expandable-nodes');
    
    await page.waitForFunction(() => {
      const graph = document.querySelector('graphty-element')?.graph;
      return graph?.initialized;
    });
    
    // Count initial nodes
    const initialNodeCount = await page.evaluate(() => {
      const graph = document.querySelector('graphty-element').graph;
      return graph.dataManager.nodes.size;
    });
    
    // Double-click on a node
    const canvas = page.locator('canvas');
    await canvas.dblclick({ position: { x: 400, y: 300 } });
    
    // Wait for expansion
    await page.waitForTimeout(500);
    
    // Verify new nodes added
    const finalNodeCount = await page.evaluate(() => {
      const graph = document.querySelector('graphty-element').graph;
      return graph.dataManager.nodes.size;
    });
    
    expect(finalNodeCount).toBeGreaterThan(initialNodeCount);
  });
});
```

### Step 3.3: Camera Controls Integration Tests

**File:** `test/integration/camera-controls.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('2D Camera Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/camera--2d-controls');
    await page.waitForFunction(() => {
      const graph = document.querySelector('graphty-element')?.graph;
      return graph?.initialized && graph?.cameraManager?.activeController;
    });
  });

  test('mouse pan in 2D mode', async ({ page }) => {
    const initialPos = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return { x: cam.position.x, y: cam.position.y };
    });
    
    // Pan with mouse
    const canvas = page.locator('canvas');
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 400, y: 300 },
      targetPosition: { x: 300, y: 200 }
    });
    
    const finalPos = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return { x: cam.position.x, y: cam.position.y };
    });
    
    expect(finalPos.x).not.toBe(initialPos.x);
    expect(finalPos.y).not.toBe(initialPos.y);
  });

  test('keyboard controls in 2D mode', async ({ page }) => {
    // Focus canvas
    await page.locator('canvas').click();
    
    const initialPos = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return { x: cam.position.x, y: cam.position.y };
    });
    
    // Press W key
    await page.keyboard.press('w', { delay: 100 });
    
    // Wait for velocity to apply
    await page.waitForTimeout(200);
    
    const finalPos = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return { x: cam.position.x, y: cam.position.y };
    });
    
    expect(finalPos.y).toBeGreaterThan(initialPos.y);
  });

  test('mouse wheel zoom', async ({ page }) => {
    const initialZoom = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return cam.orthoTop - cam.orthoBottom;
    });
    
    // Zoom in with wheel
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(100);
    
    const finalZoom = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return cam.orthoTop - cam.orthoBottom;
    });
    
    expect(finalZoom).toBeLessThan(initialZoom);
  });
});

test.describe('3D Camera Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?path=/story/camera--3d-controls');
    await page.waitForFunction(() => {
      const graph = document.querySelector('graphty-element')?.graph;
      return graph?.initialized && graph?.cameraManager?.activeController;
    });
  });

  test('mouse orbit in 3D mode', async ({ page }) => {
    const initialCamera = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return { alpha: cam.alpha, beta: cam.beta };
    });
    
    // Orbit with mouse
    const canvas = page.locator('canvas');
    await canvas.dragTo(canvas, {
      sourcePosition: { x: 400, y: 300 },
      targetPosition: { x: 500, y: 400 },
      button: 'left'
    });
    
    const finalCamera = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return { alpha: cam.alpha, beta: cam.beta };
    });
    
    expect(finalCamera.alpha).not.toBe(initialCamera.alpha);
    expect(finalCamera.beta).not.toBe(initialCamera.beta);
  });
});
```

### Step 3.4: Touch Gesture Tests

**File:** `test/integration/touch-gestures.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Touch Gestures', () => {
  test.use({ hasTouch: true });

  test('pinch zoom in 2D mode', async ({ page, context }) => {
    await page.goto('/?path=/story/camera--2d-touch');
    
    const client = await context.newCDPSession(page);
    
    const initialZoom = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return cam.orthoTop - cam.orthoBottom;
    });
    
    // Simulate pinch
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: 350, y: 300, id: 0 },
        { x: 450, y: 300, id: 1 }
      ]
    });
    
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: 300, y: 300, id: 0 },
        { x: 500, y: 300, id: 1 }
      ]
    });
    
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
    
    await page.waitForTimeout(100);
    
    const finalZoom = await page.evaluate(() => {
      const cam = document.querySelector('graphty-element').graph.cameraManager.camera;
      return cam.orthoTop - cam.orthoBottom;
    });
    
    expect(finalZoom).toBeLessThan(initialZoom); // Zoomed in
  });

  test('two-finger rotate in 2D mode', async ({ page, context }) => {
    await page.goto('/?path=/story/camera--2d-touch');
    
    const client = await context.newCDPSession(page);
    
    const initialRotation = await page.evaluate(() => {
      const graph = document.querySelector('graphty-element').graph;
      return graph.cameraManager.activeController.parent.rotation.z;
    });
    
    // Simulate rotation
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: 300, y: 300, id: 0 },
        { x: 500, y: 300, id: 1 }
      ]
    });
    
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: 400, y: 200, id: 0 },
        { x: 400, y: 400, id: 1 }
      ]
    });
    
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
    
    await page.waitForTimeout(100);
    
    const finalRotation = await page.evaluate(() => {
      const graph = document.querySelector('graphty-element').graph;
      return graph.cameraManager.activeController.parent.rotation.z;
    });
    
    expect(finalRotation).not.toBe(initialRotation);
  });
});
```

## Test Helpers

**File:** `test/helpers/graph-helpers.ts`

```typescript
export async function waitForGraphReady(page: Page) {
  await page.waitForFunction(() => {
    const graph = document.querySelector('graphty-element')?.graph;
    return graph?.initialized && 
           graph?.scene?.isReady() &&
           graph?.cameraManager?.activeController;
  }, { timeout: 5000 });
}

export async function getActiveCamera(page: Page) {
  return page.evaluate(() => {
    const graph = document.querySelector('graphty-element').graph;
    return graph.cameraManager.camera;
  });
}

export async function getCameraType(page: Page): Promise<'2d' | '3d'> {
  return page.evaluate(() => {
    const graph = document.querySelector('graphty-element').graph;
    const cam = graph.cameraManager.camera;
    return cam.mode === Camera.ORTHOGRAPHIC_CAMERA ? '2d' : '3d';
  });
}

export async function getNodePosition(page: Page, nodeId: string) {
  return page.evaluate((id) => {
    const graph = document.querySelector('graphty-element').graph;
    const node = graph.dataManager.nodes.get(id);
    return node ? {
      x: node.mesh.position.x,
      y: node.mesh.position.y,
      z: node.mesh.position.z
    } : null;
  }, nodeId);
}
```

## Implementation Timeline

### Week 1: Fix Infrastructure and Create InputManager
- [ ] Remove non-existent feature tests
- [ ] Update Graph helper methods to use real APIs
- [ ] Create src/input directory structure
- [ ] Implement InputManager in src/managers
- [ ] Update BabylonInputSystem and MockDeviceInputSystem to work with manager
- [ ] Replace IInputSystem interface with direct types

### Week 2: Unit Tests
- [ ] InputManager tests (initialization, event bridging, recording/playback)
- [ ] Node behavior tests (drag, double-click)
- [ ] 2D camera controller tests
- [ ] 3D camera controller tests

### Week 3: Integration Tests
- [ ] Node dragging in browser
- [ ] Camera controls (2D and 3D)
- [ ] Touch gesture validation
- [ ] Cross-browser testing
- [ ] Input recording/playback integration tests

### Week 4: Polish and Documentation
- [ ] Add visual regression tests
- [ ] Performance benchmarks
- [ ] Update documentation
- [ ] CI/CD integration
- [ ] Create example input recording files for automated testing

## Architectural Benefits of InputManager

The InputManager provides several key benefits over the previous IInputSystem interface approach:

1. **Consistency**: Follows the established manager pattern used throughout the codebase
2. **Integration**: Works seamlessly with EventManager for centralized event handling
3. **Lifecycle Management**: Proper init/dispose hooks managed by LifecycleManager
4. **Testing**: Built-in support for input recording and playback
5. **Configuration**: Centralized input configuration with runtime updates
6. **Extensibility**: Easy to add new features like pointer lock, gamepad support, etc.
7. **Error Handling**: Standardized error emission through EventManager

### Key Features

- **Event Bridging**: All input events are automatically bridged to the EventManager
- **State Management**: Enable/disable input globally with proper cleanup
- **Recording/Playback**: Record user interactions and replay them for automated testing
- **Mock Support**: Seamlessly switch between real and mock input for testing
- **Keyboard Shortcuts**: Automatic detection and emission of common shortcuts
- **Touch Support**: Full multi-touch support with gesture helpers

## Success Criteria

1. **All real features tested**: Every implemented input method has tests
2. **No phantom tests**: No tests for non-existent features
3. **Fast execution**: Unit tests < 5s, integration < 30s total
4. **Reliable**: <1% flaky test rate
5. **Maintainable**: Tests match actual implementation
6. **InputManager integrated**: New manager fully integrated with existing architecture
7. **Recording/Playback working**: Can record and replay complex interaction sequences