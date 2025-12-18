import {type LoggerConfig, LogLevel} from "./types.js";

/**
 * Default configuration when logging is not explicitly configured.
 */
const DEFAULT_CONFIG: LoggerConfig = {
    enabled: false,
    level: LogLevel.INFO,
    modules: "*",
    format: {
        timestamp: true,
        module: true,
        colors: true,
    },
};

/**
 * Current logging configuration. This is mutable and can be updated
 * by calling configureLogging().
 */
let currentConfig: LoggerConfig = {... DEFAULT_CONFIG, format: {... DEFAULT_CONFIG.format}};

/**
 * Configure the logging system.
 *
 * @param config - Partial configuration to merge with defaults
 * @returns Promise that resolves when configuration is complete
 */
export function configureLogging(config: Partial<LoggerConfig>): void {
    currentConfig = {
        enabled: config.enabled ?? DEFAULT_CONFIG.enabled,
        level: config.level ?? DEFAULT_CONFIG.level,
        modules: config.modules ?? DEFAULT_CONFIG.modules,
        format: {
            timestamp: config.format?.timestamp ?? DEFAULT_CONFIG.format.timestamp,
            timestampFormat: config.format?.timestampFormat ?? DEFAULT_CONFIG.format.timestampFormat,
            module: config.format?.module ?? DEFAULT_CONFIG.format.module,
            colors: config.format?.colors ?? DEFAULT_CONFIG.format.colors,
        },
    };
}

/**
 * Get the current logging configuration.
 *
 * @returns The current configuration (readonly copy)
 */
export function getLoggingConfig(): LoggerConfig {
    return {... currentConfig, format: {... currentConfig.format}};
}

/**
 * Check if a specific module category is enabled for logging.
 *
 * @param category - Hierarchical category path, e.g., ["graphty", "layout", "ngraph"]
 * @returns true if the module should log
 */
export function isModuleEnabled(category: string[]): boolean {
    // If logging is disabled, nothing is enabled
    if (!currentConfig.enabled) {
        return false;
    }

    // Empty category doesn't match specific modules
    if (category.length === 0) {
        return false;
    }

    // If all modules are enabled, return true
    if (currentConfig.modules === "*") {
        return true;
    }

    // Check if any of the category parts match an enabled module
    // This allows hierarchical matching:
    // - If "layout" is enabled, ["graphty", "layout"] matches
    // - If "layout" is enabled, ["graphty", "layout", "ngraph"] also matches
    const enabledModules = currentConfig.modules;

    for (const moduleName of enabledModules) {
        // Check if the module name appears in the category
        if (category.includes(moduleName)) {
            return true;
        }
    }

    return false;
}

/**
 * Reset logging configuration to defaults.
 * Primarily useful for testing.
 */
export function resetLoggingConfig(): void {
    currentConfig = {... DEFAULT_CONFIG, format: {... DEFAULT_CONFIG.format}};
}

// Re-export types for convenience
export type {LoggerConfig} from "./types.js";
