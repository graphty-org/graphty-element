import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../../src/graphty-element";
import {eventWaitingDecorator, renderFn} from "../helpers";

const meta: Meta = {
    title: "XR/Interactions",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    parameters: {
        layout: "fullscreen",
        chromatic: {
            delay: 1000,
        },
    },
};

export default meta;

type Story = StoryObj<Graphty>;

/**
 * NodeBehavior in XR - Testing existing node behaviors work in XR mode
 *
 * This story verifies that existing NodeBehavior features work with XR inputs:
 * - Drag nodes with controller squeeze + movement
 * - Nodes pin automatically after dragging (default behavior)
 * - Point and trigger to select nodes
 * - Double-trigger for expansion (if fetchNodes configured)
 *
 * IMPORTANT: XR does NOT reimplement these behaviors.
 * It uses the existing SixDofDragBehavior and ActionManager from NodeBehavior.ts
 */
export const NodeBehaviorInXR: Story = {
    args: {
        nodeData: Array.from({length: 10}, (_, i) => ({
            id: `${i}`,
            label: `Node ${i}`,
        })),
        edgeData: Array.from({length: 9}, (_, i) => ({
            src: `${i}`,
            dst: `${i + 1}`,
        })),
        layout: "random",
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            input: {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: false,
            },
        },
    },
};

/**
 * Hand Tracking Interaction
 *
 * Tests hand tracking features:
 * - Pinch to select nodes
 * - Near interaction: Touch nodes with hands
 * - Hand tracking should trigger same NodeBehavior as controllers
 */
export const HandTrackingInteraction: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Center Node", position: {x: 0, y: 0, z: 0}},
            {id: "2", label: "North", position: {x: 0, y: 2, z: 0}},
            {id: "3", label: "East", position: {x: 2, y: 0, z: 0}},
            {id: "4", label: "South", position: {x: 0, y: -2, z: 0}},
            {id: "5", label: "West", position: {x: -2, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "1", dst: "3"},
            {src: "1", dst: "4"},
            {src: "1", dst: "5"},
        ],
        layout: "fixed",
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            input: {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: false,
            },
        },
    },
};

/**
 * Controller-Only Interaction
 *
 * Tests with hand tracking disabled, only controllers enabled
 */
export const ControllerOnlyInteraction: Story = {
    args: {
        nodeData: Array.from({length: 15}, (_, i) => ({
            id: `${i}`,
            label: `Node ${i}`,
        })),
        edgeData: Array.from({length: 14}, (_, i) => ({
            src: `${i}`,
            dst: `${i + 1}`,
        })),
        layout: "circular",
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            input: {
                handTracking: false,
                controllers: true,
                nearInteraction: false,
                physics: false,
            },
        },
    },
};

/**
 * Physics-Enabled Hand Joints
 *
 * Demonstrates physics-enabled hand joint meshes
 * Useful for advanced interactions in future
 */
export const PhysicsHandJoints: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Physics Node 1"},
            {id: "2", label: "Physics Node 2"},
            {id: "3", label: "Physics Node 3"},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
        ],
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
            dimensions: 3,
        },
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            input: {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: true, // Enable physics on hand joints
            },
        },
    },
};

/**
 * Large Graph Interaction Test
 *
 * Tests XR interactions with a larger graph to verify performance
 */
export const LargeGraphInteraction: Story = {
    args: {
        nodeData: Array.from({length: 50}, (_, i) => ({
            id: `${i}`,
            label: `Node ${i}`,
        })),
        edgeData: Array.from({length: 75}, () => {
            const src = `${Math.floor(Math.random() * 50)}`;
            const dst = `${Math.floor(Math.random() * 50)}`;
            return {src, dst};
        }),
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
            dimensions: 3,
            iterations: 100,
        },
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            input: {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: false,
            },
        },
    },
};

/**
 * 3D Force Layout with XR
 *
 * Demonstrates XR interactions with a 3D force-directed layout
 * Tests that dragging nodes updates the layout engine correctly
 */
export const ForceLayout3D: Story = {
    args: {
        nodeData: Array.from({length: 20}, (_, i) => ({
            id: `${i}`,
            label: `Node ${i}`,
        })),
        edgeData: Array.from({length: 30}, (_, i) => {
            const src = `${Math.floor(i / 2)}`;
            const dst = `${Math.floor(Math.random() * 20)}`;
            return {src, dst};
        }),
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
            dimensions: 3,
        },
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            input: {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: false,
            },
        },
    },
};

/**
 * VR Drag with Z-Axis Amplification (Phase 3)
 *
 * Demonstrates the new unified drag system with Z-axis amplification.
 * In VR mode, Z-axis movements are amplified by 10× by default to make
 * depth manipulation more practical.
 *
 * Instructions:
 * 1. Enter VR mode using the VR button
 * 2. Point controller at a node and squeeze to grab
 * 3. Move controller to drag (notice 10× Z-axis amplification)
 * 4. Release squeeze to drop (node will pin automatically)
 *
 * Configuration:
 * - zAxisAmplification: 10.0 (default, can be adjusted)
 * - X and Y axes are NOT amplified
 * - Works in both desktop (if enabled) and VR mode
 */
export const DragInVR: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Drag Me"},
            {id: "2", label: "Connected"},
        ],
        edgeData: [{src: "1", dst: "2"}],
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
            dimensions: 3,
        },
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-right"},
            input: {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: false,
                zAxisAmplification: 10.0,
                enableZAmplificationInDesktop: false,
            },
        },
    },
};

/**
 * Desktop Z-Axis Amplification Test
 *
 * Demonstrates Z-axis amplification enabled in desktop mode.
 * This is useful for testing the amplification feature without VR hardware.
 *
 * Instructions:
 * 1. Click and drag a node
 * 2. Notice that depth (Z) movements are amplified by 5×
 * 3. X and Y movements remain normal
 */
export const DesktopZAmplification: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Node 1", position: {x: -2, y: 0, z: 0}},
            {id: "2", label: "Node 2", position: {x: 0, y: 0, z: 0}},
            {id: "3", label: "Node 3", position: {x: 2, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
        ],
        layout: "fixed",
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-right"},
            input: {
                handTracking: false,
                controllers: false,
                nearInteraction: false,
                physics: false,
                zAxisAmplification: 5.0,
                enableZAmplificationInDesktop: true, // Enable in desktop mode
            },
        },
    },
};

/**
 * Advanced Gestures - Two-Hand Interactions (Phase 5)
 *
 * Demonstrates advanced XR gestures for manipulating the entire graph:
 * - Two-hand pinch zoom: Pinch with both hands and move them closer/farther to zoom
 * - Two-hand twist rotation: Pinch with both hands and rotate them to spin the graph
 * - Thumbstick pan: Use controller thumbsticks to translate the graph
 * - Single-hand squeeze drag: Grab individual nodes (10× Z-axis amplification)
 *
 * Instructions:
 * 1. Enter VR mode
 * 2. Use both hands to pinch (thumb + index finger together)
 * 3. Move hands closer together = zoom in
 * 4. Move hands farther apart = zoom out
 * 5. Twist both hands together = rotate graph
 * 6. Use thumbsticks on controllers to pan the view
 * 7. Squeeze individual nodes to drag them
 *
 * Configuration:
 * - handTracking: true (required for two-hand gestures)
 * - controllers: true (for thumbstick pan and drag)
 * - zAxisAmplification: 10.0 (for node dragging)
 */
export const AdvancedGestures: Story = {
    args: {
        nodeData: Array.from({length: 30}, (_, i) => ({
            id: `${i}`,
            label: `Node ${i}`,
        })),
        edgeData: Array.from({length: 45}, () => {
            const src = `${Math.floor(Math.random() * 30)}`;
            const dst = `${Math.floor(Math.random() * 30)}`;
            return {src, dst};
        }),
        layout: "ngraph",
        layoutConfig: {
            seed: 42,
            dimensions: 3,
            iterations: 150,
        },
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-right"},
            input: {
                handTracking: true, // Required for two-hand gestures
                controllers: true, // For thumbstick pan and squeeze drag
                nearInteraction: true,
                physics: false,
                zAxisAmplification: 10.0, // For node dragging
                enableZAmplificationInDesktop: false,
            },
        },
    },
};

/**
 * Gesture Testing - Small Graph (Phase 5)
 *
 * Simplified graph for testing gesture detection in isolation.
 * Useful for debugging gesture recognition without visual clutter.
 *
 * Test scenarios:
 * - Two-hand pinch zoom with 5 nodes
 * - Two-hand twist rotation
 * - Thumbstick pan
 * - Individual node drag with Z-axis amplification
 */
export const GestureTestingSmall: Story = {
    args: {
        nodeData: [
            {id: "center", label: "Center", position: {x: 0, y: 0, z: 0}},
            {id: "north", label: "North", position: {x: 0, y: 2, z: 0}},
            {id: "east", label: "East", position: {x: 2, y: 0, z: 0}},
            {id: "south", label: "South", position: {x: 0, y: -2, z: 0}},
            {id: "west", label: "West", position: {x: -2, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "center", dst: "north"},
            {src: "center", dst: "east"},
            {src: "center", dst: "south"},
            {src: "center", dst: "west"},
        ],
        layout: "fixed",
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-right"},
            input: {
                handTracking: true,
                controllers: true,
                nearInteraction: true,
                physics: false,
                zAxisAmplification: 10.0,
                enableZAmplificationInDesktop: false,
            },
        },
    },
};

/**
 * Controllers Only - No Hand Tracking (Phase 5)
 *
 * Tests gesture features with controllers only, no hand tracking.
 * Only thumbstick pan is available (two-hand gestures require hand tracking).
 *
 * Available interactions:
 * - Thumbstick pan (left/right controller)
 * - Squeeze to drag nodes (10× Z-axis amplification)
 * - No two-hand gestures (requires hand tracking)
 */
export const ControllersOnlyGestures: Story = {
    args: {
        nodeData: Array.from({length: 20}, (_, i) => ({
            id: `${i}`,
            label: `Node ${i}`,
        })),
        edgeData: Array.from({length: 25}, (_, i) => {
            const src = `${Math.floor(i / 2)}`;
            const dst = `${Math.floor(Math.random() * 20)}`;
            return {src, dst};
        }),
        layout: "circular",
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-right"},
            input: {
                handTracking: false, // Disable hand tracking
                controllers: true, // Controllers for thumbstick pan and drag
                nearInteraction: false,
                physics: false,
                zAxisAmplification: 10.0,
                enableZAmplificationInDesktop: false,
            },
        },
    },
};
