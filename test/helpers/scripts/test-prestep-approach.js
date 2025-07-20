import {createHash} from "crypto";
import {chromium} from "playwright";

async function preStepLayout(page, steps = 500) {
    return await page.evaluate(async(stepCount) => {
        const graphty = document.querySelector("graphty-element");
        if (!graphty) {
            return {error: "No graphty-element found"};
        }

        // Wait for graph to be initialized (like helpers.ts does)
        let attempts = 0;
        while ((!graphty.graph?.layoutManager?.layoutEngine) && attempts < 50) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            attempts++;
        }

        if (!graphty.graph) {
            return {error: "No graph property after waiting"};
        }

        const layout = graphty.graph.layoutManager?.layoutEngine;
        if (!layout) {
            return {error: "No layout engine found after waiting", hasLayoutManager: !!graphty.graph.layoutManager};
        }

        console.log(`Pre-stepping ${layout.constructor.name} layout ${stepCount} times...`);

        const startTime = Date.now();
        let actualSteps = 0;

        // Pre-step the layout
        for (let i = 0; i < stepCount; i++) {
            layout.step();
            actualSteps++;
            if (layout.isSettled) {
                console.log(`Layout settled after ${i + 1} steps`);
                break;
            }
        }

        const endTime = Date.now();

        return {
            layoutType: layout.constructor.name,
            actualSteps,
            isSettled: layout.isSettled,
            duration: endTime - startTime,
            nodeCount: graphty.graph.nodes?.size ?? 0,
        };
    }, steps);
}

async function testStory(page, storyId) {
    console.log(`\nTesting ${storyId} with pre-stepping...`);

    // Navigate to story
    console.log(`  Navigating to: http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
    await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector("graphty-element", {timeout: 15000});
    console.log("  Found graphty-element");
    await page.waitForTimeout(5000);
    console.log("  Waited for element to initialize");

    // Pre-step the layout
    const preStepResult = await preStepLayout(page, 500);
    console.log(`  Pre-step result: ${JSON.stringify(preStepResult)}`);

    // Take 3 screenshots to test consistency
    const hashes = [];
    for (let i = 0; i < 3; i++) {
    // Pre-step again for each screenshot to ensure consistency
        await preStepLayout(page, 500);

        const screenshot = await page.locator("graphty-element").screenshot();
        const hash = createHash("sha256").update(screenshot).digest("hex");
        hashes.push(hash);
        console.log(`    Screenshot ${i + 1} hash: ${hash.substring(0, 16)}...`);

        // Save screenshot for debugging
        await page.locator("graphty-element").screenshot({
            path: `test/screenshots/${storyId}-prestep-${i}.png`,
        });
    }

    // Check consistency
    const allIdentical = hashes.every((hash) => hash === hashes[0]);
    if (allIdentical) {
        console.log(`  ✅ ${storyId} is now consistent with pre-stepping!`);
    } else {
        console.log(`  ❌ ${storyId} is still inconsistent even with pre-stepping`);
    }

    return {storyId, consistent: allIdentical, preStepResult};
}

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    const stories = [
        "layout-3d--ngraph",
    ];

    const results = [];

    for (const storyId of stories) {
        const result = await testStory(page, storyId);
        results.push(result);
    }

    console.log("\n=== SUMMARY ===");
    results.forEach((result) => {
        const status = result.consistent ? "✅" : "❌";
        console.log(`${status} ${result.storyId}: ${result.consistent ? "Consistent" : "Inconsistent"}`);
    });

    await browser.close();
}

main().catch(console.error);
