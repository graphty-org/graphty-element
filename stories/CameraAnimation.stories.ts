import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html} from "lit";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData} from "./helpers";

const meta: Meta = {
    title: "Camera/Animation",
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

export const Animation3D: Story = {
    name: "Phase 1: Camera Animation (3D)",
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
          id="graph-animation-3d"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">Camera Animation Controls (3D)</h3>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Duration:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 100, y: 50, z: 100}, {animate: true, duration: 300, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Fast (300ms)
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 50, y: 100, z: 50}, {animate: true, duration: 1000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Medium (1s)
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 150, y: 150, z: 150}, {animate: true, duration: 2000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Slow (2s)
            </button>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Easing:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 80, y: 80, z: 80}, {animate: true, duration: 1000, easing: "linear"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Linear
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 80, y: 80, z: 80}, {animate: true, duration: 1000, easing: "easeIn"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Ease In
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 80, y: 80, z: 80}, {animate: true, duration: 1000, easing: "easeOut"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Ease Out
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 80, y: 80, z: 80}, {animate: true, duration: 1000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Ease In/Out
            </button>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Presets:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 30, y: 30, z: 30}, {animate: true, duration: 1000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              📹 Close View
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 200, y: 200, z: 200}, {animate: true, duration: 1000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              📹 Far View
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPosition({x: 0, y: 100, z: 0}, {animate: true, duration: 1000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              📹 Top View
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-3d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.resetCamera({animate: true, duration: 1000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              🔄 Reset
            </button>
          </div>
        </div>

        <div style="background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #ddd;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Instructions:</strong> Try different animation durations and easing functions to see smooth camera transitions.
            Each button animates the camera with different settings. Watch how the camera smoothly transitions between positions!
          </p>
        </div>
      </div>
    </div>
  `,
};

export const Animation2D: Story = {
    name: "Phase 1: Camera Animation (2D)",
    args: {
        layoutConfig: {
            seed: 42,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                twoD: true,
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
          id="graph-animation-2d"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
        <h3 style="margin-top: 0; margin-bottom: 12px;">Camera Animation Controls (2D)</h3>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Zoom Animation:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    // Get current zoom and zoom in by 1.5x each time (no limit!)
                    const currentState = el.getCameraState();
                    const currentZoom = currentState.zoom ?? 1.0;
                    const newZoom = currentZoom * 1.5;
                    void el.setCameraZoom(newZoom, {animate: true, duration: 800, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              🔍 Zoom In (1.5x)
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    // Get current zoom and zoom out by 1.5x each time (no limit!)
                    const currentState = el.getCameraState();
                    const currentZoom = currentState.zoom ?? 1.0;
                    const newZoom = currentZoom / 1.5;
                    void el.setCameraZoom(newZoom, {animate: true, duration: 800, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              🔍 Zoom Out (1.5x)
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    // Reset both zoom and pan to initial state
                    void el.resetCamera({animate: true, duration: 800, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              🔄 Reset Camera
            </button>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Pan Animation:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPan({x: 50, y: 0}, {animate: true, duration: 600, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              ➡️ Pan Right
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPan({x: -50, y: 0}, {animate: true, duration: 600, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              ⬅️ Pan Left
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPan({x: 0, y: 50}, {animate: true, duration: 600, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              ⬆️ Pan Up
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPan({x: 0, y: -50}, {animate: true, duration: 600, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              ⬇️ Pan Down
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraPan({x: 0, y: 0}, {animate: true, duration: 600, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #ffc107; color: #000; border: none; border-radius: 4px; cursor: pointer;"
            >
              🎯 Reset Pan
            </button>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">Easing Comparison:</label>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraZoom(1.5, {animate: true, duration: 1000, easing: "linear"});
                }}
              style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Linear
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraZoom(1.5, {animate: true, duration: 1000, easing: "easeIn"});
                }}
              style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Ease In
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraZoom(1.5, {animate: true, duration: 1000, easing: "easeOut"});
                }}
              style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Ease Out
            </button>
            <button
              @click=${() => {
                    const el = document.querySelector("#graph-animation-2d");
                    if (!(el instanceof Graphty)) {
                        return;
                    }

                    void el.setCameraZoom(1.5, {animate: true, duration: 1000, easing: "easeInOut"});
                }}
              style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              Ease In/Out
            </button>
          </div>
        </div>

        <div style="background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #ddd;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Instructions:</strong> Try different zoom and pan animations with various easing functions.
            Notice how easeInOut provides the smoothest, most natural-looking transitions.
            The camera will smoothly animate to each new position!
          </p>
        </div>
      </div>
    </div>
  `,
};
