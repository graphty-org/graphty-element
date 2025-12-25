/**
 * Label helpers for formatting metric values for display
 */

/**
 * Format number as percentage
 * Default: 0 decimals
 * @param value - Numeric value (0-1 typical)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 * @example
 * percentage(0.75)      // "75%"
 * percentage(0.756, 1)  // "75.6%"
 * percentage(0.756, 2)  // "75.60%"
 */
export function percentage(value: number, decimals = 0): string {
    return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with fixed decimal places
 * Default: 2 decimals
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 * @example
 * fixed(0.123456)     // "0.12"
 * fixed(0.123456, 3)  // "0.123"
 * fixed(123.456, 1)   // "123.5"
 */
export function fixed(value: number, decimals = 2): string {
    return value.toFixed(decimals);
}

/**
 * Format number in scientific notation
 * Default: 2 decimals
 * @param value - Numeric value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string
 * @example
 * scientific(123456)     // "1.23e+5"
 * scientific(0.000123)   // "1.23e-4"
 */
export function scientific(value: number, decimals = 2): string {
    return value.toExponential(decimals);
}

/**
 * Format number in compact notation (K, M, B suffixes)
 * @param value - Numeric value
 * @returns Formatted string with suffix
 * @example
 * compact(1000)      // "1.0K"
 * compact(1500000)   // "1.5M"
 * compact(2500000000)// "2.5B"
 */
export function compact(value: number): string {
    if (value >= 1e9) {
        return `${(value / 1e9).toFixed(1)}B`;
    }

    if (value >= 1e6) {
        return `${(value / 1e6).toFixed(1)}M`;
    }

    if (value >= 1e3) {
        return `${(value / 1e3).toFixed(1)}K`;
    }

    return value.toFixed(1);
}

/**
 * Format number as integer (rounds to nearest integer)
 * @param value - Numeric value
 * @returns Formatted integer string
 * @example
 * integer(0.75)   // "1"
 * integer(123.4)  // "123"
 * integer(123.6)  // "124"
 */
export function integer(value: number): string {
    return Math.round(value).toString();
}

/**
 * Template substitution - replaces {key} placeholders with values
 * @param template - Template string with {key} placeholders
 * @param values - Object with key-value pairs
 * @returns String with substituted values
 * @example
 * substitute("Score: {score}", {score: 0.85}) // "Score: 0.85"
 */
export function substitute(template: string, values: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return key in values ? String(values[key]) : match;
    });
}

/**
 * Format rank label
 * @param rank - Rank value
 * @returns Formatted rank label
 * @example
 * rankLabel(5) // "Rank: 5"
 */
export function rankLabel(rank: number): string {
    return `Rank: ${rank}`;
}

/**
 * Format score label
 * @param score - Score value
 * @param label - Label text
 * @returns Formatted score label
 * @example
 * scoreLabel(0.85, "PageRank") // "PageRank: 0.85"
 */
export function scoreLabel(score: number, label: string): string {
    return `${label}: ${score}`;
}

/**
 * Format community label
 * @param id - Community ID
 * @returns Formatted community label
 * @example
 * communityLabel(3) // "Community 3"
 */
export function communityLabel(id: number): string {
    return `Community ${id}`;
}

/**
 * Format level label
 * @param level - Level value
 * @returns Formatted level label
 * @example
 * levelLabel(2) // "Level 2"
 */
export function levelLabel(level: number): string {
    return `Level ${level}`;
}

/**
 * Only show if value above threshold
 * @param value - Value to check
 * @param threshold - Threshold value
 * @param formatter - Function to format the value
 * @returns Formatted string or null
 * @example
 * ifAbove(0.8, 0.5, (v) => v.toFixed(2)) // "0.80"
 * ifAbove(0.3, 0.5, (v) => v.toFixed(2)) // null
 */
export function ifAbove(
    value: number,
    threshold: number,
    formatter: (v: number) => string,
): string | null {
    return value >= threshold ? formatter(value) : null;
}

/**
 * Only show for top N values
 * @param value - Value to display
 * @param rank - Rank (1-based)
 * @param n - Number of top items
 * @param formatter - Function to format the value
 * @returns Formatted string or null
 * @example
 * topN(0.9, 3, 5, (v) => v.toFixed(2)) // "0.90"
 * topN(0.5, 6, 5, (v) => v.toFixed(2)) // null
 */
export function topN(
    value: number,
    rank: number,
    n: number,
    formatter: (v: number) => string,
): string | null {
    return rank <= n ? formatter(value) : null;
}

/**
 * Conditional text
 * @param condition - Boolean condition
 * @param trueText - Text to return if condition is true
 * @param falseText - Text to return if condition is false
 * @returns Selected text based on condition
 * @example
 * conditional(true, "Yes", "No") // "Yes"
 * conditional(false, "Yes", "No") // "No"
 */
export function conditional(condition: boolean, trueText: string, falseText: string): string {
    return condition ? trueText : falseText;
}
