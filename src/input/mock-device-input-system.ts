import {Vector2} from "@babylonjs/core/Maths/math.vector";
import {Observable} from "@babylonjs/core/Misc/observable";

import {DeviceType, KeyboardInfo, MouseButton, PointerInfo, TouchPoint, WheelInfo} from "./types";

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

    public simulateTouchStart(touches: TouchPoint[]): void {
        if (!this.attached) {
            throw new Error("Input system not attached");
        }

        touches.forEach((touch) => {
            this.activeTouches.set(touch.id, touch);
        });

        this.onTouchStart.notifyObservers(touches);
    }

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
    public getPointerPosition(): Vector2 {
        return this.pointerPosition.clone();
    }

    public isPointerDown(button?: MouseButton): boolean {
        if (button === undefined) {
            return Array.from(this.pointerStates.values()).some((state) => state);
        }

        return this.pointerStates.get(button) ?? false;
    }

    public getActiveTouches(): TouchPoint[] {
        return Array.from(this.activeTouches.values());
    }

    // Lifecycle
    public attach(_element?: HTMLElement): void {
        // Mock system doesn't need the element, but accept it for interface consistency
        void _element; // Explicitly acknowledge unused parameter
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
