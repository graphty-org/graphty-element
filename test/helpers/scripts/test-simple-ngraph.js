import {chromium} from "playwright";

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

    console.log("Testing simple ngraph layout with proper config...");

    await page.goto("http://dev.ato.ms:9025");
    await page.waitForTimeout(3000);

    // Create a simple graphty element with just the essential config
    const result = await page.evaluate(() => {
        const graphty = document.createElement("graphty-element");

        // Set basic properties
        graphty.nodeData = [
            {id: 0}, {id: 1}, {id: 2},
        ];
        graphty.edgeData = [
            {src: 0, dst: 1}, {src: 1, dst: 2},
        ];

        graphty.layout = "ngraph";
        graphty.layoutConfig = {
            seed: 12,
            springLength: 30,
            springCoefficient: 0.0008, // Use correct new name
            gravity: -1.2,
            theta: 0.8,
            dragCoefficient: 0.02, // Use correct new name
            timeStep: 20,
        };

        // Simple style template
        graphty.styleTemplate = {
            graphtyTemplate: true,
            majorVersion: "1",
            layers: [{
                node: {
                    selector: "",
                    style: {
                        shape: {type: "sphere", size: 2},
                        texture: {color: "steelblue"},
                    },
                },
                edge: {
                    selector: "",
                    style: {
                        line: {width: 1, color: "lightgray"},
                    },
                },
            }],
            graph: {},
            behavior: {node: {pinOnDrag: true}},
        };

        document.body.appendChild(graphty);

        // Wait a moment for initialization
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    hasGraph: !!graphty.graph,
                    hasLayoutManager: !!graphty.graph?.layoutManager,
                    hasLayoutEngine: !!graphty.graph?.layoutManager?.layoutEngine,
                    layoutType: graphty.graph?.layoutManager?.layoutEngine?.constructor?.name,
                    nodeCount: graphty.graph?.nodes?.size ?? 0,
                    edgeCount: graphty.graph?.edges?.size ?? 0,
                });
            }, 3000);
        });
    });

    console.log("Simple ngraph result:", JSON.stringify(result, null, 2));

    await browser.close();
}

main().catch(console.error);
