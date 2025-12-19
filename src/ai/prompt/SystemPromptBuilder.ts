/**
 * System Prompt Builder Module - Builds dynamic system prompts with graph context.
 * @module ai/prompt/SystemPromptBuilder
 */

import type {Graph} from "../../Graph";
import type {GraphCommand} from "../commands/types";
import {formatSchemaForPrompt} from "../schema/SchemaFormatter";
import type {SchemaSummary} from "../schema/types";

/**
 * Options for building system prompts.
 */
export interface SystemPromptOptions {
    /** Include graph statistics in the prompt */
    includeStats?: boolean;
    /** Include current layout information */
    includeLayout?: boolean;
    /** Include available commands as tools */
    includeCommands?: boolean;
    /** Include data schema information */
    includeSchema?: boolean;
    /** Custom additional context */
    additionalContext?: string;
}

/**
 * Builds dynamic system prompts for the AI controller.
 * Incorporates graph context, available commands, and current state.
 */
export class SystemPromptBuilder {
    private commands: GraphCommand[] = [];
    private graph: Graph | null = null;
    private schemaSummary: SchemaSummary | null = null;

    /**
     * Set the graph instance for context.
     * @param graph - The graph instance
     */
    setGraph(graph: Graph): void {
        this.graph = graph;
    }

    /**
     * Set the available commands.
     * @param commands - Array of registered commands
     */
    setCommands(commands: GraphCommand[]): void {
        this.commands = commands;
    }

    /**
     * Set the schema summary for data context.
     * @param schema - The schema summary to include in prompts
     */
    setSchema(schema: SchemaSummary): void {
        this.schemaSummary = schema;
    }

    /**
     * Clear the schema summary.
     */
    clearSchema(): void {
        this.schemaSummary = null;
    }

    /**
     * Build the system prompt with current context.
     * @param options - Build options
     * @returns The complete system prompt
     */
    build(options: SystemPromptOptions = {}): string {
        const {
            includeStats = true,
            includeLayout = true,
            includeCommands = true,
            includeSchema = true,
            additionalContext,
        } = options;

        const sections: string[] = [];

        // Base prompt
        sections.push(this.buildBasePrompt());

        // Graph statistics
        if (includeStats && this.graph) {
            sections.push(this.buildStatsSection());
        }

        // Data schema (after stats, before layout)
        if (includeSchema && this.schemaSummary) {
            sections.push(this.buildSchemaSection());
        }

        // Layout information
        if (includeLayout && this.graph) {
            sections.push(this.buildLayoutSection());
        }

        // Available commands
        if (includeCommands && this.commands.length > 0) {
            sections.push(this.buildCommandsSection());
        }

        // Additional context
        if (additionalContext) {
            sections.push(`\n## Additional Context\n${additionalContext}`);
        }

        // Instructions
        sections.push(this.buildInstructionsSection());

        return sections.join("\n\n");
    }

    /**
     * Build the base introduction prompt.
     */
    private buildBasePrompt(): string {
        return `You are an AI assistant that helps users interact with a graph visualization application called Graphty.

You can help users:
- Query information about the graph (node counts, edge counts, structure)
- Change the layout algorithm (circular, force-directed, grid, etc.)
- Switch between 2D and 3D visualization modes
- Enter immersive VR/AR modes (if supported)
- Navigate and explore the graph visually`;
    }

    /**
     * Build the statistics section.
     */
    private buildStatsSection(): string {
        if (!this.graph) {
            return "";
        }

        const nodeCount = this.graph.getNodeCount();
        const edgeCount = this.graph.getEdgeCount();

        return `## Current Graph State
- Total nodes: ${nodeCount}
- Total edges: ${edgeCount}
- Visualization mode: ${this.graph.is2D() ? "2D" : "3D"}`;
    }

    /**
     * Build the schema section.
     */
    private buildSchemaSection(): string {
        if (!this.schemaSummary) {
            return "";
        }

        return formatSchemaForPrompt(this.schemaSummary);
    }

    /**
     * Build the layout section.
     */
    private buildLayoutSection(): string {
        if (!this.graph) {
            return "";
        }

        const layoutManager = this.graph.getLayoutManager();
        const currentLayout = layoutManager.layoutEngine?.type ?? "unknown";

        return `## Layout Information
- Current layout: ${currentLayout}
- Available layouts: circular, ngraph (force-directed), random, grid, d3`;
    }

    /**
     * Build the commands section.
     */
    private buildCommandsSection(): string {
        const commandDescriptions = this.commands
            .map((cmd) => {
                const examples = cmd.examples.length > 0 ?
                    `\n  Examples: ${cmd.examples.slice(0, 2).map((e) => `"${e.input}"`).join(", ")}` :
                    "";
                return `- **${cmd.name}**: ${cmd.description}${examples}`;
            })
            .join("\n");

        return `## Available Commands (Tools)
${commandDescriptions}`;
    }

    /**
     * Build the instructions section.
     */
    private buildInstructionsSection(): string {
        return `## Instructions
1. When the user asks about the graph, use the queryGraph tool to get accurate information.
2. When the user asks about node types, edge types, or available properties, use the getSchema tool.
3. When the user wants to change the layout, use the setLayout tool.
4. When the user wants to switch dimensions (2D/3D), use the setDimension tool.
5. When the user wants VR/AR mode, use the setImmersiveMode tool.
6. If no tool is needed, respond conversationally and helpfully.
7. Always explain what you're doing when executing commands.
8. If a command fails, explain the error and suggest alternatives.`;
    }

    /**
     * Build a minimal prompt without graph context.
     * Useful when graph is not yet available.
     */
    buildMinimal(): string {
        return `You are an AI assistant that helps users interact with a graph visualization.

When tools are available, use them to:
- Query graph information
- Change layouts
- Switch visualization modes

If no tools match the user's request, respond conversationally.`;
    }
}

/**
 * Create a new SystemPromptBuilder instance.
 */
export function createSystemPromptBuilder(): SystemPromptBuilder {
    return new SystemPromptBuilder();
}
