import {chromium} from "playwright";

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "https://localhost:6006";

async function main() {
    const browser = await chromium.launch({headless: true});
    const page = await browser.newPage();

    // Capture console messages
    page.on("console", (msg) => {
        console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
    });

    // Capture page errors
    page.on("pageerror", (error) => {
        console.log(`PAGE ERROR: ${error.message}`);
    });

    console.log("Navigating to story and checking for errors...");

    try {
        await page.goto(`${STORYBOOK_URL}/iframe.html?id=layout-3d--ngraph&viewMode=story`);
        await page.waitForTimeout(8000);

        console.log("Checking element properties...");
        const elementInfo = await page.evaluate(() => {
            const el = document.querySelector("graphty-element");
            if (!el) {
                return {error: "No element found"};
            }

            const props = {};
            for (const prop of ["dataSource", "dataSourceConfig", "layout", "layoutConfig", "styleTemplate"]) {
                try {
                    props[prop] = el[prop] ? "present" : "missing";
                } catch (e) {
                    props[prop] = `error: ${e.message}`;
                }
            }

            return {props};
        });

        console.log("Element properties:", JSON.stringify(elementInfo, null, 2));
    } catch (error) {
        console.log(`Navigation error: ${error.message}`);
    }

    await browser.close();
}

main().catch(console.error);
