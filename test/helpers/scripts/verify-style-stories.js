import {chromium} from "playwright";

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    const stories = [
        "styles-node--default",
        "styles-edge--default",
        "styles-graph--default",
    ];

    for (const storyId of stories) {
        console.log(`\nTesting ${storyId}...`);

        await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
        await page.waitForSelector("graphty-element", {timeout: 10000});

        // Wait longer for the graph to fully initialize
        await page.waitForTimeout(5000);

        // Check graph state multiple times
        for (let i = 0; i < 5; i++) {
            const state = await page.evaluate(() => {
                const graphty = document.querySelector("graphty-element");
                if (!graphty) {
                    return null;
                }

                return {
                    hasGraph: !!graphty.graph,
                    nodeCount: graphty.graph?.nodes?.size ?? 0,
                    edgeCount: graphty.graph?.edges?.size ?? 0,
                    isLayoutRunning: graphty.graph?.layoutManager?.running ?? false,
                    layoutEngine: graphty.graph?.layoutManager?.layoutEngine?.constructor.name ?? "none",
                };
            });

            console.log(`  Check ${i + 1}: ${JSON.stringify(state)}`);

            if (state?.nodeCount > 0) {
                console.log(`  ✅ ${storyId} is working - found ${state.nodeCount} nodes`);
                break;
            }

            await page.waitForTimeout(1000);
        }

        // Take final screenshot
        await page.locator("graphty-element").screenshot({
            path: `test/screenshots/${storyId}-final.png`,
        });
    }

    await browser.close();
}

main().catch(console.error);
