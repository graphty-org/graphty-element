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
            expanded: true,
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
                method: 'alphabetical',
                order: [
                    // Graphty stories first
                    'Graphty',
                    ['Default', '*'],
                    // Then other top-level stories
                    'Data',
                    ['Default', '*'],
                    'Calculated',
                    ['Default', '*'],
                    // Layout stories
                    'Layout',
                    ['3D', ['Default', '*'], '2D', ['Default', '*']],
                    // Style stories
                    'Styles',
                    [
                        'Node', ['Default', '*'],
                        'Edge', ['Default', '*'],
                        'Graph', ['Default', '*'],
                        'Label', ['Default', '*']
                    ],
                ],
                includeNames: true,
            },
        },
    },
};

export default preview;
