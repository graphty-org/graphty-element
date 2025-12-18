/**
 * Graphty Log Server - A standalone HTTPS log server for remote debugging.
 *
 * Features:
 * - HTTPS with auto-generated self-signed certs or custom certs
 * - Receives logs from browser via POST /log
 * - Pretty terminal output with colors
 * - REST API for querying logs
 * - Optional file logging for Claude Code to read
 *
 * Usage (from a project with @graphty/graphty-element installed):
 *   npx graphty-log-server --port 9080
 *   npx graphty-log-server --cert /path/to/cert.crt --key /path/to/key.key
 *
 * Or explicitly specifying the package:
 *   npx -p @graphty/graphty-element graphty-log-server --port 9080
 */

import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import {URL} from "url";

import {certFilesExist, generateSelfSignedCert, readCertFiles} from "./self-signed-cert.js";

// ANSI color codes for terminal output
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    bgRed: "\x1b[41m",
    bgYellow: "\x1b[43m",
};

export interface LogServerOptions {
    /** Port to listen on (default: 9080) */
    port?: number;
    /** Hostname to bind to (default: localhost) */
    host?: string;
    /** Path to SSL certificate file */
    certPath?: string;
    /** Path to SSL private key file */
    keyPath?: string;
    /** Path to file for writing logs (optional) */
    logFile?: string;
    /** Use HTTP instead of HTTPS (default: false) */
    useHttp?: boolean;
    /** Suppress startup banner (default: false) */
    quiet?: boolean;
}

interface LogEntry {
    time: string;
    level: string;
    message: string;
}

interface LogBatch {
    sessionId: string;
    logs: LogEntry[];
}

// Store for remote logs by session
const remoteLogs = new Map<string, LogEntry[]>();

// File stream for log file
let logFileStream: fs.WriteStream | null = null;

/**
 * Format log level for terminal output with colors.
 */
function formatLogLevel(level: string): string {
    switch (level.toUpperCase()) {
        case "ERROR":
            return `${colors.bgRed}${colors.white} ERROR ${colors.reset}`;
        case "WARN":
        case "WARNING":
            return `${colors.bgYellow}${colors.bright} WARN  ${colors.reset}`;
        case "INFO":
            return `${colors.blue} INFO  ${colors.reset}`;
        case "DEBUG":
            return `${colors.cyan} DEBUG ${colors.reset}`;
        case "TRACE":
            return `${colors.dim} TRACE ${colors.reset}`;
        case "LOG":
        default:
            return `${colors.green} LOG   ${colors.reset}`;
    }
}

/**
 * Display a log entry in the terminal.
 */
function displayLog(sessionId: string, log: LogEntry): void {
    const time = new Date(log.time).toLocaleTimeString();
    const level = formatLogLevel(log.level);
    const session = `${colors.cyan}[${sessionId.substring(0, 12)}]${colors.reset}`;

    // Truncate very long messages for display
    let {message} = log;
    if (message.length > 1000) {
        message = `${message.substring(0, 1000)}... [truncated]`;
    }

    // eslint-disable-next-line no-console
    console.log(`${time} ${session} ${level} ${message}`);

    // Write to log file if configured
    if (logFileStream) {
        const logLine = JSON.stringify({
            time: log.time,
            sessionId,
            level: log.level,
            message: log.message,
        });
        logFileStream.write(`${logLine}\n`);
    }
}

/**
 * Handle incoming HTTP request.
 */
function handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    host: string,
    port: number,
    useHttps: boolean,
): void {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = req.url ?? "/";
    const protocol = useHttps ? "https" : "http";

    // Handle log endpoint - receive logs from browser
    if (url === "/log" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const data = JSON.parse(body) as LogBatch;
                const {sessionId, logs} = data;

                // Initialize session if new
                if (!remoteLogs.has(sessionId)) {
                    remoteLogs.set(sessionId, []);
                    // eslint-disable-next-line no-console
                    console.log(`\n${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════${colors.reset}`);
                    // eslint-disable-next-line no-console
                    console.log(`${colors.bright}${colors.magenta}  NEW SESSION: ${sessionId}${colors.reset}`);
                    // eslint-disable-next-line no-console
                    console.log(`${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════${colors.reset}\n`);
                }

                const sessionLogs = remoteLogs.get(sessionId);
                if (!sessionLogs) {
                    // Should not happen since we just set it above, but satisfy TypeScript
                    res.writeHead(500, {"Content-Type": "application/json"});
                    res.end(JSON.stringify({error: "Internal error"}));
                    return;
                }

                // Display and store each log
                for (const log of logs) {
                    sessionLogs.push(log);
                    displayLog(sessionId, log);
                }

                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({success: true}));
            } catch (error) {
                console.error("Error parsing log data:", error);
                res.writeHead(400, {"Content-Type": "application/json"});
                res.end(JSON.stringify({error: "Invalid JSON"}));
            }
        });
        return;
    }

    // Handle logs viewer endpoint - GET all logs
    if (url === "/logs" && req.method === "GET") {
        const allLogs: Record<string, LogEntry[]> = {};
        for (const [sessionId, logs] of remoteLogs) {
            allLogs[sessionId] = logs;
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(allLogs, null, 2));
        return;
    }

    // Handle recent logs endpoint - GET last N logs across all sessions
    if (url.startsWith("/logs/recent") && req.method === "GET") {
        const urlObj = new URL(url, `${protocol}://${host}:${port}`);
        const count = parseInt(urlObj.searchParams.get("n") ?? "50", 10);
        const errorsOnly = urlObj.searchParams.get("errors") === "true";

        // Collect all logs with session info
        const allLogs: (LogEntry & {sessionId: string})[] = [];
        for (const [sessionId, logs] of remoteLogs) {
            for (const log of logs) {
                if (!errorsOnly || log.level.toUpperCase() === "ERROR") {
                    allLogs.push({sessionId, ... log});
                }
            }
        }

        // Sort by time descending and take last N
        allLogs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        const recentLogs = allLogs.slice(0, count).reverse(); // Reverse to show oldest first

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            total: allLogs.length,
            showing: recentLogs.length,
            logs: recentLogs,
        }, null, 2));
        return;
    }

    // Handle errors-only endpoint
    if (url === "/logs/errors" && req.method === "GET") {
        const errorLogs: (LogEntry & {sessionId: string})[] = [];
        for (const [sessionId, logs] of remoteLogs) {
            for (const log of logs) {
                if (log.level.toUpperCase() === "ERROR") {
                    errorLogs.push({sessionId, ... log});
                }
            }
        }
        errorLogs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({
            total: errorLogs.length,
            logs: errorLogs,
        }, null, 2));
        return;
    }

    // Handle clear logs endpoint
    if (url === "/logs/clear" && req.method === "POST") {
        remoteLogs.clear();
        // eslint-disable-next-line no-console
        console.log(`\n${colors.yellow}Logs cleared${colors.reset}\n`);
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({success: true}));
        return;
    }

    // Health check endpoint
    if (url === "/health" && req.method === "GET") {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({status: "ok", sessions: remoteLogs.size}));
        return;
    }

    // Default: 404
    res.writeHead(404, {"Content-Type": "application/json"});
    res.end(JSON.stringify({error: "Not found"}));
}

/**
 * Print startup banner.
 */
function printBanner(host: string, port: number, useHttps: boolean): void {
    const protocol = useHttps ? "https" : "http";

    // eslint-disable-next-line no-console
    console.log("");
    // eslint-disable-next-line no-console
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log(`${colors.bright}${colors.cyan}  Graphty Log Server${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log("");
    // eslint-disable-next-line no-console
    console.log(`${colors.green}Server running at:${colors.reset} ${colors.bright}${protocol}://${host}:${port}/${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log("");
    // eslint-disable-next-line no-console
    console.log(`${colors.yellow}API Endpoints:${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log(`  ${colors.cyan}POST /log         ${colors.reset} - Receive logs from browser`);
    // eslint-disable-next-line no-console
    console.log(`  ${colors.cyan}GET  /logs        ${colors.reset} - Get all logs as JSON`);
    // eslint-disable-next-line no-console
    console.log(`  ${colors.cyan}GET  /logs/recent ${colors.reset} - Get last 50 logs (?n=100 for more)`);
    // eslint-disable-next-line no-console
    console.log(`  ${colors.cyan}GET  /logs/errors ${colors.reset} - Get only error logs`);
    // eslint-disable-next-line no-console
    console.log(`  ${colors.cyan}POST /logs/clear  ${colors.reset} - Clear all logs`);
    // eslint-disable-next-line no-console
    console.log(`  ${colors.cyan}GET  /health      ${colors.reset} - Health check`);
    // eslint-disable-next-line no-console
    console.log("");
    // eslint-disable-next-line no-console
    console.log(`${colors.yellow}Browser URL Parameter:${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log(`  ${colors.dim}?graphty-element-remote-log=${protocol}://${host}:${port}${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log("");
    // eslint-disable-next-line no-console
    console.log(`${colors.dim}Remote logs will appear below:${colors.reset}`);
    // eslint-disable-next-line no-console
    console.log(`${colors.cyan}────────────────────────────────────────────────────────────${colors.reset}`);
}

/**
 * Start the log server.
 *
 * @param options - Server configuration options
 */
export function startLogServer(options: LogServerOptions = {}): void {
    const port = options.port ?? 9080;
    const host = options.host ?? "localhost";
    const useHttp = options.useHttp ?? false;
    const quiet = options.quiet ?? false;

    // Set up log file if specified
    if (options.logFile) {
        logFileStream = fs.createWriteStream(options.logFile, {flags: "a"});
        // eslint-disable-next-line no-console
        console.log(`${colors.green}Writing logs to: ${options.logFile}${colors.reset}`);
    }

    // Determine SSL configuration
    let server: https.Server | http.Server;

    if (useHttp) {
        // Plain HTTP server
        server = http.createServer((req, res) => {
            handleRequest(req, res, host, port, false);
        });
    } else {
        // HTTPS server
        let cert: string;
        let key: string;

        if (options.certPath && options.keyPath && certFilesExist(options.certPath, options.keyPath)) {
            // Use provided certificates
            ({cert, key} = readCertFiles(options.certPath, options.keyPath));
            if (!quiet) {
                // eslint-disable-next-line no-console
                console.log(`${colors.green}Using SSL certificates from: ${options.certPath}${colors.reset}`);
            }
        } else {
            // Generate self-signed certificate
            if (!quiet) {
                // eslint-disable-next-line no-console
                console.log(`${colors.yellow}Generating self-signed certificate for ${host}...${colors.reset}`);
            }

            ({cert, key} = generateSelfSignedCert(host));
            if (!quiet) {
                // eslint-disable-next-line no-console
                console.log(`${colors.yellow}Note: Browser will show certificate warning - this is expected for self-signed certs${colors.reset}`);
            }
        }

        server = https.createServer({cert, key}, (req, res) => {
            handleRequest(req, res, host, port, true);
        });
    }

    // Start listening
    server.listen(port, host, () => {
        if (!quiet) {
            printBanner(host, port, !useHttp);
        }
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
        // eslint-disable-next-line no-console
        console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
        if (logFileStream) {
            logFileStream.end();
        }

        server.close(() => {
            process.exit(0);
        });
    });
}

/**
 * Parse command line arguments and start the server.
 */
export function main(): void {
    const args = process.argv.slice(2);
    const options: LogServerOptions = {};

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case "--port":
            case "-p":
                options.port = parseInt(nextArg, 10);
                i++;
                break;
            case "--host":
            case "-h":
                options.host = nextArg;
                i++;
                break;
            case "--cert":
            case "-c":
                options.certPath = nextArg;
                i++;
                break;
            case "--key":
            case "-k":
                options.keyPath = nextArg;
                i++;
                break;
            case "--log-file":
            case "-l":
                options.logFile = nextArg;
                i++;
                break;
            case "--http":
                options.useHttp = true;
                break;
            case "--quiet":
            case "-q":
                options.quiet = true;
                break;
            case "--help":
                // eslint-disable-next-line no-console
                console.log(`
Graphty Log Server - Remote logging for browser debugging

Usage (from a project with @graphty/graphty-element installed):
  npx graphty-log-server [options]

Or explicitly specifying the package:
  npx -p @graphty/graphty-element graphty-log-server [options]

Options:
  --port, -p <port>       Port to listen on (default: 9080)
  --host, -h <host>       Hostname to bind to (default: localhost)
  --cert, -c <path>       Path to SSL certificate file
  --key, -k <path>        Path to SSL private key file
  --log-file, -l <path>   Write logs to file (for Claude to read)
  --http                  Use HTTP instead of HTTPS
  --quiet, -q             Suppress startup banner
  --help                  Show this help message

Examples:
  npx graphty-log-server                           # Start with defaults (port 9080, self-signed cert)
  npx graphty-log-server --port 9085               # Custom port
  npx graphty-log-server --cert cert.crt --key key.key  # Custom SSL certs
  npx graphty-log-server --log-file ./tmp/logs.jsonl    # Also write to file

Browser URL Parameter:
  Add this to your page URL to enable remote logging:
  ?graphty-element-remote-log=https://localhost:9080
`);
                process.exit(0);
                break;
            default:

                console.error(`Unknown option: ${arg}`);
                process.exit(1);
        }
    }

    startLogServer(options);
}
