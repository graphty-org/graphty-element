import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../../src/graphty-element";
import {eventWaitingDecorator, remoteLoggingDecorator, renderFn} from "../helpers";

const meta: Meta = {
    title: "XR",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator, remoteLoggingDecorator],
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
 * XR Example - Advanced Gestures and Two-Hand Interactions
 *
 * Demonstrates XR gestures for manipulating the graph:
 * - Two-hand pinch zoom: Pinch with both hands and move them closer/farther to zoom
 * - Two-hand twist rotation: Pinch with both hands and rotate them to spin the graph
 * - Thumbstick pan: Use controller thumbsticks to translate the graph
 * - Single-hand squeeze drag: Grab individual nodes (10x Z-axis amplification)
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
export const Default: Story = {
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
            ui: {enabled: true, position: "bottom-right", showAvailabilityWarning: true},
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
