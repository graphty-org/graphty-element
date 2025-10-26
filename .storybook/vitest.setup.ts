import {Logger} from "@babylonjs/core";
import {setProjectAnnotations} from "@storybook/web-components-vite";

import * as projectAnnotations from "./preview";

// Suppress Babylon.js logs during tests
Logger.LogLevels = Logger.ErrorLogLevel;

// Suppress Lit dev mode warnings
if (typeof window !== "undefined") {
    // @ts-expect-error - Global window modification for test environment
    window.litIssuedWarnings = new Set(); // Prevent duplicate warnings
    // Suppress console warnings from Lit during tests
    const originalWarn = console.warn;
    console.warn = (... args: unknown[]) => {
        const message = args[0];
        if (typeof message === "string" &&
            (message.includes("Lit is in dev mode") ||
             message.includes("Multiple versions of Lit loaded"))) {
            return; // Suppress Lit warnings
        }

        originalWarn.apply(console, args);
    };
}

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);
