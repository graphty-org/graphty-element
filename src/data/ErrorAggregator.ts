/**
 * Represents a single error that occurred during data loading
 */
export interface DataLoadingError {
    /** The error message */
    message: string;
    /** Optional row/line number where the error occurred */
    line?: number;
    /** Optional error category for grouping */
    category?: string;
    /** Optional field/column name related to the error */
    field?: string;
}

/**
 * Summary of errors aggregated by category
 */
export interface ErrorSummary {
    /** Total number of errors */
    totalErrors: number;
    /** Errors grouped by category */
    categories: Map<string, DataLoadingError[]>;
    /** Most common error category */
    primaryCategory?: string;
    /** User-friendly summary message */
    message: string;
    /** Actionable suggestion for fixing the errors */
    suggestion?: string;
}

/**
 * Aggregates and groups errors during data loading to provide user-friendly error messages
 */
export class ErrorAggregator {
    private errors: DataLoadingError[] = [];
    private maxErrors: number;
    private errorsByCategory = new Map<string, DataLoadingError[]>();
    private errorsByField = new Map<string, DataLoadingError[]>();

    /**
     * Creates a new ErrorAggregator instance.
     * @param maxErrors - Maximum number of errors to collect before stopping
     */
    constructor(maxErrors = 100) {
        this.maxErrors = maxErrors;
    }

    /**
     * Add an error to the aggregator
     * @param error The error to add
     * @returns true if error was added, false if error limit reached
     */
    addError(error: DataLoadingError): boolean {
        if (this.errors.length >= this.maxErrors) {
            return false;
        }

        this.errors.push(error);

        // Group by category
        const category = error.category ?? "unknown";

        if (!this.errorsByCategory.has(category)) {
            this.errorsByCategory.set(category, []);
        }

        const categoryErrors = this.errorsByCategory.get(category);
        if (categoryErrors) {
            categoryErrors.push(error);
        }

        // Group by field
        if (error.field) {
            if (!this.errorsByField.has(error.field)) {
                this.errorsByField.set(error.field, []);
            }

            const fieldErrors = this.errorsByField.get(error.field);
            if (fieldErrors) {
                fieldErrors.push(error);
            }
        }

        return true;
    }

    /**
     * Get the total number of errors
     * @returns The count of accumulated errors
     */
    getErrorCount(): number {
        return this.errors.length;
    }

    /**
     * Check if error limit has been reached
     * @returns True if the maximum error count has been reached
     */
    hasReachedLimit(): boolean {
        return this.errors.length >= this.maxErrors;
    }

    /**
     * Get all errors
     * @returns Array of all accumulated errors
     */
    getErrors(): DataLoadingError[] {
        return [... this.errors];
    }

    /**
     * Get a summary of all errors
     * @returns Error summary with categorization and suggestions
     */
    getSummary(): ErrorSummary {
        const totalErrors = this.errors.length;

        // Find the most common category
        let primaryCategory: string | undefined;
        let maxCategoryCount = 0;
        for (const [category, errors] of this.errorsByCategory.entries()) {
            if (errors.length > maxCategoryCount) {
                maxCategoryCount = errors.length;
                primaryCategory = category;
            }
        }

        // Generate user-friendly message and suggestion
        const {message, suggestion} = this.generateUserFriendlyMessage(
            totalErrors,
            primaryCategory,
            this.errorsByCategory,
            this.errorsByField,
        );

        return {
            totalErrors,
            categories: new Map(this.errorsByCategory),
            primaryCategory,
            message,
            suggestion,
        };
    }

    /**
     * Get a user-friendly error message
     * @returns Formatted error message with suggestions
     */
    getUserFriendlyMessage(): string {
        const summary = this.getSummary();
        let msg = summary.message;

        if (summary.suggestion) {
            msg += `\nSuggestion: ${summary.suggestion}`;
        }

        return msg;
    }

    /**
     * Get a detailed error report with all error messages
     * @returns Comprehensive report with categorized errors
     */
    getDetailedReport(): string {
        const summary = this.getSummary();
        let report = `${summary.message}\n\n`;

        if (summary.suggestion) {
            report += `Suggestion: ${summary.suggestion}\n\n`;
        }

        report += `Detailed Errors (${summary.totalErrors} total):\n`;
        report += `${"=".repeat(50)}\n\n`;

        // Group errors by category
        for (const [category, errors] of this.errorsByCategory.entries()) {
            report += `${category.toUpperCase()} (${errors.length} errors):\n`;

            // Show first 10 errors from this category
            const sampleErrors = errors.slice(0, 10);
            for (const error of sampleErrors) {
                const lineInfo = error.line !== undefined ? ` [line ${error.line}]` : "";
                const fieldInfo = error.field ? ` [field: ${error.field}]` : "";
                report += `  - ${error.message}${lineInfo}${fieldInfo}\n`;
            }

            if (errors.length > 10) {
                report += `  ... and ${errors.length - 10} more\n`;
            }

            report += "\n";
        }

        return report;
    }

    /**
     * Clear all errors
     */
    clear(): void {
        this.errors = [];

        this.errorsByCategory.clear();
        this.errorsByField.clear();
    }

    /**
     * Generate user-friendly message based on error patterns
     * @param totalErrors - Total number of errors
     * @param primaryCategory - Most common error category
     * @param errorsByCategory - Errors grouped by category
     * @param errorsByField - Errors grouped by field name
     * @returns Object containing user-friendly message and optional suggestion
     */
    private generateUserFriendlyMessage(
        totalErrors: number,
        primaryCategory: string | undefined,
        errorsByCategory: Map<string, DataLoadingError[]>,
        errorsByField: Map<string, DataLoadingError[]>,
    ): {message: string, suggestion?: string} {
        if (totalErrors === 0) {
            return {message: "No errors"};
        }

        // Check for common error patterns
        const missingColumnErrors = errorsByCategory.get("missing-column")?.length ?? 0;
        const parseErrors = errorsByCategory.get("parse-error")?.length ?? 0;
        const validationErrors = errorsByCategory.get("validation-error")?.length ?? 0;
        const missingValueErrors = errorsByCategory.get("missing-value")?.length ?? 0;

        // Pattern: Missing required columns
        if (missingColumnErrors > 0) {
            const fields = Array.from(errorsByField.keys());
            const message = `Found ${totalErrors} errors (${missingColumnErrors} missing column errors)`;
            const suggestion = fields.length > 0 ?
                `Check that your data has the required columns: ${fields.join(", ")}` :
                "Check that your data has the required columns (e.g., 'source', 'target' for edges)";
            return {message, suggestion};
        }

        // Pattern: Parse errors
        if (parseErrors > totalErrors * 0.5) {
            const message = `Found ${totalErrors} errors (mostly parsing errors)`;
            const suggestion = "Check your file format and encoding. Common issues: incorrect delimiter, malformed quotes, or encoding problems (try UTF-8)";
            return {message, suggestion};
        }

        // Pattern: Missing values
        if (missingValueErrors > 0) {
            const fields = Array.from(errorsByField.keys());
            const message = `Found ${totalErrors} errors (${missingValueErrors} missing required values)`;
            const suggestion = fields.length > 0 ?
                `Check that rows have values for: ${fields.join(", ")}` :
                "Check that rows have all required values";
            return {message, suggestion};
        }

        // Pattern: Validation errors
        if (validationErrors > 0) {
            const message = `Found ${totalErrors} errors (${validationErrors} validation errors)`;
            const suggestion = "Check that your data values match the expected format and types";
            return {message, suggestion};
        }

        // Generic message based on primary category
        if (primaryCategory && primaryCategory !== "unknown") {
            return {
                message: `Found ${totalErrors} errors (mostly ${primaryCategory} errors)`,
                suggestion: "See detailed error report for more information",
            };
        }

        // Fallback generic message
        return {
            message: `Found ${totalErrors} errors during data loading`,
            suggestion: "See detailed error report for more information",
        };
    }
}
