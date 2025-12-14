import {afterEach, assert, expect, test, vi} from "vitest";

import type {Graph} from "../../../src/Graph";
import {ScreenshotErrorCode} from "../../../src/screenshot/ScreenshotError.js";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
    vi.restoreAllMocks();
});

test("multiplier increases resolution correctly", async() => {
    graph = await createTestGraphWithData();

    const base = await graph.captureScreenshot({multiplier: 1});
    const result = await graph.captureScreenshot({multiplier: 2});

    assert.equal(result.metadata.width, base.metadata.width * 2);
    assert.equal(result.metadata.height, base.metadata.height * 2);
});

test("explicit dimensions override multiplier", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        multiplier: 2, // Should be ignored
        width: 1920,
        height: 1080,
    });

    assert.equal(result.metadata.width, 1920);
    assert.equal(result.metadata.height, 1080);
});

test("width-only maintains aspect ratio", async() => {
    graph = await createTestGraphWithData();

    // Canvas is 800x600 (4:3 aspect)
    const result = await graph.captureScreenshot({width: 1600});

    assert.equal(result.metadata.width, 1600);
    assert.equal(result.metadata.height, 1200); // Maintains 4:3
});

test("height-only maintains aspect ratio", async() => {
    graph = await createTestGraphWithData();

    // Canvas is 800x600 (4:3 aspect)
    const result = await graph.captureScreenshot({height: 1200});

    assert.equal(result.metadata.width, 1600); // Maintains 4:3
    assert.equal(result.metadata.height, 1200);
});

test("strictAspectRatio throws when aspect mismatch", async() => {
    graph = await createTestGraphWithData();

    // Canvas is 800x600 (4:3 aspect)
    await expect(
        graph.captureScreenshot({
            width: 1920, // 16:9 aspect
            height: 1080,
            strictAspectRatio: true,
        }),
    ).rejects.toMatchObject({
        name: "ScreenshotError",
        code: ScreenshotErrorCode.ASPECT_RATIO_MISMATCH,
    });
});

test("dimensions exceeding browser limit throw error", async() => {
    graph = await createTestGraphWithData();

    await expect(
        graph.captureScreenshot({
            width: 20000, // Exceeds 16384 limit
            height: 20000,
        }),
    ).rejects.toMatchObject({
        name: "ScreenshotError",
        code: ScreenshotErrorCode.DIMENSION_TOO_LARGE,
    });
});

test("total pixels exceeding limit throw error", async() => {
    graph = await createTestGraphWithData();

    await expect(
        graph.captureScreenshot({
            width: 10000, // 10000 * 10000 = 100MP > 33.17MP limit
            height: 10000,
        }),
    ).rejects.toMatchObject({
        name: "ScreenshotError",
        code: ScreenshotErrorCode.RESOLUTION_TOO_HIGH,
    });
});

test("large dimensions produce console warning", async() => {
    graph = await createTestGraphWithData();

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
        // Intentionally empty - we just want to suppress the warning
    });

    await graph.captureScreenshot({
        width: 3841, // Slightly larger than 4K to exceed WARN_PIXELS
        height: 2160,
    });

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy.mock.calls[0][0]).toMatch(/Large screenshot/);

    consoleWarnSpy.mockRestore();
});
