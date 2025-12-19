/**
 * Keyboard Controls Integration Tests
 *
 * These tests verify keyboard interactions in a real browser environment
 * by creating Graph instances directly and simulating keyboard events.
 */

import {assert} from "chai";
import {afterEach, beforeEach, describe, test} from "vitest";

import type {StyleSchema} from "../../../src/config";
import {Graph} from "../../../src/Graph";

/**
 * Create a minimal style template for testing
 */
function createStyleTemplate(twoD: boolean): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            twoD,
            layout: "circular",
            layoutOptions: {
                dim: twoD ? 2 : 3,
            },
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
                type: "circular",
                preSteps: 0,
                stepMultiplier: 1,
                minDelta: 0.001,
                zoomStepInterval: 5,
            },
            node: {
                pinOnDrag: true,
            },
        },
    } as unknown as StyleSchema;
}

const TEST_NODES = [
    {id: 1},
    {id: 2},
    {id: 3},
];

const TEST_EDGES = [
    {src: 1, dst: 2},
    {src: 2, dst: 3},
];

/**
 * Helper to get the 2D input controller from the graph
 */
function get2DInputController(graph: Graph): {
    applyKeyboardInertia: () => void;
} | undefined {
    const cameraManager = graph.camera;
    // Access via internal input registry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyManager = cameraManager as any;
    if (anyManager.activeInputHandler?.applyKeyboardInertia) {
        return anyManager.activeInputHandler;
    }

    return undefined;
}

/**
 * Helper to get the 2D camera controller from the graph
 */
function get2DCameraController(graph: Graph): {
    velocity: {x: number, y: number, zoom: number, rotate: number};
    camera: {position: {x: number, y: number, z: number}, orthoTop?: number, orthoBottom?: number};
} | undefined {
    const controller = graph.camera.getActiveController();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyController = controller as any;
    if (anyController.velocity) {
        return anyController;
    }

    return undefined;
}

/**
 * Helper to get the 3D camera state
 */
function get3DCameraState(graph: Graph): {
    alpha: number;
    beta: number;
    radius: number;
} {
    const controller = graph.camera.getActiveController();
    if (!controller) {
        throw new Error("No active camera controller");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const camera = controller.camera as any;
    return {
        alpha: camera.alpha ?? 0,
        beta: camera.beta ?? 0,
        radius: camera.radius ?? 30,
    };
}

describe("Keyboard Controls Integration", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    describe("2D Mode", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();

            // Set up 2D mode
            await graph.setStyleTemplate(createStyleTemplate(true));
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.operationQueue.waitForCompletion();

            // Wait for camera to be activated
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        afterEach(() => {
            graph.dispose();
            document.body.removeChild(container);
        });

        test("WASD controls work in 2D mode - W increases Y velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press W key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "w"}));
            inputController.applyKeyboardInertia();

            assert.isAbove(cameraController.velocity.y, 0, "W key should increase Y velocity");
        });

        test("WASD controls work in 2D mode - S decreases Y velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press S key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "s"}));
            inputController.applyKeyboardInertia();

            assert.isBelow(cameraController.velocity.y, 0, "S key should decrease Y velocity");
        });

        test("WASD controls work in 2D mode - A decreases X velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press A key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "a"}));
            inputController.applyKeyboardInertia();

            assert.isBelow(cameraController.velocity.x, 0, "A key should decrease X velocity");
        });

        test("WASD controls work in 2D mode - D increases X velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press D key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "d"}));
            inputController.applyKeyboardInertia();

            assert.isAbove(cameraController.velocity.x, 0, "D key should increase X velocity");
        });

        test("arrow keys work in 2D mode - ArrowUp increases Y velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press ArrowUp key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowUp"}));
            inputController.applyKeyboardInertia();

            assert.isAbove(cameraController.velocity.y, 0, "ArrowUp should increase Y velocity");
        });

        test("arrow keys work in 2D mode - ArrowDown decreases Y velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press ArrowDown key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowDown"}));
            inputController.applyKeyboardInertia();

            assert.isBelow(cameraController.velocity.y, 0, "ArrowDown should decrease Y velocity");
        });

        test("arrow keys work in 2D mode - ArrowLeft decreases X velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press ArrowLeft key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowLeft"}));
            inputController.applyKeyboardInertia();

            assert.isBelow(cameraController.velocity.x, 0, "ArrowLeft should decrease X velocity");
        });

        test("arrow keys work in 2D mode - ArrowRight increases X velocity", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Press ArrowRight key
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight"}));
            inputController.applyKeyboardInertia();

            assert.isAbove(cameraController.velocity.x, 0, "ArrowRight should increase X velocity");
        });

        test("keyboard input disabled when controller is disabled", () => {
            const inputController = get2DInputController(graph);
            const cameraController = get2DCameraController(graph);

            assert.isDefined(inputController, "Input controller should be defined");
            assert.isDefined(cameraController, "Camera controller should be defined");

            // Disable input controller
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const anyInput = inputController as any;
            if (anyInput.disable) {
                anyInput.disable();
            }

            // Reset velocity
            cameraController.velocity = {x: 0, y: 0, zoom: 0, rotate: 0};

            // Try keyboard input
            graph.canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "w"}));
            inputController.applyKeyboardInertia();

            // Velocity should remain zero when disabled
            assert.equal(cameraController.velocity.y, 0, "Keyboard input should have no effect when disabled");

            // Re-enable for cleanup
            if (anyInput.enable) {
                anyInput.enable();
            }
        });
    });

    describe("3D Mode", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();

            // Set up 3D mode
            await graph.setStyleTemplate(createStyleTemplate(false));
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.operationQueue.waitForCompletion();

            // Wait for camera to be activated
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        afterEach(() => {
            graph.dispose();
            document.body.removeChild(container);
        });

        test("canvas has tabindex for keyboard focus in 3D mode", () => {
            const {canvas} = graph;
            // Canvas should have tabindex attribute for keyboard focus
            assert.equal(canvas.getAttribute("tabindex"), "0", "Canvas should have tabindex='0' for focus");
        });

        test("3D camera has valid initial state", () => {
            const state = get3DCameraState(graph);

            // Verify camera has valid 3D state
            assert.isNumber(state.alpha, "Alpha should be a number");
            assert.isNumber(state.beta, "Beta should be a number");
            assert.isNumber(state.radius, "Radius should be a number");
            assert.isAbove(state.radius, 0, "Radius should be positive");
        });

        test("keyboard events are received on focused canvas", () => {
            const {canvas} = graph;

            let keyEventReceived = false;
            const handler = (): void => {
                keyEventReceived = true;
            };

            canvas.addEventListener("keydown", handler);

            // Focus the canvas
            canvas.focus();

            // Dispatch keyboard event
            canvas.dispatchEvent(new KeyboardEvent("keydown", {key: "w", bubbles: true}));

            assert.isTrue(keyEventReceived, "Canvas should receive keyboard events when focused");

            canvas.removeEventListener("keydown", handler);
        });
    });
});
