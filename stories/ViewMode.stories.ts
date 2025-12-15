/* eslint-disable no-console */

import "../index.ts";

import type {DecoratorFunction} from "@storybook/csf";
import type {Meta, StoryObj, WebComponentsRenderer} from "@storybook/web-components-vite";
import {html} from "lit";

import type {ViewMode} from "../src/config";
import {StyleTemplate, VIEW_MODE_VALUES} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData} from "./helpers";

// Track WebXR availability to avoid repeated checks
let vrSupported: boolean | null = null;
let arSupported: boolean | null = null;

/**
 * Decorator that alerts when AR/VR mode is selected but WebXR isn't available
 */
const xrAvailabilityDecorator: DecoratorFunction<WebComponentsRenderer> = (story, context) => {
    const viewMode = context.args.viewMode as ViewMode;

    // Check XR availability after a short delay to ensure component is ready
    setTimeout(async() => {
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
            // eslint-disable-next-line no-alert
            alert("VR Mode Unavailable\n\nWebXR VR is not supported on this device/browser. The view will fall back to 3D mode.\n\nTo use VR mode, you need:\n- A WebXR-compatible browser (Chrome, Edge, Firefox)\n- A VR headset connected\n- HTTPS connection");
        }

        // Alert if AR selected but not available
        if (viewMode === "ar" && !arSupported) {
            // eslint-disable-next-line no-alert
            alert("AR Mode Unavailable\n\nWebXR AR is not supported on this device/browser. The view will fall back to 3D mode.\n\nTo use AR mode, you need:\n- A WebXR-compatible browser\n- An AR-capable device (smartphone/tablet with ARCore/ARKit)\n- HTTPS connection");
        }
    }, 500);

    return story();
};

const meta: Meta = {
    title: "ViewMode",
    tags: ["autodocs"],
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
        // Use plain DOM creation to avoid Lit template re-render issues
        // when graphty-element's viewMode changes trigger internal state updates
        const container = document.createElement("div");
        container.style.cssText = "display: flex; flex-direction: column; gap: 16px; height: 100vh;";

        const graphContainer = document.createElement("div");
        graphContainer.style.cssText = "flex: 1; min-height: 0;";

        const graphEl = document.createElement("graphty-element") as Graphty;
        graphEl.id = "graph-viewmode";
        graphEl.style.cssText = "width: 100%; height: 100%; display: block;";
        graphEl.nodeData = args.nodeData;
        graphEl.edgeData = args.edgeData;
        graphEl.layoutConfig = args.layoutConfig;
        graphEl.styleTemplate = args.styleTemplate;
        graphEl.viewMode = args.viewMode;

        graphContainer.appendChild(graphEl);
        container.appendChild(graphContainer);

        const infoPanel = document.createElement("div");
        infoPanel.style.cssText = "padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;";
        infoPanel.innerHTML = `
            <h3 style="margin-top: 0; margin-bottom: 12px;">View Mode: <span id="current-mode-display">${args.viewMode?.toUpperCase() ?? "3D"}</span></h3>

            <div id="xr-availability" style="margin-bottom: 16px; padding: 12px; background: #fff; border-radius: 4px; border: 1px solid #ddd;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>WebXR Availability:</strong>
                <span id="vr-status">Checking VR...</span> |
                <span id="ar-status">Checking AR...</span>
              </p>
            </div>

            <div style="background: #e9ecef; padding: 12px; border-radius: 4px; border: 1px solid #ddd;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
                <strong>View Mode Descriptions:</strong>
              </p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #666;">
                <li><strong>2D Mode:</strong> Orthographic camera, flat view with pan/zoom controls</li>
                <li><strong>3D Mode:</strong> Perspective camera with full orbit controls</li>
                <li><strong>AR Mode:</strong> Augmented reality overlay (requires WebXR AR support)</li>
                <li><strong>VR Mode:</strong> Full virtual reality immersion (requires WebXR VR support)</li>
              </ul>
            </div>
        `;
        container.appendChild(infoPanel);

        return container;
    },
    play: async({canvasElement}) => {
        // Wait for graph element to be available
        const graphEl = canvasElement.querySelector("#graph-viewmode");
        if (!(graphEl instanceof Graphty)) {
            return;
        }

        // Update current mode display
        const modeDisplay = canvasElement.querySelector("#current-mode-display");
        if (modeDisplay) {
            modeDisplay.textContent = graphEl.getViewMode().toUpperCase();
        }

        // Check WebXR availability and update status indicators
        const vrStatus = canvasElement.querySelector("#vr-status");
        const arStatus = canvasElement.querySelector("#ar-status");

        try {
            const vrSupported = await graphEl.isVRSupported();
            if (vrStatus) {
                vrStatus.textContent = vrSupported ? "✅ VR Available" : "❌ VR Not Available";
                (vrStatus as HTMLElement).style.color = vrSupported ? "#28a745" : "#dc3545";
            }
        } catch {
            if (vrStatus) {
                vrStatus.textContent = "❌ VR Check Failed";
                (vrStatus as HTMLElement).style.color = "#dc3545";
            }
        }

        try {
            const arSupported = await graphEl.isARSupported();
            if (arStatus) {
                arStatus.textContent = arSupported ? "✅ AR Available" : "❌ AR Not Available";
                (arStatus as HTMLElement).style.color = arSupported ? "#28a745" : "#dc3545";
            }
        } catch {
            if (arStatus) {
                arStatus.textContent = "❌ AR Check Failed";
                (arStatus as HTMLElement).style.color = "#dc3545";
            }
        }
    },
};

/**
 * Demonstrates the initial 2D view mode configuration.
 * This story starts in 2D mode by setting `viewMode: "2d"` in the style template.
 */
export const Initial2D: Story = {
    name: "Initial 2D Mode",
    args: {
        viewMode: "2d",
        layoutConfig: {
            seed: 42,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                viewMode: "2d",
                background: {backgroundType: "color", color: "#f0f0f0"},
            },
            behavior: {
                layout: {
                    preSteps: 2000,
                },
            },
        }),
    },
    render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px; height: 100vh;">
      <div style="flex: 1; min-height: 0;">
        <graphty-element
          id="graph-2d-initial"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
          .viewMode=${args.viewMode}
        ></graphty-element>
      </div>

      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">2D Mode (Initial Configuration)</h3>
        <p style="margin: 0; font-size: 14px; color: #666;">
          This graph started in 2D mode via the <code>viewMode: "2d"</code> configuration.
          The camera is orthographic and the layout operates in 2D space.
        </p>
      </div>
    </div>
  `,
};

/**
 * Demonstrates the initial 3D view mode configuration (default).
 * This story explicitly sets `viewMode: "3d"` to show the default behavior.
 */
export const Initial3D: Story = {
    name: "Initial 3D Mode",
    args: {
        viewMode: "3d",
        layoutConfig: {
            seed: 42,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                viewMode: "3d",
            },
            behavior: {
                layout: {
                    preSteps: 2000,
                },
            },
        }),
    },
    render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px; height: 100vh;">
      <div style="flex: 1; min-height: 0;">
        <graphty-element
          id="graph-3d-initial"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
          .viewMode=${args.viewMode}
        ></graphty-element>
      </div>

      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">3D Mode (Default)</h3>
        <p style="margin: 0; font-size: 14px; color: #666;">
          This graph is in 3D mode (the default). The camera uses perspective projection
          and the layout operates in 3D space. Use orbit controls to rotate the view.
        </p>
      </div>
    </div>
  `,
};
