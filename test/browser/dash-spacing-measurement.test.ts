/**
 * Programmatic measurement of dash pattern spacing
 * This test renders a dash pattern and measures actual pixel spacing
 */

import {chromium} from "playwright";
import {PNG} from "pngjs";
import {describe, expect, test} from "vitest";

describe("Dash Pattern Spacing", () => {
    test("measure dash pattern spacing in pixels", {timeout: 30000}, async() => {
        const browser = await chromium.launch();
        const page = await browser.newPage();

        try {
            // Navigate to the dash pattern story
            await page.goto("http://dev.ato.ms:9025/iframe.html?id=styles-edge-patterns--dash&viewMode=story");

            // Wait for the graph to render
            await page.waitForTimeout(2000);

            // Take a screenshot of the canvas
            const screenshot = await page.locator("canvas").first().screenshot();

            // Parse the PNG to get pixel data
            const png = PNG.sync.read(Buffer.from(screenshot));
            const {width, height, data: pixels} = png;

            // Read pixel data from the center horizontal line (where the edge should be)
            const centerY = Math.floor(height / 2);

            // Helper to get pixel brightness
            const getBrightness = (x: number, y: number): number => {
                const idx = ((y * width) + x) * 4;
                const r = Number(pixels[idx]);
                const g = Number(pixels[idx + 1]);
                const b = Number(pixels[idx + 2]);
                return (r + g + b) / 3;
            };

            // Find all dash segments by looking for non-background pixels
            // Background is typically dark/black, dashes are light/grey
            const threshold = 50; // Pixel brightness threshold
            const segments: {start: number, end: number, length: number}[] = [];
            const gaps: {start: number, end: number, length: number}[] = [];

            let inDash = false;
            let dashStart = 0;

            for (let x = 0; x < width; x++) {
                const brightness = getBrightness(x, centerY);

                if (!inDash && brightness > threshold) {
                    // Start of a dash
                    inDash = true;
                    dashStart = x;

                    // Record gap if there was a previous dash
                    if (segments.length > 0) {
                        const lastDash = segments[segments.length - 1];
                        gaps.push({
                            start: lastDash.end,
                            end: x,
                            length: x - lastDash.end,
                        });
                    }
                } else if (inDash && brightness <= threshold) {
                    // End of a dash
                    inDash = false;
                    segments.push({
                        start: dashStart,
                        end: x,
                        length: x - dashStart,
                    });
                }
            }

            // Close final dash if still in one
            if (inDash) {
                segments.push({
                    start: dashStart,
                    end: width,
                    length: width - dashStart,
                });
            }

            // Calculate statistics
            const avgDashLength = segments.length > 0 ?
                segments.reduce((sum, s) => sum + s.length, 0) / segments.length :
                0;
            const avgGapLength = gaps.length > 0 ?
                gaps.reduce((sum, g) => sum + g.length, 0) / gaps.length :
                0;

            const gapToDashRatio = avgDashLength > 0 ? avgGapLength / avgDashLength : 0;
            const expectedRatio = 2.0 / 3.0; // We set gap=2x, dash=3x

            const measurements = {
                canvasSize: {width, height},
                centerY,
                dashSegments: segments,
                gaps,
                avgDashLength,
                avgGapLength,
                gapToDashRatio,
                expectedRatio,
            };

            console.log("=== DASH PATTERN MEASUREMENT ===");
            console.log("Canvas size:", measurements.canvasSize);
            console.log("Number of dashes:", measurements.dashSegments.length);
            console.log("Number of gaps:", measurements.gaps.length);
            console.log("Average dash length (pixels):", measurements.avgDashLength.toFixed(2));
            console.log("Average gap length (pixels):", measurements.avgGapLength.toFixed(2));
            console.log("Actual gap/dash ratio:", measurements.gapToDashRatio.toFixed(3));
            console.log("Expected gap/dash ratio:", measurements.expectedRatio.toFixed(3));
            console.log("Ratio error:", `${((measurements.gapToDashRatio - measurements.expectedRatio) / measurements.expectedRatio * 100).toFixed(1)}%`);
            console.log("\nDash segments (pixels):");
            measurements.dashSegments.forEach((seg, i) => {
                console.log(`  Dash ${i + 1}: ${seg.start} to ${seg.end} (${seg.length}px)`);
            });
            console.log("\nGap segments (pixels):");
            measurements.gaps.forEach((gap, i) => {
                console.log(`  Gap ${i + 1}: ${gap.start} to ${gap.end} (${gap.length}px)`);
            });
            console.log("================================");

            // Assert that the ratio is close to expected (within 10% tolerance)
            const tolerance = 0.1;
            expect(measurements.gapToDashRatio).toBeGreaterThan(expectedRatio * (1 - tolerance));
            expect(measurements.gapToDashRatio).toBeLessThan(expectedRatio * (1 + tolerance));
        } finally {
            await browser.close();
        }
    });
});
