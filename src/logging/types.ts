/**
 * Log levels following standard syslog-inspired hierarchy.
 * Lower values are more severe.
 */
export enum LogLevel {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5,
}

/**
 * A log record containing all information about a single log entry.
 */
export interface LogRecord {
    /** Timestamp when the log entry was created */
    timestamp: Date;
    /** Severity level of the log entry */
    level: LogLevel;
    /** Hierarchical category path, e.g., ["graphty", "layout", "ngraph"] */
    category: string[];
    /** The log message */
    message: string;
    /** Optional structured data to include with the log */
    data?: Record<string, unknown>;
    /** Optional error object for error logs */
    error?: Error;
}

/**
 * A sink is a destination for log records (console, remote server, etc.).
 */
export interface Sink {
    /** Unique name for this sink */
    name: string;
    /** Write a log record to this sink */
    write(record: LogRecord): void;
    /** Optional method to flush any buffered logs */
    flush?(): Promise<void>;
}

/**
 * Configuration for the logging system.
 */
export interface LoggerConfig {
    /** Whether logging is enabled */
    enabled: boolean;
    /** Minimum log level to output */
    level: LogLevel;
    /** Modules to enable: array of module names or "*" for all */
    modules: string[] | "*";
    /** Formatting options */
    format: {
        /** Include timestamp in output */
        timestamp: boolean;
        /** Format for timestamps (default: ISO) */
        timestampFormat?: string;
        /** Include module name in output */
        module: boolean;
        /** Enable colored output (for console) */
        colors?: boolean;
    };
}

/**
 * Map of log level names to their enum values.
 */
export const LOG_LEVEL_NAMES: Record<string, LogLevel> = {
    silent: LogLevel.SILENT,
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    debug: LogLevel.DEBUG,
    trace: LogLevel.TRACE,
};

/**
 * Map of log level enum values to their names.
 */
export const LOG_LEVEL_TO_NAME: Record<LogLevel, string> = {
    [LogLevel.SILENT]: "SILENT",
    [LogLevel.ERROR]: "ERROR",
    [LogLevel.WARN]: "WARN",
    [LogLevel.INFO]: "INFO",
    [LogLevel.DEBUG]: "DEBUG",
    [LogLevel.TRACE]: "TRACE",
};

/**
 * Parse a log level string to its enum value.
 * @param level - The level string (case-insensitive)
 * @returns The LogLevel enum value or undefined if invalid
 */
export function parseLogLevel(level: string): LogLevel | undefined {
    return LOG_LEVEL_NAMES[level.toLowerCase()];
}
