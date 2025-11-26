import {afterEach, assert, beforeEach, describe, test, vi} from "vitest";

import {Graph} from "../../../src/Graph.js";
import type {CameraWaypoint} from "../../../src/video/VideoCapture.js";

// Mock MediaRecorder
class MockMediaRecorder {
    ondataavailable: ((e: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: ((e: Event) => void) | null = null;
    state: "inactive" | "recording" | "paused" = "inactive";
    mimeType: string;

    constructor(stream: MediaStream, options?: {mimeType?: string, videoBitsPerSecond?: number}) {
        this.mimeType = options?.mimeType ?? "video/webm";
    }

    start(): void {
        this.state = "recording";
    }

    stop(): void {
        this.state = "inactive";
        // Simulate data available
        const blob = new Blob(["mock video data"], {type: this.mimeType});
        this.ondataavailable?.({data: blob} as BlobEvent);
        setTimeout(() => this.onstop?.(), 0);
    }

    pause(): void {
        this.state = "paused";
    }

    resume(): void {
        this.state = "recording";
    }

    static isTypeSupported(type: string): boolean {
        // Simulate browser support
        return type.includes("webm") || type.includes("vp9") || type.includes("vp8");
    }
}

// Store original MediaRecorder
let originalMediaRecorder: typeof MediaRecorder;

beforeEach(() => {
    // Save original
    originalMediaRecorder = globalThis.MediaRecorder;
    // Replace with mock
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
});

afterEach(() => {
    // Restore original
    vi.stubGlobal("MediaRecorder", originalMediaRecorder);
});

describe("Video Capture - Animated Camera Mode", () => {
    test("can capture video with animated camera", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 2000},
        ];

        const result = await graph.captureAnimation({
            duration: 2000,
            fps: 30,
            cameraMode: "animated",
            cameraPath,
        });

        assert.ok(result.blob instanceof Blob);
        assert.ok(result.blob.type.startsWith("video/webm"));
        assert.equal(result.metadata.fps, 30);
        assert.equal(result.metadata.format, "webm");
        assert.ok(result.metadata.width > 0);
        assert.ok(result.metadata.height > 0);

        graph.dispose();
    });

    test("supports multiple waypoints", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: 0, y: 20, z: 0}, target: {x: 0, y: 0, z: 0}, duration: 1000},
            {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 1000},
            {position: {x: 0, y: 0, z: 20}, target: {x: 0, y: 0, z: 0}, duration: 1000},
        ];

        const result = await graph.captureAnimation({
            duration: 3000,
            fps: 30,
            cameraMode: "animated",
            cameraPath,
        });

        assert.ok(result.blob instanceof Blob);
        assert.equal(result.metadata.fps, 30);

        graph.dispose();
    });

    test("supports easing options", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 2000},
        ];

        // Test all easing options
        for (const easing of ["linear", "easeInOut", "easeIn", "easeOut"] as const) {
            const result = await graph.captureAnimation({
                duration: 2000,
                fps: 30,
                cameraMode: "animated",
                cameraPath,
                easing,
            });

            assert.ok(result.blob instanceof Blob);
        }

        graph.dispose();
    });

    test("fires animation-progress events", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const progressEvents: number[] = [];

        // Use eventManager to listen for events
        const {eventManager} = (graph as {eventManager: {addListener: (event: string, handler: (data: unknown) => void) => void}});
        eventManager.addListener("animation-progress", (data) => {
            const progressData = data as {progress: number};
            progressEvents.push(progressData.progress);
        });

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 1000},
        ];

        await graph.captureAnimation({
            duration: 1000,
            fps: 10,
            cameraMode: "animated",
            cameraPath,
        });

        assert.ok(progressEvents.length > 0);
        // Last progress should be close to 100
        assert.ok(progressEvents[progressEvents.length - 1] >= 90);

        graph.dispose();
    });

    test("throws error with no camera path", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        try {
            await graph.captureAnimation({
                duration: 2000,
                fps: 30,
                cameraMode: "animated",
                // No cameraPath provided
            });
            assert.fail("Should have thrown error");
        } catch (error) {
            assert.ok((error as Error).message.includes("waypoints"));
        }

        graph.dispose();
    });

    test("throws error with single waypoint", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
        ];

        try {
            await graph.captureAnimation({
                duration: 2000,
                fps: 30,
                cameraMode: "animated",
                cameraPath,
            });
            assert.fail("Should have thrown error");
        } catch (error) {
            assert.ok((error as Error).message.includes("2 waypoints"));
        }

        graph.dispose();
    });

    test("respects custom fps setting", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 500},
        ];

        const result = await graph.captureAnimation({
            duration: 500,
            fps: 60,
            cameraMode: "animated",
            cameraPath,
        });

        assert.equal(result.metadata.fps, 60);

        graph.dispose();
    });

    test("respects custom dimensions", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 500},
        ];

        const result = await graph.captureAnimation({
            duration: 500,
            fps: 30,
            cameraMode: "animated",
            cameraPath,
            width: 1920,
            height: 1080,
        });

        assert.equal(result.metadata.width, 1920);
        assert.equal(result.metadata.height, 1080);

        graph.dispose();
    });
});

describe("Video Capture - Animated vs Stationary Comparison", () => {
    test("stationary mode still works after animated mode implementation", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const result = await graph.captureAnimation({
            duration: 1000,
            fps: 30,
            cameraMode: "stationary",
        });

        assert.ok(result.blob instanceof Blob);
        assert.equal(result.metadata.fps, 30);

        graph.dispose();
    });

    test("animated mode produces valid video output", async() => {
        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 600;
        const graph = new Graph(canvas);

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: -10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 500},
        ];

        const result = await graph.captureAnimation({
            duration: 500,
            fps: 30,
            cameraMode: "animated",
            cameraPath,
        });

        // Verify video output
        assert.ok(result.blob instanceof Blob);
        assert.ok(result.blob.size > 0);
        assert.ok(result.blob.type.includes("video"));

        graph.dispose();
    });
});
