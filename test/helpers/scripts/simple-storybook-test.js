import {chromium} from "playwright";

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    console.log("Testing Storybook connection...");

    try {
    // First test if storybook is accessible
        const response = await page.goto("http://dev.ato.ms:9025", {timeout: 5000});
        console.log(`Storybook main page status: ${response.status()}`);

        // Test a specific story
        const storyResponse = await page.goto("http://dev.ato.ms:9025/iframe.html?id=layout-3d--ngraph&viewMode=story", {timeout: 5000});
        console.log(`Story page status: ${storyResponse.status()}`);

        // Check if graphty-element exists
        await page.waitForTimeout(3000);
        const hasGraphtyElement = await page.evaluate(() => {
            return !!document.querySelector("graphty-element");
        });

        console.log(`Has graphty-element: ${hasGraphtyElement}`);

        // Take a screenshot to see what's there
        await page.screenshot({path: "test/screenshots/storybook-debug.png", fullPage: true});
        console.log("Screenshot saved to test/screenshots/storybook-debug.png");
    } catch (error) {
        console.error("Error accessing storybook:", error.message);
    }

    await browser.close();
}

main().catch(console.error);
