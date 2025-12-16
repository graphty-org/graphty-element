/**
 * 2D Scene Screenshot Capture Utility
 *
 * This script captures screenshots of 2D stories for manual review and debugging.
 * Unlike the 3D version, this doesn't change camera angles since 2D views are fixed.
 * Instead, it captures at different zoom levels to demonstrate world-space scaling.
 *
 * Usage:
 *   npx tsx test/helpers/capture-2d-screenshots.ts <story-id> [--zoom-levels]
 *
 * Examples:
 *   npx tsx test/helpers/capture-2d-screenshots.ts styles-edge--two-d-solid-lines
 *   npx tsx test/helpers/capture-2d-screenshots.ts styles-edge--two-d-all-arrows --zoom-levels
 *
 * Options:
 *   --zoom-levels    Capture at multiple zoom levels to demonstrate world-space scaling
 */

/* eslint-disable no-console */

import {resolve} from "path";
import {chromium} from "playwright";

const STORYBOOK_URL = "http://dev.ato.ms:9025";
const TMP_DIR = resolve(process.cwd(), "tmp");

interface ZoomLevel {
    name: string;
    description: string;
    radiusMultiplier: number;
}

/**
 * Define zoom levels for demonstrating world-space scaling
 */
const getZoomLevels = (): ZoomLevel[] => {
    return [
        {
            name: "default",
            description: "Default camera distance (as configured)",
            radiusMultiplier: 1.0,
        },
        {
            name: "zoom-in-2x",
            description: "Zoomed in 2x (radius * 0.5)",
            radiusMultiplier: 0.5,
        },
        {
            name: "zoom-in-4x",
            description: "Zoomed in 4x (radius * 0.25)",
            radiusMultiplier: 0.25,
        },
        {
            name: "zoom-out-2x",
            description: "Zoomed out 2x (radius * 2.0)",
            radiusMultiplier: 2.0,
        },
    ];
};

/**
 * Set camera zoom level
 */
interface PageLike {
    locator: (selector: string) => {
        screenshot: (options: {path: string}) => Promise<unknown>;
    };
    waitForTimeout: (ms: number) => Promise<void>;
    evaluate: <T>(fn: (arg: T) => void, arg: T) => Promise<void>;
}

async function setCameraZoom(
    page: PageLike,
    radiusMultiplier: number,
): Promise<void> {
    await page.evaluate((multiplier: number) => {
        const elem = document.querySelector("graphty-element") as {
            graph?: {camera: {radius: number}};
        } | null;

        if (elem?.graph?.camera) {
            // Store original radius on first call
            if (!(window as {originalRadius?: number}).originalRadius) {
                (window as {originalRadius?: number}).originalRadius = elem.graph.camera.radius;
            }

            const originalRadius = (window as {originalRadius?: number}).originalRadius ?? elem.graph.camera.radius;
            elem.graph.camera.radius = originalRadius * multiplier;
        }
    }, radiusMultiplier);

    // Wait for render to settle
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
async function captureScreenshots(storyId: string, includeZoomLevels = false): Promise<void> {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    try {
        // Navigate to the story
        const storyUrl = `${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`;
        console.log(`Navigating to: ${storyUrl}`);
        await page.goto(storyUrl);

        // Wait for the component to load and render
        await page.waitForSelector("graphty-element", {timeout: 10000});
        console.log("Component loaded");

        // Wait for initial render to complete
        await page.waitForTimeout(2000);

        const timestamp = getTimestamp();

        if (includeZoomLevels) {
            const zoomLevels = getZoomLevels();
            console.log(`\nCapturing ${zoomLevels.length} screenshots at different zoom levels`);
            console.log(`Timestamp: ${timestamp}\n`);

            // Capture images at each zoom level
            for (const level of zoomLevels) {
                console.log(`Capturing: ${level.name}`);
                console.log(`  ${level.description}`);

                await setCameraZoom(page, level.radiusMultiplier);

                const filename = `screenshot-2d-${level.name}-${timestamp}.png`;
                const screenshotPath = resolve(TMP_DIR, filename);

                // Screenshot the canvas element specifically
                const canvas = page.locator("canvas");
                await canvas.screenshot({
                    path: screenshotPath,
                });

                console.log(`  Saved: ${filename}\n`);
            }
        } else {
            // Just capture a single screenshot at default zoom
            console.log(`\nCapturing screenshot with timestamp: ${timestamp}\n`);

            const filename = `screenshot-2d-${timestamp}.png`;
            const screenshotPath = resolve(TMP_DIR, filename);

            const canvas = page.locator("canvas");
            await canvas.screenshot({
                path: screenshotPath,
            });

            console.log(`Saved: ${filename}\n`);
        }

        console.log("✓ All screenshots captured successfully");
        console.log(`\nScreenshots saved in: ${TMP_DIR}`);
        console.log("\nNext steps:");
        console.log("1. Review images in tmp/ directory");
        console.log("2. Use Nanobanana MCP to analyze images for debugging");
        console.log("   Example: Ask Claude to analyze the screenshots with nanobanana");

        if (includeZoomLevels) {
            console.log("\nZoom level comparison:");
            console.log("- Edges should appear thicker when zoomed in (world-space scaling)");
            console.log("- Edges should maintain proportional scaling across all zoom levels");
        }
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
async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
        console.log(`
Usage: npx tsx test/helpers/capture-2d-screenshots.ts <story-id> [--zoom-levels]

Arguments:
  story-id    Storybook story ID (e.g., styles-edge--two-d-solid-lines)

Options:
  --zoom-levels    Capture at multiple zoom levels to demonstrate world-space scaling
                   (default, 2x zoom in, 4x zoom in, 2x zoom out)

Examples:
  npx tsx test/helpers/capture-2d-screenshots.ts styles-edge--two-d-solid-lines
  npx tsx test/helpers/capture-2d-screenshots.ts styles-edge--two-d-all-arrows --zoom-levels
        `);
        process.exit(0);
    }

    const storyId = args[0];
    const includeZoomLevels = args.includes("--zoom-levels");

    await captureScreenshots(storyId, includeZoomLevels);
}

main().catch(console.error);
