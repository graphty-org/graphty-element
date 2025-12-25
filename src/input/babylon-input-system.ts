import {KeyboardEventTypes, PointerEventTypes, PointerInfo as BabylonPointerInfo, Scene} from "@babylonjs/core";
import {Vector2} from "@babylonjs/core/Maths/math.vector";
import {Observable} from "@babylonjs/core/Misc/observable";

import {DeviceType, KeyboardInfo, MouseButton, PointerInfo, TouchPoint, WheelInfo} from "./types";

/**
 * Input system that integrates with Babylon.js scene observables.
 * Translates Babylon.js pointer and keyboard events to a unified input interface.
 */
export class BabylonInputSystem {
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
    private element: HTMLElement | null = null;
    private pointerPosition = new Vector2(0, 0);
    private pointerStates = new Map<MouseButton, boolean>();
    private activeTouches = new Map<number, TouchPoint>();

    /**
     * Creates a new BabylonInputSystem instance
     * @param scene - The Babylon.js scene to attach to
     */
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
                case PointerEventTypes.POINTERWHEEL: {
                    const wheelInfo = pointerInfo.event as WheelEvent;
                    this.onWheel.notifyObservers({
                        deltaX: wheelInfo.deltaX,
                        deltaY: wheelInfo.deltaY,
                        deltaZ: 0,
                        deltaMode: wheelInfo.deltaMode,
                    });
                    break;
                }
                default:
                    // Ignore other pointer event types
                    break;
            }
        });

        // Keyboard events
        this.scene.onKeyboardObservable.add((kbInfo) => {
            const info = this.convertKeyboardInfo(kbInfo);

            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    this.onKeyDown.notifyObservers(info);
                    break;
                case KeyboardEventTypes.KEYUP:
                    this.onKeyUp.notifyObservers(info);
                    break;
                default:
                    // Ignore other keyboard event types
                    break;
            }
        });
    }

    private convertPointerInfo(babylonInfo: BabylonPointerInfo): PointerInfo {
        const event = babylonInfo.event as PointerEvent;

        // Determine device type
        let deviceType = DeviceType.Mouse;
        if (event.pointerType === "touch") {
            deviceType = DeviceType.Touch;
        }

        // Map button
        let button = MouseButton.Left;
        if (event.button === 1) {
            button = MouseButton.Middle;
        } else if (event.button === 2) {
            button = MouseButton.Right;
        }

        return {
            x: event.clientX,
            y: event.clientY,
            button,
            deviceType,
            pointerId: event.pointerId,
            isPrimary: event.isPrimary,
            pressure: event.pressure,
        };
    }

    private convertKeyboardInfo(kbInfo: unknown): KeyboardInfo {
        const kbInfoTyped = kbInfo as {event: KeyboardEvent};
        const {event} = kbInfoTyped;

        return {
            key: event.key,
            code: event.code,
            ctrlKey: event.ctrlKey,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
        };
    }

    private handleTouchStart = (event: TouchEvent): void => {
        const touches = this.extractTouches(event.touches);
        touches.forEach((touch) => this.activeTouches.set(touch.id, touch));
        this.onTouchStart.notifyObservers(touches);
    };

    private handleTouchMove = (event: TouchEvent): void => {
        const touches = this.extractTouches(event.touches);
        touches.forEach((touch) => this.activeTouches.set(touch.id, touch));
        this.onTouchMove.notifyObservers(touches);
    };

    private handleTouchEnd = (event: TouchEvent): void => {
        const endedIds = Array.from(event.changedTouches).map((t) => t.identifier);
        endedIds.forEach((id) => this.activeTouches.delete(id));
        this.onTouchEnd.notifyObservers(endedIds);
    };

    private extractTouches(touchList: TouchList): TouchPoint[] {
        const touches: TouchPoint[] = [];
        for (const touch of Array.from(touchList)) {
            touches.push({
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                radiusX: touch.radiusX,
                radiusY: touch.radiusY,
                force: touch.force,
            });
        }
        return touches;
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
     * Attach the input system to an HTML element for touch events
     * @param element - The HTML element to attach touch listeners to
     */
    public attach(element: HTMLElement): void {
        this.element = element;

        // Attach touch event listeners
        this.element.addEventListener("touchstart", this.handleTouchStart, {passive: false});
        this.element.addEventListener("touchmove", this.handleTouchMove, {passive: false});
        this.element.addEventListener("touchend", this.handleTouchEnd, {passive: false});
        this.element.addEventListener("touchcancel", this.handleTouchEnd, {passive: false});
    }

    /**
     * Detach the input system and remove event listeners
     */
    public detach(): void {
        if (this.element) {
            this.element.removeEventListener("touchstart", this.handleTouchStart);
            this.element.removeEventListener("touchmove", this.handleTouchMove);
            this.element.removeEventListener("touchend", this.handleTouchEnd);
            this.element.removeEventListener("touchcancel", this.handleTouchEnd);
            this.element = null;
        }

        // Clear state
        this.pointerStates.clear();
        this.activeTouches.clear();
    }

    /**
     * Dispose of the input system and clean up all resources
     */
    public dispose(): void {
        this.detach();

        // Clear observables
        this.onPointerMove.clear();
        this.onPointerDown.clear();
        this.onPointerUp.clear();
        this.onWheel.clear();
        this.onTouchStart.clear();
        this.onTouchMove.clear();
        this.onTouchEnd.clear();
        this.onKeyDown.clear();
        this.onKeyUp.clear();
    }
}
