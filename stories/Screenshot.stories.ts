import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html} from "lit";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData, waitForGraphSettled} from "./helpers";

const meta: Meta = {
    title: "Screenshot",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        layout: "fullscreen",
    },
    args: {
        nodeData,
        edgeData,
    },
};
export default meta;

type Story = StoryObj<Graphty>;

/**
 * Capture screenshots of the graph in various formats and resolutions.
 */
export const Image: Story = {
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
                    id="graph-screenshot"
                    style="width: 100%; height: 100%; display: block;"
                    .nodeData=${args.nodeData}
                    .edgeData=${args.edgeData}
                    .layoutConfig=${args.layoutConfig}
                    .styleTemplate=${args.styleTemplate}
                ></graphty-element>
            </div>

            <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <span style="font-weight: 600; margin-right: 8px;">Download:</span>

                <button
                    @click=${async() => {
                        const el = document.querySelector("#graph-screenshot");
                        if (!(el instanceof Graphty)) {
                            return;
                        }

                        await el.captureScreenshot({
                            format: "png",
                            destination: {download: true},
                        });
                    }}
                    style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    PNG
                </button>

                <button
                    @click=${async() => {
                        const el = document.querySelector("#graph-screenshot");
                        if (!(el instanceof Graphty)) {
                            return;
                        }

                        await el.captureScreenshot({
                            format: "jpeg",
                            destination: {download: true},
                        });
                    }}
                    style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    JPEG
                </button>

                <button
                    @click=${async() => {
                        const el = document.querySelector("#graph-screenshot");
                        if (!(el instanceof Graphty)) {
                            return;
                        }

                        await el.captureScreenshot({
                            format: "webp",
                            destination: {download: true},
                        });
                    }}
                    style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    WebP
                </button>

                <span style="border-left: 1px solid #ccc; height: 24px; margin: 0 8px;"></span>

                <button
                    @click=${async() => {
                        const el = document.querySelector("#graph-screenshot");
                        if (!(el instanceof Graphty)) {
                            return;
                        }

                        await el.captureScreenshot({
                            multiplier: 2,
                            destination: {download: true},
                        });
                    }}
                    style="padding: 8px 16px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    2x Resolution
                </button>

                <button
                    @click=${async() => {
                        const el = document.querySelector("#graph-screenshot");
                        if (!(el instanceof Graphty)) {
                            return;
                        }

                        await el.captureScreenshot({
                            transparentBackground: true,
                            format: "png",
                            destination: {download: true},
                        });
                    }}
                    style="padding: 8px 16px; background: #20c997; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    Transparent
                </button>

                <span style="border-left: 1px solid #ccc; height: 24px; margin: 0 8px;"></span>

                <button
                    @click=${async() => {
                        const el = document.querySelector("#graph-screenshot");
                        if (!(el instanceof Graphty)) {
                            return;
                        }

                        const result = await el.captureScreenshot({
                            destination: {clipboard: true},
                        });

                        if (result.clipboardStatus === "success") {
                            alert("Screenshot copied to clipboard!");
                        } else {
                            alert(`Clipboard copy failed: ${result.clipboardStatus}`);
                        }
                    }}
                    style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
                >
                    Copy to Clipboard
                </button>
            </div>
        </div>
    `,
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

/**
 * Capture video recordings of the graph with stationary or animated camera paths.
 */
export const Video: Story = {
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
                    id="graph-video"
                    style="width: 100%; height: 100%; display: block;"
                    .nodeData=${args.nodeData}
                    .edgeData=${args.edgeData}
                    .styleTemplate=${args.styleTemplate}
                    .layoutConfig=${args.layoutConfig}
                ></graphty-element>
            </div>

            <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: 600; margin-right: 8px;">Stationary Camera:</span>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            await el.captureAnimation({
                                duration: 5000,
                                fps: 30,
                                format: "auto",
                                cameraMode: "stationary",
                                download: true,
                                downloadFilename: "graph-video",
                            });
                        }}
                        style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        5s @ 30fps
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            await el.captureAnimation({
                                duration: 3000,
                                fps: 60,
                                format: "auto",
                                cameraMode: "stationary",
                                download: true,
                                downloadFilename: "graph-video-60fps",
                            });
                        }}
                        style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        3s @ 60fps
                    </button>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                    <span style="font-weight: 600; margin-right: 8px;">Animated Camera:</span>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            await el.captureAnimation({
                                duration: 5000,
                                fps: 30,
                                format: "auto",
                                cameraMode: "animated",
                                cameraPath: [
                                    {position: {x: 20, y: 10, z: 20}, target: {x: 0, y: 0, z: 0}},
                                    {position: {x: -20, y: 10, z: 20}, target: {x: 0, y: 0, z: 0}, duration: 2500},
                                    {position: {x: -20, y: 10, z: -20}, target: {x: 0, y: 0, z: 0}, duration: 2500},
                                ],
                                easing: "easeInOut",
                                download: true,
                                downloadFilename: "camera-orbit",
                            });
                        }}
                        style="padding: 8px 16px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Orbit
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            await el.captureAnimation({
                                duration: 4000,
                                fps: 30,
                                format: "auto",
                                cameraMode: "animated",
                                cameraPath: [
                                    {position: {x: 30, y: 30, z: 30}, target: {x: 0, y: 0, z: 0}},
                                    {position: {x: 10, y: 10, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 2000},
                                    {position: {x: 30, y: 30, z: 30}, target: {x: 0, y: 0, z: 0}, duration: 2000},
                                ],
                                easing: "easeInOut",
                                download: true,
                                downloadFilename: "zoom-in-out",
                            });
                        }}
                        style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Zoom In/Out
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            await el.captureAnimation({
                                duration: 6000,
                                fps: 30,
                                format: "auto",
                                cameraMode: "animated",
                                cameraPath: [
                                    {position: {x: 40, y: 5, z: 0}, target: {x: 0, y: 0, z: 0}},
                                    {position: {x: 0, y: 5, z: 0}, target: {x: 0, y: 0, z: 0}, duration: 2000},
                                    {position: {x: -20, y: 5, z: 0}, target: {x: -40, y: 0, z: 0}, duration: 2000},
                                    {position: {x: -40, y: 20, z: 20}, target: {x: 0, y: 0, z: 0}, duration: 2000},
                                ],
                                easing: "linear",
                                download: true,
                                downloadFilename: "flythrough",
                            });
                        }}
                        style="padding: 8px 16px; background: #E91E63; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Flythrough
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            await el.captureAnimation({
                                duration: 5000,
                                fps: 30,
                                format: "auto",
                                cameraMode: "animated",
                                cameraPath: [
                                    {position: {x: 20, y: 40, z: 20}, target: {x: 0, y: 0, z: 0}},
                                    {position: {x: 0, y: 50, z: 0}, target: {x: 0, y: 0, z: 0}, duration: 2500},
                                    {position: {x: -20, y: 40, z: -20}, target: {x: 0, y: 0, z: 0}, duration: 2500},
                                ],
                                easing: "easeOut",
                                download: true,
                                downloadFilename: "birds-eye",
                            });
                        }}
                        style="padding: 8px 16px; background: #00BCD4; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        Bird's Eye
                    </button>
                </div>
            </div>
        </div>
    `,
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};
