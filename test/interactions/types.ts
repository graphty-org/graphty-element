/**
 * TypeScript types for interaction testing
 */

import type {ViewMode} from "../../src/config";

/**
 * Options for creating a test graph
 */
export interface TestGraphOptions {
    /** View mode: "2d", "3d", or "xr" */
    mode?: ViewMode;
    /** Whether to pin nodes after dragging */
    pinOnDrag?: boolean;
    /** Layout algorithm to use */
    layout?: string;
    /** Initial node data */
    nodes?: NodeData[];
    /** Initial edge data */
    edges?: EdgeData[];
}

/**
 * Simplified node data for test setup
 */
export interface NodeData {
    id: string | number;
    label?: string;
    x?: number;
    y?: number;
    z?: number;
    [key: string]: unknown;
}

/**
 * Simplified edge data for test setup
 */
export interface EdgeData {
    src: string | number;
    dst: string | number;
    [key: string]: unknown;
}

/**
 * Camera state snapshot for comparison
 */
export interface CameraState {
    /** Current view mode */
    mode: "2d" | "3d";
    /** Camera position in world space */
    position: {x: number, y: number, z: number};
    /** Alpha angle (horizontal orbit) - 3D mode only */
    alpha?: number;
    /** Beta angle (vertical tilt) - 3D mode only */
    beta?: number;
    /** Distance from target - 3D mode only */
    radius?: number;
    /** Orthographic zoom range - 2D mode only */
    orthoRange?: number;
}

/**
 * Screen coordinates returned by node position helpers
 */
export interface ScreenPosition {
    x: number;
    y: number;
}

/**
 * 3D vector for positions and rotations
 */
export interface Vector3D {
    x: number;
    y: number;
    z: number;
}

/**
 * Delta for drag operations
 */
export interface DragDelta {
    dx: number;
    dy: number;
}

/**
 * Mock XR hand configuration
 */
export interface MockHand {
    handedness: "left" | "right";
    joints: Map<string, Vector3D>;
    pinchStrength: number;
}

/**
 * Mock XR controller configuration
 */
export interface MockController {
    handedness: "left" | "right";
    position: Vector3D;
    rotation: Vector3D;
    thumbstick: {x: number, y: number};
    trigger: {value: number, pressed: boolean};
    grip: {value: number, pressed: boolean};
}
