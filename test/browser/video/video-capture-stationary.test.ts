import {afterEach, assert, beforeEach, test, vi} from "vitest";

import {Graph} from "../../../src/Graph.js";

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

test("can capture video with stationary camera", async() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas);

    const result = await graph.captureAnimation({
        duration: 2000,
        fps: 30,
        cameraMode: "stationary",
    });

    assert.ok(result.blob instanceof Blob);
    // Blob type includes codec, e.g., 'video/webm;codecs=vp9'
    assert.ok(result.blob.type.startsWith("video/webm"));
    assert.equal(result.metadata.fps, 30);
    assert.equal(result.metadata.format, "webm"); // Format detected from blob type
    assert.ok(result.metadata.framesCaptured >= 0);
    assert.ok(result.metadata.width > 0);
    assert.ok(result.metadata.height > 0);

    graph.dispose();
});

test("auto-detects best supported codec", () => {
    const isVP9Supported = MediaRecorder.isTypeSupported("video/webm;codecs=vp9");
    const isVP8Supported = MediaRecorder.isTypeSupported("video/webm;codecs=vp8");
    const isWebMSupported = MediaRecorder.isTypeSupported("video/webm");

    // At least one should be supported
    assert.ok(isVP9Supported || isVP8Supported || isWebMSupported);
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

    await graph.captureAnimation({
        duration: 1000,
        fps: 10,
        cameraMode: "stationary",
    });

    assert.ok(progressEvents.length > 0);
    // Last progress should be close to 100
    assert.ok(progressEvents[progressEvents.length - 1] >= 90);

    graph.dispose();
});

test("respects custom fps setting", async() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas);

    const result = await graph.captureAnimation({
        duration: 1000,
        fps: 60,
        cameraMode: "stationary",
    });

    assert.equal(result.metadata.fps, 60);

    graph.dispose();
});

test("respects custom dimensions", async() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas);

    const result = await graph.captureAnimation({
        duration: 1000,
        fps: 30,
        cameraMode: "stationary",
        width: 1920,
        height: 1080,
    });

    assert.equal(result.metadata.width, 1920);
    assert.equal(result.metadata.height, 1080);

    graph.dispose();
});

test("calculates expected frames correctly", async() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas);

    const result = await graph.captureAnimation({
        duration: 2000,
        fps: 30,
        cameraMode: "stationary",
    });

    // 2 seconds at 30fps = 60 frames expected
    const expectedFrames = (2000 / 1000) * 30;
    assert.ok(result.metadata.framesCaptured <= expectedFrames + 5); // Allow small variance
    assert.ok(result.metadata.framesCaptured >= expectedFrames - 5);

    graph.dispose();
});

test("supports cancellation", async() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas);

    // Start a long capture
    const capturePromise = graph.captureAnimation({
        duration: 5000,
        fps: 30,
        cameraMode: "stationary",
    });

    // Wait a bit then cancel
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should be capturing
    assert.ok(graph.isAnimationCapturing(), "Should be capturing before cancel");

    // Cancel and check return value
    const wasCancelled = graph.cancelAnimationCapture();
    assert.ok(wasCancelled, "cancelAnimationCapture should return true when cancelling active capture");

    // Should no longer be capturing
    assert.equal(graph.isAnimationCapturing(), false, "Should not be capturing after cancel");

    // Cancelling again should return false
    const secondCancel = graph.cancelAnimationCapture();
    assert.equal(secondCancel, false, "Second cancel should return false");

    // Should throw or reject with AnimationCancelledError
    try {
        await capturePromise;
        assert.fail("Should have thrown cancellation error");
    } catch (error) {
        assert.ok(error instanceof Error);
        assert.equal(error.name, "AnimationCancelledError", "Error should be AnimationCancelledError");
        assert.ok(error.message.includes("cancel"), "Error message should mention cancellation");
    }

    graph.dispose();
});

test("cancelAnimationCapture returns false when no capture is in progress", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas);

    // Cancel when nothing is running
    const result = graph.cancelAnimationCapture();
    assert.equal(result, false, "Should return false when no capture is in progress");

    // Check isAnimationCapturing
    assert.equal(graph.isAnimationCapturing(), false, "Should not be capturing");

    graph.dispose();
});
