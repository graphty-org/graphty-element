/* eslint-disable no-console */

import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html} from "lit";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData} from "./helpers";

const meta: Meta = {
    title: "Camera",
    tags: ["autodocs"],
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
    args: {
        nodeData,
        edgeData,
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const CameraState3D: Story = {
    name: "Phase 4: Camera State API (3D)",
    args: {
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
    render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px; height: 100vh;">
      <div style="flex: 1; min-height: 0;">
        <graphty-element
          id="graph-camera"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">3D Camera Controls</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.setCameraPosition({x: 50, y: 50, z: 50}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📹 Set 3D Position
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.setCameraTarget({x: 0, y: 0, z: 0}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🎯 Set 3D Target
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const state = el.getCameraState();
                console.log("Current camera state:", state);
                alert(`Camera State:\nPosition: (${state.position?.x.toFixed(2)}, ${state.position?.y.toFixed(2)}, ${state.position?.z.toFixed(2)})\nTarget: (${state.target?.x.toFixed(2)}, ${state.target?.y.toFixed(2)}, ${state.target?.z.toFixed(2)})`);
            }}
            style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📊 Log Camera State
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.resetCamera({animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🔄 Reset Camera
          </button>
        </div>

        <div style="background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #ddd;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Instructions:</strong> Use the buttons above to control the 3D camera.
            "Set 3D Position" moves the camera to a specific location.
            "Set 3D Target" changes what the camera is looking at.
            "Log Camera State" shows the current camera state.
            "Reset Camera" returns the camera to the default position.
          </p>
        </div>
      </div>
    </div>
  `,
};

export const CameraState2D: Story = {
    name: "Phase 4: Camera State API (2D)",
    args: {
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
          id="graph-camera-2d"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">2D Camera Controls</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera-2d");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.setCameraZoom(2.0, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🔍 Zoom In (2x)
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera-2d");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.setCameraZoom(0.5, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🔍 Zoom Out (0.5x)
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera-2d");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.setCameraPan({x: 50, y: 50}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📍 Pan to (50, 50)
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera-2d");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.setCameraPan({x: 0, y: 0}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;"
          >
            🎯 Pan to Origin
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera-2d");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const state = el.getCameraState();
                console.log("Current 2D camera state:", state);
                alert(`2D Camera State:\nZoom: ${state.zoom?.toFixed(2) ?? "N/A"}\nPan: (${state.pan?.x.toFixed(2) ?? "0"}, ${state.pan?.y.toFixed(2) ?? "0"})`);
            }}
            style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📊 Log Camera State
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-camera-2d");
                if (!(el instanceof Graphty)) {
                    return;
                }

                void el.resetCamera({animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🔄 Reset Camera
          </button>
        </div>

        <div style="background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #ddd;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Instructions:</strong> Use the buttons above to control the 2D camera.
            "Zoom In/Out" changes the camera zoom level.
            "Pan to" moves the camera viewport to different positions.
            "Log Camera State" shows the current 2D camera state (zoom and pan).
            "Reset Camera" returns the camera to the default view.
          </p>
        </div>
      </div>
    </div>
  `,
};

export const CameraPresets: Story = {
    name: "Phase 5: Camera Presets",
    args: {
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
    render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px; height: 100vh;">
      <div style="flex: 1; min-height: 0;">
        <graphty-element
          id="graph-presets"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">Built-in Presets</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <button
            @click=${async() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                await el.setCameraState({preset: "fitToGraph"}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📐 Fit to Graph
          </button>

          <button
            @click=${async() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                await el.setCameraState({preset: "topView"}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            ⬇️ Top View
          </button>

          <button
            @click=${async() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                await el.setCameraState({preset: "isometric"}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📊 Isometric
          </button>

          <button
            @click=${async() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                await el.setCameraState({preset: "sideView"}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            ↔️ Side View
          </button>

          <button
            @click=${async() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                await el.setCameraState({preset: "frontView"}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;"
          >
            🎬 Front View
          </button>
        </div>

        <h3 style="margin-top: 16px; margin-bottom: 12px;">User-Defined Presets</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <button
            @click=${() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                el.saveCameraPreset("myCustomView");
                console.log("Saved current camera as \"myCustomView\"");
                alert("Saved current camera position as \"myCustomView\"");
            }}
            style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            💾 Save Custom View
          </button>

          <button
            @click=${async() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                await el.setCameraPosition({x: 200, y: 200, z: 200}, {animate: true, duration: 1000});
            }}
            style="padding: 8px 16px; background: #6610f2; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            🚀 Move Camera
          </button>

          <button
            @click=${async() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                try {
                    await el.loadCameraPreset("myCustomView", {animate: true, duration: 1000});
                } catch (error) {
                    console.error("Failed to load preset:", error);
                    alert("Please save a custom view first by clicking 'Save Custom View'");
                }
            }}
            style="padding: 8px 16px; background: #20c997; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📂 Load Custom View
          </button>

          <button
            @click=${() => {
                const el = document.querySelector("#graph-presets");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const presets = el.getCameraPresets();
                console.log("All presets:", presets);
                const presetList = Object.keys(presets).join(", ");
                alert(`Available presets:\n${presetList}`);
            }}
            style="padding: 8px 16px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;"
          >
            📋 List All Presets
          </button>
        </div>

        <div style="background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #ddd;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Instructions:</strong> Use the built-in presets to quickly navigate to common views.
            Save your current camera position as a custom preset, then move the camera and load it back.
            Click "List All Presets" to see all available presets in the console.
          </p>
        </div>
      </div>
    </div>
  `,
};
