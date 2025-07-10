// import "@storybook/addon-console";
import {Preview, setCustomElementsManifest} from "@storybook/web-components-vite";
import eruda from "eruda";
// @ts-expect-error TS doesn't recognize virtual imports?
import manifest from "virtual:vite-plugin-cem/custom-elements-manifest";

import DocumentationTemplate from "./DocumentationTemplate.mdx";
eruda.init();
eruda.show("console");
eruda.position({x: window.innerWidth - 60, y: 20});

setCustomElementsManifest(manifest);

const preview: Preview = {
    parameters: {
        // actions: { argTypesRegex: "^on[A-Z].*" },
        controls: {
            exapanded: true,
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            page: DocumentationTemplate,
        },
        options: {
            storySort: (a, b) => {
                // Define stories that should always come first (in this order)
                const priorityStories = [
                    "graphty--docs",
                ];

                const aIndex = priorityStories.indexOf(a.id);
                const bIndex = priorityStories.indexOf(b.id);

                // Check if story names contain "Default" (case-insensitive)
                const aHasDefault = a.name.toLowerCase().includes("default");
                const bHasDefault = b.name.toLowerCase().includes("default");

                // If both are in priority list, sort by their priority order
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }

                // If only one is in priority list, it comes first
                if (aIndex !== -1) {
                    return -1;
                }

                if (bIndex !== -1) {
                    return 1;
                }

                // If both have "Default", sort them alphabetically among themselves
                if (aHasDefault && bHasDefault) {
                    return a.id.localeCompare(b.id, undefined, {numeric: true});
                }

                // If only one has "Default", it comes first (after priority list)
                if (aHasDefault) {
                    return -1;
                }

                if (bHasDefault) {
                    return 1;
                }

                // Otherwise, sort alphabetically
                return a.id.localeCompare(b.id, undefined, {numeric: true});
            }},
    },
};

export default preview;
