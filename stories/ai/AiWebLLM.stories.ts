/**
 * AI WebLLM Story
 * Demonstrates in-browser LLM using WebLLM and WebGPU.
 * Phase 8: WebLLM Provider & Final Documentation
 */

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";

import type {WebLlmProvider} from "../../src/ai/providers/WebLlmProvider";

// Global provider instance (dynamically loaded)
let provider: WebLlmProvider | null = null;

// Check WebGPU availability without importing WebLlmProvider
async function checkWebGPU(): Promise<boolean> {
    if (typeof navigator === "undefined") {
        return false;
    }

    try {
        if (!("gpu" in navigator)) {
            return false;
        }

        const {gpu} = navigator;
        if (!gpu) {
            return false;
        }

        const adapter = await gpu.requestAdapter();

        return Boolean(adapter);
    } catch {
        return false;
    }
}

// Available models (defined here to avoid importing WebLlmProvider at load time)
const AVAILABLE_MODELS = [
    {id: "Llama-3.2-1B-Instruct-q4f32_1-MLC", name: "Llama 3.2 1B", size: "~500MB"},
    {id: "Llama-3.2-3B-Instruct-q4f32_1-MLC", name: "Llama 3.2 3B", size: "~1.5GB"},
    {id: "Phi-3.5-mini-instruct-q4f16_1-MLC", name: "Phi 3.5 Mini", size: "~2GB"},
    {id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", name: "Qwen 2.5 1.5B", size: "~800MB"},
    {id: "SmolLM2-360M-Instruct-q4f16_1-MLC", name: "SmolLM2 360M", size: "~200MB"},
];

// Setup WebLLM demo
async function setupWebLlmDemo(): Promise<void> {
    const webgpuCheck = document.getElementById("webgpu-check");
    const modelSelect = document.getElementById("model-select") as HTMLSelectElement | null;
    const loadBtn = document.getElementById("load-btn") as HTMLButtonElement | null;
    const progressFill = document.getElementById("progress-fill");
    const status = document.getElementById("status");
    const promptInput = document.getElementById("prompt") as HTMLInputElement | null;
    const generateBtn = document.getElementById("generate-btn") as HTMLButtonElement | null;
    const output = document.getElementById("output");

    if (!webgpuCheck || !modelSelect || !loadBtn || !status || !promptInput || !generateBtn || !output || !progressFill) {
        // Elements not found - DOM not ready yet
        return;
    }

    // Check WebGPU availability
    const isWebGPUAvailable = await checkWebGPU();

    if (isWebGPUAvailable) {
        webgpuCheck.innerHTML = `
            <div style="color: #2e7d32; padding: 10px; background: #e8f5e9; border-radius: 4px; margin-bottom: 10px;">
                ✓ WebGPU is available! You can use in-browser LLM.
            </div>
        `;
    } else {
        webgpuCheck.innerHTML = `
            <div style="color: #c62828; padding: 10px; background: #ffebee; border-radius: 4px; margin-bottom: 10px;">
                ✗ WebGPU is not available. Please use Chrome 113+ with WebGPU enabled.
                <br><br>
                <strong>To enable WebGPU:</strong>
                <ol>
                    <li>Open chrome://flags</li>
                    <li>Search for "WebGPU"</li>
                    <li>Enable "Unsafe WebGPU"</li>
                    <li>Restart Chrome</li>
                </ol>
            </div>
        `;
        loadBtn.disabled = true;
        return;
    }

    // Populate model select
    modelSelect.innerHTML = AVAILABLE_MODELS.map((m) => `
        <option value="${m.id}">${m.name} (${m.size})</option>
    `).join("");

    // Load button handler
    loadBtn.addEventListener("click", () => {
        void (async() => {
            loadBtn.disabled = true;
            modelSelect.disabled = true;
            status.textContent = "Initializing WebLLM...";
            progressFill.style.width = "0%";

            try {
                // Dynamically import WebLlmProvider only when needed
                const {WebLlmProvider} = await import("../../src/ai/providers/WebLlmProvider");

                // Create new provider with selected model
                provider = new WebLlmProvider();
                provider.configure({model: modelSelect.value});

                // Register progress callback
                provider.onProgress((progress, text) => {
                    progressFill.style.width = `${progress * 100}%`;
                    status.textContent = text;
                });

                // Initialize (this downloads the model)
                await provider.initialize();

                status.textContent = "Model loaded! Ready to generate.";
                progressFill.style.width = "100%";
                promptInput.disabled = false;
                generateBtn.disabled = false;
            } catch (error) {
                status.textContent = `Error: ${(error as Error).message}`;
                progressFill.style.width = "0%";
                loadBtn.disabled = false;
                modelSelect.disabled = false;
            }
        })();
    });

    // Generate button handler
    const handleGenerate = async(): Promise<void> => {
        if (!provider?.isReady) {
            output.textContent = "Please load a model first.";
            return;
        }

        const prompt = promptInput.value.trim();
        if (!prompt) {
            output.textContent = "Please enter a prompt.";
            return;
        }

        generateBtn.disabled = true;
        promptInput.disabled = true;
        output.textContent = "Generating...";

        try {
            // Use streaming for better UX
            let responseText = "";
            await provider.generateStream(
                [{role: "user", content: prompt}],
                [],
                {
                    onChunk: (chunk) => {
                        responseText += chunk;
                        output.textContent = responseText;
                    },
                    onComplete: () => {
                        // Streaming complete
                    },
                    onError: (error) => {
                        output.textContent = `Error: ${error.message}`;
                    },
                    onToolCall: () => {
                        // Not used in this demo
                    },
                    onToolResult: () => {
                        // Not used in this demo
                    },
                },
            );
        } catch (error) {
            output.textContent = `Error: ${(error as Error).message}`;
        } finally {
            generateBtn.disabled = false;
            promptInput.disabled = false;
        }
    };

    generateBtn.addEventListener("click", () => void handleGenerate());
    promptInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            void handleGenerate();
        }
    });
}

const meta: Meta = {
    title: "AI/WebLLM (In-Browser)",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# In-Browser LLM with WebLLM

Run LLMs entirely in your browser using WebGPU. No API key required!

## Requirements

- **Browser**: Chrome 113+ with WebGPU enabled
- **Hardware**: GPU with WebGPU support
- **Storage**: 500MB - 2GB for model download (cached after first download)

## How It Works

1. **Select a Model**: Choose from available models based on your needs
   - Smaller models (1B params): Faster, less accurate
   - Larger models (3B+ params): Slower, more accurate

2. **Load the Model**: Downloads the model to your browser's cache
   - First load takes longer (downloading)
   - Subsequent loads are faster (from cache)

3. **Generate**: Enter prompts and get responses
   - Runs entirely in your browser
   - No data sent to any server

## Available Models

| Model | Size | Use Case |
|-------|------|----------|
| Llama 3.2 1B | ~500MB | Fast responses, basic tasks |
| Llama 3.2 3B | ~1.5GB | Better quality, moderate speed |
| Phi 3.5 Mini | ~2GB | Good balance of quality and speed |
| Qwen 2.5 1.5B | ~800MB | Multilingual support |
| SmolLM2 360M | ~200MB | Very fast, limited capability |

## Privacy

All processing happens locally:
- No data leaves your browser
- No API keys needed
- Works offline after model download
                `,
            },
        },
    },
    render: (): TemplateResult => {
        // Use setTimeout to setup demo after DOM renders
        setTimeout(() => void setupWebLlmDemo(), 100);

        return html`
            <style>
                .webllm-panel {
                    padding: 20px;
                    max-width: 700px;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .webllm-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .webllm-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #7c4dff, #448aff);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                }
                .webllm-title {
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0;
                }
                .webllm-subtitle {
                    color: #666;
                    margin: 0;
                }
                .info-box {
                    background: #e3f2fd;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    font-size: 14px;
                    color: #1565c0;
                }
                #webgpu-check {
                    margin-bottom: 16px;
                }
                .model-section {
                    background: #fafafa;
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }
                .model-row {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                #model-select {
                    flex: 1;
                    min-width: 200px;
                    padding: 10px 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    background: white;
                }
                #load-btn {
                    padding: 10px 20px;
                    font-size: 14px;
                    background: #7c4dff;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                #load-btn:hover:not(:disabled) {
                    background: #651fff;
                }
                #load-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                .progress-bar {
                    width: 100%;
                    height: 24px;
                    background: #e0e0e0;
                    border-radius: 12px;
                    margin: 16px 0;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #7c4dff, #448aff);
                    transition: width 0.3s ease;
                    border-radius: 12px;
                }
                #status {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 16px;
                    min-height: 20px;
                }
                .prompt-section {
                    border-top: 1px solid #eee;
                    padding-top: 16px;
                }
                .prompt-row {
                    display: flex;
                    gap: 12px;
                }
                #prompt {
                    flex: 1;
                    padding: 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                }
                #prompt:focus {
                    border-color: #7c4dff;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.2);
                }
                #prompt:disabled {
                    background: #f5f5f5;
                }
                #generate-btn {
                    padding: 12px 24px;
                    font-size: 14px;
                    background: #448aff;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                #generate-btn:hover:not(:disabled) {
                    background: #2979ff;
                }
                #generate-btn:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                #output {
                    margin-top: 16px;
                    padding: 16px;
                    background: #fafafa;
                    border-radius: 8px;
                    min-height: 100px;
                    max-height: 400px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    font-family: ui-monospace, monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    border: 1px solid #eee;
                }
                .sample-prompts {
                    margin-top: 16px;
                    font-size: 13px;
                    color: #666;
                }
                .sample-prompts strong {
                    color: #333;
                }
                .sample-prompt {
                    display: inline-block;
                    margin: 4px;
                    padding: 4px 10px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }
                .sample-prompt:hover {
                    background: #f0f0f0;
                }
            </style>
            <div class="webllm-panel">
                <div class="webllm-header">
                    <div class="webllm-icon">W</div>
                    <div>
                        <h2 class="webllm-title">In-Browser LLM</h2>
                        <p class="webllm-subtitle">Powered by WebLLM + WebGPU</p>
                    </div>
                </div>

                <div class="info-box">
                    Run LLMs entirely in your browser using WebGPU. No API key required!
                </div>

                <div id="webgpu-check">Checking WebGPU availability...</div>

                <div class="model-section">
                    <div class="model-row">
                        <select id="model-select">
                            <option>Loading models...</option>
                        </select>
                        <button id="load-btn">Load Model</button>
                    </div>

                    <div class="progress-bar">
                        <div id="progress-fill" class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div id="status">Select a model and click Load to begin</div>
                </div>

                <div class="prompt-section">
                    <div class="prompt-row">
                        <input id="prompt" type="text" placeholder="Enter your prompt..." disabled>
                        <button id="generate-btn" disabled>Generate</button>
                    </div>

                    <pre id="output">Load a model to start generating text.</pre>

                    <div class="sample-prompts">
                        <strong>Try these prompts:</strong><br>
                        <span class="sample-prompt" onclick="document.getElementById('prompt').value = 'Explain quantum computing in simple terms'">Explain quantum computing</span>
                        <span class="sample-prompt" onclick="document.getElementById('prompt').value = 'Write a haiku about programming'">Write a haiku</span>
                        <span class="sample-prompt" onclick="document.getElementById('prompt').value = 'What is the capital of France?'">Capital of France</span>
                        <span class="sample-prompt" onclick="document.getElementById('prompt').value = 'List 5 benefits of exercise'">Benefits of exercise</span>
                    </div>
                </div>
            </div>
        `;
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
