import "../index.ts";

import type {Decorator, Meta, StoryObj} from "@storybook/web-components-vite";

import {StyleTemplate, VIEW_MODE_VALUES, type ViewMode} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData} from "./helpers";

// Track WebXR availability to avoid repeated checks
let vrSupported: boolean | null = null;
let arSupported: boolean | null = null;

/**
 * Decorator that alerts when AR/VR mode is selected but WebXR isn't available
 */
const xrAvailabilityDecorator: Decorator = (story, context) => {
    const viewMode = context.args.viewMode as ViewMode;

    // Check XR availability after a short delay to ensure component is ready
    setTimeout(() => {
        void (async() => {
            const graphEl = document.querySelector("graphty-element");
            if (!(graphEl instanceof Graphty)) {
                return;
            }

            // Cache the WebXR support checks
            if (vrSupported === null) {
                try {
                    vrSupported = await graphEl.isVRSupported();
                } catch {
                    vrSupported = false;
                }
            }

            if (arSupported === null) {
                try {
                    arSupported = await graphEl.isARSupported();
                } catch {
                    arSupported = false;
                }
            }

            // Alert if VR selected but not available
            if (viewMode === "vr" && !vrSupported) {
                alert("VR Mode Unavailable\n\nWebXR VR is not supported on this device/browser. The view will fall back to 3D mode.\n\nTo use VR mode, you need:\n- A WebXR-compatible browser (Chrome, Edge, Firefox)\n- A VR headset connected\n- HTTPS connection");
            }

            // Alert if AR selected but not available
            if (viewMode === "ar" && !arSupported) {
                alert("AR Mode Unavailable\n\nWebXR AR is not supported on this device/browser. The view will fall back to 3D mode.\n\nTo use AR mode, you need:\n- A WebXR-compatible browser\n- An AR-capable device (smartphone/tablet with ARCore/ARKit)\n- HTTPS connection");
            }
        })();
    }, 500);

    return story();
};

const meta: Meta = {
    title: "ViewMode",
    component: "graphty-element",
    decorators: [eventWaitingDecorator, xrAvailabilityDecorator],
    argTypes: {
        viewMode: {
            control: {type: "select"},
            options: VIEW_MODE_VALUES,
            description: "The rendering mode for the graph visualization",
            table: {
                defaultValue: {summary: "3d"},
            },
        },
    },
    parameters: {
        // Only show viewMode control, hide all other controls
        controls: {include: ["viewMode"]},
    },
    args: {
        nodeData,
        edgeData,
        viewMode: "3d" as ViewMode,
    },
};
export default meta;

type Story = StoryObj<Graphty & {viewMode: ViewMode}>;

/**
 * Interactive demo for switching between view modes (2D, 3D, AR, VR).
 *
 * ViewMode determines the rendering dimension and camera system:
 * - **2D**: Orthographic camera with pan/zoom controls, Z-axis locked to 0
 * - **3D**: Perspective camera with orbit controls, full 3D rendering
 * - **AR**: Augmented reality mode (requires WebXR AR support)
 * - **VR**: Virtual reality mode (requires WebXR VR support)
 *
 * Use the Storybook controls panel to switch between modes.
 * AR/VR modes require compatible hardware and browser support.
 */
export const SwitchViewModes: Story = {
    name: "Switch View Modes",
    args: {
        viewMode: "3d",
        layoutConfig: {
            seed: 42,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 2000,
                },
            },
        }),
    },
    render: (args) => {
        const graphEl = document.createElement("graphty-element") as Graphty;
        graphEl.id = "graph-viewmode";
        graphEl.style.cssText = "width: 100%; height: 100%; display: block;";
        graphEl.nodeData = args.nodeData;
        graphEl.edgeData = args.edgeData;
        graphEl.layoutConfig = args.layoutConfig;
        graphEl.styleTemplate = args.styleTemplate;
        graphEl.viewMode = args.viewMode;

        return graphEl;
    },
};

