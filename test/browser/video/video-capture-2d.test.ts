import {afterEach, assert, beforeEach, describe, test, vi} from "vitest";

import {Graph} from "../../../src/Graph.js";
import type {CameraWaypoint} from "../../../src/video/VideoCapture.js";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup.js";
import {restoreMockMediaRecorder, setupMockMediaRecorder} from "./mock-media-recorder.js";

// Store original MediaRecorder
let originalMediaRecorder: typeof MediaRecorder;

beforeEach(() => {
    // Save original
    originalMediaRecorder = globalThis.MediaRecorder;
    // Replace with mock
    setupMockMediaRecorder(vi);
});

afterEach(() => {
    // Restore original
    restoreMockMediaRecorder(vi, originalMediaRecorder);
});

describe("Video Capture - 2D Orthographic Camera", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Create test graph
        graph = await createTestGraph();

        // Switch to 2D mode using proper template format
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                viewMode: "2d",
                background: {backgroundType: "color", color: "#f0f0f0"},
                addDefaultStyle: true,
                startingCameraDistance: 30,
                layout: "fixed", // Use fixed to avoid layout delays
            },
            layers: [],
            data: {
                knownFields: {
                    nodeIdPath: "id",
                    nodeWeightPath: null,
                    nodeTimePath: null,
                    edgeSrcIdPath: "src",
                    edgeDstIdPath: "dst",
                    edgeWeightPath: null,
                    edgeTimePath: null,
                },
            },
            behavior: {
                layout: {
                    type: "fixed",
                    preSteps: 0,
                    stepMultiplier: 1,
                    minDelta: 0.001,
                    zoomStepInterval: 5,
                },
                node: {
                    pinOnDrag: true,
                },
            },
        });

        // Wait for camera to be activated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify 2D mode is active
        assert.isTrue(graph.getViewMode() === "2d", "Graph should be in 2D mode");
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    test("can capture video with 2D orthographic camera", async() => {
        const result = await graph.captureAnimation({
            duration: 1000,
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
    });

    test("2D video capture respects custom dimensions", async() => {
        const result = await graph.captureAnimation({
            duration: 500,
            fps: 30,
            cameraMode: "stationary",
            width: 1920,
            height: 1080,
        });

        assert.equal(result.metadata.width, 1920);
        assert.equal(result.metadata.height, 1080);
    });

    test("2D video capture fires animation-progress events", async() => {
        const progressEvents: number[] = [];

        // Use eventManager to listen for events
        const {eventManager} = (graph as {eventManager: {addListener: (event: string, handler: (data: unknown) => void) => void}});
        eventManager.addListener("animation-progress", (data) => {
            const progressData = data as {progress: number};
            progressEvents.push(progressData.progress);
        });

        await graph.captureAnimation({
            duration: 500,
            fps: 10,
            cameraMode: "stationary",
        });

        assert.ok(progressEvents.length > 0);
        // Last progress should be close to 100
        assert.ok(progressEvents[progressEvents.length - 1] >= 90);
    });
});

describe("Video Capture - 2D Animated Camera", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Create test graph
        graph = await createTestGraph();

        // Switch to 2D mode using proper template format
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                viewMode: "2d",
                background: {backgroundType: "color", color: "#f0f0f0"},
                addDefaultStyle: true,
                startingCameraDistance: 30,
                layout: "fixed", // Use fixed to avoid layout delays
            },
            layers: [],
            data: {
                knownFields: {
                    nodeIdPath: "id",
                    nodeWeightPath: null,
                    nodeTimePath: null,
                    edgeSrcIdPath: "src",
                    edgeDstIdPath: "dst",
                    edgeWeightPath: null,
                    edgeTimePath: null,
                },
            },
            behavior: {
                layout: {
                    type: "fixed",
                    preSteps: 0,
                    stepMultiplier: 1,
                    minDelta: 0.001,
                    zoomStepInterval: 5,
                },
                node: {
                    pinOnDrag: true,
                },
            },
        });

        // Wait for camera to be activated
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Verify 2D mode is active
        assert.isTrue(graph.getViewMode() === "2d", "Graph should be in 2D mode");
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    test("can capture video with 2D animated camera using waypoints", async() => {
        // For 2D cameras, z position is used as zoom proxy
        // Higher z = more zoomed out, lower z = more zoomed in
        const cameraPath: CameraWaypoint[] = [
            {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: 5, y: 5, z: 15}, target: {x: 0, y: 0, z: 0}, duration: 500},
        ];

        const result = await graph.captureAnimation({
            duration: 500,
            fps: 30,
            cameraMode: "animated",
            cameraPath,
        });

        assert.ok(result.blob instanceof Blob);
        assert.ok(result.blob.type.startsWith("video/webm"));
        assert.equal(result.metadata.fps, 30);
        assert.equal(result.metadata.format, "webm");
    });

    test("2D animated video supports multiple waypoints", async() => {
        // Create a path that pans and zooms
        const cameraPath: CameraWaypoint[] = [
            {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}}, // Start centered
            {position: {x: 5, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 250}, // Pan right
            {position: {x: 5, y: 5, z: 5}, target: {x: 0, y: 0, z: 0}, duration: 250}, // Pan up + zoom in
            {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 250}, // Return to start
        ];

        const result = await graph.captureAnimation({
            duration: 750,
            fps: 30,
            cameraMode: "animated",
            cameraPath,
        });

        assert.ok(result.blob instanceof Blob);
        assert.equal(result.metadata.fps, 30);
    });

    test("2D animated video supports easing options", async() => {
        const cameraPath: CameraWaypoint[] = [
            {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: 10, y: 10, z: 20}, target: {x: 0, y: 0, z: 0}, duration: 500},
        ];

        // Test all easing options with 2D camera
        for (const easing of ["linear", "easeInOut", "easeIn", "easeOut"] as const) {
            const result = await graph.captureAnimation({
                duration: 500,
                fps: 30,
                cameraMode: "animated",
                cameraPath,
                easing,
            });

            assert.ok(result.blob instanceof Blob, `Easing '${easing}' should produce valid blob`);
        }
    });

    test("2D animated video fires animation-progress events", async() => {
        const progressEvents: number[] = [];

        // Use eventManager to listen for events
        const {eventManager} = (graph as {eventManager: {addListener: (event: string, handler: (data: unknown) => void) => void}});
        eventManager.addListener("animation-progress", (data) => {
            const progressData = data as {progress: number};
            progressEvents.push(progressData.progress);
        });

        const cameraPath: CameraWaypoint[] = [
            {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}},
            {position: {x: 5, y: 5, z: 15}, target: {x: 0, y: 0, z: 0}, duration: 500},
        ];

        await graph.captureAnimation({
            duration: 500,
            fps: 10,
            cameraMode: "animated",
            cameraPath,
        });

        assert.ok(progressEvents.length > 0);
        // Last progress should be close to 100
        assert.ok(progressEvents[progressEvents.length - 1] >= 90);
    });

    test("2D animated video throws error with insufficient waypoints", async() => {
        const cameraPath: CameraWaypoint[] = [
            {position: {x: 0, y: 0, z: 10}, target: {x: 0, y: 0, z: 0}},
        ];

        try {
            await graph.captureAnimation({
                duration: 500,
                fps: 30,
                cameraMode: "animated",
                cameraPath,
            });
            assert.fail("Should have thrown error");
        } catch (error) {
            assert.ok((error as Error).message.includes("2 waypoints"));
        }
    });

    test("2D animated video throws error without camera path", async() => {
        try {
            await graph.captureAnimation({
                duration: 500,
                fps: 30,
                cameraMode: "animated",
                // No cameraPath provided
            });
            assert.fail("Should have thrown error");
        } catch (error) {
            assert.ok((error as Error).message.includes("waypoints"));
        }
    });
});

describe("Video Capture - 2D Camera Preservation", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Create test graph
        graph = await createTestGraph();

        // Switch to 2D mode
        await graph.setStyleTemplate({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
                viewMode: "2d",
                background: {backgroundType: "color", color: "#f0f0f0"},
                addDefaultStyle: true,
                startingCameraDistance: 30,
                layout: "fixed",
            },
            layers: [],
            data: {
                knownFields: {
                    nodeIdPath: "id",
                    nodeWeightPath: null,
                    nodeTimePath: null,
                    edgeSrcIdPath: "src",
                    edgeDstIdPath: "dst",
                    edgeWeightPath: null,
                    edgeTimePath: null,
                },
            },
            behavior: {
                layout: {
                    type: "fixed",
                    preSteps: 0,
                    stepMultiplier: 1,
                    minDelta: 0.001,
                    zoomStepInterval: 5,
                },
                node: {
                    pinOnDrag: true,
                },
            },
        });

        // Wait for camera to be activated
        await new Promise((resolve) => setTimeout(resolve, 100));
    });

    afterEach(() => {
        cleanupTestGraph(graph);
    });

    test("2D mode is maintained during video capture", async() => {
        // Verify 2D mode before capture
        assert.isTrue(graph.getViewMode() === "2d", "Graph should be in 2D mode before capture");

        const result = await graph.captureAnimation({
            duration: 500,
            fps: 30,
            cameraMode: "stationary",
        });

        // Verify 2D mode after capture
        assert.isTrue(graph.getViewMode() === "2d", "Graph should remain in 2D mode after capture");
        assert.ok(result.blob instanceof Blob);
    });

    test("2D video capture supports cancellation", async() => {
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

        // Should throw or reject with AnimationCancelledError
        try {
            await capturePromise;
            assert.fail("Should have thrown cancellation error");
        } catch (error) {
            assert.ok(error instanceof Error);
            assert.equal(error.name, "AnimationCancelledError", "Error should be AnimationCancelledError");
            assert.ok(error.message.includes("cancel"), "Error message should mention cancellation");
        }
    });
});
