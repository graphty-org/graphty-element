/**
 * Schema Discovery Stories
 * Demonstrates the schema discovery tools that help LLMs understand graph data structures.
 *
 * Features demonstrated:
 * - Schema extraction and display in system prompts
 * - sampleData command for inspecting actual data
 * - describeProperty command for analyzing property distributions
 */

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";

import type {GraphtyElement} from "../../src/graphty-element";

// Sample social network with diverse data types for schema demonstration
const SAMPLE_NODES = [
    {id: "alice", label: "Alice", type: "person", age: 28, active: true, tags: ["developer", "team-lead"]},
    {id: "bob", label: "Bob", type: "person", age: 34, active: true, tags: ["designer"]},
    {id: "carol", label: "Carol", type: "person", age: 25, active: false, tags: ["developer", "junior"]},
    {id: "dave", label: "Dave", type: "person", age: 42, active: true, tags: ["manager"]},
    {id: "eve", label: "Eve", type: "person", age: 31, active: true, tags: ["developer", "senior"]},
    {id: "proj-alpha", label: "Project Alpha", type: "project", budget: 150000, active: true},
    {id: "proj-beta", label: "Project Beta", type: "project", budget: 80000, active: false},
    {id: "proj-gamma", label: "Project Gamma", type: "project", budget: 200000, active: true},
    {id: "team-eng", label: "Engineering", type: "team", headcount: 12, active: true},
    {id: "team-design", label: "Design", type: "team", headcount: 4, active: true},
];

const SAMPLE_EDGES = [
    {src: "alice", dst: "proj-alpha", type: "works-on", weight: 0.8, since: "2023-01"},
    {src: "alice", dst: "proj-beta", type: "works-on", weight: 0.2, since: "2022-06"},
    {src: "bob", dst: "proj-alpha", type: "works-on", weight: 1.0, since: "2023-03"},
    {src: "carol", dst: "proj-gamma", type: "works-on", weight: 1.0, since: "2024-01"},
    {src: "dave", dst: "proj-alpha", type: "manages", weight: 1.0, since: "2022-01"},
    {src: "dave", dst: "proj-gamma", type: "manages", weight: 1.0, since: "2023-06"},
    {src: "eve", dst: "proj-beta", type: "works-on", weight: 0.5, since: "2021-09"},
    {src: "eve", dst: "proj-gamma", type: "works-on", weight: 0.5, since: "2024-02"},
    {src: "alice", dst: "team-eng", type: "member-of", weight: 1.0},
    {src: "carol", dst: "team-eng", type: "member-of", weight: 1.0},
    {src: "eve", dst: "team-eng", type: "member-of", weight: 1.0},
    {src: "bob", dst: "team-design", type: "member-of", weight: 1.0},
    {src: "dave", dst: "team-eng", type: "leads", weight: 1.0},
];

/**
 * Setup function for the SchemaInPrompt story.
 * Displays the extracted schema and formatted system prompt section.
 */
async function setupSchemaInPrompt(): Promise<void> {
    const element = document.querySelector<GraphtyElement>("graphty-element");
    const schemaDisplay = document.getElementById("schema-display");
    const promptDisplay = document.getElementById("prompt-display");
    const refreshBtn = document.getElementById("refresh-btn") as HTMLButtonElement | null;
    const statsDisplay = document.getElementById("stats-display");

    if (!element || !schemaDisplay || !promptDisplay) {
        console.error("Required elements not found");
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const {graph} = element;

    // Add sample data
    await graph.addNodes(SAMPLE_NODES);
    await graph.addEdges(SAMPLE_EDGES);

    // Enable AI to get access to SchemaManager
    await graph.enableAiControl({provider: "mock"});

    const displaySchema = (): void => {
        const aiManager = graph.getAiManager();
        if (!aiManager) {
            schemaDisplay.textContent = "AI not enabled";
            return;
        }

        const schemaManager = aiManager.getSchemaManager();
        if (!schemaManager) {
            schemaDisplay.textContent = "Schema manager not available";
            return;
        }

        // Display raw schema
        const schema = schemaManager.extract();
        schemaDisplay.textContent = JSON.stringify(schema, null, 2);

        // Display formatted prompt section
        const formattedSchema = schemaManager.getFormattedSchema();
        promptDisplay.textContent = formattedSchema;

        // Update stats
        if (statsDisplay) {
            statsDisplay.innerHTML = `
                <strong>Node Count:</strong> ${schema.nodeCount}<br>
                <strong>Edge Count:</strong> ${schema.edgeCount}<br>
                <strong>Node Properties:</strong> ${schema.nodeProperties.length}<br>
                <strong>Edge Properties:</strong> ${schema.edgeProperties.length}
            `;
        }
    };

    displaySchema();

    if (refreshBtn) {
        refreshBtn.addEventListener("click", () => {
            const aiManager = graph.getAiManager();
            const schemaManager = aiManager?.getSchemaManager();
            schemaManager?.invalidateCache();
            displaySchema();
        });
    }
}

/**
 * Setup function for the SampleDataDemo story.
 * Demonstrates the sampleData command with different parameters.
 */
async function setupSampleDataDemo(): Promise<void> {
    const element = document.querySelector<GraphtyElement>("graphty-element");
    const targetSelect = document.getElementById("sample-target") as HTMLSelectElement | null;
    const countInput = document.getElementById("sample-count") as HTMLInputElement | null;
    const stratifyInput = document.getElementById("stratify-by") as HTMLInputElement | null;
    const executeBtn = document.getElementById("execute-sample-btn") as HTMLButtonElement | null;
    const resultDisplay = document.getElementById("sample-result");

    if (!element || !targetSelect || !countInput || !executeBtn || !resultDisplay) {
        console.error("Required elements not found");
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const {graph} = element;

    // Add sample data
    await graph.addNodes(SAMPLE_NODES);
    await graph.addEdges(SAMPLE_EDGES);

    // Enable AI with mock provider
    await graph.enableAiControl({provider: "mock"});

    // Set up mock responses for sampleData
    const aiManager = graph.getAiManager();
    if (!aiManager) {
        return;
    }

    const executeSample = async(): Promise<void> => {
        const target = targetSelect.value as "nodes" | "edges" | "both";
        const countParsed = parseInt(countInput.value, 10);
        const count = Number.isNaN(countParsed) ? 3 : countParsed;
        const stratifyBy = stratifyInput?.value.trim() ?? undefined;

        resultDisplay.textContent = "Executing...";

        try {
            // Execute sampleData command directly through the command registry
            const registry = aiManager.getCommandRegistry();
            const command = registry.get("sampleData");

            if (!command) {
                resultDisplay.textContent = "sampleData command not found";
                return;
            }

            const result = await command.execute(graph, {target, count, stratifyBy});
            resultDisplay.textContent = JSON.stringify(result, null, 2);
        } catch (error) {
            resultDisplay.textContent = `Error: ${(error as Error).message}`;
        }
    };

    executeBtn.addEventListener("click", () => void executeSample());

    // Execute once on load
    void executeSample();
}

/**
 * Setup function for the DescribePropertyDemo story.
 * Demonstrates the describeProperty command with different property types.
 */
async function setupDescribePropertyDemo(): Promise<void> {
    const element = document.querySelector<GraphtyElement>("graphty-element");
    const propertyInput = document.getElementById("property-name") as HTMLInputElement | null;
    const targetSelect = document.getElementById("property-target") as HTMLSelectElement | null;
    const limitInput = document.getElementById("property-limit") as HTMLInputElement | null;
    const executeBtn = document.getElementById("execute-describe-btn") as HTMLButtonElement | null;
    const resultDisplay = document.getElementById("describe-result");
    const quickButtons = document.querySelectorAll<HTMLButtonElement>(".quick-btn");

    if (!element || !propertyInput || !targetSelect || !executeBtn || !resultDisplay) {
        console.error("Required elements not found");
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const {graph} = element;

    // Add sample data
    await graph.addNodes(SAMPLE_NODES);
    await graph.addEdges(SAMPLE_EDGES);

    // Enable AI with mock provider
    await graph.enableAiControl({provider: "mock"});

    const aiManager = graph.getAiManager();
    if (!aiManager) {
        return;
    }

    const executeDescribe = async(): Promise<void> => {
        const property = propertyInput.value.trim();
        if (!property) {
            resultDisplay.textContent = "Please enter a property name";
            return;
        }

        const target = targetSelect.value as "nodes" | "edges";
        const limit = parseInt(limitInput?.value ?? "20", 10);

        resultDisplay.textContent = "Analyzing...";

        try {
            const registry = aiManager.getCommandRegistry();
            const command = registry.get("describeProperty");

            if (!command) {
                resultDisplay.textContent = "describeProperty command not found";
                return;
            }

            const result = await command.execute(graph, {property, target, limit});
            resultDisplay.textContent = JSON.stringify(result, null, 2);
        } catch (error) {
            resultDisplay.textContent = `Error: ${(error as Error).message}`;
        }
    };

    executeBtn.addEventListener("click", () => void executeDescribe());

    // Quick select buttons
    quickButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const prop = btn.dataset.property;
            const target = btn.dataset.target as "nodes" | "edges" | undefined;

            if (prop) {
                propertyInput.value = prop;
            }

            if (target) {
                targetSelect.value = target;
            }

            void executeDescribe();
        });
    });

    // Execute once on load with default property
    propertyInput.value = "type";
    void executeDescribe();
}

const meta: Meta = {
    title: "AI/Schema Discovery",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# Schema Discovery

Schema discovery tools help LLMs understand the structure of graph data so they can write accurate JMESPath selectors and queries.

## Features

### 1. Automatic Schema Extraction
The system automatically extracts schema information from graph nodes and edges:
- Property names and types (string, number, boolean, array, object, mixed)
- Nullable properties
- Enum-like values (strings with ≤10 unique values)
- Numeric ranges (min/max)
- Array item types

### 2. Schema in System Prompts
The extracted schema is formatted as markdown and included in LLM system prompts, giving the LLM immediate awareness of data structure.

### 3. \`sampleData\` Command
LLMs can use this tool to inspect actual data samples:
\`\`\`json
{
  "target": "nodes" | "edges" | "both",
  "count": 1-10,
  "stratifyBy": "data.type"
}
\`\`\`

### 4. \`describeProperty\` Command
For deep-diving into specific properties:
\`\`\`json
{
  "property": "type",
  "target": "nodes" | "edges",
  "limit": 1-50
}
\`\`\`

Returns:
- **Strings**: Value distribution with counts and percentages
- **Numbers**: Min, max, avg, median, histogram
- **Booleans**: True/false counts and percentages
- **Arrays**: Unique items, item type, length statistics

## Use Cases

1. **Styling**: LLM asks "What node types exist?" → uses schema → applies styles
2. **Queries**: LLM understands available properties for filtering
3. **Analysis**: LLM explores property distributions before making recommendations
`,
            },
        },
    },
};

export default meta;

type Story = StoryObj;

export const SchemaInPrompt: Story = {
    name: "Schema in System Prompt",
    render: (): TemplateResult => {
        setTimeout(() => void setupSchemaInPrompt(), 100);

        return html`
            <style>
                .schema-demo {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    font-family: system-ui, -apple-system, sans-serif;
                    height: calc(100vh - 32px);
                    background: #f5f5f5;
                }
                .graph-panel {
                    flex: 1;
                    min-width: 300px;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                graphty-element {
                    width: 100%;
                    height: 100%;
                }
                .info-panel {
                    flex: 1;
                    min-width: 400px;
                    max-width: 600px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    overflow-y: auto;
                }
                .panel-section {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }
                .refresh-btn {
                    padding: 6px 12px;
                    font-size: 12px;
                    background: #2196f3;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .refresh-btn:hover { background: #1976d2; }
                .code-display {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 12px;
                    border-radius: 8px;
                    font-family: ui-monospace, monospace;
                    font-size: 11px;
                    white-space: pre-wrap;
                    overflow-x: auto;
                    max-height: 250px;
                    overflow-y: auto;
                }
                .stats-display {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.6;
                }
                .prompt-display {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    padding: 12px;
                    border-radius: 8px;
                    font-family: ui-monospace, monospace;
                    font-size: 11px;
                    white-space: pre-wrap;
                    overflow-x: auto;
                    max-height: 300px;
                    overflow-y: auto;
                }
            </style>

            <div class="schema-demo">
                <div class="graph-panel">
                    <graphty-element layout-type="ngraph"></graphty-element>
                </div>

                <div class="info-panel">
                    <div class="panel-section">
                        <div class="section-header">
                            <span class="section-title">📊 Graph Statistics</span>
                            <button id="refresh-btn" class="refresh-btn">Refresh Schema</button>
                        </div>
                        <div id="stats-display" class="stats-display">Loading...</div>
                    </div>

                    <div class="panel-section">
                        <div class="section-header">
                            <span class="section-title">📝 Formatted Schema (System Prompt)</span>
                        </div>
                        <div id="prompt-display" class="prompt-display">Loading...</div>
                    </div>

                    <div class="panel-section">
                        <div class="section-header">
                            <span class="section-title">🔍 Raw Schema Object</span>
                        </div>
                        <pre id="schema-display" class="code-display">Loading...</pre>
                    </div>
                </div>
            </div>
        `;
    },
};

export const SampleDataDemo: Story = {
    name: "sampleData Command",
    render: (): TemplateResult => {
        setTimeout(() => void setupSampleDataDemo(), 100);

        return html`
            <style>
                .sample-demo {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    font-family: system-ui, -apple-system, sans-serif;
                    height: calc(100vh - 32px);
                    background: #f5f5f5;
                }
                .graph-panel {
                    flex: 1;
                    min-width: 300px;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                graphty-element {
                    width: 100%;
                    height: 100%;
                }
                .control-panel {
                    flex: 1;
                    min-width: 400px;
                    max-width: 500px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .panel-section {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                }
                .form-row {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .form-label {
                    font-size: 13px;
                    color: #666;
                    min-width: 80px;
                }
                .form-input {
                    flex: 1;
                    padding: 8px 12px;
                    font-size: 13px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }
                .form-select {
                    flex: 1;
                    padding: 8px 12px;
                    font-size: 13px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    background: white;
                }
                .execute-btn {
                    padding: 10px 20px;
                    font-size: 14px;
                    background: #4caf50;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .execute-btn:hover { background: #43a047; }
                .result-display {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 12px;
                    border-radius: 8px;
                    font-family: ui-monospace, monospace;
                    font-size: 11px;
                    white-space: pre-wrap;
                    overflow-x: auto;
                    flex: 1;
                    min-height: 200px;
                    overflow-y: auto;
                }
                .hint {
                    font-size: 11px;
                    color: #888;
                    margin-top: 8px;
                    line-height: 1.5;
                }
            </style>

            <div class="sample-demo">
                <div class="graph-panel">
                    <graphty-element layout-type="ngraph"></graphty-element>
                </div>

                <div class="control-panel">
                    <div class="panel-section">
                        <div class="section-title">🎲 sampleData Command</div>

                        <div class="form-row">
                            <span class="form-label">Target:</span>
                            <select id="sample-target" class="form-select">
                                <option value="both">Both (nodes + edges)</option>
                                <option value="nodes">Nodes only</option>
                                <option value="edges">Edges only</option>
                            </select>
                        </div>

                        <div class="form-row">
                            <span class="form-label">Count:</span>
                            <input id="sample-count" type="number" class="form-input" value="3" min="1" max="10">
                        </div>

                        <div class="form-row">
                            <span class="form-label">Stratify By:</span>
                            <input id="stratify-by" type="text" class="form-input" placeholder="e.g., data.type">
                        </div>

                        <button id="execute-sample-btn" class="execute-btn">Execute sampleData</button>

                        <div class="hint">
                            <strong>stratifyBy</strong> ensures samples from each group.<br>
                            Try "data.type" to get samples from each node/edge type.
                        </div>
                    </div>

                    <div class="panel-section" style="flex: 1; display: flex; flex-direction: column;">
                        <div class="section-title">📋 Result</div>
                        <pre id="sample-result" class="result-display">Loading...</pre>
                    </div>
                </div>
            </div>
        `;
    },
};

export const DescribePropertyDemo: Story = {
    name: "describeProperty Command",
    render: (): TemplateResult => {
        setTimeout(() => void setupDescribePropertyDemo(), 100);

        return html`
            <style>
                .describe-demo {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    font-family: system-ui, -apple-system, sans-serif;
                    height: calc(100vh - 32px);
                    background: #f5f5f5;
                }
                .graph-panel {
                    flex: 1;
                    min-width: 300px;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                graphty-element {
                    width: 100%;
                    height: 100%;
                }
                .control-panel {
                    flex: 1;
                    min-width: 400px;
                    max-width: 550px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .panel-section {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                }
                .form-row {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .form-label {
                    font-size: 13px;
                    color: #666;
                    min-width: 80px;
                }
                .form-input {
                    flex: 1;
                    padding: 8px 12px;
                    font-size: 13px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }
                .form-select {
                    flex: 1;
                    padding: 8px 12px;
                    font-size: 13px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    background: white;
                }
                .execute-btn {
                    padding: 10px 20px;
                    font-size: 14px;
                    background: #7c4dff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .execute-btn:hover { background: #651fff; }
                .quick-buttons {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 12px;
                }
                .quick-btn {
                    padding: 6px 12px;
                    font-size: 12px;
                    background: #e3f2fd;
                    color: #1565c0;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .quick-btn:hover { background: #bbdefb; }
                .quick-btn.edge { background: #fce4ec; color: #c2185b; }
                .quick-btn.edge:hover { background: #f8bbd9; }
                .result-display {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 12px;
                    border-radius: 8px;
                    font-family: ui-monospace, monospace;
                    font-size: 11px;
                    white-space: pre-wrap;
                    overflow-x: auto;
                    flex: 1;
                    min-height: 200px;
                    overflow-y: auto;
                }
                .property-legend {
                    font-size: 11px;
                    color: #666;
                    line-height: 1.6;
                    margin-top: 12px;
                    padding: 10px;
                    background: #fafafa;
                    border-radius: 6px;
                }
                .property-legend code {
                    background: #e0e0e0;
                    padding: 2px 4px;
                    border-radius: 3px;
                    font-size: 10px;
                }
            </style>

            <div class="describe-demo">
                <div class="graph-panel">
                    <graphty-element layout-type="ngraph"></graphty-element>
                </div>

                <div class="control-panel">
                    <div class="panel-section">
                        <div class="section-title">🔎 describeProperty Command</div>

                        <div class="form-row">
                            <span class="form-label">Property:</span>
                            <input id="property-name" type="text" class="form-input" placeholder="e.g., type, age, weight">
                        </div>

                        <div class="form-row">
                            <span class="form-label">Target:</span>
                            <select id="property-target" class="form-select">
                                <option value="nodes">Nodes</option>
                                <option value="edges">Edges</option>
                            </select>
                        </div>

                        <div class="form-row">
                            <span class="form-label">Limit:</span>
                            <input id="property-limit" type="number" class="form-input" value="20" min="1" max="50">
                        </div>

                        <button id="execute-describe-btn" class="execute-btn">Describe Property</button>

                        <div class="quick-buttons">
                            <strong style="width: 100%; font-size: 12px; color: #666; margin-bottom: 4px;">Quick Select:</strong>
                            <button class="quick-btn" data-property="type" data-target="nodes">type (string)</button>
                            <button class="quick-btn" data-property="age" data-target="nodes">age (number)</button>
                            <button class="quick-btn" data-property="active" data-target="nodes">active (boolean)</button>
                            <button class="quick-btn" data-property="tags" data-target="nodes">tags (array)</button>
                            <button class="quick-btn edge" data-property="weight" data-target="edges">weight (number)</button>
                            <button class="quick-btn edge" data-property="type" data-target="edges">edge type</button>
                        </div>

                        <div class="property-legend">
                            <strong>Available Node Properties:</strong><br>
                            <code>type</code> <code>age</code> <code>active</code> <code>tags</code> <code>budget</code> <code>headcount</code><br>
                            <strong>Available Edge Properties:</strong><br>
                            <code>type</code> <code>weight</code> <code>since</code>
                        </div>
                    </div>

                    <div class="panel-section" style="flex: 1; display: flex; flex-direction: column;">
                        <div class="section-title">📊 Analysis Result</div>
                        <pre id="describe-result" class="result-display">Loading...</pre>
                    </div>
                </div>
            </div>
        `;
    },
};
