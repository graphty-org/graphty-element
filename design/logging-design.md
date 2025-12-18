# Feature Design: Logging System for graphty-element

## Overview

- **User Value**: Developers can debug graphty-element behavior through configurable, module-specific logging that can be enabled via URL parameters without code changes
- **Technical Value**: Structured logging infrastructure with extensible transports (console, remote, Sentry), consistent formatting, and minimal production overhead

## Requirements

| Requirement | Description |
|-------------|-------------|
| **Enable/Disable** | Logging is off by default, enabled via `?graphty-element-logging=true` |
| **Per-Module Control** | Enable specific modules: `?graphty-element-logging=xr,layout` |
| **Extensible Transports** | Support remote logging (existing), Sentry, custom transports |
| **Configurable Format** | Timestamps, module prefixes, structured data |
| **Log Levels** | debug, info, warn, error (trace optional) |

## Logging Library Analysis

### Library Comparison

| Library | Weekly Downloads | Size | Browser Support | TypeScript | Zero Deps | Key Strengths |
|---------|------------------|------|-----------------|------------|-----------|---------------|
| [**Winston**](https://github.com/winstonjs/winston) | 12M+ | ~110KB | Partial (needs polyfills) | ✅ | ❌ | Feature-rich, many transports |
| [**Pino**](https://github.com/pinojs/pino) | 5M+ | ~50KB | Via pino-browser | ✅ | ❌ | Fastest, JSON-native |
| [**loglevel**](https://github.com/pimterry/loglevel) | 9M+ | 1.4KB | ✅ Native | ✅ | ✅ | Lightweight, plugin API |
| [**LogTape**](https://github.com/dahlia/logtape) | 50K+ | 5.3KB | ✅ Native | ✅ | ✅ | Modern, hierarchical categories |
| [**debug**](https://github.com/debug-js/debug) | 200M+ | 3KB | ✅ Native | ✅ | ❌ | Namespace-based, simple |

### Detailed Library Analysis

#### 1. Winston - The Feature-Rich Choice

**Pros:**
- Most comprehensive feature set
- Extensive transport ecosystem (file, HTTP, Sentry, CloudWatch, etc.)
- Query API for log filtering
- Multiple format options (JSON, printf, colorize)

**Cons:**
- Heavy for browser usage (~110KB)
- Requires polyfills for browser environment
- No timestamp by default (configuration required)
- No stack traces for errors by default

**Best For:** Server-side Node.js applications requiring complex log routing

**Not Recommended For:** Browser-first applications like graphty-element

#### 2. Pino - The Performance Champion

**Pros:**
- 5-10x faster than Winston in benchmarks
- Low CPU overhead
- Native JSON structured logging
- pino-browser for browser support
- OpenTelemetry integration

**Cons:**
- Browser support requires separate bundle (pino-browser)
- Less intuitive API than alternatives
- Fewer built-in transports

**Best For:** High-throughput server applications, microservices

**Not Recommended For:** Browser applications where raw performance isn't critical

#### 3. loglevel - The Lightweight Champion

**Pros:**
- Smallest footprint (1.4KB gzipped)
- Zero dependencies
- Native browser support
- Plugin API for extension
- Persistent log levels via localStorage
- Drop-in console.log replacement

**Cons:**
- No native JSON/structured logging
- Limited built-in formatting
- Plugins required for advanced features
- Plugin ecosystem is fragmented

**Best For:** Simple browser applications, minimal overhead requirements

**When to Use:** When size is critical and basic log levels suffice

#### 4. LogTape - The Modern Choice

**Pros:**
- TypeScript-first design with excellent types
- Zero dependencies (5.3KB gzipped)
- Hierarchical categories (perfect for modules)
- Native browser support without polyfills
- Modern async/await patterns
- Template literal API: `logger.info\`User ${userId} logged in\``
- Built-in adapters: Sentry, OpenTelemetry, Winston, Pino
- Non-blocking option for production

**Cons:**
- Newer library (less proven in production)
- Smaller community
- Fewer direct resources/tutorials

**Best For:** Modern TypeScript applications, library authors, multi-runtime apps

**When to Use:** New projects wanting TypeScript-first, hierarchical logging

#### 5. debug - The Namespace Pioneer

**Pros:**
- Simple namespace-based filtering
- Widely adopted (200M+ downloads)
- Works in browser and Node.js
- Colorized output
- Enable via DEBUG env var or localStorage

**Cons:**
- Not designed for production logging
- No log levels (all or nothing per namespace)
- No structured logging
- No timestamp formatting

**Best For:** Development debugging only

**Not Recommended For:** Production logging systems

### Recommendation for graphty-element

**Primary Recommendation: LogTape**

Reasons:
1. **Hierarchical Categories** - Perfect match for graphty-element's module structure (e.g., `["graphty", "layout", "ngraph"]`)
2. **TypeScript-First** - Aligns with project's strict TypeScript usage
3. **Zero Dependencies** - Matches project's philosophy
4. **Browser-Native** - No polyfills needed
5. **Sentry Adapter** - Built-in `@logtape/sentry` package
6. **Non-Blocking Mode** - Production-safe with minimal overhead
7. **Library-First Design** - Won't conflict with application logging

**Alternative: loglevel**

If you prefer maximum maturity and minimal risk:
- More proven in production
- Simpler API
- Plugin ecosystem for extensions (loglevel-plugin-prefix, loglevel-plugin-remote)

### Decision Matrix

| Criteria | Winston | Pino | loglevel | LogTape | debug |
|----------|---------|------|----------|---------|-------|
| Browser-native | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |
| TypeScript-first | ⚠️ | ✅ | ⚠️ | ✅ | ⚠️ |
| Zero deps | ❌ | ❌ | ✅ | ✅ | ❌ |
| Hierarchical | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| Sentry support | ✅ | ✅ | ⚠️ | ✅ | ❌ |
| Size (gzipped) | 110KB | 50KB | 1.4KB | 5.3KB | 3KB |
| Maturity | ✅ | ✅ | ✅ | ⚠️ | ✅ |

✅ = Excellent, ⚠️ = Partial/Limited, ❌ = Not supported

---

## Proposed Solution

### User Interface/API

#### 1. URL Parameter Control

```
# Enable all logging
?graphty-element-logging=true

# Enable specific modules (comma-separated)
?graphty-element-logging=xr,layout,camera

# Enable with log level
?graphty-element-logging=true&graphty-element-log-level=debug

# Enable specific modules with level
?graphty-element-logging=layout:debug,xr:info
```

#### 2. Programmatic API

```typescript
import { GraphtyLogger, LogLevel } from "graphty-element";

// Global configuration
GraphtyLogger.configure({
    enabled: true,
    level: LogLevel.DEBUG,
    modules: ["layout", "xr"], // or "*" for all
    format: {
        timestamp: true,
        module: true,
    },
});

// Module-specific logger (used internally)
const logger = GraphtyLogger.getLogger(["graphty", "layout", "ngraph"]);
logger.debug("Layout iteration", { iteration: 42, energy: 0.001 });
logger.info("Layout settled");
logger.warn("Force exceeded threshold", { force: 150 });
logger.error("Layout failed", new Error("Invalid node positions"));
```

#### 3. Available Module Names

Based on codebase exploration, these modules would be loggable:

| Module | Description |
|--------|-------------|
| `lifecycle` | Manager initialization/disposal |
| `render` | Babylon.js render loop |
| `layout` | Layout engine operations |
| `data` | Node/edge data operations |
| `style` | Style computation and application |
| `input` | Mouse/touch/keyboard input |
| `camera` | Camera movements and animations |
| `xr` | XR/VR session and controllers |
| `algorithm` | Algorithm execution |
| `operation` | Operation queue management |
| `mesh` | Mesh creation and caching |
| `event` | Event emission |

### Technical Architecture

#### Components

```
src/
├── logging/
│   ├── index.ts              # Public exports
│   ├── GraphtyLogger.ts      # Main logger facade
│   ├── LoggerConfig.ts       # Configuration management
│   ├── URLParamParser.ts     # URL parameter parsing
│   ├── sinks/
│   │   ├── ConsoleSink.ts    # Browser console output
│   │   ├── RemoteSink.ts     # HTTP POST transport (wraps existing)
│   │   └── SentrySink.ts     # Sentry integration
│   └── formatters/
│       ├── DefaultFormatter.ts
│       └── JSONFormatter.ts
```

#### Data Model

```typescript
// Log levels (standard syslog-inspired)
enum LogLevel {
    SILENT = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5,
}

// Configuration schema
interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    modules: string[] | "*";
    format: {
        timestamp: boolean;
        timestampFormat?: string; // ISO or custom
        module: boolean;
        colors?: boolean; // For console
    };
    sinks: Sink[];
}

// Sink interface (transport)
interface Sink {
    name: string;
    write(record: LogRecord): void;
    flush?(): Promise<void>;
}

// Log record (what gets passed to sinks)
interface LogRecord {
    timestamp: Date;
    level: LogLevel;
    category: string[];  // Hierarchical: ["graphty", "layout", "ngraph"]
    message: string;
    data?: Record<string, unknown>;
    error?: Error;
}
```

#### Integration Points

1. **graphty-element.ts** - Parse URL parameters in `connectedCallback()`
2. **Graph.ts** - Initialize logger with graph context
3. **Manager base class** - Add logger to each manager
4. **Existing remote-logging.ts** - Wrap as RemoteSink

### Implementation Approach

#### Phase 1: Core Infrastructure (2-3 days)
1. Create `src/logging/` directory structure
2. Implement `LoggerConfig` with Zod schema validation
3. Implement `GraphtyLogger` facade class
4. Create `ConsoleSink` with formatting
5. Add URL parameter parsing to `graphty-element.ts`

#### Phase 2: Module Integration (1-2 days)
1. Add logger to GraphContext interface
2. Inject logger into managers via context
3. Replace console.* calls in high-priority modules:
   - LayoutManager
   - XRSessionManager
   - CameraManager
   - RenderManager

#### Phase 3: Transport Extensions (1 day)
1. Wrap existing `remote-logging.ts` as RemoteSink
2. Add Sentry sink (optional, documented)
3. Document custom sink creation

#### Phase 4: Testing & Documentation (1 day)
1. Unit tests for logger configuration
2. Integration tests for URL parameters
3. Update documentation

### Example Usage in Code

```typescript
// src/managers/LayoutManager.ts
import { GraphtyLogger } from "../logging";

export class LayoutManager implements Manager {
    private logger = GraphtyLogger.getLogger(["graphty", "layout"]);

    async init(): Promise<void> {
        this.logger.debug("Initializing LayoutManager");
        // ...
        this.logger.info("LayoutManager initialized", {
            engine: this.engineName
        });
    }

    private onLayoutStep(iteration: number, energy: number): void {
        this.logger.trace("Layout step", { iteration, energy });
    }

    private onLayoutError(error: Error): void {
        this.logger.error("Layout failed", error);
    }
}
```

```typescript
// src/xr/XRSessionManager.ts
import { GraphtyLogger } from "../logging";

export class XRSessionManager {
    private logger = GraphtyLogger.getLogger(["graphty", "xr", "session"]);

    async startSession(): Promise<void> {
        this.logger.info("Starting XR session");
        // ...
    }

    onControllerInput(controller: string, action: string): void {
        this.logger.debug("Controller input", { controller, action });
    }
}
```

---

## Module-by-Module Logging Analysis

This section provides a comprehensive analysis of all modules in graphty-element, identifying what information would be valuable to log in each, and explicitly calling out hot paths where logging should be avoided or carefully guarded.

### Module Inventory

| Category | Module | Files | Priority | Hot Path Risk |
|----------|--------|-------|----------|---------------|
| **Core** | Graph | `Graph.ts` | High | Medium |
| **Core** | graphty-element | `graphty-element.ts` | Medium | Low |
| **Managers** | LifecycleManager | `managers/LifecycleManager.ts` | High | None |
| **Managers** | OperationQueueManager | `managers/OperationQueueManager.ts` | High | Low |
| **Managers** | LayoutManager | `managers/LayoutManager.ts` | High | Medium |
| **Managers** | DataManager | `managers/DataManager.ts` | High | Low |
| **Managers** | RenderManager | `managers/RenderManager.ts` | Medium | **HIGH** |
| **Managers** | StyleManager | `managers/StyleManager.ts` | Medium | Medium |
| **Managers** | InputManager | `managers/InputManager.ts` | Medium | Medium |
| **Managers** | EventManager | `managers/EventManager.ts` | Low | Medium |
| **Managers** | UpdateManager | `managers/UpdateManager.ts` | Low | **HIGH** |
| **Managers** | StatsManager | `managers/StatsManager.ts` | Low | **HIGH** |
| **Managers** | AlgorithmManager | `managers/AlgorithmManager.ts` | Medium | Low |
| **Layout** | LayoutEngine (base) | `layout/LayoutEngine.ts` | Medium | Medium |
| **Layout** | NGraphLayoutEngine | `layout/NGraphLayoutEngine.ts` | High | **HIGH** |
| **Layout** | Other engines | `layout/*.ts` (15+ files) | Medium | Medium |
| **Data** | DataSource (base) | `data/DataSource.ts` | High | Low |
| **Data** | Format sources | `data/*.ts` (8 files) | Medium | Low |
| **Camera** | CameraManager | `cameras/CameraManager.ts` | Medium | Medium |
| **Camera** | OrbitCameraController | `cameras/OrbitCameraController.ts` | Low | **HIGH** |
| **Camera** | TwoDCameraController | `cameras/TwoDCameraController.ts` | Low | **HIGH** |
| **Camera** | XRInputHandler | `cameras/XRInputHandler.ts` | High | Medium |
| **XR** | XRSessionManager | `xr/XRSessionManager.ts` | High | Low |
| **XR** | XRUIManager | `ui/XRUIManager.ts` | Medium | Low |
| **Mesh** | EdgeMesh | `meshes/EdgeMesh.ts` | Low | **HIGH** |
| **Mesh** | NodeMesh | `meshes/NodeMesh.ts` | Low | **HIGH** |
| **Mesh** | MeshCache | `meshes/MeshCache.ts` | Medium | Medium |
| **Elements** | Node | `Node.ts` | Medium | **HIGH** |
| **Elements** | Edge | `Edge.ts` | Medium | **HIGH** |
| **Elements** | NodeBehavior | `NodeBehavior.ts` | Medium | Medium |
| **Algorithm** | Algorithm (base) | `algorithms/Algorithm.ts` | Medium | Low |
| **Algorithm** | Specific algorithms | `algorithms/*.ts` (20+ files) | Low | Low |
| **Screenshot** | ScreenshotCapture | `screenshot/ScreenshotCapture.ts` | Medium | Low |
| **Video** | MediaRecorderCapture | `video/MediaRecorderCapture.ts` | Medium | Low |

---

### Detailed Module Logging Specifications

#### 1. LifecycleManager (`managers/LifecycleManager.ts`)

**Category**: `["graphty", "lifecycle"]`

**Purpose**: Orchestrates initialization and disposal of all managers in correct order.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Init started | INFO | `init()` entry | `{managerCount, initOrder}` |
| Manager initializing | DEBUG | Before each manager.init() | `{managerName}` |
| Manager initialized | DEBUG | After each manager.init() | `{managerName, elapsedMs}` |
| Manager init failed | ERROR | On manager.init() error | `{managerName, error}` |
| All managers initialized | INFO | After all init complete | `{totalMs, managerCount}` |
| Dispose started | INFO | `dispose()` entry | `{managerCount}` |
| Manager disposed | DEBUG | After each manager.dispose() | `{managerName}` |
| Dispose error | WARN | On manager.dispose() error | `{managerName, error}` |
| All disposed | INFO | After all dispose complete | `{}` |

**Hot Path Considerations**: None - init/dispose are one-time operations.

---

#### 2. OperationQueueManager (`managers/OperationQueueManager.ts`)

**Category**: `["graphty", "operation"]`

**Purpose**: Manages operation queue with dependencies, obsolescence, and progress tracking.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Operation queued | DEBUG | `queueOperation()` | `{id, category, description}` |
| Operation started | DEBUG | When execution begins | `{id, category, queueSize}` |
| Operation completed | DEBUG | After successful execution | `{id, category, elapsedMs}` |
| Operation failed | ERROR | On execution error | `{id, category, error}` |
| Operation obsoleted | DEBUG | When made obsolete | `{id, category, reason, byId}` |
| Operation cancelled | WARN | When aborted | `{id, category, progress}` |
| Batch started | DEBUG | `startBatch()` | `{batchId}` |
| Batch committed | DEBUG | `commitBatch()` | `{batchId, operationCount}` |
| Queue idle | DEBUG | When queue becomes empty | `{completedCount}` |
| Trigger fired | TRACE | When post-trigger runs | `{sourceCategory, triggeredCategory}` |

**Hot Path Considerations**:
- Queue polling is on a timer (`OPERATION_POLL_INTERVAL_MS = 10ms`) - use TRACE level sparingly
- Avoid logging in `waitForCompletion` polling loop

---

#### 3. LayoutManager (`managers/LayoutManager.ts`)

**Category**: `["graphty", "layout"]`

**Purpose**: Manages layout engine lifecycle and layout updates.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Layout set started | INFO | `setLayout()` entry | `{type, options}` |
| Layout engine created | DEBUG | After engine instantiation | `{type, nodeCount, edgeCount}` |
| Layout initialized | INFO | After `engine.init()` | `{type, preStepsRun}` |
| Layout set failed | ERROR | On initialization error | `{type, error}` |
| Layout dimension update | DEBUG | `updateLayoutDimension()` | `{twoD, layoutType}` |
| Layout running | DEBUG | When `running` set to true | `{type}` |
| Layout settled | INFO | When `isSettled` becomes true | `{type, stepCount}` |
| Position update | TRACE | `updatePositions()` | `{nodeCount}` |

**Hot Path Considerations**:
- **AVOID**: Do NOT log in `step()` method - called every frame during layout
- **AVOID**: Do NOT log in `getNodePosition()` or `getEdgePosition()` - called per node/edge per frame
- Use TRACE only for batch operations like `updatePositions()`

---

#### 4. DataManager (`managers/DataManager.ts`)

**Category**: `["graphty", "data"]`

**Purpose**: Manages node/edge collections, caching, and data source loading.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Nodes added | DEBUG | `addNodes()` completion | `{count, totalNodes}` |
| Edges added | DEBUG | `addEdges()` completion | `{count, totalEdges, bufferedCount}` |
| Edge buffered | TRACE | When edge buffered (missing nodes) | `{srcId, dstId}` |
| Buffered edges processed | DEBUG | After processing buffered edges | `{processedCount, remainingCount}` |
| Node removed | DEBUG | `removeNode()` | `{nodeId}` |
| Edge removed | DEBUG | `removeEdge()` | `{edgeId}` |
| Data source loading | INFO | `addDataFromSource()` start | `{type, url}` |
| Data chunk loaded | DEBUG | After each chunk | `{chunkNum, nodesInChunk, edgesInChunk}` |
| Data source complete | INFO | After all chunks loaded | `{type, totalNodes, totalEdges, elapsedMs}` |
| Data source error | ERROR | On loading failure | `{type, error, chunksLoaded}` |
| Validation errors | WARN | When validation fails | `{errorCount, errorSummary}` |
| Clear data | DEBUG | `clear()` | `{clearedNodes, clearedEdges}` |

**Hot Path Considerations**:
- Node/edge iteration in `applyStylesToExistingNodes/Edges` could be expensive with large graphs
- Use batch logging (log summary at end, not per-item)

---

#### 5. RenderManager (`managers/RenderManager.ts`)

**Category**: `["graphty", "render"]`

**Purpose**: Manages Babylon.js engine, scene, and render loop.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Engine created | DEBUG | Constructor | `{useWebGPU}` |
| Scene created | DEBUG | Constructor | `{backgroundColor}` |
| Cameras setup | DEBUG | `setupCameras()` | `{registeredCameras}` |
| Render init started | DEBUG | `init()` entry | `{}` |
| WebGPU initialized | INFO | After `engine.initAsync()` | `{capabilities}` |
| Scene ready | DEBUG | After `scene.whenReadyAsync()` | `{}` |
| Render init complete | INFO | After all init | `{elapsedMs}` |
| Render loop started | INFO | `startRenderLoop()` | `{}` |
| Render loop stopped | INFO | `stopRenderLoop()` | `{}` |
| Background color changed | DEBUG | `setBackgroundColor()` | `{color}` |
| Render error | ERROR | In render loop catch | `{error}` |
| Dispose | DEBUG | `dispose()` | `{}` |

**Hot Path Considerations**:
- **CRITICAL**: NEVER log inside the render loop callback in `startRenderLoop()`
- The render loop runs 60+ times per second
- Only log errors with rate limiting in render loop (existing pattern)

---

#### 6. StyleManager (`managers/StyleManager.ts`)

**Category**: `["graphty", "style"]`

**Purpose**: Manages graph styling with caching and layer operations.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Style template loaded | INFO | `loadStylesFromObject/Url()` | `{source, layerCount}` |
| Layer added | DEBUG | `addLayer()` | `{layerSelector, layerIndex}` |
| Layer inserted | DEBUG | `insertLayer()` | `{position, layerSelector}` |
| Layers removed | DEBUG | `removeLayersByMetadata()` | `{removedCount}` |
| Cache cleared | DEBUG | `clearCache()` | `{nodeEntries, edgeEntries}` |
| Cache hit | TRACE | On cache hit (guarded) | `{type, cacheKey}` |
| Cache miss | TRACE | On cache miss | `{type, cacheKey}` |
| Style computed | TRACE | First style computation | `{nodeId/edgeId, styleId}` |

**Hot Path Considerations**:
- `getStyleForNode/Edge` is called frequently during data loading
- TRACE level only; cache hit/miss logging should be behind `isTraceEnabled()` guard
- Don't log during style re-application loops

---

#### 7. XRSessionManager (`xr/XRSessionManager.ts`)

**Category**: `["graphty", "xr", "session"]`

**Purpose**: Manages WebXR VR/AR session lifecycle.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| XR support check | DEBUG | `isXRSupported()` | `{hasXR, isSecureContext, userAgent}` |
| VR support check | DEBUG | `isVRSupported()` result | `{supported}` |
| AR support check | DEBUG | `isARSupported()` result | `{supported}` |
| VR enter started | INFO | `enterVR()` entry | `{}` |
| XR experience created | DEBUG | After `CreateAsync()` | `{mode}` |
| Hand tracking enabled | DEBUG | After feature enable | `{success, config}` |
| VR session entered | INFO | After `enterXRAsync()` | `{mode, enabledFeatures}` |
| Camera transferred | DEBUG | After position transfer | `{fromCamera}` |
| VR enter failed | ERROR | On enterVR error | `{error}` |
| AR enter started | INFO | `enterAR()` entry | `{}` |
| AR session entered | INFO | After `enterXRAsync()` | `{mode}` |
| XR exited | INFO | `exitXR()` | `{mode}` |
| XR disposed | DEBUG | `dispose()` | `{}` |

**Hot Path Considerations**:
- XR session events are infrequent (user-initiated)
- No hot path concerns in this module

---

#### 8. CameraManager (`cameras/CameraManager.ts`)

**Category**: `["graphty", "camera"]`

**Purpose**: Manages multiple camera controllers and input handlers.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Camera registered | DEBUG | `registerCamera()` | `{key}` |
| Camera activated | INFO | `activateCamera()` | `{key, previousKey}` |
| Camera not found | WARN | On missing camera | `{key}` |
| Zoom to fit | DEBUG | `zoomToBoundingBox()` | `{min, max}` |
| Input disabled | DEBUG | `temporarilyDisableInput()` | `{reason}` |
| Input enabled | DEBUG | `temporarilyEnableInput()` | `{}` |

**Hot Path Considerations**:
- `update()` is called every frame - DO NOT LOG
- Only log camera switches and zoom operations

---

#### 9. XRInputHandler (`cameras/XRInputHandler.ts`)

**Category**: `["graphty", "xr", "input"]`

**Purpose**: Handles XR controller input for gestures and interactions.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Handler initialized | DEBUG | Constructor | `{controllerTypes}` |
| Controller connected | INFO | On connection | `{controllerId, type, hand}` |
| Controller disconnected | INFO | On disconnection | `{controllerId}` |
| Gesture started | DEBUG | Pinch/grab start | `{gestureType, controllerId}` |
| Gesture ended | DEBUG | Pinch/grab end | `{gestureType, controllerId}` |
| Node selected | DEBUG | On node pick | `{nodeId, controllerId}` |
| Node deselected | DEBUG | On release | `{nodeId}` |

**Hot Path Considerations**:
- Controller position updates happen every frame - DO NOT LOG
- Only log gesture start/end events
- Avoid logging during continuous pinch/grab movements

---

#### 10. NodeBehavior/NodeDragHandler (`NodeBehavior.ts`)

**Category**: `["graphty", "interaction", "drag"]`

**Purpose**: Handles node dragging for desktop and XR.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Drag started | DEBUG | `onDragStart()` | `{nodeId, isXRMode, position}` |
| Drag ended | DEBUG | `onDragEnd()` | `{nodeId, finalPosition, pinned}` |
| Node pinned | DEBUG | After pin during drag | `{nodeId}` |

**Hot Path Considerations**:
- **AVOID**: Do NOT log in `onDragUpdate()` - called continuously during drag
- Only log drag start/end events

---

#### 11. LayoutEngine (Base and Implementations)

**Category**: `["graphty", "layout", "{engineType}"]`

**Purpose**: Layout computation engines (ngraph, d3, circular, etc.)

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Engine created | DEBUG | Constructor | `{type, config}` |
| Engine initialized | DEBUG | `init()` | `{nodeCount, edgeCount}` |
| Node added | TRACE | `addNode()` (batch only) | `{count}` |
| Edge added | TRACE | `addEdge()` (batch only) | `{count}` |
| Layout settled | INFO | When `isSettled` → true | `{stepCount, avgMovement}` |
| Layout reset | DEBUG | When nodes added unsettles | `{stepCount: 0}` |
| Dispose | DEBUG | `dispose()` | `{}` |

**Hot Path Considerations**:
- **CRITICAL**: `step()` runs every frame during layout animation - NEVER LOG
- **CRITICAL**: `getNodePosition()` and `getEdgePosition()` called per-element per-frame - NEVER LOG
- Only log batch operations and state transitions
- For NGraphLayoutEngine: don't log individual `_lastMoves` updates

---

#### 12. DataSource (Base and Implementations)

**Category**: `["graphty", "data", "{sourceType}"]`

**Purpose**: Load graph data from various formats (JSON, CSV, GEXF, etc.)

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Source created | DEBUG | Constructor | `{type, chunkSize}` |
| Fetch started | DEBUG | `fetchWithRetry()` entry | `{url}` |
| Fetch retry | DEBUG | On retry | `{url, attempt, delay}` |
| Fetch failed | ERROR | After all retries | `{url, attempts, error}` |
| Parse started | DEBUG | Parsing entry | `{type}` |
| Chunk yielded | TRACE | Each `yield` | `{nodeCount, edgeCount, chunkNum}` |
| Parse complete | DEBUG | Generator complete | `{totalNodes, totalEdges}` |
| Parse error | ERROR | On parse failure | `{error, position}` |
| Validation error | WARN | On schema validation fail | `{field, expected, actual}` |

**Hot Path Considerations**:
- Chunk iteration can be frequent for large files - use TRACE
- Batch validation error reporting (summary at end)

---

#### 13. Algorithm (Base and Implementations)

**Category**: `["graphty", "algorithm", "{namespace}", "{type}"]`

**Purpose**: Graph algorithms (PageRank, betweenness, community detection, etc.)

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Algorithm started | INFO | `run()` entry | `{namespace, type, nodeCount, edgeCount}` |
| Algorithm completed | INFO | `run()` exit | `{namespace, type, elapsedMs}` |
| Algorithm failed | ERROR | On error | `{namespace, type, error}` |
| Node result added | TRACE | `addNodeResult()` (if enabled) | `{nodeId, resultName}` |
| Graph result added | DEBUG | `addGraphResult()` | `{resultName, resultPreview}` |

**Hot Path Considerations**:
- Algorithm internals (loops, iterations) should not be logged
- Only log entry/exit and final results
- TRACE level for per-node results is expensive - guard carefully

---

#### 14. Node/Edge (`Node.ts`, `Edge.ts`)

**Category**: `["graphty", "element"]`

**Purpose**: Graph node and edge instances with mesh management.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Node created | TRACE | Constructor | `{id, styleId}` |
| Edge created | TRACE | Constructor | `{srcId, dstId, styleId}` |
| Style updated | TRACE | `updateStyle()` | `{id, oldStyleId, newStyleId}` |
| Node disposed | TRACE | `dispose()` | `{id}` |
| Edge disposed | TRACE | `dispose()` | `{srcId, dstId}` |

**Hot Path Considerations**:
- **CRITICAL**: `update()` is called every frame for position/style updates - NEVER LOG
- **CRITICAL**: Mesh position updates happen every frame - NEVER LOG
- TRACE level only, and primarily for debugging creation/disposal issues
- These are the most performance-sensitive classes

---

#### 15. MeshCache (`meshes/MeshCache.ts`)

**Category**: `["graphty", "mesh", "cache"]`

**Purpose**: Caches mesh instances for performance.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Cache hit | TRACE | On successful lookup | `{key, instanceCount}` |
| Cache miss | TRACE | On miss | `{key}` |
| Instance created | TRACE | New instance from master | `{key, totalInstances}` |
| Master mesh created | DEBUG | New mesh type | `{key}` |
| Cache cleared | DEBUG | `clear()` | `{entryCount}` |
| Cache stats | DEBUG | Periodic or on request | `{size, hitRate}` |

**Hot Path Considerations**:
- Cache lookups happen frequently - TRACE only
- Consider sampling (log every Nth lookup) if needed

---

#### 16. InputManager (`managers/InputManager.ts`)

**Category**: `["graphty", "input"]`

**Purpose**: Unified input handling for mouse, keyboard, touch.

| Event | Level | When to Log | Data to Include |
|-------|-------|-------------|-----------------|
| Input initialized | DEBUG | `init()` | `{config}` |
| Input enabled/disabled | DEBUG | `setEnabled()` | `{enabled}` |
| Recording started | INFO | `startRecording()` | `{}` |
| Recording stopped | INFO | `stopRecording()` | `{eventCount}` |
| Playback started | INFO | `startPlayback()` | `{eventCount}` |
| Playback completed | INFO | On complete | `{}` |
| Pointer lock changed | DEBUG | On lock/unlock | `{locked}` |

**Hot Path Considerations**:
- **AVOID**: Do not log individual pointer move, touch move events
- Event bridges fire on every input - only log in debug scenarios
- Use event sampling if continuous input logging is needed

---

### Summary: What NOT to Log (Hot Paths)

The following methods are called at high frequency (30-60+ times per second) and should **never** contain logging:

| Module | Method | Frequency | Impact |
|--------|--------|-----------|--------|
| RenderManager | `runRenderLoop` callback | 60 FPS | Would flood logs |
| LayoutEngine | `step()` | Every frame | Layout iteration |
| LayoutEngine | `getNodePosition()` | N nodes × 60 FPS | Position lookup |
| LayoutEngine | `getEdgePosition()` | E edges × 60 FPS | Position lookup |
| CameraManager | `update()` | 60 FPS | Camera update |
| OrbitCameraController | Internal update | 60 FPS | Rotation/zoom |
| Node | `update()` | 60 FPS per node | Position sync |
| Edge | `update()` | 60 FPS per edge | Position sync |
| NodeDragHandler | `onDragUpdate()` | During drag | Continuous update |
| XRInputHandler | Controller position | 90 FPS (XR) | Hand tracking |

### Summary: High-Value Debug Points

The following are the most valuable logging points for debugging common issues:

1. **Initialization failures**: LifecycleManager init sequence
2. **Layout not settling**: LayoutManager engine switching, settlement detection
3. **Data loading issues**: DataManager/DataSource parsing and validation
4. **XR setup problems**: XRSessionManager feature detection and session creation
5. **Operation ordering**: OperationQueueManager dependency resolution
6. **Performance debugging**: Already covered by StatsManager (separate system)

---

## Acceptance Criteria

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

---

## Technical Considerations

### Performance

**Impact:**
- Logger lookup: O(1) via Map cache
- Level check: Single integer comparison before any work
- Message construction: Only when level passes filter

**Mitigation:**
```typescript
// Lazy message construction pattern
if (logger.isDebugEnabled()) {
    logger.debug("Expensive operation", computeExpensiveData());
}

// Or use LogTape's template literal API (evaluates lazily)
logger.debug`Layout energy: ${() => computeEnergy()}`;
```

### Security

- No sensitive data in log messages (node IDs are fine, but no auth tokens)
- Remote logging URL should be validated
- Rate limiting on remote transport (already exists in remote-logging.ts)

### Compatibility

- Backward compatible: No changes to public API
- Works alongside existing console.log calls during migration
- URL parameter naming follows existing pattern (`?profiling=true`)

### Testing

- Unit tests for LoggerConfig parsing
- Unit tests for URL parameter extraction
- Integration test: logging enabled via URL shows expected output
- No visual test changes needed (logging doesn't affect rendering)

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| **LogTape is newer library** | Fallback: Use loglevel with plugins; LogTape has stable 1.0 release |
| **Logging overhead in production** | Guards before message construction; disable by default |
| **Migration effort for existing console calls** | Gradual replacement; coexistence period |
| **URL parameter conflicts** | Unique prefix: `graphty-element-logging` |
| **Bundle size increase** | LogTape is only 5.3KB gzipped; minimal impact |

---

## Future Enhancements

1. **Log Level Persistence** - Store user's log level preference in localStorage
2. **Log Viewer UI** - Overlay showing real-time logs in development
3. **OpenTelemetry Integration** - Export traces via LogTape's OTel adapter
4. **Log Sampling** - Sample high-frequency debug logs for performance
5. **Log Export** - Download logs as file for bug reports
6. **Performance Correlation** - Link logs to StatsManager profiling data

---

## Implementation Estimate

| Phase | Effort |
|-------|--------|
| Phase 1: Core Infrastructure | 2-3 days |
| Phase 2: Module Integration | 1-2 days |
| Phase 3: Transport Extensions | 1 day |
| Phase 4: Testing & Documentation | 1 day |
| **Total** | **5-7 days** |

---

## Appendix: LogTape Quick Start

If LogTape is selected, here's how the integration would look:

```typescript
// src/logging/setup.ts
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";

export async function setupLogging(options: LoggerOptions): Promise<void> {
    await configure({
        sinks: {
            console: getConsoleSink({
                formatter: (record) =>
                    `[${record.timestamp.toISOString()}] [${record.category.join(".")}] ${record.level}: ${record.message}`,
            }),
        },
        filters: {
            // Only log enabled modules at configured level
        },
        loggers: [
            {
                category: ["graphty"],
                sinks: ["console"],
                level: options.level,
            },
            // Per-module overrides
            ...options.modules.map(mod => ({
                category: ["graphty", mod],
                sinks: ["console"],
                level: options.moduleLevel ?? options.level,
            })),
        ],
    });
}

// Usage in modules
const logger = getLogger(["graphty", "layout", "ngraph"]);
logger.info("Layout started");
logger.debug`Iteration ${iteration} energy ${energy}`;
```

---

## Sources

- [Best Node.js Logging Libraries - Better Stack](https://betterstack.com/community/guides/logging/best-nodejs-logging-libraries/)
- [Top 5 Node.js Logging Frameworks 2025 - Dash0](https://www.dash0.com/faq/the-top-5-best-node-js-and-javascript-logging-frameworks-in-2025-a-complete-guide)
- [Pino vs Winston Comparison - Better Stack](https://betterstack.com/community/comparisons/pino-vs-winston/)
- [LogTape Documentation](https://logtape.org/)
- [LogTape GitHub](https://github.com/dahlia/logtape)
- [loglevel GitHub](https://github.com/pimterry/loglevel)
- [loglevel npm](https://www.npmjs.com/package/loglevel)
- [LogTape Sinks Documentation](https://logtape.org/manual/sinks)
- [LogTape Comparison](https://logtape.org/comparison)
