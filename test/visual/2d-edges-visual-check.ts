/**
 * Visual regression check for 2D edge rendering
 *
 * This script captures screenshots from 2D edge stories and can be used
 * to manually verify that 2D edges render correctly with world-space scaling.
 *
 * Usage:
 *   npx tsx test/visual/2d-edges-visual-check.ts
 *
 * The script will:
 * 1. Capture screenshots of 2D solid, patterned, and arrow stories
 * 2. Capture before/after zoom screenshots to demonstrate world-space scaling
 * 3. Save all screenshots to the tmp/ directory
 * 4. Report success/failure based on whether screenshots were captured
 */

/* eslint-disable no-console */

import {chromium, type Browser, type Page} from "playwright";
import {resolve} from "path";

const STORYBOOK_URL = "http://dev.ato.ms:9025";
const TMP_DIR = resolve(process.cwd(), "tmp");

async function captureStory(
    page: Page,
    storyId: string,
    filename: string,
): Promise<void> {
    const storyUrl = `${STORYBOOK_URL}/iframe.html?id=${storyId}&viewMode=story`;
    await page.goto(storyUrl, {waitUntil: "networkidle"});

    // Wait for component to load
    await page.waitForSelector("graphty-element", {timeout: 10000});
    await page.waitForTimeout(1000);

    // Take screenshot
    const canvas = page.locator("canvas");
    const screenshotPath = resolve(TMP_DIR, filename);
    await canvas.screenshot({path: screenshotPath});

    console.log(`  ✓ Captured: ${filename}`);
}

async function checkZoomBehavior(page: Page): Promise<void> {
    const storyUrl = `${STORYBOOK_URL}/iframe.html?id=styles-edge--two-d-solid-lines&viewMode=story`;
    await page.goto(storyUrl, {waitUntil: "networkidle"});

    await page.waitForSelector("graphty-element", {timeout: 10000});
    await page.waitForTimeout(1000);

    // Capture before zoom
    const canvas = page.locator("canvas");
    await canvas.screenshot({
        path: resolve(TMP_DIR, "2d-zoom-before.png"),
    });
    console.log("  ✓ Captured: 2d-zoom-before.png");

    // Zoom in
    await page.evaluate(() => {
        const elem = document.querySelector("graphty-element") as {
            graph?: {camera: {radius: number}};
        } | null;
        if (elem?.graph?.camera) {
            elem.graph.camera.radius *= 0.5; // Zoom in 2x
        }
    });

    await page.waitForTimeout(500);

    // Capture after zoom
    await canvas.screenshot({
        path: resolve(TMP_DIR, "2d-zoom-after.png"),
    });
    console.log("  ✓ Captured: 2d-zoom-after.png");
}

async function main(): Promise<void> {
    console.log("Starting 2D edge visual regression check...\n");

    const browser: Browser = await chromium.launch({headless: true});
    const page: Page = await browser.newPage();

    try {
        console.log("1. Testing 2D solid edges:");
        await captureStory(page, "styles-edge--two-d-solid-lines", "2d-solid-edges.png");

        console.log("\n2. Testing 2D patterned edges:");
        await captureStory(page, "styles-edge--two-d-patterned-lines", "2d-patterned-edges.png");

        console.log("\n3. Testing 2D arrow heads:");
        await captureStory(page, "styles-edge--two-d-normal-arrow-head", "2d-arrow-head.png");

        console.log("\n4. Testing world-space zoom behavior:");
        await checkZoomBehavior(page);

        console.log("\n✅ All visual checks completed successfully!");
        console.log(`\nScreenshots saved in: ${TMP_DIR}`);
        console.log("\nNext steps:");
        console.log("1. Review images in tmp/ directory");
        console.log("2. Verify edges render correctly");
        console.log("3. Compare zoom-before and zoom-after to verify world-space scaling");
    } catch (error) {
        console.error("\n❌ Visual check failed:", error);
        throw error;
    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
