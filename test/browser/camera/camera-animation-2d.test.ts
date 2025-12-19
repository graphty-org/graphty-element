import {afterEach, assert, test} from "vitest";

import {TwoDCameraController} from "../../../src/cameras/TwoDCameraController.js";
import {Graph} from "../../../src/Graph.js";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup.js";

let graph: Graph;
let cameraController: TwoDCameraController;

afterEach(() => {
    cleanupTestGraph(graph);
});

async function setup2DGraph(): Promise<void> {
    graph = await createTestGraph();

    // Switch to 2D mode using proper template format (like 2d-camera-controls.test.ts)
    await graph.setStyleTemplate({
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            twoD: true,
            viewMode: "2d",
            background: {backgroundType: "color", color: "#f0f0f0"},
            addDefaultStyle: true,
            startingCameraDistance: 30,
            layout: "ngraph",
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
                type: "ngraph",
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

    // Get the camera controller
    const cameraManager = graph.camera;
    cameraController = (cameraManager as unknown as {activeCameraController: TwoDCameraController}).activeCameraController;
    assert.isDefined(cameraController, "Camera controller should be defined after switching to 2D mode");
}

test("animates 2D zoom smoothly", async() => {
    await setup2DGraph();

    // Calculate initial zoom from ortho bounds (full width)
    const initialOrthoWidth = (cameraController.camera.orthoRight ?? 1) - (cameraController.camera.orthoLeft ?? -1);
    const targetZoom = 2.0;

    const startTime = Date.now();
    await graph.setCameraZoom(targetZoom, {animate: true, duration: 500});
    const elapsed = Date.now() - startTime;

    // Animation should take approximately the requested duration
    assert.ok(elapsed >= 450 && elapsed <= 650, `Animation took ${elapsed}ms, expected ~500ms`);

    // Ortho size should have changed (zoom in makes it smaller)
    const finalOrthoWidth = (cameraController.camera.orthoRight ?? 1) - (cameraController.camera.orthoLeft ?? -1);
    assert.notEqual(finalOrthoWidth, initialOrthoWidth, "Ortho width should have changed");

    // Final width should be approximately initial / targetZoom
    // The zoom divides the half-width by zoom, so full width is also divided by zoom
    const expectedWidth = initialOrthoWidth / targetZoom;
    assert.ok(Math.abs(finalOrthoWidth - expectedWidth) < 1.0, `Final ortho width is ${finalOrthoWidth}, expected ~${expectedWidth}`);
});

test("animates 2D pan smoothly", async() => {
    await setup2DGraph();

    const initialPanX = cameraController.camera.position.x;
    const initialPanY = cameraController.camera.position.y;
    const targetPan = {x: 50, y: 50};

    await graph.setCameraPan(targetPan, {animate: true, duration: 500});

    // Pan should have changed
    assert.notEqual(cameraController.camera.position.x, initialPanX, "Pan X should have changed");
    assert.notEqual(cameraController.camera.position.y, initialPanY, "Pan Y should have changed");

    // Pan should be close to target (allowing some tolerance)
    assert.ok(Math.abs(cameraController.camera.position.x - targetPan.x) < 10, `Pan X is ${cameraController.camera.position.x}, expected ${targetPan.x}`);
    assert.ok(Math.abs(cameraController.camera.position.y - targetPan.y) < 10, `Pan Y is ${cameraController.camera.position.y}, expected ${targetPan.y}`);
});

test("applies easing to 2D animations", async() => {
    await setup2DGraph();

    // Track ortho size changes during animation
    const orthoSizes: number[] = [];

    const listenerId = graph.eventManager.addListener("camera-state-changed", () => {
        const size = (cameraController.camera.orthoRight ?? 1) - (cameraController.camera.orthoLeft ?? -1);
        orthoSizes.push(size);
    });

    await graph.setCameraZoom(1.5, {animate: true, duration: 300, easing: "easeInOut"});

    graph.eventManager.removeListener(listenerId);

    // With easeInOut, we should see zoom changes (animation occurred)
    assert.ok(orthoSizes.length > 0, "Animation should trigger camera-state-changed events");
});

test("emits camera-state-changed event after 2D animation", async() => {
    await setup2DGraph();

    let eventFired = false;
    const listenerId = graph.eventManager.addListener("camera-state-changed", () => {
        eventFired = true;
    });

    await graph.setCameraZoom(1.2, {animate: true, duration: 200});

    assert.ok(eventFired, "camera-state-changed event should fire after animation");

    graph.eventManager.removeListener(listenerId);
});
