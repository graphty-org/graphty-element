/**
 * Logging module for graphty-element.
 *
 * Provides a structured logging system with:
 * - URL parameter-based enable/disable and module filtering
 * - Hierarchical module categories matching the codebase structure
 * - Configurable log levels (silent, error, warn, info, debug, trace)
 * - Console and remote sinks for output
 * - TypeScript-first design with full type safety
 *
 * @example
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
 * ```
 *
 * @example URL Parameters
 * ```
 * // Enable all logging
 * ?graphty-element-logging=true
 *
 * // Enable specific modules
 * ?graphty-element-logging=layout,xr,camera
 *
 * // Set log level
 * ?graphty-element-logging=true&graphty-element-log-level=debug
 *
 * // Module-specific levels
 * ?graphty-element-logging=layout:debug,xr:info
 *
 * // Enable remote logging to a server
 * ?graphty-element-logging=true&graphty-element-remote-log=https://localhost:9080
 * ```
 *
 * @module logging
 */

// Core exports
export {GraphtyLogger, type GraphtyLoggerConfig, type Logger} from "./GraphtyLogger.js";
export {isLazy, lazy, LAZY_SYMBOL, type LazyValue, resolveDataObject, resolveLazy} from "./LazyEval.js";
export {
    configureLogging,
    getLoggingConfig,
    isModuleEnabled,
    type LoggerConfig,
    resetLoggingConfig,
} from "./LoggerConfig.js";
export {type ConsoleSinkOptions, createConsoleSink} from "./sinks/ConsoleSink.js";
export {createRemoteSink, type RemoteSinkOptions} from "./sinks/RemoteSink.js";
export {clearLoggingConfig, loadLoggingConfig, saveLoggingConfig} from "./storage.js";
export {
    LOG_LEVEL_NAMES,
    LOG_LEVEL_TO_NAME,
    LogLevel,
    type LogRecord,
    parseLogLevel,
    type Sink,
} from "./types.js";
export {type ParsedLoggingParams, parseLoggingURLParams} from "./URLParamParser.js";
