import {type ArcRotateCamera, Camera} from "@babylonjs/core";

import type {Graph} from "../Graph.js";
import type {CameraState} from "../screenshot/types.js";

export const BUILTIN_PRESETS = [
    "fitToGraph",
    "topView",
    "sideView",
    "frontView",
    "isometric",
] as const;

interface BoundingBox {
    min: {x: number, y: number, z: number};
    max: {x: number, y: number, z: number};
    center: {x: number, y: number, z: number};
    width: number;
    height: number;
    depth: number;
    maxDimension: number;
}

/**
 * Calculate bounding box from graph nodes
 * @param graph - Graph instance to calculate bounds for
 * @returns Bounding box containing all nodes
 */
function getNodeBoundingBox(graph: Graph): BoundingBox {
    const nodes = graph.getNodes();

    if (nodes.length === 0) {
    // Default bounding box if no nodes
        return {
            min: {x: -10, y: -10, z: -10},
            max: {x: 10, y: 10, z: 10},
            center: {x: 0, y: 0, z: 0},
            width: 20,
            height: 20,
            depth: 20,
            maxDimension: 20,
        };
    }

    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;

    for (const node of nodes) {
        const pos = node.getPosition();
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        minZ = Math.min(minZ, pos.z);
        maxX = Math.max(maxX, pos.x);
        maxY = Math.max(maxY, pos.y);
        maxZ = Math.max(maxZ, pos.z);
    }

    const width = maxX - minX;
    const height = maxY - minY;
    const depth = maxZ - minZ;

    return {
        min: {x: minX, y: minY, z: minZ},
        max: {x: maxX, y: maxY, z: maxZ},
        center: {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            z: (minZ + maxZ) / 2,
        },
        width,
        height,
        depth,
        maxDimension: Math.max(width, height, depth),
    };
}

/**
 * Calculate fitToGraph preset - adapts to 2D or 3D camera
 * @param graph - Graph instance to fit camera to
 * @param camera - Camera to calculate state for
 * @returns Camera state that fits all nodes in view
 */
export function calculateFitToGraph(
    graph: Graph,
    camera: Camera,
): CameraState {
    const bounds = getNodeBoundingBox(graph);
    const {center} = bounds;

    const is2D = camera.mode === Camera.ORTHOGRAPHIC_CAMERA;

    if (is2D) {
    // 2D: Calculate zoom to fit all nodes with padding
        const canvasWidth = camera.getEngine().getRenderWidth();
        const canvasHeight = camera.getEngine().getRenderHeight();
        const canvasAspect = canvasWidth / canvasHeight;

        const size = Math.max(bounds.width, bounds.height / canvasAspect);
        const zoom = canvasWidth / (size * 1.05); // 5% padding

        return {
            type: "orthographic",
            zoom,
            pan: {x: center.x, y: center.y},
        };
    }

    // 3D: Calculate distance to fit all nodes with padding
    const maxDim = bounds.maxDimension;
    const arcCamera = camera as ArcRotateCamera;
    const {fov} = arcCamera;

    // Base distance calculation for straight-on viewing
    const baseDistance = (maxDim / Math.tan(fov / 2)) * 1.1; // 10% padding

    // For isometric view (equal x,y,z offsets), the apparent size of the graph
    // is smaller because we're viewing at an angle (~35.26° from each axis).
    // The cos(35.26°) ≈ 0.816 factor reduces apparent height.
    // We compensate by using a smaller distance (0.65 empirically tuned).
    const isometricFactor = 0.65;
    const distance = baseDistance * isometricFactor;

    return {
        type: "arcRotate",
        position: {
            x: center.x + (distance * 0.577), // Equidistant from center (1/√3)
            y: center.y + (distance * 0.577),
            z: center.z + (distance * 0.577),
        },
        target: center,
    };
}

/**
 * Calculate topView preset - adapts to 2D or 3D camera
 * @param graph - Graph instance to calculate view for
 * @param camera - Camera to calculate state for
 * @returns Camera state for top-down view
 */
export function calculateTopView(graph: Graph, camera: Camera): CameraState {
    const bounds = getNodeBoundingBox(graph);
    const {center} = bounds;

    const is2D = camera.mode === Camera.ORTHOGRAPHIC_CAMERA;

    if (is2D) {
    // 2D: Standard top-down view (default for 2D)
        return {
            type: "orthographic",
            zoom: 1.0,
            pan: {x: center.x, y: center.y},
        };
    }

    // 3D: Look down from above
    const distance = bounds.maxDimension * 1.5;
    return {
        type: "arcRotate",
        position: {x: center.x, y: center.y + distance, z: center.z},
        target: center,
    };
}

/**
 * Calculate sideView preset - 3D only
 * @param graph - Graph instance to calculate view for
 * @returns Camera state for side view
 */
export function calculateSideView(graph: Graph): CameraState {
    const bounds = getNodeBoundingBox(graph);
    const {center} = bounds;
    const distance = bounds.maxDimension * 1.5;

    return {
        type: "arcRotate",
        position: {x: center.x + distance, y: center.y, z: center.z},
        target: center,
    };
}

/**
 * Calculate frontView preset - 3D only
 * @param graph - Graph instance to calculate view for
 * @returns Camera state for front view
 */
export function calculateFrontView(graph: Graph): CameraState {
    const bounds = getNodeBoundingBox(graph);
    const {center} = bounds;
    const distance = bounds.maxDimension * 1.5;

    return {
        type: "arcRotate",
        position: {x: center.x, y: center.y, z: center.z + distance},
        target: center,
    };
}

/**
 * Calculate isometric preset - 3D only
 * @param graph - Graph instance to calculate view for
 * @returns Camera state for isometric view
 */
export function calculateIsometric(graph: Graph): CameraState {
    const bounds = getNodeBoundingBox(graph);
    const {center} = bounds;
    const distance = bounds.maxDimension * 1.5;

    return {
        type: "arcRotate",
        alpha: Math.PI / 4, // 45° horizontal
        beta: 0.615, // ≈35.264° vertical (classic isometric)
        radius: distance,
        target: center,
    };
}
