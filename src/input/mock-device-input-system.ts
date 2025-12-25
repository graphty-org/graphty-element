import {Vector2} from "@babylonjs/core/Maths/math.vector";
import {Observable} from "@babylonjs/core/Misc/observable";

import {DeviceType, KeyboardInfo, MouseButton, PointerInfo, TouchPoint, WheelInfo} from "./types";

/**
 * Mock input system for testing user interactions without a real browser environment.
 * Simulates mouse, touch, and keyboard events with full state tracking.
 */
export class MockDeviceInputSystem {
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
    /**
     * Simulate a mouse move event
     * @param x - The x coordinate
     * @param y - The y coordinate
     */
    public simulateMouseMove(x: number, y: number): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        this.pointerPosition.set(x, y);
        const info: PointerInfo = {
            x,
            y,
            button: MouseButton.Left, // Default for move
            deviceType: DeviceType.Mouse,
            pointerId: 1,
            isPrimary: true,
            pressure: 0.5,
        };

        this.onPointerMove.notifyObservers(info);
    }

    /**
     * Simulate a mouse button press
     * @param button - The mouse button to press
     */
    public simulateMouseDown(button: MouseButton = MouseButton.Left): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        if (this.pointerStates.get(button)) {
            return;
        } // Already down

        this.pointerStates.set(button, true);
        const info: PointerInfo = {
            x: this.pointerPosition.x,
            y: this.pointerPosition.y,
            button,
            deviceType: DeviceType.Mouse,
            pointerId: 1,
            isPrimary: true,
            pressure: 1.0,
        };

        this.onPointerDown.notifyObservers(info);
    }

    /**
     * Simulate a mouse button release
     * @param button - The mouse button to release
     */
    public simulateMouseUp(button: MouseButton = MouseButton.Left): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        if (!this.pointerStates.get(button)) {
            return;
        } // Already up

        this.pointerStates.set(button, false);
        const info: PointerInfo = {
            x: this.pointerPosition.x,
            y: this.pointerPosition.y,
            button,
            deviceType: DeviceType.Mouse,
            pointerId: 1,
            isPrimary: true,
            pressure: 0,
        };

        this.onPointerUp.notifyObservers(info);
    }

    /**
     * Simulate a mouse wheel event
     * @param deltaY - Vertical scroll delta
     * @param deltaX - Horizontal scroll delta
     */
    public simulateWheel(deltaY: number, deltaX = 0): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        const info: WheelInfo = {
            deltaX,
            deltaY,
            deltaZ: 0,
            deltaMode: 0, // DOM_DELTA_PIXEL
        };

        this.onWheel.notifyObservers(info);
    }

    /**
     * Simulate touch start event with one or more touch points
     * @param touches - Array of touch points to start
     */
    public simulateTouchStart(touches: TouchPoint[]): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        touches.forEach((touch) => {
            this.activeTouches.set(touch.id, touch);
        });

        this.onTouchStart.notifyObservers(touches);
    }

    /**
     * Simulate touch move event for existing touch points
     * @param touches - Array of touch points with updated positions
     */
    public simulateTouchMove(touches: TouchPoint[]): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        // Validate all touches are active
        touches.forEach((touch) => {
            if (!this.activeTouches.has(touch.id)) {
                throw new Error(`Touch ${touch.id} not started`);
            }

            this.activeTouches.set(touch.id, touch);
        });

        this.onTouchMove.notifyObservers(touches);
    }

    /**
     * Simulate touch end event for specific touch points
     * @param touchIds - Array of touch IDs to end
     */
    public simulateTouchEnd(touchIds: number[]): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        // Validate touches exist
        touchIds.forEach((id) => {
            if (!this.activeTouches.has(id)) {
                throw new Error(`Touch ${id} not active`);
            }

            this.activeTouches.delete(id);
        });

        this.onTouchEnd.notifyObservers(touchIds);
    }

    /**
     * Simulate a key press event
     * @param key - The key to press
     * @param modifiers - Optional modifier keys (ctrl, shift, alt, meta)
     */
    public simulateKeyDown(key: string, modifiers?: Partial<KeyboardInfo>): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        if (this.activeKeys.has(key)) {
            return;
        } // Already down

        this.activeKeys.add(key);
        const info: KeyboardInfo = {
            key,
            code: `Key${key.toUpperCase()}`,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            ... modifiers,
        };

        this.onKeyDown.notifyObservers(info);
    }

    /**
     * Simulate a key release event
     * @param key - The key to release
     */
    public simulateKeyUp(key: string): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        if (!this.activeKeys.has(key)) {
            return;
        } // Already up

        this.activeKeys.delete(key);
        const info: KeyboardInfo = {
            key,
            code: `Key${key.toUpperCase()}`,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
        };

        this.onKeyUp.notifyObservers(info);
    }

    // Helper methods for common gestures
    /**
     * Simulate a drag gesture by interpolating mouse movement
     * @param startX - Starting x coordinate
     * @param startY - Starting y coordinate
     * @param endX - Ending x coordinate
     * @param endY - Ending y coordinate
     * @param steps - Number of intermediate steps to generate
     */
    public simulateDrag(startX: number, startY: number, endX: number, endY: number, steps = 10): void {
        this.simulateMouseMove(startX, startY);
        this.simulateMouseDown();

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = startX + ((endX - startX) * t);
            const y = startY + ((endY - startY) * t);
            this.simulateMouseMove(x, y);
        }

        this.simulateMouseUp();
    }

    /**
     * Simulate a pinch gesture with two touch points
     * @param centerX - Center x coordinate for the pinch
     * @param centerY - Center y coordinate for the pinch
     * @param startDistance - Initial distance between touch points
     * @param endDistance - Final distance between touch points
     * @param steps - Number of intermediate steps to generate
     */
    public simulatePinch(centerX: number, centerY: number, startDistance: number, endDistance: number, steps = 10): void {
        const startOffset = startDistance / 2;
        const endOffset = endDistance / 2;

        // Start touches
        this.simulateTouchStart([
            {id: 1, x: centerX - startOffset, y: centerY},
            {id: 2, x: centerX + startOffset, y: centerY},
        ]);

        // Animate pinch
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const offset = startOffset + ((endOffset - startOffset) * t);

            this.simulateTouchMove([
                {id: 1, x: centerX - offset, y: centerY},
                {id: 2, x: centerX + offset, y: centerY},
            ]);
        }

        // End touches
        this.simulateTouchEnd([1, 2]);
    }

    // State queries
    /**
     * Get the current pointer position
     * @returns Current pointer position as Vector2
     */
    public getPointerPosition(): Vector2 {
        return this.pointerPosition.clone();
    }

    /**
     * Check if a pointer button is currently pressed
     * @param button - Optional specific button to check, or any button if omitted
     * @returns True if the button is pressed
     */
    public isPointerDown(button?: MouseButton): boolean {
        if (button === undefined) {
            return Array.from(this.pointerStates.values()).some((state) => state);
        }

        return this.pointerStates.get(button) ?? false;
    }

    /**
     * Get all currently active touch points
     * @returns Array of active touch points
     */
    public getActiveTouches(): TouchPoint[] {
        return Array.from(this.activeTouches.values());
    }

    // Lifecycle
    /**
     * Attach the input system (no-op for mock, accepts element for interface consistency)
     * @param _element - Optional HTML element (unused in mock implementation)
     */
    public attach(_element?: HTMLElement): void {
        // Mock system doesn't need the element, but accept it for interface consistency
        void _element; // Explicitly acknowledge unused parameter
        this.attached = true;
    }

    /**
     * Detach the input system and reset state
     */
    public detach(): void {
        this.attached = false;
        this.reset();
    }

    /**
     * Dispose of the input system and clean up all resources
     */
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

    /**
     * Reset all input state to initial values
     */
    public reset(): void {
        this.pointerPosition.set(0, 0);
        this.pointerStates.clear();
        this.activeTouches.clear();
        this.activeKeys.clear();
    }
}
