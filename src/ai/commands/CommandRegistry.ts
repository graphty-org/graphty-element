/**
 * Command Registry Module - Registry for graph commands.
 * @module ai/commands/CommandRegistry
 */

import type {ToolDefinition} from "../providers/types";
import type {GraphCommand} from "./types";

/**
 * Registry for graph commands that can be executed via AI.
 * Follows the same pattern as LayoutEngine.register() and Algorithm.register().
 */
export class CommandRegistry {
    private commands = new Map<string, GraphCommand>();

    /**
     * Register a new command.
     * @param command - The command to register
     * @throws Error if a command with the same name is already registered
     */
    register(command: GraphCommand): void {
        if (this.commands.has(command.name)) {
            throw new Error(`Command "${command.name}" is already registered`);
        }

        this.commands.set(command.name, command);
    }

    /**
     * Get a command by name.
     * @param name - Name of the command
     * @returns The command or undefined if not found
     */
    get(name: string): GraphCommand | undefined {
        return this.commands.get(name);
    }

    /**
     * Check if a command is registered.
     * @param name - Name of the command
     * @returns True if the command is registered
     */
    has(name: string): boolean {
        return this.commands.has(name);
    }

    /**
     * Get all registered commands.
     * @returns Array of all registered commands
     */
    getAll(): GraphCommand[] {
        return Array.from(this.commands.values());
    }

    /**
     * Get names of all registered commands.
     * @returns Array of command names
     */
    getNames(): string[] {
        return Array.from(this.commands.keys());
    }

    /**
     * Unregister a command by name.
     * @param name - Name of the command to remove
     */
    unregister(name: string): void {
        this.commands.delete(name);
    }

    /**
     * Remove all registered commands.
     */
    clear(): void {
        this.commands.clear();
    }

    /**
     * Convert all registered commands to Vercel AI SDK tool definitions.
     * @returns Array of tool definitions for use with LLM providers
     */
    toToolDefinitions(): ToolDefinition[] {
        return this.getAll().map((command) => ({
            name: command.name,
            description: command.description,
            parameters: command.parameters,
        }));
    }
}
