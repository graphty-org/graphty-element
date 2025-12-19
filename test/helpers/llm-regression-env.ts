/**
 * LLM Regression Environment Utilities
 * @module test/helpers/llm-regression-env
 *
 * Environment variable handling for LLM regression tests.
 */

/**
 * Get the OpenAI API key from environment variables.
 * @returns The API key or undefined if not set
 */
export function getOpenAiApiKey(): string | undefined {
    // Vite exposes env vars with VITE_ prefix via import.meta.env
    // The env object always exists in Vite context
    const viteApiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    if (viteApiKey) {
        return viteApiKey;
    }

    // Fallback for Node.js environment
    if (typeof process !== "undefined" && process.env.VITE_OPENAI_API_KEY) {
        return process.env.VITE_OPENAI_API_KEY;
    }

    return undefined;
}

/**
 * Check if LLM regression tests should be enabled.
 * Tests are enabled when VITE_OPENAI_API_KEY is set.
 * @returns True if LLM regression tests should run
 */
export function isLlmRegressionEnabled(): boolean {
    const apiKey = getOpenAiApiKey();
    return apiKey !== undefined && apiKey.length > 0;
}

/**
 * Get the reason why LLM regression tests are disabled.
 * @returns A descriptive message for why tests are being skipped
 */
export function getSkipReason(): string {
    return "LLM regression tests require VITE_OPENAI_API_KEY environment variable to be set";
}

/**
 * Create a skip condition for LLM regression tests.
 * Use with vitest's skipIf: describe.skipIf(skipIfNoApiKey)("suite name", ...)
 * @returns True if tests should be skipped (no API key available)
 */
export function skipIfNoApiKey(): boolean {
    return !isLlmRegressionEnabled();
}

/**
 * Get the model to use for LLM regression tests.
 * Defaults to gpt-4o-mini for cost-efficiency.
 * @returns The model identifier
 */
export function getLlmRegressionModel(): string {
    // Allow override via environment variable
    const viteModel = import.meta.env.VITE_LLM_REGRESSION_MODEL as string | undefined;
    if (viteModel) {
        return viteModel;
    }

    if (typeof process !== "undefined" && process.env.VITE_LLM_REGRESSION_MODEL) {
        return process.env.VITE_LLM_REGRESSION_MODEL;
    }

    return "gpt-4o-mini";
}
