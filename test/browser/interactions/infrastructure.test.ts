import {describe, expect, test} from "vitest";

import {MockDeviceInputSystem} from "../../../src/input/mock-device-input-system";
import {MouseButton} from "../../../src/input/types";

describe("Interaction Testing Infrastructure", () => {
    test("MockDeviceInputSystem can be created", () => {
        const mockInput = new MockDeviceInputSystem();
        expect(mockInput).toBeDefined();
    });

    test("MockDeviceInputSystem simulates mouse events", () => {
        const mockInput = new MockDeviceInputSystem();
        mockInput.attach(document.createElement("div"));

        let moveEventFired = false;
        let downEventFired = false;
        let upEventFired = false;

        mockInput.onPointerMove.add(() => {
            moveEventFired = true;
        });
        mockInput.onPointerDown.add(() => {
            downEventFired = true;
        });
        mockInput.onPointerUp.add(() => {
            upEventFired = true;
        });

        mockInput.simulateMouseMove(100, 200);
        expect(moveEventFired).toBe(true);
        expect(mockInput.getPointerPosition().x).toBe(100);
        expect(mockInput.getPointerPosition().y).toBe(200);

        mockInput.simulateMouseDown(MouseButton.Left);
        expect(downEventFired).toBe(true);
        expect(mockInput.isPointerDown(MouseButton.Left)).toBe(true);

        mockInput.simulateMouseUp(MouseButton.Left);
        expect(upEventFired).toBe(true);
        expect(mockInput.isPointerDown(MouseButton.Left)).toBe(false);
    });

    test("MockDeviceInputSystem simulates touch events", () => {
        const mockInput = new MockDeviceInputSystem();
        mockInput.attach(document.createElement("div"));

        let touchStartFired = false;
        let touchMoveFired = false;
        let touchEndFired = false;

        mockInput.onTouchStart.add(() => {
            touchStartFired = true;
        });
        mockInput.onTouchMove.add(() => {
            touchMoveFired = true;
        });
        mockInput.onTouchEnd.add(() => {
            touchEndFired = true;
        });

        // Start touch
        mockInput.simulateTouchStart([
            {id: 1, x: 100, y: 100},
        ]);
        expect(touchStartFired).toBe(true);
        expect(mockInput.getActiveTouches()).toHaveLength(1);

        // Move touch
        mockInput.simulateTouchMove([
            {id: 1, x: 150, y: 150},
        ]);
        expect(touchMoveFired).toBe(true);

        // End touch
        mockInput.simulateTouchEnd([1]);
        expect(touchEndFired).toBe(true);
        expect(mockInput.getActiveTouches()).toHaveLength(0);
    });

    test("MockDeviceInputSystem simulates keyboard events", () => {
        const mockInput = new MockDeviceInputSystem();
        mockInput.attach(document.createElement("div"));

        let keyDownFired = false;
        let keyUpFired = false;
        let keyPressed = "";

        mockInput.onKeyDown.add((info) => {
            keyDownFired = true;
            keyPressed = info.key;
        });
        mockInput.onKeyUp.add(() => {
            keyUpFired = true;
        });

        mockInput.simulateKeyDown("a");
        expect(keyDownFired).toBe(true);
        expect(keyPressed).toBe("a");

        mockInput.simulateKeyUp("a");
        expect(keyUpFired).toBe(true);
    });

    test("MockDeviceInputSystem helper methods work", () => {
        const mockInput = new MockDeviceInputSystem();
        mockInput.attach(document.createElement("div"));

        let dragStarted = false;
        let dragEnded = false;
        const positions: {x: number, y: number}[] = [];

        mockInput.onPointerDown.add(() => {
            dragStarted = true;
        });
        mockInput.onPointerUp.add(() => {
            dragEnded = true;
        });
        mockInput.onPointerMove.add((info) => {
            positions.push({x: info.x, y: info.y});
        });

        // Simulate drag
        mockInput.simulateDrag(0, 0, 100, 100, 5);

        expect(dragStarted).toBe(true);
        expect(dragEnded).toBe(true);
        expect(positions.length).toBeGreaterThan(5); // Initial move + 5 steps
        expect(positions[positions.length - 1].x).toBe(100);
        expect(positions[positions.length - 1].y).toBe(100);
    });
});
