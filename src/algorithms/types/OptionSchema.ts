/**
 * Option schema types for algorithm configuration
 *
 * This module provides type definitions and validation utilities for
 * algorithm options. Schemas enable:
 * - Type-safe option configuration
 * - Runtime validation with clear error messages
 * - UI form generation from schema metadata
 * - Self-documenting API through option descriptions
 */

/**
 * Supported option types for algorithm configuration
 */
export type OptionType = "number" | "integer" | "boolean" | "string" | "select" | "nodeId";

/**
 * Select option value with display label
 */
export interface SelectOption<T = unknown> {
    /** The actual value stored/used */
    value: T;
    /** Human-readable label for UI display */
    label: string;
}

/**
 * Definition for a single algorithm option
 *
 * @typeParam T - The type of the option value
 */
export interface OptionDefinition<T = unknown> {
    /** The data type of this option */
    type: OptionType;
    /** Default value when option is not provided */
    default: T;
    /** Human-readable label for UI display */
    label: string;
    /** Detailed description explaining what this option does */
    description: string;
    /** Whether this option must be provided (defaults to false) */
    required?: boolean;

    // Type-specific constraints for number/integer types
    /** Minimum allowed value (for number/integer types) */
    min?: number;
    /** Maximum allowed value (for number/integer types) */
    max?: number;
    /** Suggested step increment for UI sliders (for number/integer types) */
    step?: number;

    // For select type
    /** Available choices for select type options */
    options?: SelectOption<T>[];

    // UI hints
    /** Hide in basic mode, show only in advanced UI (defaults to false) */
    advanced?: boolean;
    /** Group related options together in UI */
    group?: string;
}

/**
 * Schema defining all options for an algorithm
 *
 * Each key is an option name, value is its definition
 */
export type OptionsSchema = Record<string, OptionDefinition>;

/**
 * Type helper to extract the options type from a schema definition
 *
 * This allows TypeScript to infer the correct types for algorithm options
 * based on the schema definition.
 *
 * @example
 * ```typescript
 * const schema = {
 *     dampingFactor: { type: 'number', default: 0.85, ... },
 *     maxIterations: { type: 'integer', default: 100, ... }
 * } as const;
 *
 * type Options = OptionsFromSchema<typeof schema>;
 * // Options = { dampingFactor?: number; maxIterations?: number; }
 * ```
 */
export type OptionsFromSchema<S extends OptionsSchema> = {
    [K in keyof S]?: S[K]["default"];
};

/**
 * Validation error for option schema validation
 */
export class OptionValidationError extends Error {
    constructor(
        public readonly optionKey: string,
        message: string,
    ) {
        super(`Option '${optionKey}': ${message}`);
        this.name = "OptionValidationError";
    }
}

/**
 * Validates a single option value against its definition
 *
 * @param key - The option key/name
 * @param value - The value to validate
 * @param def - The option definition
 * @throws {OptionValidationError} If validation fails
 */
export function validateOption(key: string, value: unknown, def: OptionDefinition): void {
    // Handle null/undefined for required options
    if (value === null || value === undefined) {
        if (def.required) {
            throw new OptionValidationError(key, "is required but was not provided");
        }

        return; // Allow null/undefined for non-required options (will use default)
    }

    switch (def.type) {
        case "number":
            validateNumber(key, value, def, false);
            break;
        case "integer":
            validateNumber(key, value, def, true);
            break;
        case "boolean":
            if (typeof value !== "boolean") {
                throw new OptionValidationError(key, `must be a boolean, got ${typeof value}`);
            }

            break;
        case "string":
            if (typeof value !== "string") {
                throw new OptionValidationError(key, `must be a string, got ${typeof value}`);
            }

            break;
        case "select":
            validateSelect(key, value, def);
            break;
        case "nodeId":
            // NodeId can be string or number
            if (typeof value !== "string" && typeof value !== "number") {
                throw new OptionValidationError(key, `must be a string or number (node ID), got ${typeof value}`);
            }

            break;
        default:
            // Unknown type - should not happen with TypeScript
            throw new OptionValidationError(key, `has unknown type '${def.type as string}'`);
    }
}

/**
 * Validates a number or integer option
 */
function validateNumber(key: string, value: unknown, def: OptionDefinition, requireInteger: boolean): void {
    if (typeof value !== "number") {
        throw new OptionValidationError(key, `must be a number, got ${typeof value}`);
    }

    if (Number.isNaN(value)) {
        throw new OptionValidationError(key, "must not be NaN");
    }

    if (!Number.isFinite(value)) {
        throw new OptionValidationError(key, "must be finite");
    }

    if (requireInteger && !Number.isInteger(value)) {
        throw new OptionValidationError(key, `must be an integer, got ${value}`);
    }

    if (def.min !== undefined && value < def.min) {
        throw new OptionValidationError(key, `must be >= ${def.min}, got ${value}`);
    }

    if (def.max !== undefined && value > def.max) {
        throw new OptionValidationError(key, `must be <= ${def.max}, got ${value}`);
    }
}

/**
 * Validates a select option
 */
function validateSelect(key: string, value: unknown, def: OptionDefinition): void {
    if (!def.options || def.options.length === 0) {
        throw new OptionValidationError(key, "is a select type but has no options defined");
    }

    const validValues = def.options.map((o) => o.value);
    if (!validValues.includes(value)) {
        const validLabels = def.options.map((o) => `'${String(o.value)}'`).join(", ");
        throw new OptionValidationError(key, `must be one of [${validLabels}], got '${String(value)}'`);
    }
}

/**
 * Resolves options by applying defaults and validating values
 *
 * @param schema - The options schema
 * @param providedOptions - User-provided options (may be partial)
 * @returns Fully resolved options with defaults applied
 * @throws {OptionValidationError} If any option fails validation
 */
export function resolveOptions<S extends OptionsSchema>(
    schema: S,
    providedOptions?: Partial<OptionsFromSchema<S>>,
): OptionsFromSchema<S> {
    const resolved: Record<string, unknown> = {};

    for (const [key, def] of Object.entries(schema)) {
        const providedValue = providedOptions?.[key as keyof typeof providedOptions];
        const value = providedValue ?? def.default;

        // Validate the value (either provided or default)
        validateOption(key, value, def);

        resolved[key] = value;
    }

    return resolved as OptionsFromSchema<S>;
}

/**
 * Creates a type-safe options schema definition
 *
 * This is a helper function that provides better type inference
 * when defining option schemas.
 *
 * @param schema - The schema definition
 * @returns The same schema with proper typing
 */
export function defineOptionsSchema<S extends OptionsSchema>(schema: S): S {
    return schema;
}
