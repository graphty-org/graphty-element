import {Vector2, Vector3} from "@babylonjs/core/Maths/math.vector";
import {afterEach, expect} from "vitest";

import type {Graph} from "../src/Graph";
import {MockDeviceInputSystem} from "../src/input/mock-device-input-system";

// Global test utilities
export function createMockInputSystem(): MockDeviceInputSystem {
    return new MockDeviceInputSystem();
}

// Cleanup after each test
afterEach(() => {
    // Only run DOM cleanup if document is available (browser environment)
    if (typeof document !== "undefined") {
        // Clean up any lingering canvases
        document.querySelectorAll("canvas").forEach((canvas) => {
            canvas.remove();
        });

        // Reset body styles
        document.body.style.margin = "0";
        document.body.style.padding = "0";
    }
});

// Test helpers
export function createTestContainer(): HTMLElement {
    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.height = "600px";
    container.style.position = "relative";
    document.body.appendChild(container);
    return container;
}

export function waitForGraph(graph: Graph): Promise<void> {
    return new Promise((resolve) => {
    // Check if graph has initialized property
        if (graph.initialized) {
            resolve();
        } else {
            // Wait a frame for initialization
            requestAnimationFrame(() => {
                resolve();
            });
        }
    });
}

// Assertion helpers
export function expectVector2Near(actual: Vector2, expected: Vector2, tolerance = 0.01): void {
    expect(Math.abs(actual.x - expected.x)).toBeLessThan(tolerance);
    expect(Math.abs(actual.y - expected.y)).toBeLessThan(tolerance);
}

export function expectVector3Near(actual: Vector3, expected: Vector3, tolerance = 0.01): void {
    expect(Math.abs(actual.x - expected.x)).toBeLessThan(tolerance);
    expect(Math.abs(actual.y - expected.y)).toBeLessThan(tolerance);
    expect(Math.abs(actual.z - expected.z)).toBeLessThan(tolerance);
}
