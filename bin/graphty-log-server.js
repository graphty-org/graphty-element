#!/usr/bin/env node

/**
 * Graphty Log Server CLI
 *
 * A standalone HTTPS log server for remote debugging of browser applications.
 * Receives logs from the browser and displays them in the terminal.
 *
 * Usage:
 *   npx graphty-log-server --port 9080
 *   npx graphty-log-server --cert /path/to/cert.crt --key /path/to/key.key
 *   npx graphty-log-server --help
 */

import {main} from "../dist/src/logging/server/log-server.js";

main();
