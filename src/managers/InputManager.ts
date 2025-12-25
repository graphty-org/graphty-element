import type {Vector2} from "@babylonjs/core/Maths/math.vector";
import {Observable} from "@babylonjs/core/Misc/observable";

import {BabylonInputSystem} from "../input/babylon-input-system";
import {MockDeviceInputSystem} from "../input/mock-device-input-system";
import type {
    KeyboardInfo,
    MouseButton,
    PointerInfo,
    TouchPoint,
    WheelInfo,
} from "../input/types";
import type {Manager, ManagerContext} from "./interfaces";

/**
 * Recorded input event structure
 */
export interface RecordedInputEvent {
    timestamp: number;
    type: string;
    data: Record<string, unknown>;
}

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
    private recordedEvents: RecordedInputEvent[] = [];
    private playbackIndex = 0;
    private playbackStartTime = 0;

    /**
     * Creates an instance of InputManager
     * @param context - Manager context providing access to scene, canvas, and event manager
     * @param config - Input manager configuration options
     */
    constructor(
        private context: ManagerContext,
        private config: InputManagerConfig = {},
    ) {
        // Create appropriate input system based on config
        this.inputSystem = this.config.useMockInput ?
            new MockDeviceInputSystem() :
            new BabylonInputSystem(this.context.scene);

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

    /**
     * Initializes the input manager and sets up event bridges
     */
    async init(): Promise<void> {
        try {
            // Attach input system to canvas
            this.inputSystem.attach(this.context.canvas as HTMLElement);

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

    /**
     * Disposes of the input manager and cleans up resources
     */
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
     * @param enabled - Whether input should be enabled
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;

        if (!enabled && this.inputSystem instanceof BabylonInputSystem) {
            // Clear any active states when disabling
            this.inputSystem.detach();
        } else if (enabled && this.inputSystem instanceof BabylonInputSystem) {
            this.inputSystem.attach(this.context.canvas as HTMLElement);
        }

        this.context.eventManager.emitGraphEvent("input-enabled-changed", {enabled});
    }

    /**
     * Get the current pointer position
     * @returns Current pointer position as Vector2
     */
    getPointerPosition(): Vector2 {
        return this.inputSystem.getPointerPosition();
    }

    /**
     * Check if a pointer button is currently down
     * @param button - Mouse button to check (left, middle, right)
     * @returns True if the button is pressed, false otherwise
     */
    isPointerDown(button?: MouseButton): boolean {
        return this.inputSystem.isPointerDown(button);
    }

    /**
     * Get all active touch points
     * @returns Array of active touch points
     */
    getActiveTouches(): TouchPoint[] {
        return this.inputSystem.getActiveTouches();
    }

    /**
     * Get the mock input system for testing
     * @returns MockDeviceInputSystem instance
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
     * @returns Array of recorded events
     */
    stopRecording(): RecordedInputEvent[] {
        this.config.recordInput = false;
        this.context.eventManager.emitGraphEvent("input-recording-stopped", {
            eventCount: this.recordedEvents.length,
        });
        return [... this.recordedEvents];
    }

    /**
     * Start playback of recorded events
     * @param events - Optional array of events to play back
     * @returns Promise that resolves when playback completes
     */
    startPlayback(events?: RecordedInputEvent[]): Promise<void> {
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
            this.inputSystem.attach(this.context.canvas as HTMLElement);
            this.setupEventBridges();
        }

        this.playbackIndex = 0;
        this.playbackStartTime = Date.now();

        // Start playback loop and return the promise
        return this.runPlayback();
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
        ): void => {
            observable.add((data) => {
                if (!this.enabled) {
                    return;
                }

                // Record event if recording
                if (this.config.recordInput && shouldRecord) {
                    this.recordedEvents.push({
                        timestamp: Date.now(),
                        type: eventName,
                        data: this.serializeEventData(data),
                    });
                }

                // Emit through event manager
                const eventData = this.serializeEventData(data);
                this.context.eventManager.emitGraphEvent(eventName, eventData);
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
            if (!this.enabled) {
                return;
            }

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
     * @param data - Event data to serialize
     * @returns Serialized event data as a plain object
     */
    private serializeEventData(data: unknown): Record<string, unknown> {
        // Handle Vector2 objects
        if (data && typeof data === "object" && "x" in data && "y" in data &&
            typeof data.x === "number" && typeof data.y === "number") {
            return {x: data.x, y: data.y};
        }

        // Handle arrays
        if (Array.isArray(data)) {
            return {array: data.map((item) => this.serializeEventData(item))};
        }

        // Handle objects
        if (data && typeof data === "object") {
            const serialized: Record<string, unknown> = {};
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    serialized[key] = this.serializeEventData((data as Record<string, unknown>)[key]);
                }
            }
            return serialized;
        }

        // Primitives - wrap in object
        return {value: data};
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
                await new Promise((resolve) => setTimeout(resolve, eventTime - elapsed));
            }

            // Replay the event
            switch (event.type) {
                case "input:pointer-move":
                    mockSystem.simulateMouseMove(event.data.x as number, event.data.y as number);
                    break;
                case "input:pointer-down":
                    mockSystem.simulateMouseDown(event.data.button as MouseButton);
                    break;
                case "input:pointer-up":
                    mockSystem.simulateMouseUp(event.data.button as MouseButton);
                    break;
                case "input:wheel":
                    mockSystem.simulateWheel(event.data.deltaY as number, event.data.deltaX as number);
                    break;
                case "input:touch-start":
                    mockSystem.simulateTouchStart(event.data.array as TouchPoint[]);
                    break;
                case "input:touch-move":
                    mockSystem.simulateTouchMove(event.data.array as TouchPoint[]);
                    break;
                case "input:touch-end":
                    mockSystem.simulateTouchEnd(event.data.array as number[]);
                    break;
                case "input:key-down":
                    mockSystem.simulateKeyDown(event.data.key as string, event.data as Partial<KeyboardInfo>);
                    break;
                case "input:key-up":
                    mockSystem.simulateKeyUp(event.data.key as string);
                    break;
                default:
                    // Unknown event type
                    break;
            }

            this.playbackIndex++;
        }

        this.context.eventManager.emitGraphEvent("input-playback-completed", {});
    }

    /**
     * Load playback file
     * @param filename - Path or URL to the playback file
     */
    private async loadPlaybackFile(filename: string): Promise<void> {
        try {
            const response = await fetch(filename);
            const data = await response.json();
            this.recordedEvents = data.events ?? [];
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
        if (typeof window !== "undefined") {
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
     * @param config - Partial configuration to merge with existing config
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
