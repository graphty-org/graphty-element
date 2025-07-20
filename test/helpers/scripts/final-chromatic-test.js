import {createHash} from "crypto";
import {chromium} from "playwright";

async function testForChromatic(page, storyId) {
    console.log(`\nTesting ${storyId} for Chromatic readiness...`);

    // Navigate to story and wait for complete initialization
    await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector("graphty-element", {timeout: 15000});

    // Wait a generous amount of time for Storybook play functions to complete
    console.log("  Waiting for play function and layout settling...");
    await page.waitForTimeout(10000);

    // Check if there are actual graph elements visible
    const hasNodes = await page.evaluate(() => {
        const canvas = document.querySelector("canvas");
        if (!canvas) {
            return false;
        }

        // Take a small sample to check if anything is drawn
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return false;
        }

        const imageData = ctx.getImageData(0, 0, 100, 100);
        const pixels = imageData.data;

        // Check if there are any non-background pixels
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            // If we find any non-transparent, non-gray pixels, there's content
            if (a > 0 && (r !== g || g !== b || r !== 128)) {
                return true;
            }
        }
        return false;
    });

    console.log(`  Graph has visible content: ${hasNodes}`);

    // Take consistency screenshots
    const hashes = [];
    for (let i = 0; i < 3; i++) {
    // Reload the story each time to test true consistency
        await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
        await page.waitForSelector("graphty-element", {timeout: 15000});
        await page.waitForTimeout(10000); // Wait for layout settling

        const screenshot = await page.locator("graphty-element").screenshot();
        const hash = createHash("sha256").update(screenshot).digest("hex");
        hashes.push(hash);
        console.log(`    Run ${i + 1}/3 hash: ${hash.substring(0, 12)}...`);

        // Save final screenshot for visual inspection
        if (i === 2) {
            await page.locator("graphty-element").screenshot({
                path: `test/screenshots/${storyId}-final.png`,
            });
        }
    }

    const allIdentical = hashes.every((hash) => hash === hashes[0]);
    const status = allIdentical && hasNodes ? "READY" : "ISSUE";

    console.log(`  Status: ${status}`);
    if (!allIdentical) {
        console.log(`    ❌ Inconsistent hashes: ${hashes.map((h) => h.substring(0, 8)).join(", ")}`);
    }

    if (!hasNodes) {
        console.log("    ⚠️  No visible graph content detected");
    }

    if (allIdentical && hasNodes) {
        console.log("    ✅ Consistent and has content - Chromatic ready!");
    }

    return {storyId, consistent: allIdentical, hasContent: hasNodes, ready: allIdentical && hasNodes};
}

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    // Test the main animated layout stories that had issues
    const stories = [
        "layout-3d--ngraph",
        "layout-3d--d-3",
    ];

    const results = [];

    for (const storyId of stories) {
        const result = await testForChromatic(page, storyId);
        results.push(result);
    }

    console.log("\\n=== CHROMATIC READINESS SUMMARY ===");
    const readyCount = results.filter((r) => r.ready).length;
    console.log(`Ready for Chromatic: ${readyCount}/${results.length}`);

    results.forEach((result) => {
        let icon;
        let status;
        if (result.ready) {
            icon = "✅";
            status = "READY";
        } else if (result.consistent) {
            icon = "⚠️";
            status = "CONSISTENT_NO_CONTENT";
        } else {
            icon = "❌";
            status = "INCONSISTENT";
        }

        console.log(`${icon} ${result.storyId}: ${status}`);
    });

    if (readyCount === results.length) {
        console.log("\\n🎉 All stories are ready for Chromatic visual testing!");
    } else {
        console.log("\\n⚠️ Some stories still need attention before Chromatic will work reliably.");
    }

    await browser.close();
}

main().catch(console.error);
