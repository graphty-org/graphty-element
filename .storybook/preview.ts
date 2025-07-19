// import "@storybook/addon-console";
import "../src/layout/index";
import "../src/data/index";
import "../src/algorithms/index";

import {Preview, setCustomElementsManifest} from "@storybook/web-components-vite";
import eruda from "eruda";
// @ts-expect-error TS doesn't recognize virtual imports?
import manifest from "virtual:vite-plugin-cem/custom-elements-manifest";

// Force import and registration of graphty-element and all its dependencies
import {Graphty} from "../src/graphty-element";
import {initConsoleCaptureUI} from "./console-capture-ui";
import DocumentationTemplate from "./DocumentationTemplate.mdx";

// Ensure custom element is registered
if (!customElements.get("graphty-element")) {
    // console.log("[preview] Registering graphty-element...");
    customElements.define("graphty-element", Graphty);
}

// Initialize console capture with UI
initConsoleCaptureUI();

// eruda.init();
// eruda.show("console");
// eruda.position({x: window.innerWidth - 60, y: 20});

setCustomElementsManifest(manifest);

// Global play function to wait for graph to settle
async function waitForGraphSettled({canvasElement}: {canvasElement: HTMLElement}): Promise<void> {
    const graphtyElement = canvasElement.querySelector("graphty-element");
    if (!graphtyElement) {
        // No graphty-element in this story
        return;
    }

    // Wait for the graph-settled event
    await new Promise<void>((resolve) => {
        let settled = false;
        const timeout = setTimeout(() => {
            if (!settled) {
                console.warn("Graph settled timeout - proceeding anyway");
                settled = true;
                resolve();
            }
        }, 10000); // 10 second timeout

        const handleSettled = (): void => {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                resolve();
            }
        };

        // Add the event listener
        graphtyElement.addEventListener("graph-settled", handleSettled, {once: true});
    });
}

const preview: Preview = {
    play: waitForGraphSettled,
    parameters: {
        // actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            expanded: true,
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            page: DocumentationTemplate,
        },
        chromatic: {
            delay: 500, // Small initial delay
            pauseAnimationAtEnd: true,
        },
        options: {
            storySort: {
                method: "alphabetical",
                order: [
                    // Graphty stories first
                    "Graphty",
                    ["Default", "*"],
                    // Then other top-level stories
                    "Data",
                    ["Default", "*"],
                    "Calculated",
                    ["Default", "*"],
                    // Layout stories
                    "Layout",
                    ["3D", ["Default", "*"], "2D", ["Default", "*"]],
                    // Style stories
                    "Styles",
                    [
                        "Node",
                        ["Default", "*"],
                        "Edge",
                        ["Default", "*"],
                        "Graph",
                        ["Default", "*"],
                        "Label",
                        ["Default", "*"],
                    ],
                ],
                includeNames: true,
            },
        },
    },
};

export default preview;
