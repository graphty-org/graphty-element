/**
 * Multi-angle 3D Scene Screenshot Capture Utility
 *
 * This script captures screenshots of a 3D scene from multiple camera angles
 * for debugging complex 3D rendering issues. Images can be analyzed with
 * Nanobanana MCP or other vision tools.
 *
 * Camera Positions:
 * - start: Initial camera position (as configured in the story)
 * - left: Looking at origin from the left side
 * - top: Looking down at origin from above
 * - top-left-1: Halfway between top and left (closer to top)
 * - top-left-2: Halfway between top and left (closer to left)
 *
 * Usage:
 *   npx tsx test/helpers/capture-3d-debug-screenshots.ts <story-id> [--axes]
 *
 * Examples:
 *   npx tsx test/helpers/capture-3d-debug-screenshots.ts styles-edge--circle-arrow-head
 *   npx tsx test/helpers/capture-3d-debug-screenshots.ts styles-edge--circle-arrow-head --axes
 *
 * Options:
 *   --axes    Enable BabylonJS AxesViewer to show coordinate system
 */

import { chromium } from "playwright";
import { resolve } from "path";

const STORYBOOK_URL = "http://dev.ato.ms:9025";
const TMP_DIR = resolve(process.cwd(), "tmp");

interface CameraPosition {
    name: string;
    description: string;
    alpha: number;  // Horizontal rotation (in radians)
    beta: number;   // Vertical rotation (in radians)
    radius: number; // Distance from target
}

/**
 * Define camera positions for multi-angle capture
 */
const getCameraPositions = (): CameraPosition[] => {
    return [
        {
            name: "start",
            description: "Starting camera position (as configured)",
            alpha: NaN, // Will use existing camera position
            beta: NaN,
            radius: NaN,
        },
        {
            name: "left",
            description: "Left side view looking at origin",
            alpha: Math.PI / 2,  // 90 degrees
            beta: Math.PI / 2,   // Horizontal, at equator
            radius: 10,
        },
        {
            name: "top",
            description: "Top-down view looking at origin",
            alpha: 0,
            beta: 0.1,  // Almost directly above (slight offset to avoid gimbal lock)
            radius: 10,
        },
        {
            name: "top-left-1",
            description: "Halfway between top and left (closer to top)",
            alpha: Math.PI / 4,   // 45 degrees
            beta: Math.PI / 6,    // 30 degrees from top
            radius: 10,
        },
        {
            name: "top-left-2",
            description: "Halfway between top and left (closer to left)",
            alpha: Math.PI / 4,   // 45 degrees
            beta: Math.PI / 3,    // 60 degrees from top
            radius: 10,
        },
    ];
};

/**
 * Setup camera position
 */
async function setupCamera(
    page: any,
    position: CameraPosition
): Promise<void> {
    await page.evaluate((pos: CameraPosition) => {
        const graphty = document.querySelector("graphty-element") as any;
        if (!graphty || !graphty.graph) {
            throw new Error("Graph not found");
        }

        const camera = graphty.graph.camera;
        if (!camera) {
            throw new Error("Camera not found");
        }

        // Set camera position (skip if NaN - use existing position)
        if (!isNaN(pos.alpha)) {
            camera.alpha = pos.alpha;
        }
        if (!isNaN(pos.beta)) {
            camera.beta = pos.beta;
        }
        if (!isNaN(pos.radius)) {
            camera.radius = pos.radius;
        }

        // Force a render
        graphty.graph.scene.render();
    }, position);

    // Wait for render to complete
    await page.waitForTimeout(500);
}

/**
 * Enable axes viewer at the origin
 */
async function enableAxesViewer(page: any): Promise<void> {
    await page.evaluate(() => {
        const graphty = document.querySelector("graphty-element") as any;
        if (!graphty || !graphty.graph) {
            console.error("Graph not found");
            return;
        }

        const scene = graphty.graph.scene;

        // Remove any existing axes viewer
        if (scene.metadata?.axesViewer) {
            scene.metadata.axesViewer.dispose();
        }

        // Create AxesViewer using global BABYLON namespace
        // Size 5 makes axes visible but not too large
        const axes = new (window as any).BABYLON.AxesViewer(scene, 5);

        // Make the colors bright and vivid (graphty-element's scene settings can wash out colors)
        // Set both emissive and diffuse colors to full brightness
        axes._xAxis.getChildMeshes().forEach((mesh: any) => {
            if (mesh.material) {
                mesh.material.emissiveColor = new (window as any).BABYLON.Color3(1, 0, 0); // Bright red
                mesh.material.diffuseColor = new (window as any).BABYLON.Color3(1, 0, 0);
            }
        });

        axes._yAxis.getChildMeshes().forEach((mesh: any) => {
            if (mesh.material) {
                mesh.material.emissiveColor = new (window as any).BABYLON.Color3(0, 1, 0); // Bright green
                mesh.material.diffuseColor = new (window as any).BABYLON.Color3(0, 1, 0);
            }
        });

        axes._zAxis.getChildMeshes().forEach((mesh: any) => {
            if (mesh.material) {
                mesh.material.emissiveColor = new (window as any).BABYLON.Color3(0, 0, 1); // Bright blue
                mesh.material.diffuseColor = new (window as any).BABYLON.Color3(0, 0, 1);
            }
        });

        // Store reference
        if (!scene.metadata) {
            scene.metadata = {};
        }
        scene.metadata.axesViewer = axes;

        // Force render
        scene.render();
    });

    // Wait for axes to be created and rendered
    await page.waitForTimeout(500);
}

/**
 * Generate timestamp for filename
 */
function getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, -5);
}

/**
 * Main capture function
 */
async function captureScreenshots(storyId: string, showAxes: boolean = false) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        // Navigate to the story
        const storyUrl = `${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`;
        console.log(`Navigating to: ${storyUrl}`);
        await page.goto(storyUrl);

        // Wait for the component to load and render
        await page.waitForSelector("graphty-element", { timeout: 10000 });
        console.log("Component loaded");

        // Wait for initial render to complete
        await page.waitForTimeout(2000);

        const timestamp = getTimestamp();
        const positions = getCameraPositions();

        console.log(`\nCapturing ${positions.length} screenshots with timestamp: ${timestamp}`);
        if (showAxes) {
            console.log("AxesViewer enabled (Red=X, Green=Y, Blue=Z)\n");
            await enableAxesViewer(page);
        }

        // Capture images from each camera position
        for (const position of positions) {
            console.log(`Capturing: ${position.name}`);
            console.log(`  ${position.description}`);

            await setupCamera(page, position);

            const filename = `screenshot-${position.name}-${timestamp}.png`;
            const screenshotPath = resolve(TMP_DIR, filename);

            await page.screenshot({
                path: screenshotPath,
                fullPage: false,
            });

            console.log(`  Saved: ${filename}\n`);
        }

        console.log("✓ All screenshots captured successfully");
        console.log(`\nScreenshots saved in: ${TMP_DIR}`);
        console.log("\nNext steps:");
        console.log("1. Review images in tmp/ directory");
        console.log("2. Use Nanobanana MCP to analyze images for debugging");
        console.log("   Example: Ask Claude to analyze the screenshots with nanobanana");

    } catch (error) {
        console.error("Error:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * Parse command line arguments and run
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        console.log(`
Usage: npx tsx test/helpers/capture-3d-debug-screenshots.ts <story-id> [--axes]

Arguments:
  story-id    Storybook story ID (e.g., styles-edge--circle-arrow-head)

Options:
  --axes      Enable BabylonJS AxesViewer to show coordinate system
              Red = X axis, Green = Y axis, Blue = Z axis

Examples:
  npx tsx test/helpers/capture-3d-debug-screenshots.ts styles-edge--circle-arrow-head
  npx tsx test/helpers/capture-3d-debug-screenshots.ts styles-edge--circle-arrow-head --axes
        `);
        process.exit(0);
    }

    const storyId = args[0];
    const showAxes = args.includes("--axes");

    await captureScreenshots(storyId, showAxes);
}

main().catch(console.error);
