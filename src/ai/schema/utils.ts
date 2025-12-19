/**
 * Schema Utilities Module - Helper functions for schema operations.
 * @module ai/schema/utils
 */

/**
 * Statistics result for numeric values.
 */
export interface NumericStatistics {
    min: number;
    max: number;
    avg: number;
    median: number;
    count: number;
}

/**
 * Histogram bin representation.
 */
export interface HistogramBin {
    range: string;
    count: number;
    min: number;
    max: number;
}

/**
 * Truncate a string to a maximum length, adding ellipsis if truncated.
 *
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncation (default 100)
 * @returns The truncated string with '...' appended if it was truncated
 */
export function truncateString(str: string, maxLength = 100): string {
    if (str.length <= maxLength) {
        return str;
    }

    return `${str.slice(0, maxLength)}...`;
}

/**
 * Safely access a nested property using dot notation.
 *
 * @param obj - The object to access
 * @param path - Dot-notation path (e.g., "data.type")
 * @returns The value at the path, or undefined if not found
 */
export function getNestedProperty(obj: unknown, path: string): unknown {
    if (obj === null || obj === undefined) {
        return undefined;
    }

    const parts = path.split(".");
    let current: unknown = obj;

    for (const part of parts) {
        if (current === null || current === undefined || typeof current !== "object") {
            return undefined;
        }

        current = (current as Record<string, unknown>)[part];
    }

    return current;
}

/**
 * Recursively truncate all string values in an object.
 *
 * @param obj - The object to process
 * @param maxLength - Maximum length for string values (default 100)
 * @returns A new object with truncated string values
 */
export function truncateObjectStrings<T>(obj: T, maxLength = 100): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === "string") {
        return truncateString(obj, maxLength) as T;
    }

    if (Array.isArray(obj)) {
        return obj.map((item) => truncateObjectStrings(item, maxLength)) as T;
    }

    if (typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = truncateObjectStrings(value, maxLength);
        }

        return result as T;
    }

    return obj;
}

/**
 * Calculate statistics for an array of numeric values.
 *
 * @param values - Array of numbers to analyze
 * @returns Statistics object with min, max, avg, median, count
 */
export function calculateStatistics(values: number[]): NumericStatistics {
    if (values.length === 0) {
        return {min: 0, max: 0, avg: 0, median: 0, count: 0};
    }

    const sorted = [... values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const avg = sum / values.length;

    // Calculate median
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ?
        (sorted[mid - 1] + sorted[mid]) / 2 :
        sorted[mid];

    return {min, max, avg, median, count: values.length};
}

/**
 * Generate a histogram from numeric values.
 *
 * @param values - Array of numbers to analyze
 * @param binCount - Number of bins to create (default 5)
 * @returns Array of histogram bins
 */
export function generateHistogram(values: number[], binCount = 5): HistogramBin[] {
    if (values.length === 0) {
        return [];
    }

    const min = Math.min(... values);
    const max = Math.max(... values);

    // Handle case where all values are the same
    if (min === max) {
        return [{
            range: formatRange(min, max),
            count: values.length,
            min,
            max,
        }];
    }

    const binSize = (max - min) / binCount;
    const bins: HistogramBin[] = [];

    // Create bins
    for (let i = 0; i < binCount; i++) {
        const binMin = min + (i * binSize);
        const binMax = i === binCount - 1 ? max : min + ((i + 1) * binSize);
        bins.push({
            range: formatRange(binMin, binMax),
            count: 0,
            min: binMin,
            max: binMax,
        });
    }

    // Count values in each bin
    for (const value of values) {
        // Find the appropriate bin
        let binIndex = Math.floor((value - min) / binSize);
        // Handle edge case where value === max
        if (binIndex >= binCount) {
            binIndex = binCount - 1;
        }

        bins[binIndex].count++;
    }

    return bins;
}

/**
 * Format a range string for histogram display.
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Formatted range string
 */
function formatRange(min: number, max: number): string {
    const formatNum = (n: number): string => {
        if (Number.isInteger(n)) {
            return n.toString();
        }

        return n.toFixed(2);
    };

    return `${formatNum(min)} - ${formatNum(max)}`;
}

/**
 * Determine the type of a value.
 *
 * @param value - Value to analyze
 * @returns Type string
 */
export function getValueType(value: unknown): "string" | "number" | "boolean" | "array" | "object" | "null" {
    if (value === null || value === undefined) {
        return "null";
    }

    if (Array.isArray(value)) {
        return "array";
    }

    const type = typeof value;
    if (type === "string" || type === "number" || type === "boolean") {
        return type;
    }

    if (type === "object") {
        return "object";
    }

    return "null";
}

/**
 * Collect all values for a property from a collection of items.
 *
 * @param items - Collection of items to extract values from
 * @param propertyPath - Dot-notation path to the property
 * @returns Array of values and null count
 */
export function collectPropertyValues(
    items: Iterable<{data: Record<string, unknown>}>,
    propertyPath: string,
): {values: unknown[], nullCount: number} {
    const values: unknown[] = [];
    let nullCount = 0;

    for (const item of items) {
        const value = getNestedProperty(item.data, propertyPath);
        if (value === null || value === undefined) {
            nullCount++;
        } else {
            values.push(value);
        }
    }

    return {values, nullCount};
}

/**
 * Analyze the dominant type of a collection of values.
 *
 * @param values - Array of values to analyze
 * @returns The dominant type or "mixed" if multiple types
 */
export function analyzeDominantType(values: unknown[]): "string" | "number" | "boolean" | "array" | "object" | "mixed" | "null" {
    if (values.length === 0) {
        return "null";
    }

    const typeCounts = new Map<string, number>();

    for (const value of values) {
        const type = getValueType(value);
        typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }

    // Remove null counts as we track those separately
    typeCounts.delete("null");

    if (typeCounts.size === 0) {
        return "null";
    }

    if (typeCounts.size > 1) {
        return "mixed";
    }

    return typeCounts.keys().next().value as "string" | "number" | "boolean" | "array" | "object";
}

/**
 * Get all available property names from a collection of items.
 *
 * @param items - Collection of items to extract property names from
 * @param maxDepth - Maximum nesting depth to explore (default 3)
 * @returns Array of property paths
 */
export function getAvailableProperties(
    items: Iterable<{data: Record<string, unknown>}>,
    maxDepth = 3,
): string[] {
    const properties = new Set<string>();

    for (const item of items) {
        collectPropertyPaths(item.data, "", properties, 0, maxDepth);
    }

    return Array.from(properties).sort();
}

/**
 * Recursively collect property paths from an object.
 *
 * @param obj - Object to explore
 * @param prefix - Current property path prefix
 * @param properties - Set to add property paths to
 * @param depth - Current depth
 * @param maxDepth - Maximum depth to explore
 */
function collectPropertyPaths(
    obj: unknown,
    prefix: string,
    properties: Set<string>,
    depth: number,
    maxDepth: number,
): void {
    if (depth >= maxDepth || obj === null || obj === undefined || typeof obj !== "object" || Array.isArray(obj)) {
        return;
    }

    for (const key of Object.keys(obj as Record<string, unknown>)) {
        const path = prefix ? `${prefix}.${key}` : key;
        properties.add(path);

        const value = (obj as Record<string, unknown>)[key];
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            collectPropertyPaths(value, path, properties, depth + 1, maxDepth);
        }
    }
}
