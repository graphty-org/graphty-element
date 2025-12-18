import {
    configure,
    getLogger as getLogTapeLogger,
    type Logger as LogTapeLogger,
    type Sink as LogTapeSink,
} from "@logtape/logtape";

import {resolveDataObject} from "./LazyEval.js";
import {configureLogging, getLoggingConfig, isModuleEnabled} from "./LoggerConfig.js";
import {createRemoteSink} from "./sinks/RemoteSink.js";
import {LOG_LEVEL_TO_NAME, type LoggerConfig, LogLevel, type LogRecord, type Sink} from "./types.js";

/* eslint-disable no-console -- This is a logging module, console usage is intentional */

/**
 * Create a simple console sink for LogTape without CSS styling.
 * Our messages are already formatted, so we just pass them through.
 */
function createSimpleConsoleSink(): LogTapeSink {
    return (record) => {
        // Our messages are already fully formatted, just extract and log them
        // The message array contains our formatted string
        const message = record.message.join("");

        const hasProperties = Object.keys(record.properties).length > 0;

        switch (record.level) {
            case "fatal":
            case "error":
                if (hasProperties) {
                    console.error(message, record.properties);
                } else {
                    console.error(message);
                }

                break;
            case "warning":
                if (hasProperties) {
                    console.warn(message, record.properties);
                } else {
                    console.warn(message);
                }

                break;
            case "info":
                if (hasProperties) {
                    console.info(message, record.properties);
                } else {
                    console.info(message);
                }

                break;
            case "debug":
            default:
                if (hasProperties) {
                    console.debug(message, record.properties);
                } else {
                    console.debug(message);
                }

                break;
        }
    };
}

/* eslint-enable no-console */

/**
 * Logger interface providing typed logging methods.
 */
export interface Logger {
    /** Log a trace message (most verbose) */
    trace(message: string, data?: Record<string, unknown>): void;
    /** Log a debug message */
    debug(message: string, data?: Record<string, unknown>): void;
    /** Log an info message */
    info(message: string, data?: Record<string, unknown>): void;
    /** Log a warning message */
    warn(message: string, data?: Record<string, unknown>): void;
    /** Log an error message */
    error(message: string, error?: Error, data?: Record<string, unknown>): void;
    /** Check if trace level is enabled */
    isTraceEnabled(): boolean;
    /** Check if debug level is enabled */
    isDebugEnabled(): boolean;
}

/**
 * Cache of logger instances by category key.
 */
const loggerCache = new Map<string, Logger>();

/**
 * Track whether LogTape has been configured.
 */
let logTapeConfigured = false;

/**
 * Registry of custom sinks.
 */
const sinkRegistry = new Map<string, Sink>();

/**
 * Remote log server URL (if configured).
 */
let remoteLogUrl: string | undefined;

/**
 * Create a category key from a category array.
 */
function categoryKey(category: string[]): string {
    return category.join(".");
}

/**
 * Format log output with timestamp and category.
 */
function formatLogMessage(category: string[], level: LogLevel, message: string): string {
    const config = getLoggingConfig();
    const parts: string[] = [];

    if (config.format.timestamp) {
        parts.push(`[${new Date().toISOString()}]`);
    }

    if (config.format.module) {
        parts.push(`[${category.join(".")}]`);
    }

    parts.push(`[${LOG_LEVEL_TO_NAME[level]}]`);
    parts.push(message);

    return parts.join(" ");
}

/**
 * Dispatch a log record to all registered custom sinks.
 */
function dispatchToSinks(record: LogRecord): void {
    for (const sink of sinkRegistry.values()) {
        try {
            sink.write(record);
        } catch (err) {
            // Don't let sink errors break logging
            console.error(`[GraphtyLogger] Error in sink "${sink.name}":`, err);
        }
    }
}

/**
 * Create a Logger wrapper that checks module enablement and formats output.
 */
function createLoggerWrapper(category: string[], logTapeLogger: LogTapeLogger): Logger {
    const makeLogFn = (level: LogLevel, logTapeMethod: (msg: string, data?: Record<string, unknown>) => void) => {
        return (message: string, data?: Record<string, unknown>): void => {
            const config = getLoggingConfig();

            // Skip if logging is disabled or module not enabled
            if (!config.enabled || !isModuleEnabled(category)) {
                return;
            }

            // Skip if level is below configured level
            if (level > config.level) {
                return;
            }

            // Resolve lazy values in data object (only when actually logging)
            const resolvedData = data ? resolveDataObject(data) : undefined;

            const formattedMessage = formatLogMessage(category, level, message);
            if (resolvedData) {
                logTapeMethod(formattedMessage, resolvedData);
            } else {
                logTapeMethod(formattedMessage);
            }

            // Dispatch to custom sinks
            dispatchToSinks({
                timestamp: new Date(),
                level,
                category,
                message,
                data: resolvedData,
            });
        };
    };

    return {
        trace: makeLogFn(LogLevel.TRACE, (msg, data) => {
            logTapeLogger.debug(msg, data);
        }),
        debug: makeLogFn(LogLevel.DEBUG, (msg, data) => {
            logTapeLogger.debug(msg, data);
        }),
        info: makeLogFn(LogLevel.INFO, (msg, data) => {
            logTapeLogger.info(msg, data);
        }),
        warn: makeLogFn(LogLevel.WARN, (msg, data) => {
            logTapeLogger.warn(msg, data);
        }),
        error: (message: string, error?: Error, data?: Record<string, unknown>): void => {
            const config = getLoggingConfig();

            // Skip if logging is disabled or module not enabled
            if (!config.enabled || !isModuleEnabled(category)) {
                return;
            }

            // Error level is always >= SILENT, so always allowed if enabled
            if (LogLevel.ERROR > config.level) {
                return;
            }

            // Resolve lazy values in data object (only when actually logging)
            const resolvedData = data ? resolveDataObject(data) : undefined;

            const formattedMessage = formatLogMessage(category, LogLevel.ERROR, message);
            const logData = error ? {... resolvedData, error: error.stack ?? error.message} : resolvedData;
            logTapeLogger.error(formattedMessage, logData);

            // Dispatch to custom sinks
            dispatchToSinks({
                timestamp: new Date(),
                level: LogLevel.ERROR,
                category,
                message,
                data: resolvedData,
                error,
            });
        },
        isTraceEnabled: (): boolean => {
            const config = getLoggingConfig();
            return config.enabled && isModuleEnabled(category) && config.level >= LogLevel.TRACE;
        },
        isDebugEnabled: (): boolean => {
            const config = getLoggingConfig();
            return config.enabled && isModuleEnabled(category) && config.level >= LogLevel.DEBUG;
        },
    };
}

/**
 * Extended configuration options for GraphtyLogger.
 */
export interface GraphtyLoggerConfig extends LoggerConfig {
    /** URL of remote log server (e.g., https://localhost:9080) */
    remoteLogUrl?: string;
    /** Additional custom sinks to register */
    sinks?: Sink[];
}

/**
 * Configure the logging system.
 *
 * @param config - Logger configuration
 */
async function configureGraphtyLogging(config: GraphtyLoggerConfig): Promise<void> {
    // Update our internal config
    configureLogging(config);

    // Configure LogTape
    // Always configure at "debug" level (lowest) so our wrapper controls filtering
    // This allows changing log levels at runtime without reconfiguring LogTape
    if (config.enabled && !logTapeConfigured) {
        await configure({
            sinks: {
                console: createSimpleConsoleSink(),
            },
            loggers: [
                {
                    category: ["graphty"],
                    sinks: ["console"],
                    lowestLevel: "debug", // Always allow all levels; wrapper does filtering
                },
                // Silence the LogTape meta logger (it's noisy)
                {
                    category: ["logtape", "meta"],
                    sinks: [],
                    lowestLevel: "fatal",
                },
            ],
        });
        logTapeConfigured = true;
    }

    // Configure remote logging if URL is provided
    const {remoteLogUrl: newRemoteLogUrl} = config;
    if (newRemoteLogUrl && newRemoteLogUrl !== remoteLogUrl) {
        remoteLogUrl = newRemoteLogUrl;
        // Remove existing remote sink if any
        sinkRegistry.delete("remote");
        // Add new remote sink
        const remoteSink = createRemoteSink({serverUrl: newRemoteLogUrl});
        sinkRegistry.set(remoteSink.name, remoteSink);
    }

    // Register additional custom sinks
    if (config.sinks) {
        for (const sink of config.sinks) {
            sinkRegistry.set(sink.name, sink);
        }
    }

    // Clear logger cache when reconfiguring
    loggerCache.clear();
}

/**
 * Add a custom sink to the logger.
 *
 * @param sink - The sink to add
 */
function addSink(sink: Sink): void {
    sinkRegistry.set(sink.name, sink);
}

/**
 * Remove a sink by name.
 *
 * @param name - The name of the sink to remove
 * @returns true if the sink was removed, false if it didn't exist
 */
function removeSink(name: string): boolean {
    return sinkRegistry.delete(name);
}

/**
 * Get all registered sinks.
 *
 * @returns Array of registered sinks
 */
function getSinks(): Sink[] {
    return Array.from(sinkRegistry.values());
}

/**
 * Flush all sinks that support flushing.
 */
async function flushSinks(): Promise<void> {
    const flushPromises: Promise<void>[] = [];
    for (const sink of sinkRegistry.values()) {
        if (sink.flush) {
            flushPromises.push(sink.flush());
        }
    }
    await Promise.all(flushPromises);
}

/**
 * Get a logger for the specified category.
 *
 * @param category - Hierarchical category path, e.g., ["graphty", "layout", "ngraph"]
 * @returns Logger instance for the category
 */
function getGraphtyLogger(category: string[]): Logger {
    const key = categoryKey(category);

    // Return cached logger if available
    const cached = loggerCache.get(key);
    if (cached) {
        return cached;
    }

    // Get LogTape logger
    const logTapeLogger = getLogTapeLogger(category);

    // Create and cache our wrapper
    const logger = createLoggerWrapper(category, logTapeLogger);
    loggerCache.set(key, logger);

    return logger;
}

/**
 * Check if logging is enabled.
 *
 * @returns true if logging is enabled
 */
function isLoggingEnabled(): boolean {
    return getLoggingConfig().enabled;
}

/**
 * Main logger facade for graphty-element.
 *
 * Usage:
 * ```typescript
 * import { GraphtyLogger, LogLevel } from "graphty-element";
 *
 * // Configure logging
 * await GraphtyLogger.configure({
 *     enabled: true,
 *     level: LogLevel.DEBUG,
 *     modules: "*",
 *     format: { timestamp: true, module: true },
 * });
 *
 * // Get a logger for a category
 * const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
 * logger.info("Layout started", { nodeCount: 100 });
 *
 * // Configure with remote logging
 * await GraphtyLogger.configure({
 *     enabled: true,
 *     level: LogLevel.DEBUG,
 *     modules: "*",
 *     format: { timestamp: true, module: true },
 *     remoteLogUrl: "https://localhost:9080",
 * });
 *
 * // Add custom sinks programmatically
 * GraphtyLogger.addSink({
 *     name: "custom",
 *     write: (record) => { ... },
 * });
 * ```
 */
export const GraphtyLogger = {
    /**
     * Configure the logging system.
     */
    configure: configureGraphtyLogging,

    /**
     * Get a logger for the specified category.
     */
    getLogger: getGraphtyLogger,

    /**
     * Check if logging is enabled.
     */
    isEnabled: isLoggingEnabled,

    /**
     * Add a custom sink to the logger.
     */
    addSink,

    /**
     * Remove a sink by name.
     */
    removeSink,

    /**
     * Get all registered sinks.
     */
    getSinks,

    /**
     * Flush all sinks that support flushing.
     */
    flush: flushSinks,
};
