/**
 * SchemaFormatter - Formats schema information as markdown for system prompts.
 * @module ai/schema/SchemaFormatter
 */

import type {PropertySummary, SchemaSummary} from "./types";

/**
 * Maximum number of enum values to display in the formatted output.
 */
const MAX_ENUM_VALUES_DISPLAYED = 10;

/**
 * Maximum length for property names before truncation.
 */
const MAX_PROPERTY_NAME_LENGTH = 50;

/**
 * Format a schema summary as markdown for inclusion in system prompts.
 *
 * @param schema - The schema summary to format
 * @returns Formatted markdown string
 */
export function formatSchemaForPrompt(schema: SchemaSummary): string {
    const sections: string[] = [];

    // Header with counts
    sections.push(formatHeader(schema));

    // Node properties section
    if (schema.nodeProperties.length > 0) {
        sections.push(formatNodeProperties(schema.nodeProperties));
    } else if (schema.nodeCount > 0) {
        sections.push("### Node Properties\nNo custom properties on node data.");
    }

    // Edge properties section
    if (schema.edgeProperties.length > 0) {
        sections.push(formatEdgeProperties(schema.edgeProperties));
    } else if (schema.edgeCount > 0) {
        sections.push("### Edge Properties\nNo custom properties on edge data.");
    }

    return sections.join("\n\n");
}

/**
 * Format the header section with graph counts.
 */
function formatHeader(schema: SchemaSummary): string {
    return `## Data Schema
- Nodes: ${schema.nodeCount}
- Edges: ${schema.edgeCount}`;
}

/**
 * Format node properties section.
 */
function formatNodeProperties(properties: PropertySummary[]): string {
    const lines = ["### Node Properties"];

    for (const prop of properties) {
        lines.push(formatProperty(prop));
    }

    return lines.join("\n");
}

/**
 * Format edge properties section.
 */
function formatEdgeProperties(properties: PropertySummary[]): string {
    const lines = ["### Edge Properties"];

    for (const prop of properties) {
        lines.push(formatProperty(prop));
    }

    return lines.join("\n");
}

/**
 * Format a single property as a markdown line.
 */
function formatProperty(prop: PropertySummary): string {
    const name = truncateName(prop.name);
    const nullable = prop.nullable ? "?" : "";
    const typeStr = formatType(prop);
    const details = formatDetails(prop);

    return `- \`${name}\`: ${typeStr}${nullable}${details}`;
}

/**
 * Format the type string for a property.
 */
function formatType(prop: PropertySummary): string {
    if (prop.type === "array" && prop.itemType) {
        return `${prop.itemType}[]`;
    }

    return prop.type;
}

/**
 * Format additional details for a property (enum values, range, format).
 */
function formatDetails(prop: PropertySummary): string {
    const details: string[] = [];

    // Add format if present
    if (prop.format) {
        details.push(`format: ${prop.format}`);
    }

    // Add enum values if present
    if (prop.enumValues && prop.enumValues.length > 0) {
        const values = formatEnumValues(prop.enumValues);
        details.push(`values: [${values}]`);
    }

    // Add range if present
    if (prop.range) {
        details.push(`range: ${prop.range.min}..${prop.range.max}`);
    }

    if (details.length === 0) {
        return "";
    }

    return ` (${details.join(", ")})`;
}

/**
 * Format enum values, truncating if there are too many.
 */
function formatEnumValues(values: string[]): string {
    if (values.length <= MAX_ENUM_VALUES_DISPLAYED) {
        return values.map((v) => `"${v}"`).join(", ");
    }

    const displayed = values.slice(0, MAX_ENUM_VALUES_DISPLAYED);
    const remaining = values.length - MAX_ENUM_VALUES_DISPLAYED;

    return `${displayed.map((v) => `"${v}"`).join(", ")}, ... +${remaining} more`;
}

/**
 * Truncate property name if too long.
 */
function truncateName(name: string): string {
    if (name.length <= MAX_PROPERTY_NAME_LENGTH) {
        return name;
    }

    return `${name.slice(0, MAX_PROPERTY_NAME_LENGTH - 3)}...`;
}
