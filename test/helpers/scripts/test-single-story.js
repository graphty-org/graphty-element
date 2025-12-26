import {chromium} from "playwright";

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "https://localhost:6006";

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    // Test ngraph story
    await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-3d--ngraph&viewMode=story`);

    // Wait for graphty-element
    await page.waitForSelector("graphty-element", {timeout: 10000});

    // Check layout state periodically
    for (let i = 0; i < 20; i++) {
        const state = await page.evaluate(() => {
            const graphty = document.querySelector("graphty-element");
            if (!graphty?.graph) {
                return {exists: false};
            }

            const layout = graphty.graph.layoutManager?.layoutEngine;
            if (!layout) {
                return {exists: true, hasLayout: false};
            }

            return {
                exists: true,
                hasLayout: true,
                isSettled: layout.isSettled,
                layoutType: layout.constructor.name,
                nodeCount: graphty.graph.nodes?.size ?? 0,
            };
        });

        console.log(`Check ${i}: `, state);
        await page.waitForTimeout(1000);
    }

    // Take screenshots
    console.log("\nTaking screenshots...");
    for (let i = 0; i < 3; i++) {
        await page.locator("graphty-element").screenshot({
            path: `test/screenshots/ngraph-test-${i}.png`,
        });
        console.log(`Screenshot ${i} saved`);
        await page.waitForTimeout(2000);
    }

    await browser.close();
}

main().catch(console.error);
