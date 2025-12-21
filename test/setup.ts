import {Vector2, Vector3} from "@babylonjs/core/Maths/math.vector";
import {afterEach, beforeAll, expect, vi} from "vitest";

import type {Graph} from "../src/Graph";
import {MockDeviceInputSystem} from "../src/input/mock-device-input-system";

// Mock CreateScreenshotAsync to return a valid 1x1 PNG data URL
// This allows testing screenshot logic without requiring actual WebGL rendering
vi.mock("@babylonjs/core", async() => {
    const actual = await vi.importActual<typeof import("@babylonjs/core")>("@babylonjs/core");
    // 1x1 white PNG: 67 bytes base64-encoded
    const mockPngDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    return {
        ... actual,
        CreateScreenshotAsync: vi.fn().mockResolvedValue(mockPngDataUrl),
    };
});

// Type augmentation for Chrome-specific performance.memory API
declare global {
    interface Performance {
        memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
        };
    }
}

// Suppress Babylon.js logs during tests - must use dynamic import since we mock @babylonjs/core
beforeAll(async() => {
    const {Logger} = await import("@babylonjs/core");
    Logger.LogLevels = Logger.ErrorLogLevel;
});

// Suppress Lit dev mode warnings by setting production mode
if (typeof window !== "undefined") {
    // Global window modification for test environment
    (window as typeof window & {litIssuedWarnings?: Set<unknown>}).litIssuedWarnings = new Set(); // Prevent duplicate warnings
    // Suppress console warnings from Lit during tests
    const originalWarn = console.warn;
    console.warn = (... args: unknown[]) => {
        const message = args[0];
        if (typeof message === "string" &&
            (message.includes("Lit is in dev mode") ||
             message.includes("Multiple versions of Lit loaded"))) {
            return; // Suppress Lit warnings
        }

        originalWarn.apply(console, args);
    };
}

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
