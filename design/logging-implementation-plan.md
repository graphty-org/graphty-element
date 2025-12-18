# Implementation Plan: Logging System for graphty-element

## Overview

This plan implements a comprehensive logging system for graphty-element based on LogTape, providing:

- URL parameter-based enable/disable and module filtering
- Hierarchical module categories matching the codebase structure
- Configurable log levels (silent, error, warn, info, debug, trace)
- Multiple sinks (console, remote, Sentry)
- Zero overhead when disabled
- TypeScript-first design with full type safety

## Phase Breakdown

### Phase 1: Core Logging Infrastructure

**Objective**: Establish the foundational logging system with LogTape integration, configuration management, and console output.

**Tests to Write First**:

- `test/logging/LoggerConfig.test.ts`: Configuration parsing and validation
  ```typescript
  describe("LoggerConfig", () => {
    it("should parse enabled=true from URL params");
    it("should parse comma-separated module list");
    it("should parse module:level format");
    it("should default to INFO level when not specified");
    it("should validate log level values");
    it("should handle invalid URL parameter gracefully");
  });
  ```

- `test/logging/URLParamParser.test.ts`: URL parameter extraction
  ```typescript
  describe("URLParamParser", () => {
    it("should extract graphty-element-logging param");
    it("should extract graphty-element-log-level param");
    it("should return null for missing params");
    it("should parse 'true' as enable all modules");
    it("should parse module list as string array");
  });
  ```

- `test/logging/GraphtyLogger.test.ts`: Logger facade basic operations
  ```typescript
  describe("GraphtyLogger", () => {
    it("should create logger for category");
    it("should cache logger instances");
    it("should not log when disabled");
    it("should log when enabled at correct level");
    it("should include timestamp in output");
    it("should include category prefix");
  });
  ```

**Implementation**:

- `src/logging/index.ts`: Public exports
  ```typescript
  export { GraphtyLogger, LogLevel } from "./GraphtyLogger";
  export { configureLogging, LoggerConfig } from "./LoggerConfig";
  export type { LogRecord, Sink } from "./types";
  ```

- `src/logging/types.ts`: Core type definitions
  ```typescript
  export enum LogLevel {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5,
  }

  export interface LogRecord {
    timestamp: Date;
    level: LogLevel;
    category: string[];
    message: string;
    data?: Record<string, unknown>;
    error?: Error;
  }

  export interface Sink {
    name: string;
    write(record: LogRecord): void;
    flush?(): Promise<void>;
  }

  export interface LoggerConfig {
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
  ```

- `src/logging/URLParamParser.ts`: URL parameter parsing
  ```typescript
  export interface ParsedLoggingParams {
    enabled: boolean;
    modules: string[] | "*";
    level?: LogLevel;
    moduleOverrides?: Map<string, LogLevel>;
  }

  export function parseLoggingURLParams(): ParsedLoggingParams | null;
  ```

- `src/logging/LoggerConfig.ts`: Configuration management with Zod validation
  ```typescript
  export function configureLogging(config: Partial<LoggerConfig>): Promise<void>;
  export function getLoggingConfig(): LoggerConfig;
  export function isModuleEnabled(category: string[]): boolean;
  ```

- `src/logging/GraphtyLogger.ts`: Main logger facade wrapping LogTape
  ```typescript
  export class GraphtyLogger {
    static configure(config: LoggerConfig): Promise<void>;
    static getLogger(category: string[]): Logger;
    static isEnabled(): boolean;
  }

  export interface Logger {
    trace(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, error?: Error, data?: Record<string, unknown>): void;
    isTraceEnabled(): boolean;
    isDebugEnabled(): boolean;
  }
  ```

- `src/logging/sinks/ConsoleSink.ts`: Browser console output
  ```typescript
  export function createConsoleSink(options?: {
    formatter?: (record: LogRecord) => string;
    colors?: boolean;
  }): Sink;
  ```

**Dependencies**:
- External: `@logtape/logtape` (5.3KB gzipped)
- Internal: None

**Verification**:
1. Run: `npm test -- test/logging/`
2. Expected: All tests pass
3. Manual: Open browser console, see no logging output by default

---

### Phase 2: URL Parameter Integration

**Objective**: Enable logging via URL parameters in graphty-element, allowing developers to debug by adding query strings.

**Tests to Write First**:

- `test/logging/integration/URLParamIntegration.test.ts`: End-to-end URL parameter tests
  ```typescript
  describe("URL Parameter Integration", () => {
    it("should enable logging when ?graphty-element-logging=true");
    it("should filter to layout module with ?graphty-element-logging=layout");
    it("should set debug level with ?graphty-element-log-level=debug");
    it("should parse combined module:level format");
    it("should persist config in sessionStorage");
  });
  ```

- `test/logging/integration/ConsoleOutput.test.ts`: Verify console output format
  ```typescript
  describe("Console Output", () => {
    it("should include ISO timestamp");
    it("should include module category path");
    it("should include log level");
    it("should format structured data as JSON");
    it("should include stack trace for errors");
  });
  ```

**Implementation**:

- Update `src/graphty-element.ts`:
  ```typescript
  // In parseURLParams()
  private parseURLParams(): void {
    // ... existing profiling param parsing ...

    // Parse logging params
    const loggingParams = parseLoggingURLParams();
    if (loggingParams?.enabled) {
      void GraphtyLogger.configure({
        enabled: true,
        modules: loggingParams.modules,
        level: loggingParams.level ?? LogLevel.INFO,
        format: { timestamp: true, module: true, colors: true },
      });
    }
  }
  ```

- `src/logging/storage.ts`: Session persistence
  ```typescript
  export function saveLoggingConfig(config: LoggerConfig): void;
  export function loadLoggingConfig(): LoggerConfig | null;
  export function clearLoggingConfig(): void;
  ```

- Update `src/logging/LoggerConfig.ts`: Add auto-detection of URL params on module load

**Dependencies**:
- External: None (uses Web APIs)
- Internal: Phase 1 logging infrastructure

**Verification**:
1. Run: `npm test -- test/logging/integration/`
2. Manual test:
   - Start Storybook: `npm run storybook`
   - Navigate to: `http://dev.ato.ms:9025/?graphty-element-logging=true`
   - Open browser console
   - Expected: See log messages with timestamps and module prefixes
3. Run: `npm run build` - verify no bundle size increase beyond LogTape

---

### Phase 3: Remote Log Server & Remote Sink

**Objective**: Create a reusable remote log server CLI tool and RemoteSink that allows debugging from mobile/XR devices. The server runs locally and receives logs from browsers, displaying them in the terminal where Claude Code can see and iterate on errors.

**Key Design Decisions**:
- Server is part of this package (not a separate package)
- Runnable via `npx graphty-log-server` (from a project with @graphty/graphty-element installed)
- Or via `npx -p @graphty/graphty-element graphty-log-server` (explicitly specifying the package)
- HTTPS support with auto-generated self-signed certs (required for WebXR)
- Custom cert paths can be provided via CLI options
- Remote logging disabled by default in browser
- Enable via URL parameter: `?graphty-element-remote-log=https://localhost:9080`

**Tests to Write First**:

- `test/logging/sinks/RemoteSink.test.ts`:
  ```typescript
  describe("RemoteSink", () => {
    it("should batch logs before sending");
    it("should retry on failure");
    it("should respect throttle patterns");
    it("should format messages correctly for server");
    it("should be disabled by default");
    it("should enable when serverUrl is provided");
  });
  ```

- `test/logging/sinks/SinkRegistry.test.ts`:
  ```typescript
  describe("SinkRegistry", () => {
    it("should register custom sink");
    it("should remove sink by name");
    it("should list registered sinks");
    it("should dispatch to all registered sinks");
    it("should handle sink errors gracefully");
  });
  ```

- `test/logging/URLParamParser.test.ts` (additions):
  ```typescript
  describe("URLParamParser - Remote Logging", () => {
    it("should parse graphty-element-remote-log parameter");
    it("should return null remoteLogUrl when not specified");
    it("should validate URL format");
  });
  ```

**Implementation**:

- `bin/graphty-log-server.js`: CLI entry point for npx
  ```javascript
  #!/usr/bin/env node
  import { startLogServer } from '../dist/src/logging/server/log-server.js';
  startLogServer();
  ```

- `src/logging/server/log-server.ts`: Standalone log server
  ```typescript
  export interface LogServerOptions {
    port?: number;           // Default: 9080
    host?: string;           // Default: localhost
    certPath?: string;       // Path to SSL cert (optional)
    keyPath?: string;        // Path to SSL key (optional)
    logFile?: string;        // Optional file to write logs to
  }

  export async function startLogServer(options?: LogServerOptions): Promise<void>;

  // Features:
  // - HTTPS with self-signed certs if none provided
  // - POST /log - receive logs from browser
  // - GET /logs - view all logs as JSON
  // - GET /logs/recent?n=50 - last N logs
  // - GET /logs/errors - errors only
  // - POST /logs/clear - clear logs
  // - Pretty terminal output with colors
  // - Optionally writes to file for Claude to read
  ```

- `src/logging/server/self-signed-cert.ts`: Generate self-signed certs
  ```typescript
  export function generateSelfSignedCert(): { cert: string; key: string };
  ```

- `src/logging/sinks/RemoteSink.ts`: Browser-side sink
  ```typescript
  export interface RemoteSinkOptions {
    serverUrl: string;
    sessionPrefix?: string;
    batchIntervalMs?: number;  // Default: 100
    maxRetries?: number;       // Default: 3
  }

  export function createRemoteSink(options: RemoteSinkOptions): Sink;
  ```

- Update `src/logging/URLParamParser.ts`:
  ```typescript
  export interface ParsedLoggingParams {
    enabled: boolean;
    modules: string[] | "*";
    level?: LogLevel;
    moduleOverrides?: Map<string, LogLevel>;
    remoteLogUrl?: string;  // NEW: URL of remote log server
  }
  ```

- Update `package.json`:
  ```json
  {
    "bin": {
      "graphty-log-server": "./bin/graphty-log-server.js"
    }
  }
  ```

- Update `src/logging/GraphtyLogger.ts`: Expose sink management API
  ```typescript
  static addSink(sink: Sink): void;
  static removeSink(name: string): void;
  static getSinks(): Sink[];
  ```

**CLI Usage** (from a project with @graphty/graphty-element installed):
```bash
# Start with defaults (port 9080, auto-generated certs)
npx graphty-log-server

# Custom port
npx graphty-log-server --port 9085

# With custom SSL certs
npx graphty-log-server --cert /path/to/cert.crt --key /path/to/key.key

# Also write to file (for Claude to read)
npx graphty-log-server --log-file ./tmp/graphty.log

# Or explicitly specify the package (works from anywhere)
npx -p @graphty/graphty-element graphty-log-server --port 9080
```

**Browser URL Parameters**:
```
# Enable remote logging to specific server
?graphty-element-logging=true&graphty-element-remote-log=https://localhost:9080

# Can combine with other logging options
?graphty-element-logging=layout,xr&graphty-element-log-level=debug&graphty-element-remote-log=https://dev.ato.ms:9080
```

**Dependencies**:
- External: None (uses Node.js built-in crypto for cert generation)
- Internal: Phase 1-2 logging infrastructure

**Verification**:
1. Run: `npm test -- test/logging/sinks/`
2. Manual test:
   ```bash
   # Terminal 1: Start log server
   npx graphty-log-server --port 9080

   # Terminal 2: Start Storybook
   npm run storybook

   # Browser: Open with remote logging enabled
   # https://dev.ato.ms:9025/?graphty-element-logging=true&graphty-element-remote-log=https://localhost:9080
   ```
3. Verify logs appear in Terminal 1
4. Verify Claude can read logs via `/logs/recent` endpoint or log file

---

### Phase 4: Programmatic API & Documentation

**Objective**: Expose complete programmatic API and comprehensive documentation.

**Tests to Write First**:

- `test/logging/api/ProgrammaticAPI.test.ts`:
  ```typescript
  describe("Programmatic API", () => {
    it("should configure via GraphtyLogger.configure()");
    it("should get logger for custom category");
    it("should dynamically enable/disable modules");
    it("should change log level at runtime");
    it("should register custom sinks");
  });
  ```

- `test/logging/api/CustomSink.test.ts`:
  ```typescript
  describe("Custom Sink", () => {
    it("should receive all log records");
    it("should be called with correct format");
    it("should support async flush");
  });
  ```

**Implementation**:

- Update `src/logging/index.ts`: Complete public API
  ```typescript
  export {
    GraphtyLogger,
    LogLevel,
    configureLogging,
    getLoggingConfig,
  } from "./GraphtyLogger";

  export type {
    LogRecord,
    Sink,
    LoggerConfig,
    Logger,
  } from "./types";

  export {
    createConsoleSink,
    createRemoteSink,
  } from "./sinks";

  // Re-export LogTape types for consumers creating custom sinks
  export type { Logger as LogTapeLogger } from "@logtape/logtape";
  ```

- Update `src/index.ts`: Export logging module
  ```typescript
  export * from "./logging";
  ```

- Create Storybook documentation story: `stories/Logging/Logging.mdx`
  - Overview of logging system
  - URL parameter reference
  - Module names reference
  - Programmatic API examples
  - Custom sink examples

**Dependencies**:
- External: None
- Internal: Phase 1-3

**Verification**:
1. Run: `npm test -- test/logging/api/`
2. Run: `npm run build` - verify exports work
3. Run: `npm run storybook` - verify documentation renders
4. Run: `npm run lint:pkg` - verify no unused exports

---

### Phase 5: Performance Guards & Lazy Evaluation

**Objective**: Add performance safeguards, lazy evaluation helpers, and ensure zero overhead when disabled.

**Tests to Write First**:

- `test/logging/performance/DisabledOverhead.test.ts`:
  ```typescript
  describe("Disabled Logging Overhead", () => {
    it("should have zero overhead when disabled");
    it("should not construct messages when disabled");
    it("should not call expensive data functions when level filtered");
  });
  ```

- `test/logging/performance/LazyEvaluation.test.ts`:
  ```typescript
  describe("Lazy Evaluation", () => {
    it("should not evaluate lazy function when level filtered");
    it("should evaluate lazy function when level passes");
    it("should work with isDebugEnabled() guard");
  });
  ```

**Implementation**:

- Add lazy evaluation helpers:
  ```typescript
  // src/logging/LazyEval.ts
  export function lazy<T>(fn: () => T): () => T;

  // Usage:
  logger.debug("Expensive data", lazy(() => computeExpensiveData()));
  ```

- Add logging level guards:
  ```typescript
  // Only compute expensive data if debug is enabled
  if (logger.isDebugEnabled()) {
    logger.debug("Data", { complex: computeExpensiveData() });
  }
  ```

- Document hot path guidelines in code comments

**Dependencies**:
- External: None
- Internal: Phase 1-4

**Verification**:
1. Run: `npm test -- test/logging/performance/`
2. Performance test:
   - Measure overhead with logging disabled
   - Verify < 1% impact on render loop

---

### Phase 6: Manager Integration (High-Priority Modules)

**Objective**: Add logging to the most valuable modules for debugging: LifecycleManager, OperationQueueManager, LayoutManager, DataManager.

**Tests to Write First**:

- `test/logging/modules/LifecycleManagerLogging.test.ts`:
  ```typescript
  describe("LifecycleManager Logging", () => {
    it("should log manager init started");
    it("should log each manager initialization with timing");
    it("should log init failures with error details");
    it("should log disposal sequence");
  });
  ```

- `test/logging/modules/LayoutManagerLogging.test.ts`:
  ```typescript
  describe("LayoutManager Logging", () => {
    it("should log layout type set");
    it("should log layout settled event");
    it("should NOT log in step() method (hot path)");
    it("should log layout initialization failure");
  });
  ```

- `test/logging/modules/DataManagerLogging.test.ts`:
  ```typescript
  describe("DataManager Logging", () => {
    it("should log batch node addition with count");
    it("should log data source loading start");
    it("should log data source completion with stats");
    it("should log validation errors");
  });
  ```

**Implementation**:

- Update `src/managers/LifecycleManager.ts`:
  ```typescript
  import { GraphtyLogger } from "../logging";

  export class LifecycleManager implements Manager {
    private logger = GraphtyLogger.getLogger(["graphty", "lifecycle"]);

    async init(): Promise<void> {
      this.logger.info("Initializing managers", {
        managerCount: this.managers.size,
        initOrder: this.initOrder
      });
      // ... existing code with logging added ...
    }
  }
  ```

- Update `src/managers/LayoutManager.ts`:
  ```typescript
  export class LayoutManager implements Manager {
    private logger = GraphtyLogger.getLogger(["graphty", "layout"]);

    async setLayout(type: string, opts: object = {}): Promise<void> {
      this.logger.info("Setting layout", { type, options: opts });
      // ... existing code ...
      this.logger.debug("Layout initialized", {
        type,
        nodeCount,
        edgeCount
      });
    }

    // Note: step() method MUST NOT have logging - hot path
  }
  ```

- Update `src/managers/DataManager.ts`:
  ```typescript
  export class DataManager implements Manager {
    private logger = GraphtyLogger.getLogger(["graphty", "data"]);

    async addNodes(nodes: NodeData[]): Promise<void> {
      this.logger.debug("Adding nodes", { count: nodes.length });
      // ... existing code ...
    }
  }
  ```

- Update `src/managers/OperationQueueManager.ts`:
  ```typescript
  export class OperationQueueManager implements Manager {
    private logger = GraphtyLogger.getLogger(["graphty", "operation"]);

    queueOperation(op: Operation): void {
      this.logger.debug("Operation queued", {
        id: op.id,
        category: op.category
      });
    }
  }
  ```

**Dependencies**:
- External: None
- Internal: Phase 1-5 logging infrastructure

**Verification**:
1. Run: `npm test -- test/logging/modules/`
2. Manual test:
   - Start Storybook with logging: `?graphty-element-logging=lifecycle,layout,data`
   - Load a graph story
   - Expected: See initialization sequence, layout setup, data loading in console
3. Run: `npm run test:visual` - ensure no performance regression

---

### Phase 7: Additional Module Integration & Final Polish

**Objective**: Add logging to remaining high-value modules and finalize with hot path verification tests.

**Tests to Write First**:

- `test/logging/modules/XRSessionManagerLogging.test.ts`:
  ```typescript
  describe("XRSessionManager Logging", () => {
    it("should log XR support check results");
    it("should log VR session entry");
    it("should log XR errors");
  });
  ```

- `test/logging/modules/CameraManagerLogging.test.ts`:
  ```typescript
  describe("CameraManager Logging", () => {
    it("should log camera activation");
    it("should log zoom to fit");
    it("should NOT log in update() method (hot path)");
  });
  ```

- `test/logging/modules/StyleManagerLogging.test.ts`:
  ```typescript
  describe("StyleManager Logging", () => {
    it("should log style template loaded");
    it("should log layer operations");
    it("should use TRACE for cache hits/misses");
  });
  ```

- `test/logging/performance/HotPathGuards.test.ts`:
  ```typescript
  describe("Hot Path Guards", () => {
    it("should not call logger in RenderManager render loop");
    it("should not call logger in LayoutEngine.step()");
    it("should not call logger in Node.update()");
    it("should not call logger in Edge.update()");
  });
  ```

**Implementation**:

- Update `src/xr/XRSessionManager.ts`:
  ```typescript
  private logger = GraphtyLogger.getLogger(["graphty", "xr", "session"]);
  ```

- Update `src/cameras/CameraManager.ts`:
  ```typescript
  private logger = GraphtyLogger.getLogger(["graphty", "camera"]);
  ```

- Update `src/managers/StyleManager.ts`:
  ```typescript
  private logger = GraphtyLogger.getLogger(["graphty", "style"]);
  ```

- Update `src/managers/RenderManager.ts`:
  ```typescript
  private logger = GraphtyLogger.getLogger(["graphty", "render"]);
  // CRITICAL: No logging inside runRenderLoop callback
  ```

- Add ESLint rule to prevent logging in hot paths (optional, documented):
  ```typescript
  // eslint-disable-next-line no-logging-in-hot-path
  ```

**Dependencies**:
- External: None
- Internal: Phase 1-6

**Verification**:
1. Run: `npm test -- test/logging/modules/`
2. Run: `npm test -- test/logging/performance/`
3. Manual test:
   - Test XR logging with XR stories
   - Test camera logging with camera interactions
4. Run: `npm run test:visual` - ensure no visual regressions
5. Run: `npm run ready:commit` - full test suite passes
6. Performance test:
   - Load large graph (1000+ nodes) with logging disabled
   - Load same graph with logging enabled at DEBUG level
   - Verify < 5% FPS difference

---

## Common Utilities Needed

| Utility | Purpose | Used By |
|---------|---------|---------|
| `lazy<T>()` | Lazy evaluation wrapper for expensive log data | All modules |
| `formatDuration()` | Human-readable time formatting | LifecycleManager, OperationQueueManager |
| `truncateData()` | Truncate large data objects for logging | DataManager, StyleManager |
| `safeStringify()` | JSON.stringify with circular reference handling | All sinks |

## External Libraries Assessment

| Task | Library | Reason |
|------|---------|--------|
| Core logging | `@logtape/logtape` | Zero deps, TypeScript-first, hierarchical categories, 5.3KB |
| Config validation | `zod` (already in project) | Consistent with existing validation patterns |

**Note**: Sentry and other third-party integrations are intentionally not included here. The extensible sink API allows consumers (like graphty) to add their own integrations using `@logtape/sentry` or custom sinks.

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| LogTape is newer library | Fallback implementation ready; LogTape has stable 1.0+ release |
| Performance regression | Strict hot path guards; performance tests in CI |
| Bundle size increase | LogTape is only 5.3KB; tree-shakeable |
| Breaking existing console.log calls | Gradual migration; both systems coexist during transition |
| URL param conflicts | Unique prefix `graphty-element-logging` |

## Acceptance Criteria Checklist

From design document:

- [ ] Logging is disabled by default (no console output when not configured)
- [ ] `?graphty-element-logging=true` enables all logging at INFO level
- [ ] `?graphty-element-logging=layout,xr` enables only specified modules
- [ ] `?graphty-element-log-level=debug` sets the log level
- [ ] Log output includes timestamp, module name, and message
- [ ] Structured data is logged as JSON-serializable objects
- [ ] Errors include stack traces
- [ ] Remote logging transport works with existing `xr-demo-server.js`
- [ ] Custom sinks can be registered programmatically
- [ ] No logging overhead when disabled (guards before message construction)
- [ ] Unit tests cover configuration parsing and filtering
- [ ] TypeScript types are fully specified (no `any`)

## Summary

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Core Infrastructure | LogTape integration, types, console sink |
| 2 | URL Integration | URL param parsing, graphty-element integration |
| 3 | Remote Log Server & Sink | `npx graphty-log-server` CLI, RemoteSink, URL param for server URL |
| 4 | Programmatic API | Complete public API, documentation |
| 5 | Performance Guards | Lazy evaluation, zero-overhead checks |
| 6 | Manager Integration (Priority) | Lifecycle, Layout, Data, Operation managers |
| 7 | Additional Modules & Polish | XR, Camera, Style, Render managers, hot path tests |
