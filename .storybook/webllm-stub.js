/**
 * WebLLM stub module for Storybook development.
 * This loads the actual @mlc-ai/web-llm library from a CDN at runtime.
 * The library is too large to bundle and requires WebGPU which is only available in the browser.
 *
 * Uses esm.run CDN as recommended by WebLLM documentation.
 * See: https://webllm.mlc.ai/docs/user/get_started.html
 */

// Load from esm.run CDN - the recommended CDN for WebLLM
// See: https://github.com/mlc-ai/web-llm/issues/319
const CDN_URL = "https://esm.run/@mlc-ai/web-llm";

let webllmModule = null;
let loadPromise = null;

async function loadWebLLM() {
    if (webllmModule) {
        return webllmModule;
    }

    if (!loadPromise) {
        loadPromise = import(/* @vite-ignore */ CDN_URL).then(module => {
            webllmModule = module;
            return module;
        });
    }

    return loadPromise;
}

// Export a proxy that loads the real module on first use
export async function CreateMLCEngine(model, options) {
    const webllm = await loadWebLLM();
    return webllm.CreateMLCEngine(model, options);
}

// Re-export other commonly used items as async getters
export async function hasModelInCache(model) {
    const webllm = await loadWebLLM();
    return webllm.hasModelInCache(model);
}

export async function deleteModelFromCache(model) {
    const webllm = await loadWebLLM();
    return webllm.deleteModelFromCache(model);
}

// For any other exports, provide a way to get the full module
export async function getWebLLM() {
    return loadWebLLM();
}
