# Implementation Plan for Code Review Fixes (2025-11-25)

## Overview

This implementation plan addresses issues identified in the code review of the screen capture and video capture implementation. The fixes are prioritized by severity (critical → high → medium → low) and organized into phases that deliver verifiable improvements incrementally.

**Issues Summary:**
- 1 Critical: Missing type exports for public API
- 4 High Priority: Test duplication, console logging, hardcoded quality, unimplemented manual mode
- 5 Medium Priority: Event listener cleanup, test style inconsistency, undocumented deferrals, hardcoded skybox name, missing 2D video tests
- 6 Low Priority: Naming inconsistency, JSDoc gaps, magic numbers, type casts, race conditions, unused option

---

## Phase Breakdown

### Phase 1: Critical & High Priority - Public API and Code Quality

**Objective**: Fix the critical missing exports and address code quality issues that affect production usage.

**Duration**: 1-2 days

#### Tests to Write First

- `test/browser/exports.test.ts`: Verify all public types are importable

```typescript
// Example test case
import {assert, test} from "vitest";

test("screenshot types are exported from main entry point", async () => {
    // Dynamic import to test the actual package export
    const exports = await import("../../../index.js");

    // Verify ScreenshotError is exported
    assert.ok(exports.ScreenshotError !== undefined, "ScreenshotError should be exported");
    assert.ok(exports.ScreenshotErrorCode !== undefined, "ScreenshotErrorCode should be exported");
});

test("video types are exported from main entry point", async () => {
    const exports = await import("../../../index.js");

    assert.ok(exports.AnimationCancelledError !== undefined, "AnimationCancelledError should be exported");
});
```

#### Implementation

1. **Export public types from `index.ts`**:

```typescript
// Add to index.ts
export type {
    ScreenshotOptions,
    ScreenshotResult,
    CameraState,
    CameraAnimationOptions,
    QualityEnhancementOptions,
    ClipboardStatus,
} from "./src/screenshot/types";

export {ScreenshotError, ScreenshotErrorCode} from "./src/screenshot/ScreenshotError";

export type {
    AnimationOptions,
    AnimationResult,
    CameraWaypoint,
} from "./src/video/VideoCapture";

export {AnimationCancelledError} from "./src/video/MediaRecorderCapture";
```

2. **Create shared MockMediaRecorder test helper**:
   - Create `test/browser/video/mock-media-recorder.ts`
   - Extract `MockMediaRecorder` class from both test files
   - Export helper functions for setup/teardown

```typescript
// test/browser/video/mock-media-recorder.ts
export class MockMediaRecorder {
    ondataavailable: ((e: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: ((e: Event) => void) | null = null;
    state: "inactive" | "recording" | "paused" = "inactive";
    mimeType: string;

    constructor(stream: MediaStream, options?: {mimeType?: string, videoBitsPerSecond?: number}) {
        this.mimeType = options?.mimeType ?? "video/webm";
    }

    start(): void {
        this.state = "recording";
    }

    stop(): void {
        this.state = "inactive";
        const blob = new Blob(["mock video data"], {type: this.mimeType});
        this.ondataavailable?.({data: blob} as BlobEvent);
        setTimeout(() => this.onstop?.(), 0);
    }

    pause(): void {
        this.state = "paused";
    }

    resume(): void {
        this.state = "recording";
    }

    static isTypeSupported(type: string): boolean {
        return type.includes("webm") || type.includes("vp9") || type.includes("vp8");
    }
}

export function setupMockMediaRecorder(vi: typeof import("vitest").vi): void {
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
}

export function restoreMockMediaRecorder(
    vi: typeof import("vitest").vi,
    original: typeof MediaRecorder
): void {
    vi.stubGlobal("MediaRecorder", original);
}
```

3. **Replace console.log with conditional debug logging in `MediaRecorderCapture.ts`**:

```typescript
// Add debug configuration
export interface MediaRecorderCaptureConfig {
    debug?: boolean;
}

export class MediaRecorderCapture {
    private debug: boolean;

    constructor(config: MediaRecorderCaptureConfig = {}) {
        this.debug = config.debug ?? false;
    }

    private log(message: string): void {
        if (this.debug) {
            // eslint-disable-next-line no-console
            console.log(message);
        }
    }
    // ... rest of implementation
}
```

4. **Fix hardcoded quality in format conversion** (`ScreenshotCapture.ts:408`):
   - Add `quality` parameter to `convertBlobFormat` method
   - Pass user-specified quality through the conversion pipeline

**Dependencies**:
- External: None
- Internal: None

**Verification**:
1. Run: `npm run build && npm test`
2. Expected: All tests pass, no build errors
3. Manual verification: Import types from built package in a test file

---

### Phase 2: High Priority - Manual Capture Mode Decision

**Objective**: Either implement the `manual` capture mode or remove it from the interface and document why.

**Duration**: 1-2 days

#### Tests to Write First (if implementing)

```typescript
// test/browser/video/video-capture-manual.test.ts
test("can capture video in manual mode", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas);

    const result = await graph.captureAnimation({
        duration: 2000,
        fps: 30,
        cameraMode: "stationary",
        captureMode: "manual",
    });

    // Manual mode guarantees all frames
    const expectedFrames = Math.ceil((2000 / 1000) * 30);
    assert.equal(result.metadata.framesDropped, 0, "Manual mode should not drop frames");
    assert.equal(result.metadata.framesCaptured, expectedFrames, "Manual mode should capture all frames");
});
```

#### Implementation Decision

**Option A: Remove `manual` mode** (recommended if not implementing)
- Remove `captureMode?: "realtime" | "manual"` from `AnimationOptions`
- Add JSDoc comment explaining real-time constraints
- Document in design notes that manual capture is deferred to future phase

**Option B: Implement `manual` mode** (requires significant effort)
- Implement frame-by-frame capture with Babylon.js screenshots
- Use `ffmpeg.wasm` or similar for video encoding
- Add significant bundle size (~50KB+ compressed)

#### Recommendation

Given the design review's acknowledgment that MediaRecorder operates in real-time only, **Option A** (removal + documentation) is recommended for this phase. Manual mode can be added in a future phase with proper library integration.

**Dependencies**:
- External: None (or `ffmpeg.wasm` if implementing Option B)
- Internal: Phase 1 completion

**Verification**:
1. Run: `npm run lint && npm run build && npm test`
2. For Option A: Verify TypeScript compilation succeeds with `captureMode` removed
3. For Option B: Verify frame counts match expectations in tests

---

### Phase 3: Medium Priority - Memory Leak Prevention and Code Cleanup

**Objective**: Fix event listener cleanup, standardize test style, and address other medium-priority issues.

**Duration**: 1-2 days

#### Tests to Write First

```typescript
// test/browser/screenshot/screenshot-listener-cleanup.test.ts
test("event listeners are cleaned up after waitForLayoutSettle", async () => {
    const graph = await createTestGraphWithData();

    // Access internal graph listener count (if available via testing API)
    const initialListenerCount = graph.listenerCount?.("graph-settled") ?? 0;

    await graph.captureScreenshot({
        timing: {waitForSettle: true},
    });

    // Listener should be removed after capture
    const finalListenerCount = graph.listenerCount?.("graph-settled") ?? 0;
    assert.equal(finalListenerCount, initialListenerCount, "Listener should be cleaned up");
});
```

#### Implementation

1. **Fix listener cleanup in `waitForLayoutSettle`** (`ScreenshotCapture.ts:279-296`):

```typescript
private async waitForLayoutSettle(): Promise<void> {
    const layoutManager = this.graph.layoutManager;
    if (!layoutManager) {
        return;
    }

    if (layoutManager.isSettled) {
        return;
    }

    return new Promise((resolve, reject) => {
        let completed = false;

        const cleanup = (): void => {
            this.graph.removeListener("graph-settled", handler);
            clearTimeout(timeout);
        };

        const timeout = setTimeout(() => {
            if (!completed) {
                completed = true;
                cleanup();
                reject(new ScreenshotError(
                    "Layout did not settle within timeout",
                    ScreenshotErrorCode.LAYOUT_SETTLE_TIMEOUT,
                ));
            }
        }, 30000);

        const handler = (): void => {
            if (!completed && layoutManager.isSettled) {
                completed = true;
                cleanup();
                resolve();
            }
        };

        this.graph.addListener("graph-settled", handler);

        // Check immediately in case it's already settled
        if (!completed && layoutManager.isSettled) {
            completed = true;
            cleanup();
            resolve();
        }
    });
}
```

2. **Standardize test assertions** in `screenshot-error-codes.test.ts`:
   - Replace `expect().rejects.toThrow()` with `assert.rejects()` pattern

```typescript
// Before
await expect(
    graph.captureScreenshot({width: 20000, height: 20000}),
).rejects.toThrow(ScreenshotError);

// After
await assert.rejects(
    () => graph.captureScreenshot({width: 20000, height: 20000}),
    ScreenshotError,
    "Should throw ScreenshotError for oversized dimensions"
);
```

3. **Add skybox mesh name configuration** (`ScreenshotCapture.ts:124, 225`):

```typescript
// Add to ScreenshotCapture options or as a configurable property
private readonly skyboxMeshNames = ["testdome", "skybox", "skyBox", "Skybox"];

private findSkyboxMesh(): Mesh | null {
    for (const name of this.skyboxMeshNames) {
        const mesh = this.scene.getMeshByName(name) as Mesh | null;
        if (mesh) return mesh;
    }
    // Fallback: look for PhotoDome or common skybox patterns
    return this.scene.meshes.find(m =>
        m.name.toLowerCase().includes("dome") ||
        m.name.toLowerCase().includes("skybox")
    ) as Mesh | null ?? null;
}
```

4. **Document deferred PNG metadata feature** in types.ts:

```typescript
export interface ScreenshotOptions {
    // ... existing options ...

    /**
     * PNG metadata embedding.
     *
     * NOTE: This feature is not yet implemented. PNG metadata embedding
     * requires binary format manipulation and external libraries.
     * See design/screen-capture-design-review.md for details.
     *
     * @future Phase 3+ feature
     */
    // embedMetadata?: boolean;
    // metadata?: Record<string, string>;
}
```

**Dependencies**:
- External: None
- Internal: Phases 1-2 completion

**Verification**:
1. Run: `npm run lint && npm run build && npm test`
2. Expected: All tests pass, no memory leak warnings in browser tests
3. Manual: Run extended test session and monitor memory usage

---

### Phase 4: Medium Priority - Test Coverage Expansion

**Objective**: Add missing test coverage for 2D camera video capture.

**Duration**: 1 day

#### Tests to Write First

```typescript
// test/browser/video/video-capture-2d.test.ts
import {afterEach, assert, beforeEach, test, vi} from "vitest";
import {Graph} from "../../../src/Graph.js";
import {MockMediaRecorder, setupMockMediaRecorder, restoreMockMediaRecorder} from "./mock-media-recorder.js";

let originalMediaRecorder: typeof MediaRecorder;

beforeEach(() => {
    originalMediaRecorder = globalThis.MediaRecorder;
    setupMockMediaRecorder(vi);
});

afterEach(() => {
    restoreMockMediaRecorder(vi, originalMediaRecorder);
});

test("can capture video with 2D orthographic camera", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas, {is2D: true});

    const result = await graph.captureAnimation({
        duration: 2000,
        fps: 30,
        cameraMode: "stationary",
    });

    assert.ok(result.blob instanceof Blob);
    assert.ok(result.blob.type.startsWith("video/webm"));
});

test("can capture video with 2D camera zoom animation", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas, {is2D: true});

    // 2D animation through zoom/pan rather than 3D waypoints
    const result = await graph.captureAnimation({
        duration: 2000,
        fps: 30,
        cameraMode: "stationary",
        camera: {
            zoom: 2,
            pan: {x: 100, y: 100},
        },
    });

    assert.ok(result.blob instanceof Blob);
});

test("2D video capture maintains orthographic projection", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const graph = new Graph(canvas, {is2D: true});

    const result = await graph.captureAnimation({
        duration: 1000,
        fps: 30,
        cameraMode: "stationary",
    });

    // Verify dimensions match expected orthographic output
    assert.equal(result.metadata.width, 800);
    assert.equal(result.metadata.height, 600);
});
```

#### Implementation

1. **Ensure `CameraPathAnimator` properly handles 2D mode**:
   - Verify 2D camera state (zoom, pan) is correctly interpolated
   - Add fallback behavior when 3D waypoints provided for 2D camera

2. **Update any documentation for 2D video capture**:
   - Add examples in JSDoc for 2D-specific options
   - Note any limitations (e.g., no 3D rotation in 2D mode)

**Dependencies**:
- External: None
- Internal: Phase 1 (shared mock helper)

**Verification**:
1. Run: `npm run test -- test/browser/video/video-capture-2d.test.ts`
2. Expected: All 2D video tests pass
3. Run full test suite to ensure no regressions

---

### Phase 5: Low Priority - Code Polish and Consistency

**Objective**: Address naming inconsistencies, add JSDoc, extract magic numbers, and document intentional limitations.

**Duration**: 1 day

#### Implementation

1. **Standardize parameter naming** (`MediaRecorderCapture.ts:127`, `VideoCapture.ts:17`):

```typescript
// In AnimationOptions interface
export interface AnimationOptions {
    // ... existing options ...

    /**
     * Video bitrate in bits per second.
     * Higher values = better quality but larger file size.
     * @default 5000000 (5 Mbps)
     * @alias videoBitsPerSecond
     */
    videoBitrate?: number;
}

// In implementation, accept both names for backwards compatibility
const bitrate = options.videoBitrate ?? options.videoBitsPerSecond ?? 5_000_000;
```

2. **Extract magic numbers to named constants** (`ScreenshotCapture.ts:277`, `test-setup.ts:27`):

```typescript
// src/screenshot/constants.ts
export const SCREENSHOT_CONSTANTS = {
    /** Maximum time to wait for layout to settle (ms) */
    LAYOUT_SETTLE_TIMEOUT_MS: 30_000,

    /** Browser canvas maximum dimension (conservative estimate) */
    MAX_CANVAS_DIMENSION: 16_384,

    /** Maximum recommended pixel count (8K resolution) */
    MAX_PIXELS: 33_177_600,

    /** Warning threshold for pixel count (4K resolution) */
    WARN_PIXELS: 8_294_400,

    /** Default JPEG/WebP quality when converting formats */
    DEFAULT_CONVERSION_QUALITY: 0.92,

    /** Default video bitrate (5 Mbps) */
    DEFAULT_VIDEO_BITRATE: 5_000_000,
} as const;
```

3. **Add JSDoc to private methods** (where helpful):

```typescript
/**
 * Waits for a single render frame to complete.
 * Used to ensure scene state is captured in screenshot.
 * @internal
 */
private async waitForRender(): Promise<void> {
    return new Promise((resolve) => {
        this.scene.onAfterRenderObservable.addOnce(() => {
            resolve();
        });
    });
}
```

4. **Document `captureMode` status** (if not removed in Phase 2):

```typescript
export interface AnimationOptions {
    /**
     * Capture mode for video recording.
     *
     * - `realtime` (default): Uses MediaRecorder API for hardware-accelerated
     *   capture. Fast but may drop frames if system can't keep up.
     * - `manual`: Reserved for future implementation. Would capture each
     *   frame individually for guaranteed quality, but requires external
     *   encoding library.
     *
     * @default "realtime"
     * @see design/screen-capture-design-review.md for technical details
     */
    captureMode?: "realtime" | "manual";
}
```

5. **Address potential race condition** in cancellation (`MediaRecorderCapture.ts:148-154`):
   - Review the cancellation flow
   - Add synchronization if needed (e.g., use a mutex or state machine)

**Dependencies**:
- External: None
- Internal: All previous phases

**Verification**:
1. Run: `npm run lint && npm run build && npm test`
2. Expected: All tests pass, no new linting errors
3. Manual: Review JSDoc rendering in IDE tooltips

---

## Common Utilities Needed

| Utility | Purpose | Used In |
|---------|---------|---------|
| `MockMediaRecorder` | Test helper for video capture | Phase 1, all video tests |
| `SCREENSHOT_CONSTANTS` | Named constants for configuration | Phase 5, ScreenshotCapture |
| `findSkyboxMesh()` | Robust skybox detection | Phase 3, transparency handling |

---

## External Libraries Assessment

| Task | Consideration | Recommendation |
|------|---------------|----------------|
| Manual video capture | `ffmpeg.wasm` for frame-by-frame encoding | Defer to future phase - adds ~50KB+ to bundle |
| PNG metadata | `png-metadata-ts` or similar | Defer to future phase - complex binary manipulation |
| Test coverage reporting | Built-in Vitest coverage | Already configured, no changes needed |

---

## Risk Mitigation

| Potential Risk | Mitigation Strategy |
|----------------|---------------------|
| Breaking public API with type exports | Export types as-is without modifications; types are additive |
| Console logging removal breaks debugging | Add optional `debug` flag to preserve capability |
| MockMediaRecorder extraction breaks tests | Run tests after each extraction step |
| Event listener cleanup causes behavior change | Add specific test for cleanup behavior before implementing |
| 2D video tests fail due to camera differences | Test in isolation first, verify camera mode detection |

---

## Verification Summary

After completing all phases, run the full verification suite:

```bash
# Full build and test
npm run ready:commit

# Visual inspection of exports
npm run build && node -e "
const pkg = require('./dist/graphty-element.js');
console.log('Exported:', Object.keys(pkg).filter(k => k.includes('Screenshot') || k.includes('Animation')));
"

# Test coverage check
npm run coverage
```

**Expected Outcomes:**
- All tests pass
- No TypeScript errors
- No ESLint errors
- Type exports accessible from main entry point
- Console output clean (no debug logging by default)
- Event listeners properly cleaned up

---

## Implementation Tracking

| Phase | Status | Completion Date | Notes |
|-------|--------|-----------------|-------|
| Phase 1 | Completed | 2025-11-25 | Public API exports, MockMediaRecorder helper, debug logging, quality passthrough |
| Phase 2 | Completed | 2025-11-25 | Option A: Removed `captureMode` from interface, documented decision |
| Phase 3 | Completed | 2025-11-26 | Event listener cleanup in waitForLayoutSettle, test assertion standardization, skybox mesh name configuration, PNG metadata documentation |
| Phase 4 | Completed | 2025-11-26 | Added 2D video capture tests, fixed CameraPathAnimator to use valid ortho properties instead of invalid orthoSize |
| Phase 5 | Completed | 2025-11-26 | Created SCREENSHOT_CONSTANTS and VIDEO_CONSTANTS, added JSDoc to private methods, documented cancellation race condition handling |
