import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            all: true,
            reporter: ["text", "json-summary", "json"],
        },
    },
});
