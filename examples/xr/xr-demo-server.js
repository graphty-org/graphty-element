// Simple HTTPS server for XR demo with remote logging
// Usage: npm run dev:xr
// Or:    node examples/xr/xr-demo-server.js

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SSL certificate paths
const CERT_PATH = '/home/apowers/ssl/atoms.crt';
const KEY_PATH = '/home/apowers/ssl/atoms.key';

// Server configuration (using port in allowed range 9000-9099)
const PORT = 9077;
const HOST = 'dev.ato.ms';

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// Store for remote logs by session
const remoteLogs = new Map();

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgYellow: '\x1b[43m',
};

function formatLogLevel(level) {
    switch (level) {
        case 'ERROR':
            return `${colors.bgRed}${colors.white} ERROR ${colors.reset}`;
        case 'WARN':
            return `${colors.bgYellow}${colors.bright} WARN  ${colors.reset}`;
        case 'INFO':
            return `${colors.blue} INFO  ${colors.reset}`;
        case 'LOG':
        default:
            return `${colors.green} LOG   ${colors.reset}`;
    }
}

function displayLog(sessionId, log) {
    const time = new Date(log.time).toLocaleTimeString();
    const level = formatLogLevel(log.level);
    const session = `${colors.cyan}[${sessionId.substring(0, 12)}]${colors.reset}`;

    // Truncate very long messages for display (increased limit)
    let message = log.message;
    if (message.length > 1000) {
        message = message.substring(0, 1000) + '... [truncated]';
    }

    console.log(`${time} ${session} ${level} ${message}`);
}

// Track total log count for summary
let totalLogCount = 0;

// Read SSL certificates
const options = {
    key: fs.readFileSync(KEY_PATH),
    cert: fs.readFileSync(CERT_PATH),
};

// Create HTTPS server
const server = https.createServer(options, (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Handle log endpoint
    if (req.url === '/log' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const sessionId = data.sessionId || 'unknown';
                const logs = data.logs || [];

                // Store logs
                if (!remoteLogs.has(sessionId)) {
                    remoteLogs.set(sessionId, []);
                    console.log(`\n${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════${colors.reset}`);
                    console.log(`${colors.bright}${colors.magenta}  NEW SESSION: ${sessionId}${colors.reset}`);
                    console.log(`${colors.bright}${colors.magenta}═══════════════════════════════════════════════════════════${colors.reset}\n`);
                }

                const sessionLogs = remoteLogs.get(sessionId);

                // Display and store each log
                for (const log of logs) {
                    sessionLogs.push(log);
                    displayLog(sessionId, log);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('Error parsing log data:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    // Handle logs viewer endpoint
    if (req.url === '/logs' && req.method === 'GET') {
        const allLogs = {};
        for (const [sessionId, logs] of remoteLogs) {
            allLogs[sessionId] = logs;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(allLogs, null, 2));
        return;
    }

    // Handle recent logs endpoint - returns last N logs across all sessions
    if (req.url.startsWith('/logs/recent') && req.method === 'GET') {
        const urlParams = new URL(req.url, `https://${HOST}:${PORT}`);
        const count = parseInt(urlParams.searchParams.get('n') || '50', 10);
        const errorsOnly = urlParams.searchParams.get('errors') === 'true';

        // Collect all logs with session info
        const allLogs = [];
        for (const [sessionId, logs] of remoteLogs) {
            for (const log of logs) {
                if (!errorsOnly || log.level === 'ERROR') {
                    allLogs.push({ sessionId, ...log });
                }
            }
        }

        // Sort by time descending and take last N
        allLogs.sort((a, b) => new Date(b.time) - new Date(a.time));
        const recentLogs = allLogs.slice(0, count).reverse(); // Reverse to show oldest first

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            total: allLogs.length,
            showing: recentLogs.length,
            logs: recentLogs
        }, null, 2));
        return;
    }

    // Handle errors-only endpoint
    if (req.url === '/logs/errors' && req.method === 'GET') {
        const errorLogs = [];
        for (const [sessionId, logs] of remoteLogs) {
            for (const log of logs) {
                if (log.level === 'ERROR') {
                    errorLogs.push({ sessionId, ...log });
                }
            }
        }
        errorLogs.sort((a, b) => new Date(a.time) - new Date(b.time));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            total: errorLogs.length,
            logs: errorLogs
        }, null, 2));
        return;
    }

    // Handle clear logs endpoint
    if (req.url === '/logs/clear' && req.method === 'POST') {
        remoteLogs.clear();
        console.log(`\n${colors.yellow}Logs cleared${colors.reset}\n`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    // Static file serving
    let filePath = req.url.split('?')[0]; // Remove query string

    // Default to pivot camera demo (with drag and drop)
    if (filePath === '/' || filePath === '') {
        filePath = '/xr-pivot-camera-demo.html';
    }

    // Resolve file path
    const fullPath = path.join(__dirname, filePath);

    // Check if file exists
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.log(`${colors.red}404 Not Found: ${filePath}${colors.reset}`);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Get file extension and MIME type
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Read and serve file
        fs.readFile(fullPath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }

            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
            });
            res.end(content);
        });
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  XR Pivot Camera Demo Server - with Remote Logging${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}════════════════════════════════════════════════════════════${colors.reset}`);
    console.log('');
    console.log(`${colors.green}Server running at:${colors.reset} ${colors.bright}https://${HOST}:${PORT}/${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}Demo Page:${colors.reset}`);
    console.log(`  ${colors.cyan}/  ${colors.reset} - XR Pivot Camera Demo (drag & drop enabled)`);
    console.log('');
    console.log(`${colors.yellow}API Endpoints:${colors.reset}`);
    console.log(`  ${colors.cyan}/log          ${colors.reset} - POST logs from Quest (automatic)`);
    console.log(`  ${colors.cyan}/logs         ${colors.reset} - GET all logs as JSON`);
    console.log(`  ${colors.cyan}/logs/recent  ${colors.reset} - GET last 50 logs (?n=100 for more)`);
    console.log(`  ${colors.cyan}/logs/errors  ${colors.reset} - GET only error logs`);
    console.log(`  ${colors.cyan}/logs/clear   ${colors.reset} - POST to clear all logs`);
    console.log('');
    console.log(`${colors.yellow}XR Controls:${colors.reset}`);
    console.log(`  ${colors.bright}Thumbsticks:${colors.reset}`);
    console.log(`    - Left X/Y:  Rotate view (yaw/pitch)`);
    console.log(`    - Right Y:   Zoom in/out`);
    console.log(`    - Right X:   Pan left/right`);
    console.log(`  ${colors.bright}Two-hand gestures (both triggers/pinch):${colors.reset}`);
    console.log(`    - Pull apart/push together: Zoom`);
    console.log(`    - Twist: Rotate view`);
    console.log(`  ${colors.bright}Single-hand drag (one trigger/pinch):${colors.reset}`);
    console.log(`    - Point at object + trigger/pinch: Grab`);
    console.log(`    - Move hand: Drag object`);
    console.log(`    - Release: Drop object`);
    console.log('');
    console.log(`${colors.dim}Remote logs from Quest will appear below:${colors.reset}`);
    console.log(`${colors.cyan}────────────────────────────────────────────────────────────${colors.reset}`);
});
