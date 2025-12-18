/* eslint-disable no-console -- This is a console sink, console usage is intentional */
import {LOG_LEVEL_TO_NAME, LogLevel, type LogRecord, type Sink} from "../types.js";

/**
 * Options for the console sink.
 */
export interface ConsoleSinkOptions {
    /** Custom formatter for log records */
    formatter?: (record: LogRecord) => string;
    /** Enable colored output */
    colors?: boolean;
}

/**
 * Default formatter for log records.
 */
function defaultFormatter(record: LogRecord): string {
    const parts: string[] = [];

    // Add timestamp
    parts.push(`[${record.timestamp.toISOString()}]`);

    // Add category
    parts.push(`[${record.category.join(".")}]`);

    // Add level
    parts.push(`[${LOG_LEVEL_TO_NAME[record.level]}]`);

    // Add message
    parts.push(record.message);

    return parts.join(" ");
}

/**
 * Get the console method for a log level.
 */
function getConsoleMethod(level: LogLevel): "error" | "warn" | "info" | "debug" | "log" {
    switch (level) {
        case LogLevel.ERROR:
            return "error";
        case LogLevel.WARN:
            return "warn";
        case LogLevel.INFO:
            return "info";
        case LogLevel.DEBUG:
        case LogLevel.TRACE:
            return "debug";
        default:
            return "log";
    }
}

/**
 * Create a console sink for logging to the browser console.
 *
 * @param options - Sink configuration options
 * @returns A Sink that writes to the console
 */
export function createConsoleSink(options: ConsoleSinkOptions = {}): Sink {
    const formatter = options.formatter ?? defaultFormatter;

    return {
        name: "console",
        write(record: LogRecord): void {
            const message = formatter(record);
            const method = getConsoleMethod(record.level);

            // Log the message
            if (record.data || record.error) {
                const extra: Record<string, unknown> = {};
                if (record.data) {
                    Object.assign(extra, record.data);
                }

                if (record.error) {
                    extra.error = record.error;
                }

                console[method](message, extra);
            } else {
                console[method](message);
            }
        },
    };
}
