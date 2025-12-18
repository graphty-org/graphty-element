import {LogLevel, parseLogLevel} from "./types.js";

/**
 * URL parameter names for logging configuration.
 */
const LOGGING_PARAM = "graphty-element-logging";
const LOG_LEVEL_PARAM = "graphty-element-log-level";
const REMOTE_LOG_PARAM = "graphty-element-remote-log";

/**
 * Parsed logging parameters from the URL.
 */
export interface ParsedLoggingParams {
    /** Whether logging is enabled */
    enabled: boolean;
    /** Modules to enable: array of module names or "*" for all */
    modules: string[] | "*";
    /** Global log level (if specified via graphty-element-log-level param) */
    level?: LogLevel;
    /** Per-module log level overrides (from module:level format) */
    moduleOverrides?: Map<string, LogLevel>;
    /** URL of remote log server (if specified via graphty-element-remote-log param) */
    remoteLogUrl?: string;
}

/**
 * Parse logging configuration from URL parameters.
 *
 * Supported URL parameter formats:
 * - `?graphty-element-logging=true` - Enable all logging at default level
 * - `?graphty-element-logging=layout,xr` - Enable specific modules
 * - `?graphty-element-logging=layout:debug,xr:info` - Enable modules with levels
 * - `?graphty-element-log-level=debug` - Set global log level
 * - `?graphty-element-remote-log=https://localhost:9080` - Send logs to remote server
 *
 * @returns Parsed logging parameters, or null if logging param is not present or disabled
 */
export function parseLoggingURLParams(): ParsedLoggingParams | null {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof URLSearchParams === "undefined") {
        return null;
    }

    const params = new URLSearchParams(window.location.search);
    const loggingValue = params.get(LOGGING_PARAM);
    const levelValue = params.get(LOG_LEVEL_PARAM);
    const remoteLogValue = params.get(REMOTE_LOG_PARAM);

    // No logging param or explicitly disabled
    if (!loggingValue || loggingValue === "" || loggingValue === "false") {
        return null;
    }

    // Parse the logging value
    const result: ParsedLoggingParams = {
        enabled: true,
        modules: "*",
    };

    // "true" means enable all modules
    if (loggingValue === "true") {
        result.modules = "*";
    } else {
        // Parse module list (potentially with level overrides)
        const moduleSpecs = loggingValue.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
        const modules: string[] = [];
        const moduleOverrides = new Map<string, LogLevel>();

        for (const spec of moduleSpecs) {
            // Check for module:level format
            const colonIndex = spec.indexOf(":");
            if (colonIndex > 0) {
                const moduleName = spec.substring(0, colonIndex).trim();
                const levelStr = spec.substring(colonIndex + 1).trim();
                const level = parseLogLevel(levelStr);

                modules.push(moduleName);
                if (level !== undefined) {
                    moduleOverrides.set(moduleName, level);
                }
            } else {
                modules.push(spec);
            }
        }

        result.modules = modules;
        if (moduleOverrides.size > 0) {
            result.moduleOverrides = moduleOverrides;
        }
    }

    // Parse global log level if specified
    if (levelValue) {
        const level = parseLogLevel(levelValue);
        if (level !== undefined) {
            result.level = level;
        }
    }

    // Parse remote log server URL if specified
    if (remoteLogValue) {
        // Validate it looks like a URL
        if (isValidUrl(remoteLogValue)) {
            result.remoteLogUrl = remoteLogValue;
        }
    }

    return result;
}

/**
 * Check if a string is a valid URL.
 *
 * @param urlString - The string to validate
 * @returns true if the string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        // Only allow http and https protocols
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}
