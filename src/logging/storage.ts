import {type LoggerConfig, LogLevel} from "./types.js";

/**
 * Storage key for logging configuration in sessionStorage.
 */
const STORAGE_KEY = "graphty-element-logging-config";

/**
 * Serializable version of LoggerConfig for storage.
 */
interface StoredConfig {
    enabled: boolean;
    level: LogLevel;
    modules: string[] | "*";
    format: {
        timestamp: boolean;
        timestampFormat?: string;
        module: boolean;
        colors?: boolean;
    };
}

/**
 * Save logging configuration to sessionStorage.
 *
 * This allows logging settings to persist across page navigations
 * within the same browser session, so developers don't need to
 * re-add URL parameters on every page load.
 *
 * @param config - The logging configuration to save
 */
export function saveLoggingConfig(config: LoggerConfig): void {
    try {
        // Check if we're in a browser environment
        if (typeof sessionStorage === "undefined") {
            return;
        }

        const storedConfig: StoredConfig = {
            enabled: config.enabled,
            level: config.level,
            modules: config.modules,
            format: {
                timestamp: config.format.timestamp,
                timestampFormat: config.format.timestampFormat,
                module: config.format.module,
                colors: config.format.colors,
            },
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedConfig));
    } catch {
        // Silently fail if sessionStorage is not available or quota exceeded
    }
}

/**
 * Load logging configuration from sessionStorage.
 *
 * @returns The stored logging configuration, or null if none is stored
 */
export function loadLoggingConfig(): LoggerConfig | null {
    try {
        // Check if we're in a browser environment
        if (typeof sessionStorage === "undefined") {
            return null;
        }

        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return null;
        }

        const parsed = JSON.parse(stored) as StoredConfig;

        // Validate the parsed data
        if (typeof parsed.enabled !== "boolean" ||
            typeof parsed.level !== "number" ||
            (parsed.modules !== "*" && !Array.isArray(parsed.modules))) {
            // Invalid data, clear it
            clearLoggingConfig();
            return null;
        }

        // Validate level is a valid LogLevel enum value
        if (parsed.level < LogLevel.SILENT || parsed.level > LogLevel.TRACE) {
            clearLoggingConfig();
            return null;
        }

        // Handle format field - it might be undefined in older stored configs
        const format = parsed.format as StoredConfig["format"] | undefined;

        return {
            enabled: parsed.enabled,
            level: parsed.level,
            modules: parsed.modules,
            format: {
                timestamp: format?.timestamp ?? true,
                timestampFormat: format?.timestampFormat,
                module: format?.module ?? true,
                colors: format?.colors,
            },
        };
    } catch {
        // Invalid JSON or other error
        clearLoggingConfig();
        return null;
    }
}

/**
 * Clear logging configuration from sessionStorage.
 */
export function clearLoggingConfig(): void {
    try {
        // Check if we're in a browser environment
        if (typeof sessionStorage === "undefined") {
            return;
        }

        sessionStorage.removeItem(STORAGE_KEY);
    } catch {
        // Silently fail if sessionStorage is not available
    }
}
