/**
 * @fileoverview Unified Options Schema System
 *
 * This module provides a Zod-based schema system that combines validation
 * with rich UI metadata. Both algorithms and layouts use this system to
 * define their configurable options.
 *
 * Key features:
 * - Zod for robust validation
 * - UI metadata (labels, descriptions, advanced flags)
 * - Type-safe option inference
 * - Consistent discovery APIs
 */

import {z} from "zod/v4";

/**
 * UI metadata for an option (not validation - that's Zod's job)
 */
export interface OptionMeta {
    /** Human-readable label for UI display */
    label: string;
    /** Detailed description/help text */
    description: string;
    /** Hide in basic UI mode (show only in advanced settings) */
    advanced?: boolean;
    /** Group related options together in UI */
    group?: string;
    /** Suggested step increment for numeric sliders */
    step?: number;
}

/**
 * A single option definition: Zod schema + UI metadata
 */
export interface OptionDefinition<T extends z.ZodType = z.ZodType> {
    /** Zod schema for validation and type inference */
    schema: T;
    /** UI metadata for display and organization */
    meta: OptionMeta;
}

/**
 * Complete options schema: map of option names to definitions
 */
export type OptionsSchema = Record<string, OptionDefinition>;

/**
 * Infer TypeScript types from an OptionsSchema
 *
 * @example
 * ```typescript
 * const myOptions = defineOptions({
 *     threshold: {
 *         schema: z.number().default(0.5),
 *         meta: { label: "Threshold", description: "..." }
 *     }
 * });
 * type MyOptions = InferOptions<typeof myOptions>;
 * // MyOptions = { threshold: number }
 * ```
 */
export type InferOptions<S extends OptionsSchema> = {
    [K in keyof S]: z.infer<S[K]["schema"]>;
};

/**
 * Partial options type for constructor parameters
 */
export type PartialOptions<S extends OptionsSchema> = Partial<InferOptions<S>>;

/**
 * Helper to define options with full type inference
 *
 * @example
 * ```typescript
 * export const myOptions = defineOptions({
 *     dampingFactor: {
 *         schema: z.number().min(0).max(1).default(0.85),
 *         meta: {
 *             label: "Damping Factor",
 *             description: "Probability of following a link",
 *             step: 0.05,
 *         },
 *     },
 * });
 * ```
 */
export function defineOptions<S extends OptionsSchema>(schema: S): S {
    return schema;
}

/**
 * Extract just the Zod object schema for validation
 *
 * This creates a z.object() from the individual field schemas,
 * allowing standard Zod parsing/validation.
 */
export function toZodSchema<S extends OptionsSchema>(
    optionsSchema: S,
): z.ZodObject<{[K in keyof S]: S[K]["schema"]}> {
    const shape: Record<string, z.ZodType> = {};
    for (const [key, def] of Object.entries(optionsSchema)) {
        shape[key] = def.schema;
    }

    return z.object(shape) as z.ZodObject<{[K in keyof S]: S[K]["schema"]}>;
}

/**
 * Validate and parse options using the schema
 *
 * Uses Zod for validation, applying defaults from the schema.
 * Throws ZodError if validation fails.
 *
 * @example
 * ```typescript
 * const options = parseOptions(myOptionsSchema, { dampingFactor: 0.9 });
 * // options is fully typed with all defaults applied
 * ```
 */
export function parseOptions<S extends OptionsSchema>(
    optionsSchema: S,
    options: PartialOptions<S>,
): InferOptions<S> {
    const zodSchema = toZodSchema(optionsSchema);
    return zodSchema.parse(options) as InferOptions<S>;
}

/**
 * Result type for safe parsing
 */
export type SafeParseResult<T> =
    | {success: true, data: T}
    | {success: false, error: z.ZodError};

/**
 * Safely parse options, returning a result object instead of throwing
 *
 * @returns Object with success flag and either data or error
 */
export function safeParseOptions<S extends OptionsSchema>(
    optionsSchema: S,
    options: PartialOptions<S>,
): SafeParseResult<InferOptions<S>> {
    const zodSchema = toZodSchema(optionsSchema);
    const result = zodSchema.safeParse(options);
    if (result.success) {
        return {success: true, data: result.data as InferOptions<S>};
    }

    return {success: false, error: result.error};
}

/**
 * Get default values from an options schema
 *
 * Extracts the default value from each Zod schema definition.
 */
export function getDefaults<S extends OptionsSchema>(
    optionsSchema: S,
): InferOptions<S> {
    const zodSchema = toZodSchema(optionsSchema);
    return zodSchema.parse({}) as InferOptions<S>;
}

/**
 * Check if a schema has any configurable options
 */
export function hasOptions(optionsSchema: OptionsSchema): boolean {
    return Object.keys(optionsSchema).length > 0;
}

/**
 * Get all option metadata from a schema (for UI generation)
 *
 * @returns Map of option name to metadata
 */
export function getOptionsMeta(optionsSchema: OptionsSchema): Map<string, OptionMeta> {
    const meta = new Map<string, OptionMeta>();
    for (const [key, def] of Object.entries(optionsSchema)) {
        meta.set(key, def.meta);
    }

    return meta;
}

/**
 * Get options filtered by advanced flag
 *
 * @param advanced - If true, return only advanced options. If false, return only basic options.
 */
export function getOptionsFiltered(
    optionsSchema: OptionsSchema,
    advanced: boolean,
): OptionsSchema {
    const filtered: OptionsSchema = {};
    for (const [key, def] of Object.entries(optionsSchema)) {
        const isAdvanced = def.meta.advanced ?? false;
        if (isAdvanced === advanced) {
            filtered[key] = def;
        }
    }

    return filtered;
}

/**
 * Get options grouped by their group property
 *
 * @returns Map of group name to options in that group. Ungrouped options are under ""
 */
export function getOptionsGrouped(
    optionsSchema: OptionsSchema,
): Map<string, OptionsSchema> {
    const groups = new Map<string, OptionsSchema>();

    for (const [key, def] of Object.entries(optionsSchema)) {
        const group = def.meta.group ?? "";
        let groupSchema = groups.get(group);
        if (!groupSchema) {
            groupSchema = {};
            groups.set(group, groupSchema);
        }

        groupSchema[key] = def;
    }

    return groups;
}

/**
 * Information about a configurable item (algorithm or layout)
 */
export interface ConfigurableInfo {
    /** Unique type identifier */
    type: string;
    /** Category: "algorithm" or "layout" */
    category: "algorithm" | "layout";
    /** Full options schema with metadata */
    optionsSchema: OptionsSchema;
    /** Whether this item has any configurable options */
    hasOptions: boolean;
}
