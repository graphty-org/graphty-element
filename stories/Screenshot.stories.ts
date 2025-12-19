import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import isChromatic from "chromatic/isChromatic";
import {html} from "lit";

import {StyleTemplate} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {edgeData, eventWaitingDecorator, nodeData, waitForGraphSettled} from "./helpers";

const meta: Meta = {
    title: "Screenshot",
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

export const BasicScreenshot: Story = {
    name: "Phase 1: Basic Screenshot",
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
          id="graph-screenshot"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div
        style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 8px; flex-wrap: wrap;"
      >
        <button
          @click=${async() => {
                const el = document.querySelector("#graph-screenshot");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    destination: {download: true},
                });
                // PNG Screenshot captured: result.metadata
                void result;
            }}
          style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Download PNG Screenshot
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-screenshot");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    format: "jpeg",
                    destination: {download: true},
                });
                void result;
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Download JPEG Screenshot
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-screenshot");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    format: "webp",
                    destination: {download: true},
                });
                void result;
            }}
          style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Download WebP Screenshot
        </button>

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
          📋 Copy to Clipboard
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-screenshot");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    multiplier: 2,
                    destination: {download: true},
                });
                void result;
            }}
          style="padding: 8px 16px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 2x Resolution (Double)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-screenshot");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    width: 1920,
                    height: 1080,
                    destination: {download: true},
                });
                void result;
            }}
          style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 1920x1080 (Full HD)
        </button>

        <div style="flex-basis: 100%; padding: 8px; background: #fff; border-radius: 4px;">
          <strong>Console Output:</strong> Check the browser console for detailed metadata about
          each screenshot capture.
        </div>
      </div>
    </div>
  `,
};

export const AdvancedOptions: Story = {
    name: "Phase 2: Advanced Options",
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
          id="graph-advanced"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div
        style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 8px; flex-wrap: wrap;"
      >
        <button
          @click=${async() => {
                const el = document.querySelector("#graph-advanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    multiplier: 2,
                    destination: {download: true},
                    downloadFilename: "graph-2x.png",
                });
                void result;
            }}
          style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 2x Resolution
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-advanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    transparentBackground: true,
                    format: "png",
                    destination: {download: true},
                    downloadFilename: "graph-transparent.png",
                });
                void result;
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Transparent PNG
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-advanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    preset: "print",
                    downloadFilename: "graph-print.png",
                });
                void result;
            }}
          style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Print Quality (4x)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-advanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    preset: "thumbnail",
                    downloadFilename: "graph-thumb.jpg",
                });
                void result;
            }}
          style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Thumbnail (400×300)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-advanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    preset: "web-share",
                });
                if (result.clipboardStatus === "success") {
                    alert("Screenshot copied to clipboard!");
                } else {
                    alert(`Clipboard copy failed: ${result.clipboardStatus}`);
                }
            }}
          style="padding: 8px 16px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📋 Web Share (2x + Clipboard)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-advanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    preset: "documentation",
                    downloadFilename: "graph-docs.png",
                });
                void result;
            }}
          style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Documentation (Transparent 2x)
        </button>

        <div style="flex-basis: 100%; padding: 8px; background: #fff; border-radius: 4px;">
          <strong>Phase 2 Features:</strong>
          <ul style="margin: 4px 0; padding-left: 20px;">
            <li><strong>Presets:</strong> Pre-configured options for common use cases</li>
            <li><strong>Transparent Background:</strong> Remove skybox and environment for PNGs</li>
            <li><strong>Resolution Control:</strong> Use multipliers or explicit dimensions</li>
            <li><strong>Format Support:</strong> PNG, JPEG, WebP with quality control</li>
          </ul>
        </div>
      </div>
    </div>
  `,
};

export const TimingControl: Story = {
    name: "Phase 3: Timing Control",
    args: {
        layoutConfig: {
            seed: 42,
        },
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            behavior: {
                layout: {
                    preSteps: 0, // Start unsettled for timing demo
                },
            },
        }),
    },
    render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px; height: 100vh;">
      <div style="flex: 1; min-height: 0;">
        <graphty-element
          id="graph-timing"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div
        style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 8px; flex-wrap: wrap;"
      >
        <button
          @click=${() => {
                const el = document.querySelector("#graph-timing");
                if (!(el instanceof Graphty)) {
                    return;
                }

                el.layout = "ngraph"; // Start physics simulation
            }}
          style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          🎬 Start Force Layout
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-timing");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    timing: {waitForSettle: true}, // Wait for layout
                    destination: {download: true},
                    downloadFilename: "graph-settled.png",
                });
                (window as Window & {lastScreenshotResult?: unknown}).lastScreenshotResult = result;
            }}
          style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Capture After Settled
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-timing");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    timing: {
                        waitForSettle: false,
                        waitForOperations: false,
                    },
                    destination: {download: true},
                    downloadFilename: "graph-immediate.png",
                });
                (window as Window & {lastScreenshotResult?: unknown}).lastScreenshotResult = result;
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Capture Immediately
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-timing");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    camera: {
                        position: {x: 50, y: 50, z: 50},
                        target: {x: 0, y: 0, z: 0},
                    },
                    destination: {download: true},
                    downloadFilename: "graph-custom-camera.png",
                    timing: {
                        waitForSettle: false,
                        waitForOperations: false,
                    },
                });
                (window as Window & {lastScreenshotResult?: unknown}).lastScreenshotResult = result;
            }}
          style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Custom Camera Position
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-timing");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const result = await el.captureScreenshot({
                    camera: {preset: "fitToGraph"},
                    destination: {download: true},
                    downloadFilename: "graph-fit.png",
                    timing: {
                        waitForSettle: false,
                        waitForOperations: false,
                    },
                });
                (window as Window & {lastScreenshotResult?: unknown}).lastScreenshotResult = result;
            }}
          style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Camera Preset (fitToGraph)
        </button>

        <div style="flex-basis: 100%; padding: 8px; background: #fff; border-radius: 4px;">
          <strong>Phase 3 Features:</strong>
          <ul style="margin: 4px 0; padding-left: 20px;">
            <li>
              <strong>Layout Settling:</strong> Wait for physics-based layouts to settle before
              capturing
            </li>
            <li><strong>Operation Queue:</strong> Screenshots execute sequentially and safely</li>
            <li>
              <strong>Camera Override:</strong> Temporarily change camera for screenshot, then
              restore
            </li>
            <li><strong>Camera Presets:</strong> Use preset camera positions like "fitToGraph"</li>
            <li>
              <strong>Timing Control:</strong> Choose whether to wait for operations/settling or
              capture immediately
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
};

/* eslint-disable no-console */

// Generate large dataset for Phase 3 testing (100 nodes, 500 edges)
// This creates a complex graph that takes time to settle with physics layouts
const generateLargeGraph = (): {nodes: {id: number, group: number}[], edges: {src: number, dst: number}[]} => {
    const nodes: {id: number, group: number}[] = [];
    const edges: {src: number, dst: number}[] = [];

    // Generate 100 nodes with 10 groups
    for (let i = 0; i < 100; i++) {
        nodes.push({
            id: i,
            group: i % 10,
        });
    }

    // Generate 500 edges with random connections
    // Use a seeded random for reproducibility
    let seed = 42;
    const seededRandom = (): number => {
        seed = ((seed * 9301) + 49297) % 233280;
        return seed / 233280;
    };

    for (let i = 0; i < 500; i++) {
        const src = Math.floor(seededRandom() * 100);
        const dst = Math.floor(seededRandom() * 100);
        // Avoid self-loops
        if (src !== dst) {
            edges.push({src, dst});
        }
    }

    return {nodes, edges};
};

const largeGraphData = generateLargeGraph();

export const Phase3InteractiveTests: Story = {
    name: "Phase 3: Timing & Queue Tests",
    parameters: {
        // Disable Chromatic snapshot for this interactive test story
        // The play function tests timing features that exceed Chromatic's 15-second interaction timeout
        chromatic: {disableSnapshot: true},
    },
    args: {
        nodeData: largeGraphData.nodes,
        edgeData: largeGraphData.edges,
        styleTemplate: StyleTemplate.parse({
            graphtyTemplate: true,
            majorVersion: "1",
            graph: {
                layout: "ngraph",
                layoutOptions: {
                    dim: 3,
                    seed: 42,
                },
            },
            behavior: {
                layout: {
                    // Use preSteps in Chromatic for consistent snapshots, 0 for interactive testing
                    preSteps: isChromatic() ? 20000 : 0,
                },
            },
        }),
    },
    render: (args) => html`
    <div style="display: flex; flex-direction: column; gap: 16px; height: 100vh;">
      <div style="flex: 1; min-height: 0;">
        <graphty-element
          id="graph-phase3"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div
        style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 8px; flex-wrap: wrap;"
      >
        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase3");
                if (!(el instanceof Graphty)) {
                    return;
                }

                console.log("⏱️ Screenshot WITH waitForSettle (will wait for physics)");
                const start = Date.now();

                const result = await el.captureScreenshot({
                    timing: {waitForSettle: true, waitForOperations: false},
                    destination: {download: true},
                    downloadFilename: "phase3-with-wait.png",
                });

                console.log(`✓ Completed in ${Date.now() - start}ms, downloaded: ${result.downloaded}`);
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ⏱️ WITH waitForSettle
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase3");
                if (!(el instanceof Graphty)) {
                    return;
                }

                console.log("⚡ Screenshot WITHOUT waitForSettle (immediate)");
                const start = Date.now();

                const result = await el.captureScreenshot({
                    timing: {waitForSettle: false, waitForOperations: false},
                    destination: {download: true},
                    downloadFilename: "phase3-without-wait.png",
                });

                console.log(`✓ Completed in ${Date.now() - start}ms, downloaded: ${result.downloaded}`);
            }}
          style="padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;"
        >
          ⚡ WITHOUT waitForSettle
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase3");
                if (!(el instanceof Graphty)) {
                    return;
                }

                console.log("📷 Testing camera override and restore...");
                const before = el.graph.getCameraState();
                console.log(`Camera BEFORE: (${before.position?.x.toFixed(1)}, ${before.position?.y.toFixed(1)}, ${before.position?.z.toFixed(1)})`);

                await el.captureScreenshot({
                    camera: {
                        position: {x: 100, y: 100, z: 100},
                        target: {x: 0, y: 0, z: 0},
                    },
                    timing: {waitForSettle: false, waitForOperations: false},
                    destination: {download: true},
                    downloadFilename: "phase3-camera-override.png",
                });

                const after = el.graph.getCameraState();
                console.log(`Camera AFTER: (${after.position?.x.toFixed(1)}, ${after.position?.y.toFixed(1)}, ${after.position?.z.toFixed(1)})`);

                const restored =
                    Math.abs((before.position?.x ?? 0) - (after.position?.x ?? 0)) < 0.1 &&
                    Math.abs((before.position?.y ?? 0) - (after.position?.y ?? 0)) < 0.1 &&
                    Math.abs((before.position?.z ?? 0) - (after.position?.z ?? 0)) < 0.1;

                console.log(restored ? "✓ Camera RESTORED" : "✗ Camera NOT restored!");
            }}
          style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📷 Camera Override Test
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase3");
                if (!(el instanceof Graphty)) {
                    return;
                }

                console.log("🔥 Firing 3 screenshots sequentially...");

                const p1 = el.captureScreenshot({
                    timing: {waitForSettle: false, waitForOperations: false},
                    destination: {download: true},
                    downloadFilename: "phase3-seq-1.png",
                }).then(() => {
                    console.log("✓ Screenshot #1");
                });

                const p2 = el.captureScreenshot({
                    timing: {waitForSettle: false, waitForOperations: false},
                    destination: {download: true},
                    downloadFilename: "phase3-seq-2.png",
                }).then(() => {
                    console.log("✓ Screenshot #2");
                });

                const p3 = el.captureScreenshot({
                    timing: {waitForSettle: false, waitForOperations: false},
                    destination: {download: true},
                    downloadFilename: "phase3-seq-3.png",
                }).then(() => {
                    console.log("✓ Screenshot #3");
                });

                await Promise.all([p1, p2, p3]);
                console.log("✓ All 3 completed");
            }}
          style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          🔥 Sequential Queue (3x)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase3");
                if (!(el instanceof Graphty)) {
                    return;
                }

                console.log("📋 Testing clipboard copy...");

                const result = await el.captureScreenshot({
                    timing: {waitForSettle: false, waitForOperations: false},
                    destination: {clipboard: true},
                });

                if (result.clipboardStatus === "success") {
                    console.log("✓ Clipboard copy succeeded");
                    alert("✓ Screenshot copied to clipboard!");
                } else {
                    console.error(`✗ Clipboard failed: ${result.clipboardStatus}`);
                    alert(`✗ Clipboard failed: ${result.clipboardStatus}`);
                }
            }}
          style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📋 Clipboard Copy
        </button>

        <div style="flex-basis: 100%; padding: 8px; background: #fff; border-radius: 4px;">
          <strong>Phase 3 Features (Check Console):</strong>
          <ul style="margin: 4px 0; padding-left: 20px;">
            <li><strong>waitForSettle:</strong> Compare timing WITH vs WITHOUT waiting</li>
            <li><strong>Camera Override:</strong> Verify camera position restores after screenshot</li>
            <li><strong>Sequential Queue:</strong> Verify screenshots execute in order (1, 2, 3)</li>
            <li><strong>Clipboard:</strong> Test clipboard integration</li>
          </ul>
        </div>
      </div>
    </div>
  `,
    play: async({canvasElement}) => {
        // Wait for the graph to fully settle before taking the screenshot
        await waitForGraphSettled(canvasElement);
    },
};

export const ErrorHandling: Story = {
    name: "Phase 6: Error Handling",
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
          id="graph-phase6"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div
        style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 8px; flex-wrap: wrap;"
      >
        <h3 style="flex-basis: 100%; margin: 0 0 8px 0;">Error Scenarios</h3>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase6");
                if (!(el instanceof Graphty)) {
                    return;
                }

                try {
                    await el.captureScreenshot({
                        width: 20000,
                        height: 20000,
                    });
                    alert("❌ Should have thrown error!");
                } catch (err) {
                    const e = err as {code?: string, message?: string};
                    console.error("Error:", e.code, e.message);
                    alert(`✓ Expected error:\n${e.code}\n${e.message}`);
                }
            }}
          style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ❌ Try Excessive Dimensions
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase6");
                if (!(el instanceof Graphty)) {
                    return;
                }

                try {
                    await el.captureScreenshot({
                        transparentBackground: true,
                        format: "jpeg",
                    });
                    alert("❌ Should have thrown error!");
                } catch (err) {
                    const e = err as {code?: string, message?: string};
                    console.error("Error:", e.code, e.message);
                    alert(`✓ Expected error:\n${e.code}\n${e.message}`);
                }
            }}
          style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ❌ Try JPEG + Transparent
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase6");
                if (!(el instanceof Graphty)) {
                    return;
                }

                try {
                    await el.captureScreenshot({
                        width: 1920,
                        height: 1080,
                        strictAspectRatio: true,
                    });
                    alert("✓ Aspect ratio validation passed (or failed with expected error)");
                } catch (err) {
                    const e = err as {code?: string, message?: string};
                    console.error("Error:", e.code, e.message);
                    alert(`Aspect ratio check:\n${e.code}\n${e.message}`);
                }
            }}
          style="padding: 8px 16px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;"
        >
          ⚠️ Try Aspect Ratio Check
        </button>

        <h3 style="flex-basis: 100%; margin: 16px 0 8px 0;">Capability Checks</h3>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase6");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const check = await el.canCaptureScreenshot({multiplier: 4});
                console.log("Capability check:", check);

                let message = "Multiplier 4x Check:\n";
                message += `Supported: ${check.supported}\n`;
                if (check.reason) {
                    message += `Reason: ${check.reason}\n`;
                }

                if (check.warnings) {
                    message += `Warnings:\n${check.warnings.join("\n")}`;
                }

                message += `\nEstimated Memory: ${check.estimatedMemoryMB.toFixed(1)}MB`;

                alert(message);
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ✅ Check 4x Capability
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase6");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const check = await el.canCaptureScreenshot({
                    width: 7680,
                    height: 4320,
                });
                console.log("8K capability check:", check);

                let message = "8K Resolution Check:\n";
                message += `Supported: ${check.supported}\n`;
                if (check.reason) {
                    message += `Reason: ${check.reason}\n`;
                }

                if (check.warnings) {
                    message += `Warnings:\n${check.warnings.join("\n")}\n`;
                }

                message += `Estimated Memory: ${check.estimatedMemoryMB.toFixed(0)}MB`;

                alert(message);
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ✅ Check 8K Capability
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-phase6");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const check = await el.canCaptureScreenshot({format: "webp"});
                console.log("WebP capability check:", check);

                let message = "WebP Format Check:\n";
                message += `Supported: ${check.supported}\n`;
                if (check.reason) {
                    message += `Reason: ${check.reason}\n`;
                }

                message += `Estimated Memory: ${check.estimatedMemoryMB.toFixed(1)}MB`;

                alert(message);
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ✅ Check WebP Support
        </button>

        <div style="flex-basis: 100%; padding: 8px; background: #fff; border-radius: 4px;">
          <strong>Phase 6 Features (Check Alerts & Console):</strong>
          <ul style="margin: 4px 0; padding-left: 20px;">
            <li><strong>Error Codes:</strong> Comprehensive error codes with helpful messages</li>
            <li><strong>Dimension Validation:</strong> Prevents exceeding browser limits</li>
            <li><strong>Format Validation:</strong> Ensures format compatibility (e.g., JPEG + transparency)</li>
            <li><strong>Capability Checks:</strong> Pre-flight validation before capture</li>
            <li><strong>Memory Estimation:</strong> Predicts memory usage for large screenshots</li>
          </ul>
        </div>
      </div>
    </div>
  `,
};

export const EnhancedQuality: Story = {
    name: "Enhanced Quality (Supersampling)",
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
          id="graph-enhanced"
          style="width: 100%; height: 100%; display: block;"
          .nodeData=${args.nodeData}
          .edgeData=${args.edgeData}
          .layoutConfig=${args.layoutConfig}
          .styleTemplate=${args.styleTemplate}
        ></graphty-element>
      </div>

      <div
        style="padding: 16px; background: #f5f5f5; border-top: 1px solid #ddd; display: flex; gap: 8px; flex-wrap: wrap;"
      >
        <button
          @click=${async() => {
                const el = document.querySelector("#graph-enhanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const statusEl = document.querySelector("#enhance-status");
                if (statusEl) {
                    statusEl.textContent = "Capturing standard screenshot...";
                }

                const result = await el.captureScreenshot({
                    enhanceQuality: false,
                    destination: {download: true},
                    downloadFilename: "graph-standard.png",
                });

                if (statusEl) {
                    statusEl.textContent = `Standard: ${result.metadata.width}x${result.metadata.height}, ${(result.metadata.byteSize / 1024).toFixed(1)}KB`;
                }
            }}
          style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          📸 Standard (No AA)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-enhanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const statusEl = document.querySelector("#enhance-status");
                if (statusEl) {
                    statusEl.textContent = "Capturing with 2x supersampling + 4x MSAA...";
                }

                const result = await el.captureScreenshot({
                    enhanceQuality: true, // Default: 2x supersample + 4x MSAA
                    destination: {download: true},
                    downloadFilename: "graph-enhanced-2x.png",
                });

                if (statusEl) {
                    const enhTime = result.metadata.enhancementTime ?? 0;
                    statusEl.textContent = `Enhanced (2x SS + 4x MSAA): ${result.metadata.width}x${result.metadata.height}, ${(result.metadata.byteSize / 1024).toFixed(1)}KB, took ${enhTime}ms`;
                }
            }}
          style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ✨ 2x Supersample + MSAA (Default)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-enhanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const statusEl = document.querySelector("#enhance-status");
                if (statusEl) {
                    statusEl.textContent = "Capturing with 4x supersampling + 8x MSAA (highest quality)...";
                }

                const result = await el.captureScreenshot({
                    enhanceQuality: {
                        supersampleFactor: 4,
                        msaaSamples: 8,
                    },
                    destination: {download: true},
                    downloadFilename: "graph-enhanced-4x.png",
                });

                if (statusEl) {
                    const enhTime = result.metadata.enhancementTime ?? 0;
                    statusEl.textContent = `Enhanced (4x SS + 8x MSAA): ${result.metadata.width}x${result.metadata.height}, ${(result.metadata.byteSize / 1024).toFixed(1)}KB, took ${enhTime}ms`;
                }
            }}
          style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ✨ 4x Supersample + 8x MSAA (Max Quality)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-enhanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const statusEl = document.querySelector("#enhance-status");
                if (statusEl) {
                    statusEl.textContent = "Capturing with MSAA only (no supersampling)...";
                }

                const result = await el.captureScreenshot({
                    enhanceQuality: {
                        supersampleFactor: 1, // No supersampling
                        msaaSamples: 8,
                    },
                    destination: {download: true},
                    downloadFilename: "graph-msaa-only.png",
                });

                if (statusEl) {
                    const enhTime = result.metadata.enhancementTime ?? 0;
                    statusEl.textContent = `MSAA Only (8x): ${result.metadata.width}x${result.metadata.height}, ${(result.metadata.byteSize / 1024).toFixed(1)}KB, took ${enhTime}ms`;
                }
            }}
          style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ✨ MSAA Only (8x, No SS)
        </button>

        <button
          @click=${async() => {
                const el = document.querySelector("#graph-enhanced");
                if (!(el instanceof Graphty)) {
                    return;
                }

                const statusEl = document.querySelector("#enhance-status");
                if (statusEl) {
                    statusEl.textContent = "Capturing with all methods combined...";
                }

                const result = await el.captureScreenshot({
                    enhanceQuality: {
                        supersampleFactor: 2,
                        msaaSamples: 4,
                        fxaa: true, // Add FXAA as final pass
                    },
                    destination: {download: true},
                    downloadFilename: "graph-all-aa.png",
                });

                if (statusEl) {
                    const enhTime = result.metadata.enhancementTime ?? 0;
                    statusEl.textContent = `All AA (2x SS + 4x MSAA + FXAA): ${result.metadata.width}x${result.metadata.height}, ${(result.metadata.byteSize / 1024).toFixed(1)}KB, took ${enhTime}ms`;
                }
            }}
          style="padding: 8px 16px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          ✨ SS + MSAA + FXAA (All Combined)
        </button>

        <div style="flex-basis: 100%; padding: 8px; background: #fff; border-radius: 4px;">
          <div id="enhance-status" style="font-family: monospace; padding: 4px 0; color: #666;">
            Click a button to capture a screenshot
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #666;">
            <strong>Anti-Aliasing Methods:</strong>
            <ul style="margin: 4px 0; padding-left: 20px;">
              <li><strong>Supersampling (SS):</strong> Render at higher resolution, then downscale. Best quality for static images.</li>
              <li><strong>MSAA:</strong> Multi-Sample Anti-Aliasing. Good for edges, hardware-accelerated.</li>
              <li><strong>FXAA:</strong> Fast Approximate AA. Blurs edges slightly, use as final pass if needed.</li>
            </ul>
          </div>
        </div>

        <div style="flex-basis: 100%; padding: 8px; background: #fff; border-radius: 4px;">
          <strong>Enhanced Quality Features:</strong>
          <ul style="margin: 4px 0; padding-left: 20px;">
            <li><strong>FXAA Anti-Aliasing:</strong> Applies Fast Approximate Anti-Aliasing for smoother edges</li>
            <li><strong>Enhancement Time:</strong> Returns timing metrics in result.metadata.enhancementTime</li>
            <li><strong>Events:</strong> Emits 'screenshot-enhancing' and 'screenshot-ready' events</li>
            <li><strong>Combinable:</strong> Works with all other options (multiplier, transparent, presets)</li>
          </ul>
          <p style="margin: 8px 0 0 0; font-size: 0.9em; color: #666;">
            <strong>Tip:</strong> Compare standard vs enhanced screenshots side-by-side to see the difference in edge smoothness.
          </p>
        </div>
      </div>
    </div>
  `,
};
