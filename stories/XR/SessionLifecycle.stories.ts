import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../../src/graphty-element";
import {eventWaitingDecorator, renderFn} from "../helpers";

const meta: Meta = {
    title: "XR/Session Lifecycle",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    parameters: {
        layout: "fullscreen",
        chromatic: {
            delay: 500,
        },
    },
    args: {
        nodeData: [
            {id: "1", label: "Node 1"},
            {id: "2", label: "Node 2"},
            {id: "3", label: "Node 3"},
            {id: "4", label: "Node 4"},
            {id: "5", label: "Node 5"},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
            {src: "3", dst: "4"},
            {src: "4", dst: "5"},
            {src: "5", dst: "1"},
        ],
        layout: "ngraph",
        layoutConfig: {seed: 42},
    },
};

export default meta;

type Story = StoryObj<Graphty>;

/**
 * Basic VR session with a simple graph
 * Click the VR button to enter VR mode
 */
export const BasicVRSession: Story = {
    args: {
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
        },
    },
};

/**
 * AR session with camera position transfer
 * Click the AR button to enter AR mode
 * Camera position should be preserved when entering AR
 */
export const ARSession: Story = {
    args: {
        nodeData: [
            {id: "1", label: "AR Node 1", x: 0, y: 0, z: 0},
            {id: "2", label: "AR Node 2", x: 1, y: 1, z: 0},
            {id: "3", label: "AR Node 3", x: -1, y: 1, z: 0},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "1", dst: "3"},
        ],
        layout: "fixed",
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            ar: {enabled: true},
        },
    },
};

/**
 * XR Unavailable message
 * This story shows what users see when WebXR is not supported
 * Note: On browsers with WebXR support, you'll see VR/AR buttons instead
 */
export const XRUnavailable: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Node 1"},
            {id: "2", label: "Node 2"},
        ],
        edgeData: [{src: "1", dst: "2"}],
        xr: {
            enabled: true,
            ui: {
                enabled: true,
                position: "bottom-left",
                unavailableMessageDuration: 10000,
            },
        },
    },
};

/**
 * Custom button positioning
 * Demonstrates XR buttons in different screen positions (top-right)
 */
export const TopRightPosition: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Node 1"},
            {id: "2", label: "Node 2"},
            {id: "3", label: "Node 3"},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
        ],
        xr: {
            enabled: true,
            ui: {enabled: true, position: "top-right"},
        },
    },
};

/**
 * VR Only mode
 * Only shows VR button, AR is disabled
 */
export const VROnly: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Node 1"},
            {id: "2", label: "Node 2"},
            {id: "3", label: "Node 3"},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
        ],
        xr: {
            enabled: true,
            ui: {enabled: true, position: "bottom-left"},
            vr: {enabled: true},
            ar: {enabled: false},
        },
    },
};

/**
 * Disabled XR
 * XR features are completely disabled - no XR buttons should be visible
 */
export const DisabledXR: Story = {
    args: {
        nodeData: [
            {id: "1", label: "Node 1"},
            {id: "2", label: "Node 2"},
            {id: "3", label: "Node 3"},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
        ],
        xr: {
            enabled: false,
        },
    },
};
