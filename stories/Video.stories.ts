/* eslint-disable no-console */

import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html} from "lit";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData} from "./helpers";

const meta: Meta = {
    title: "Video",
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

export const StationaryCamera: Story = {
    name: "Phase 7: Video - Stationary Camera",
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
                    id="graph-video"
                    style="width: 100%; height: 100%; display: block;"
                    .nodeData=${args.nodeData}
                    .edgeData=${args.edgeData}
                    .styleTemplate=${args.styleTemplate}
                    .layoutConfig=${args.layoutConfig}
                ></graphty-element>
            </div>

            <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
                <h3 style="margin: 0 0 12px 0;">Phase 7: Video Capture - Stationary Camera</h3>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Starting 5-second video capture at 30fps...");
                            const result = await el.captureAnimation({
                                duration: 5000,
                                fps: 30,
                                format: "auto", // Auto-detects WebM (Chrome/Firefox) or MP4 (Safari/iOS)
                                cameraMode: "stationary",
                                download: true,
                                downloadFilename: "layout-settling", // Extension auto-added based on detected format
                            });
                            console.log("Video captured:", result.metadata);
                            console.log("Format used:", result.metadata.format);
                            console.log("Frames captured:", result.metadata.framesCaptured);
                            console.log("Frames dropped:", result.metadata.framesDropped);
                            console.log("Drop rate:", `${result.metadata.dropRate}%`);

                            // Store for E2E testing
                            (window as Window & {lastVideoResult?: typeof result}).lastVideoResult = result;
                        }}
                        style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        🎥 Capture 5s Video (30fps)
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Starting 3-second video capture at 60fps...");
                            const result = await el.captureAnimation({
                                duration: 3000,
                                fps: 60,
                                format: "auto", // Auto-detects WebM (Chrome/Firefox) or MP4 (Safari/iOS)
                                cameraMode: "stationary",
                                download: true,
                                downloadFilename: "high-fps-video", // Extension auto-added based on detected format
                            });
                            console.log("Video captured:", result.metadata);
                            console.log("Format used:", result.metadata.format);
                        }}
                        style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        🎥 Capture 3s Video (60fps)
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Estimating 4K @ 60fps...");
                            const estimate = await el.estimateAnimationCapture({
                                duration: 5000,
                                fps: 60,
                                width: 3840,
                                height: 2160,
                            });

                            const estimatedSizeMB = estimate.estimatedFileSize ? (estimate.estimatedFileSize / 1024 / 1024).toFixed(1) : "N/A";
                            const message = estimate.likelyToDropFrames ?
                                `⚠️ Warning: May drop frames\\n\\nRecommended settings:\\n- Resolution: ${estimate.recommendedResolution}\\n- FPS: ${estimate.recommendedFps}\\n\\nTotal frames: ${estimate.totalFrames}\\nEstimated size: ${estimatedSizeMB}MB` :
                                `✅ Settings should work fine!\\n\\nTotal frames: ${estimate.totalFrames}\\nEstimated size: ${estimatedSizeMB}MB`;

                            alert(message);
                            console.log("Estimation result:", estimate);
                        }}
                        style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        📊 Estimate 4K @ 60fps
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Estimating 1080p @ 30fps...");
                            const estimate = await el.estimateAnimationCapture({
                                duration: 5000,
                                fps: 30,
                                width: 1920,
                                height: 1080,
                            });

                            const estimatedSizeMB = estimate.estimatedFileSize ? (estimate.estimatedFileSize / 1024 / 1024).toFixed(1) : "N/A";
                            const message = estimate.likelyToDropFrames ?
                                "⚠️ Warning: May drop frames" :
                                `✅ Settings should work fine!\\n\\nTotal frames: ${estimate.totalFrames}\\nEstimated size: ${estimatedSizeMB}MB`;

                            alert(message);
                            console.log("Estimation result:", estimate);
                        }}
                        style="padding: 8px 16px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        📊 Estimate 1080p @ 30fps
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            // Trigger a layout change for dynamic capture
                            el.layout = "ngraph";

                            console.log("Capturing layout settling animation...");
                            const result = await el.captureAnimation({
                                duration: 5000,
                                fps: 30,
                                format: "auto", // Auto-detects WebM (Chrome/Firefox) or MP4 (Safari/iOS)
                                cameraMode: "stationary",
                                download: true,
                                downloadFilename: "layout-animation", // Extension auto-added based on detected format
                            });
                            console.log("Animation captured:", result.metadata);
                            console.log("Format used:", result.metadata.format);
                        }}
                        style="padding: 8px 16px; background: #E91E63; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        🔄 Capture Layout Animation
                    </button>
                </div>

                <div style="margin-top: 12px; padding: 8px; background: white; border-radius: 4px; font-size: 12px;">
                    <strong>Usage:</strong> Click any button to test video capture. Open browser console to see detailed output.
                    Videos will be automatically downloaded when captured.
                </div>
            </div>
        </div>
    `,
};

export const AnimatedCamera: Story = {
    name: "Phase 8: Video - Animated Camera",
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
                    id="graph-animated-video"
                    style="width: 100%; height: 100%; display: block;"
                    .nodeData=${args.nodeData}
                    .edgeData=${args.edgeData}
                    .styleTemplate=${args.styleTemplate}
                    .layoutConfig=${args.layoutConfig}
                ></graphty-element>
            </div>

            <div style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd;">
                <h3 style="margin: 0 0 12px 0;">Phase 8: Video Capture - Animated Camera Path</h3>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-animated-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Starting camera tour (orbit around graph)...");
                            const result = await el.captureAnimation({
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
                            console.log("Video captured:", result.metadata);
                            console.log("Format used:", result.metadata.format);
                        }}
                        style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        🎬 Camera Orbit Tour
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-animated-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Starting zoom in/out animation...");
                            const result = await el.captureAnimation({
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
                            console.log("Video captured:", result.metadata);
                        }}
                        style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        🔎 Zoom In/Out
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-animated-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Starting flythrough animation...");
                            const result = await el.captureAnimation({
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
                            console.log("Video captured:", result.metadata);
                        }}
                        style="padding: 8px 16px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        ✈️ Flythrough
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-animated-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Starting bird's eye view animation...");
                            const result = await el.captureAnimation({
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
                                downloadFilename: "birds-eye-view",
                            });
                            console.log("Video captured:", result.metadata);
                        }}
                        style="padding: 8px 16px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        🦅 Bird's Eye View
                    </button>

                    <button
                        @click=${async() => {
                            const el = document.querySelector("#graph-animated-video");
                            if (!(el instanceof Graphty)) {
                                return;
                            }

                            console.log("Starting dramatic reveal animation...");
                            const result = await el.captureAnimation({
                                duration: 8000,
                                fps: 30,
                                format: "auto",
                                cameraMode: "animated",
                                cameraPath: [
                                    {position: {x: 5, y: 2, z: 5}, target: {x: 0, y: 0, z: 0}},
                                    {position: {x: 10, y: 5, z: 10}, target: {x: 0, y: 0, z: 0}, duration: 2000},
                                    {position: {x: 20, y: 15, z: 20}, target: {x: 0, y: 0, z: 0}, duration: 3000},
                                    {position: {x: 25, y: 25, z: 25}, target: {x: 0, y: 0, z: 0}, duration: 3000},
                                ],
                                easing: "easeIn",
                                download: true,
                                downloadFilename: "dramatic-reveal",
                            });
                            console.log("Video captured:", result.metadata);
                        }}
                        style="padding: 8px 16px; background: #E91E63; color: white; border: none; border-radius: 4px; cursor: pointer;"
                    >
                        🎭 Dramatic Reveal
                    </button>
                </div>

                <div style="margin-top: 12px; padding: 8px; background: white; border-radius: 4px; font-size: 12px;">
                    <strong>Usage:</strong> Click any button to capture video with animated camera path.
                    The camera will move through predefined waypoints while recording.
                    <br><br>
                    <strong>Options:</strong>
                    <ul style="margin: 4px 0; padding-left: 20px;">
                        <li><strong>Camera Orbit Tour:</strong> Camera orbits around the graph</li>
                        <li><strong>Zoom In/Out:</strong> Smooth zoom in then out</li>
                        <li><strong>Flythrough:</strong> Linear movement through the scene</li>
                        <li><strong>Bird's Eye View:</strong> Looking down from above</li>
                        <li><strong>Dramatic Reveal:</strong> Close-up that pulls back dramatically</li>
                    </ul>
                </div>
            </div>
        </div>
    `,
};
