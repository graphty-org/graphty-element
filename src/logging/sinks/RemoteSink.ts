/**
 * Remote logging sink for sending logs to a remote server.
 * This runs in the browser and sends logs to the graphty-log-server.
 */

import {LOG_LEVEL_TO_NAME, type LogRecord, type Sink} from "../types.js";

/**
 * Options for the remote sink.
 */
export interface RemoteSinkOptions {
    /** URL of the remote log server (e.g., https://localhost:9080) */
    serverUrl: string;
    /** Prefix for session ID (default: "graphty") */
    sessionPrefix?: string;
    /** Interval in ms to batch logs before sending (default: 100) */
    batchIntervalMs?: number;
    /** Maximum number of retries on failure (default: 3) */
    maxRetries?: number;
    /** Delay between retries in ms (default: 1000) */
    retryDelayMs?: number;
    /** Patterns to throttle (prevent log flooding) */
    throttlePatterns?: RegExp[];
    /** Throttle window in ms (default: 5000) */
    throttleMs?: number;
}

interface LogEntry {
    time: string;
    level: string;
    message: string;
}

/**
 * Create a remote sink for sending logs to a log server.
 *
 * @param options - Sink configuration options
 * @returns A Sink that sends logs to the remote server
 */
export function createRemoteSink(options: RemoteSinkOptions): Sink {
    const serverUrl = options.serverUrl.replace(/\/$/, ""); // Remove trailing slash
    const sessionPrefix = options.sessionPrefix ?? "graphty";
    const batchIntervalMs = options.batchIntervalMs ?? 100;
    const maxRetries = options.maxRetries ?? 3;
    const retryDelayMs = options.retryDelayMs ?? 1000;
    const throttlePatterns = options.throttlePatterns ?? [];
    const throttleMs = options.throttleMs ?? 5000;

    // Generate unique session ID
    const sessionId = `${sessionPrefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

    // Buffer for batching logs
    const logBuffer: LogEntry[] = [];
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let isFlushing = false;

    // Throttle tracking
    const lastMessageTimes = new Map<string, number>();

    /**
     * Check if a message should be throttled.
     */
    function shouldThrottle(message: string): boolean {
        for (const pattern of throttlePatterns) {
            if (pattern.test(message)) {
                const key = pattern.source;
                const lastTime = lastMessageTimes.get(key) ?? 0;
                const now = Date.now();
                if (now - lastTime < throttleMs) {
                    return true;
                }

                lastMessageTimes.set(key, now);
                return false;
            }
        }
        return false;
    }

    /**
     * Format a LogRecord into a LogEntry for the server.
     */
    function formatRecord(record: LogRecord): LogEntry {
        const parts: string[] = [];

        // Add category
        parts.push(`[${record.category.join(".")}]`);

        // Add message
        parts.push(record.message);

        // Add structured data if present
        if (record.data && Object.keys(record.data).length > 0) {
            try {
                parts.push(JSON.stringify(record.data));
            } catch {
                parts.push("[non-serializable data]");
            }
        }

        // Add error stack if present
        if (record.error) {
            parts.push(`\nError: ${record.error.message}`);
            if (record.error.stack) {
                parts.push(`\n${record.error.stack}`);
            }
        }

        return {
            time: record.timestamp.toISOString(),
            level: LOG_LEVEL_TO_NAME[record.level],
            message: parts.join(" "),
        };
    }

    /**
     * Send logs to the server with retry logic.
     */
    async function sendLogs(logs: LogEntry[], retriesLeft: number): Promise<void> {
        try {
            const response = await fetch(`${serverUrl}/log`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({sessionId, logs}),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }
        } catch (error) {
            if (retriesLeft > 0) {
                // Wait and retry
                await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
                await sendLogs(logs, retriesLeft - 1);
            } else {
                // Give up - log to console as fallback

                console.warn("[RemoteSink] Failed to send logs after retries:", error);
            }
        }
    }

    /**
     * Flush buffered logs to the server.
     */
    async function flushLogs(): Promise<void> {
        if (isFlushing || logBuffer.length === 0) {
            return;
        }

        isFlushing = true;
        const logsToSend = logBuffer.splice(0, logBuffer.length);

        try {
            await sendLogs(logsToSend, maxRetries);
        } finally {
            isFlushing = false;
        }
    }

    /**
     * Schedule a flush after the batch interval.
     */
    function scheduleFlush(): void {
        if (flushTimer) {
            clearTimeout(flushTimer);
        }

        flushTimer = setTimeout(() => {
            void flushLogs();
        }, batchIntervalMs);
    }

    return {
        name: "remote",

        write(record: LogRecord): void {
            const entry = formatRecord(record);

            // Check throttling
            if (shouldThrottle(entry.message)) {
                return;
            }

            // Add to buffer
            logBuffer.push(entry);

            // Schedule flush
            scheduleFlush();
        },

        async flush(): Promise<void> {
            // Clear any pending timer
            if (flushTimer) {
                clearTimeout(flushTimer);
                flushTimer = null;
            }

            // Flush immediately
            await flushLogs();
        },
    };
}
