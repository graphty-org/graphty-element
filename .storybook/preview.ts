import "@storybook/addon-console";
import {Preview, setCustomElementsManifest} from "@storybook/web-components";
// @ts-expect-error TS doesn't recognize virtual imports?
import manifest from "virtual:vite-plugin-cem/custom-elements-manifest";

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
    },
};

export default preview;
