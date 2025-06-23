import "@storybook/addon-console";

import {Preview, setCustomElementsManifest} from "@storybook/web-components-vite";
// @ts-expect-error TS doesn't recognize virtual imports?
import manifest from "virtual:vite-plugin-cem/custom-elements-manifest";

import DocumentationTemplate from "./DocumentationTemplate.mdx";

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
            storySort: {
                order: ["Graphty"],
                method: "alphabetical",
            },
        },
    },
};

export default preview;
