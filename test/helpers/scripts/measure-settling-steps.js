import {chromium} from "playwright";

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    const stories = [
        "layout-3d--ngraph",
        "layout-3d--d-3",
        "styles-node--default",
    ];

    for (const storyId of stories) {
        console.log(`\nMeasuring settling steps for ${storyId}...`);

        await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
        await page.waitForSelector("graphty-element", {timeout: 10000});
        await page.waitForTimeout(2000);

        // Measure how many steps it takes to settle
        const stepsMeasurement = await page.evaluate(() => {
            return new Promise((resolve) => {
                const graphty = document.querySelector("graphty-element");
                if (!graphty?.graph) {
                    resolve({error: "No graph found"});
                    return;
                }

                const layout = graphty.graph.layoutManager?.layoutEngine;
                if (!layout) {
                    resolve({error: "No layout engine found"});
                    return;
                }

                let steps = 0;
                let maxSteps = 1000; // Safety limit

                const startTime = Date.now();

                // Keep stepping until settled or max steps reached
                while (!layout.isSettled && steps < maxSteps) {
                    layout.step();
                    steps++;
                }

                const endTime = Date.now();

                resolve({
                    steps,
                    isSettled: layout.isSettled,
                    duration: endTime - startTime,
                    layoutType: layout.constructor.name,
                    nodeCount: graphty.graph.nodes?.size ?? 0,
                });
            });
        });

        console.log(`  Result: ${JSON.stringify(stepsMeasurement, null, 2)}`);
    }

    await browser.close();
}

main().catch(console.error);
