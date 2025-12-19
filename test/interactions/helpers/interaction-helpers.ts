/**
 * Core test utilities for interaction testing
 *
 * These helpers provide common functionality needed across all interaction tests,
 * including graph setup, camera state retrieval, and node manipulation.
 */

import {Matrix, Vector3} from "@babylonjs/core";

import {Graph} from "../../../src/Graph";
import {cleanupTestGraph, createTestGraph} from "../../helpers/testSetup";
import type {
    CameraState,
    DragDelta,
    NodeData,
    ScreenPosition,
    TestGraphOptions,
    Vector3D,
} from "../types";

/**
 * Wait for a graph to be fully initialized and ready for interaction.
 * This ensures the camera, scene, and input handlers are all set up.
 *
 * @param graph - The graph instance to wait for
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForGraphReady(
    graph: Graph,
    timeout = 5000,
): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        if (graph.initialized) {
            // Give a small delay for everything to settle
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Trigger a render loop iteration to ensure layout is applied
            if (graph.scene) {
                graph.scene.render();
            }

            // Another small delay for positions to be applied
            await new Promise((resolve) => setTimeout(resolve, 50));
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error(`Graph did not initialize within ${timeout}ms`);
}

/**
 * Get the screen position of a node by its ID.
 * Uses Babylon.js Vector3.Project to convert world coordinates to screen space.
 *
 * @param graph - The graph instance
 * @param nodeId - The ID of the node to find
 * @returns Screen coordinates or null if node not found
 */
export function getNodeScreenPosition(
    graph: Graph,
    nodeId: string | number,
): ScreenPosition | null {
    const node = graph.getNode(String(nodeId));
    if (!node) {
        return null;
    }

    const {scene, engine} = graph;
    const {activeCamera: camera} = scene;

    if (!camera) {
        return null;
    }

    // Force scene render to ensure all matrices are up-to-date
    scene.render();

    // Force world matrix computation to ensure absolutePosition is up-to-date
    node.mesh.computeWorldMatrix(true);

    // Use mesh.absolutePosition to account for parent transformations (like graph-root)
    const worldPos = node.mesh.absolutePosition;

    const {viewport} = camera;
    // Vector3.Project(vector, world, transform, viewport)
    // - world: object's world matrix (Identity for points already in world space)
    // - transform: view * projection matrix
    const screenPos = Vector3.Project(
        worldPos,
        Matrix.Identity(),
        scene.getTransformMatrix(),
        viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()),
    );

    return {
        x: screenPos.x,
        y: screenPos.y,
    };
}

/**
 * Get the current state of the active camera.
 * Returns different properties depending on whether it's 2D or 3D mode.
 *
 * @param graph - The graph instance
 * @returns Current camera state snapshot
 */
export function getCameraState(graph: Graph): CameraState {
    const viewMode = graph.getViewMode();
    const controller = graph.camera.getActiveController();

    if (!controller) {
        throw new Error("No active camera controller");
    }

    const {camera} = controller;
    const position = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
    };

    if (viewMode === "2d") {
        // 2D orthographic camera
        const orthoCamera = camera as {
            orthoTop?: number | null;
            orthoBottom?: number | null;
        };

        const top = orthoCamera.orthoTop ?? 10;
        const bottom = orthoCamera.orthoBottom ?? -10;
        const orthoRange = top - bottom;

        return {
            mode: "2d",
            position,
            orthoRange,
        };
    }

    // 3D arc rotate camera
    const arcCamera = camera as {
        alpha?: number;
        beta?: number;
        radius?: number;
    };

    return {
        mode: "3d",
        position,
        alpha: arcCamera.alpha,
        beta: arcCamera.beta,
        radius: arcCamera.radius,
    };
}

/**
 * Set up a test graph with specified options.
 * Creates a graph instance using NullEngine for headless testing.
 *
 * @param options - Configuration options for the test graph
 * @returns The initialized graph instance
 */
export async function setupTestGraph(options: TestGraphOptions = {}): Promise<Graph> {
    const {
        mode = "3d",
        pinOnDrag = true,
        layout = "ngraph",
        nodes = [],
        edges = [],
    } = options;

    // Use real WebGL engine for interaction tests - NullEngine doesn't support picking
    const graph = await createTestGraph({useRealEngine: true});

    // Configure the graph with a style template
    await graph.setStyleTemplate({
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            twoD: mode === "2d",
            viewMode: mode,
            background: {backgroundType: "color", color: "#2D2D2D"},
            addDefaultStyle: true,
            startingCameraDistance: 30,
            layout,
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
                type: layout,
                preSteps: 0,
                stepMultiplier: 1,
                minDelta: 0.001,
                zoomStepInterval: 5,
            },
            node: {
                pinOnDrag,
            },
        },
    });

    // Add initial nodes and edges if provided
    for (const nodeData of nodes) {
        await graph.addNode(nodeData);
    }

    for (const edgeData of edges) {
        await graph.addEdge(edgeData);
    }

    // Wait for everything to settle
    await waitForGraphReady(graph);

    return graph;
}

/**
 * Perform a drag operation on a node.
 * Simulates mouse down, move, and up events to drag a node.
 *
 * @param graph - The graph instance
 * @param nodeId - The ID of the node to drag
 * @param delta - The delta to move the node by (in screen pixels)
 */
export async function dragNode(
    graph: Graph,
    nodeId: string | number,
    delta: DragDelta,
): Promise<void> {
    const screenPos = getNodeScreenPosition(graph, nodeId);
    if (!screenPos) {
        throw new Error(`Node ${nodeId} not found`);
    }

    const {scene} = graph;
    const {PointerEventTypes} = await import("@babylonjs/core");

    // Simulate pointer down on the node
    scene.onPointerObservable.notifyObservers({
        type: PointerEventTypes.POINTERDOWN,
        event: {
            clientX: screenPos.x,
            clientY: screenPos.y,
            buttons: 1,
            button: 0,
        } as PointerEvent,
    } as unknown as Parameters<typeof scene.onPointerObservable.notifyObservers>[0]);

    // Small delay to allow event processing
    await new Promise((resolve) => setTimeout(resolve, 16));

    // Simulate pointer move
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        scene.onPointerObservable.notifyObservers({
            type: PointerEventTypes.POINTERMOVE,
            event: {
                clientX: screenPos.x + (delta.dx * progress),
                clientY: screenPos.y + (delta.dy * progress),
                buttons: 1,
                button: 0,
            } as PointerEvent,
        } as unknown as Parameters<typeof scene.onPointerObservable.notifyObservers>[0]);

        await new Promise((resolve) => setTimeout(resolve, 16));
    }

    // Simulate pointer up
    scene.onPointerObservable.notifyObservers({
        type: PointerEventTypes.POINTERUP,
        event: {
            clientX: screenPos.x + delta.dx,
            clientY: screenPos.y + delta.dy,
            buttons: 0,
            button: 0,
        } as PointerEvent,
    } as unknown as Parameters<typeof scene.onPointerObservable.notifyObservers>[0]);

    // Wait for physics to settle
    await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Get the current scale of the scene (for XR pivot-based scaling).
 *
 * @param graph - The graph instance
 * @returns The current scene scale (1.0 = default)
 */
export function getSceneScale(graph: Graph): number {
    // In XR mode, scale is managed via the pivot controller
    // For non-XR modes, we return the ortho range ratio or radius ratio
    const state = getCameraState(graph);

    if (state.mode === "2d" && state.orthoRange !== undefined) {
        // Default ortho range is approximately 20 units
        return 20 / state.orthoRange;
    } else if (state.mode === "3d" && state.radius !== undefined) {
        // Default radius is 30 (startingCameraDistance)
        return 30 / state.radius;
    }

    return 1.0;
}

/**
 * Get the current rotation of the scene/camera.
 *
 * @param graph - The graph instance
 * @returns Euler angles (x, y, z) in radians
 */
export function getSceneRotation(graph: Graph): Vector3D {
    const controller = graph.camera.getActiveController();
    if (!controller) {
        return {x: 0, y: 0, z: 0};
    }

    // For 2D mode, rotation is stored on the parent TransformNode
    if (graph.getViewMode() === "2d") {
        // Access the parent property which holds the rotation
        const twoDController = controller as unknown as {
            parent?: {rotation?: {x?: number, y?: number, z?: number}};
        };
        const parentRotation = twoDController.parent?.rotation;
        return {
            x: parentRotation?.x ?? 0,
            y: parentRotation?.y ?? 0,
            z: parentRotation?.z ?? 0,
        };
    }

    // For 3D mode, rotation is defined by alpha/beta angles
    const {camera} = controller;
    const arcCamera = camera as {alpha?: number, beta?: number};
    return {
        x: arcCamera.beta ?? 0,
        y: arcCamera.alpha ?? 0,
        z: 0,
    };
}

/**
 * Get the current camera position in world space.
 *
 * @param graph - The graph instance
 * @returns Camera position (x, y, z)
 */
export function getCameraPosition(graph: Graph): Vector3D {
    const controller = graph.camera.getActiveController();
    if (!controller) {
        return {x: 0, y: 0, z: 0};
    }

    const pos = controller.camera.position;
    return {
        x: pos.x,
        y: pos.y,
        z: pos.z,
    };
}

/**
 * Clean up a test graph created with setupTestGraph.
 *
 * @param graph - The graph instance to clean up
 */
export function teardownTestGraph(graph: Graph): void {
    cleanupTestGraph(graph);
}

/**
 * Default test nodes for interaction testing.
 * Creates a small triangle graph for basic tests.
 * Note: FixedLayout reads position from node.data.position
 */
export const DEFAULT_TEST_NODES: NodeData[] = [
    {id: "node1", position: {x: 0, y: 0, z: 0}},
    {id: "node2", position: {x: 5, y: 0, z: 0}},
    {id: "node3", position: {x: 2.5, y: 4, z: 0}},
];

/**
 * Default test edges connecting the default test nodes.
 */
export const DEFAULT_TEST_EDGES = [
    {src: "node1", dst: "node2"},
    {src: "node2", dst: "node3"},
    {src: "node3", dst: "node1"},
];

/**
 * Simulate a click (pointer down + up with no movement) on a specific screen position.
 *
 * @param graph - The graph instance
 * @param position - Screen position to click at
 */
export async function clickAtPosition(
    graph: Graph,
    position: ScreenPosition,
): Promise<void> {
    const {scene} = graph;
    const {PointerEventTypes} = await import("@babylonjs/core");

    // Set pointer position on scene - this is what scene.pick() uses
    scene.pointerX = position.x;
    scene.pointerY = position.y;

    // Notify Babylon's PrePointerObservable (used by NodeBehavior)
    // The scene.pick() inside the handler will use scene.pointerX/Y
    scene.onPrePointerObservable.notifyObservers({
        type: PointerEventTypes.POINTERDOWN,
        event: {
            clientX: position.x,
            clientY: position.y,
            buttons: 1,
            button: 0,
        } as PointerEvent,
    } as Parameters<typeof scene.onPrePointerObservable.notifyObservers>[0]);

    // Small delay for event processing
    await new Promise((resolve) => setTimeout(resolve, 16));

    // Pointer up to complete the click
    scene.onPrePointerObservable.notifyObservers({
        type: PointerEventTypes.POINTERUP,
        event: {
            clientX: position.x,
            clientY: position.y,
            buttons: 0,
            button: 0,
        } as PointerEvent,
    } as Parameters<typeof scene.onPrePointerObservable.notifyObservers>[0]);

    // Small delay for click detection processing
    await new Promise((resolve) => setTimeout(resolve, 50));
}

/**
 * Simulate a click on a node.
 *
 * @param graph - The graph instance
 * @param nodeId - The ID of the node to click
 * @returns True if the click was performed, false if node not found
 */
export async function clickOnNode(
    graph: Graph,
    nodeId: string | number,
): Promise<boolean> {
    const node = graph.getNode(String(nodeId));
    if (!node) {
        return false;
    }

    // Manually apply layout positions to nodes
    // (In tests, the render loop might not automatically call node.update)
    for (const n of graph.getNodes()) {
        n.update();
        // Force world matrix computation to update absolutePosition
        n.mesh.computeWorldMatrix(true);
    }

    // Trigger a few render frames to ensure everything is synchronized
    for (let i = 0; i < 3; i++) {
        graph.scene.render();
        await new Promise((resolve) => setTimeout(resolve, 16));
    }

    const screenPos = getNodeScreenPosition(graph, nodeId);
    if (!screenPos) {
        return false;
    }

    await clickAtPosition(graph, screenPos);
    return true;
}

/**
 * Simulate a click on the background (not on any node).
 *
 * @param graph - The graph instance
 */
export async function clickOnBackground(graph: Graph): Promise<void> {
    // Click at the corner of the canvas where there's unlikely to be a node
    const {engine} = graph;
    const width = engine.getRenderWidth();
    const height = engine.getRenderHeight();

    // Use corner position (should be background)
    await clickAtPosition(graph, {
        x: width - 10,
        y: height - 10,
    });
}
