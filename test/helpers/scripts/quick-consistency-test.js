import {createHash} from "crypto";
import {chromium} from "playwright";

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "https://localhost:6006";

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    console.log("Testing visual consistency of ngraph layout...\n");

    const hashes = [];

    for (let i = 0; i < 3; i++) {
        console.log(`Attempt ${i + 1}/3:`);

        // Navigate to ngraph story
        await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-3d--ngraph&viewMode=story`);

        // Wait for graphty-element
        await page.waitForSelector("graphty-element", {timeout: 10000});

        // Wait for settling
        await page.waitForTimeout(5000); // Give it 5 seconds to settle

        // Take screenshot
        const screenshot = await page.locator("graphty-element").screenshot();
        const hash = createHash("sha256").update(screenshot).digest("hex");
        hashes.push(hash);

        console.log(`  Hash: ${hash.substring(0, 16)}...`);
    }

    // Check consistency
    const allIdentical = hashes.every((hash) => hash === hashes[0]);

    if (allIdentical) {
        console.log("\n✅ Layout is consistent across runs!");
    } else {
        console.log("\n❌ Layout is NOT consistent - different hashes detected");
    }

    await browser.close();
}

main().catch(console.error);
