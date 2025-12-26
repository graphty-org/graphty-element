import {chromium} from "playwright";

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "https://localhost:6006";

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    console.log("Testing specific story: layout-3d--ngraph");

    // Navigate to the story
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-3d--ngraph&viewMode=story`);

    console.log("Waiting for page to load...");
    await page.waitForTimeout(5000);

    // Check if graphty-element exists
    const hasGraphty = await page.evaluate(() => {
        return !!document.querySelector("graphty-element");
    });
    console.log(`Has graphty-element: ${hasGraphty}`);

    // Check the internal state
    const graphState = await page.evaluate(() => {
        const graphty = document.querySelector("graphty-element");
        if (!graphty) {
            return {error: "No graphty element"};
        }

        return {
            hasGraph: !!graphty.graph,
            hasLayoutManager: !!graphty.graph?.layoutManager,
            hasLayoutEngine: !!graphty.graph?.layoutManager?.layoutEngine,
            layoutType: graphty.graph?.layoutManager?.layoutEngine?.constructor?.name,
            nodeCount: graphty.graph?.nodes?.size ?? 0,
            edgeCount: graphty.graph?.edges?.size ?? 0,
            isSettled: graphty.graph?.layoutManager?.layoutEngine?.isSettled,
        };
    });

    console.log("Graph state:", JSON.stringify(graphState, null, 2));

    // Take screenshot
    await page.screenshot({path: "test/screenshots/debug-specific-story.png", fullPage: true});
    await page.locator("graphty-element").screenshot({path: "test/screenshots/debug-graphty-element.png"});

    console.log("Screenshots saved");

    await browser.close();
}

main().catch(console.error);
