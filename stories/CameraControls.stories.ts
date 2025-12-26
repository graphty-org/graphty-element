import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html} from "lit";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData, waitForGraphSettled} from "./helpers";

const meta: Meta = {
    title: "Camera Controls",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        layout: "fullscreen",
    },
    argTypes: {
        duration: {
            control: {type: "range", min: 100, max: 3000, step: 100},
            description: "Animation duration in milliseconds",
        },
        easing: {
            control: {type: "select"},
            options: ["linear", "easeIn", "easeOut", "easeInOut"],
            description: "Animation easing function",
        },
    },
    args: {
        nodeData,
        edgeData,
        duration: 800,
        easing: "easeInOut",
    },
};
export default meta;

type Story = StoryObj<Graphty & {duration: number, easing: string}>;

/**
 * 3D camera controls with animated transitions.
 */
export const ThreeD: Story = {
    name: "3D",
    args: {
        layoutConfig: {seed: 42},
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {preSteps: 2000},
            },
        }),
    },
    render: (args) => html`
        <div style="display: flex; flex-direction: column; height: 100vh;">
            <div style="flex: 1; min-height: 0;">
                <graphty-element
                    id="graph-animation"
                    style="width: 100%; height: 100%; display: block;"
                    .nodeData=${args.nodeData}
                    .edgeData=${args.edgeData}
                    .layoutConfig=${args.layoutConfig}
                    .styleTemplate=${args.styleTemplate}
                ></graphty-element>
            </div>

            <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPosition(
                                {x: 30, y: 30, z: 30},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Close
                    </button>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPosition(
                                {x: 150, y: 150, z: 150},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Far
                    </button>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPosition(
                                {x: 0, y: 100, z: 0},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Top
                    </button>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPosition(
                                {x: 100, y: 0, z: 0},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Side
                    </button>

                    <span style="border-left: 1px solid #ccc; height: 24px; margin: 0 8px;"></span>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.resetCamera({animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"});
                        }}
                        style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    `,
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

/**
 * 2D camera with zoom and pan controls.
 */
export const TwoD: Story = {
    name: "2D",
    args: {
        layoutConfig: {seed: 42},
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                viewMode: "2d",
                background: {backgroundType: "color", color: "#f0f0f0"},
            },
            behavior: {
                layout: {preSteps: 2000},
            },
        }),
    },
    render: (args) => html`
        <div style="display: flex; flex-direction: column; height: 100vh;">
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
                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation-2d");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            const state = el.getCameraState();

                            void el.setCameraZoom(
                                (state.zoom ?? 1) * 1.5,
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Zoom In
                    </button>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation-2d");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            const state = el.getCameraState();

                            void el.setCameraZoom(
                                (state.zoom ?? 1) / 1.5,
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Zoom Out
                    </button>

                    <span style="border-left: 1px solid #ccc; height: 24px; margin: 0 8px;"></span>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation-2d");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPan(
                                {x: -50, y: 0},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Left
                    </button>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation-2d");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPan(
                                {x: 50, y: 0},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Right
                    </button>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation-2d");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPan(
                                {x: 0, y: 50},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Up
                    </button>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation-2d");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.setCameraPan(
                                {x: 0, y: -50},
                                {animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"},
                            );
                        }}
                        style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Down
                    </button>

                    <span style="border-left: 1px solid #ccc; height: 24px; margin: 0 8px;"></span>

                    <button
                        @click=${() => {
                            const el = document.querySelector("#graph-animation-2d");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            void el.resetCamera({animate: true, duration: args.duration, easing: args.easing as "linear" | "easeIn" | "easeOut" | "easeInOut"});
                        }}
                        style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    `,
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};
