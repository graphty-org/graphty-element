import {afterEach, assert, expect, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {ScreenshotError, ScreenshotErrorCode} from "../../../src/screenshot/ScreenshotError.js";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("throws DIMENSION_TOO_LARGE when exceeding browser limits", async() => {
    graph = await createTestGraphWithData();

    await expect(
        graph.captureScreenshot({width: 20000, height: 20000}),
    ).rejects.toThrow(ScreenshotError);

    try {
        await graph.captureScreenshot({width: 20000, height: 20000});
        assert.fail("Should have thrown ScreenshotError");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.equal(err.code, ScreenshotErrorCode.DIMENSION_TOO_LARGE, "Error code should be DIMENSION_TOO_LARGE");
        assert.match(err.message, /(too large|exceeds|limit)/i, "Error message should mention dimensions are too large or exceed limit");
    }
});

test("throws RESOLUTION_TOO_HIGH when total pixels exceed limit", async() => {
    graph = await createTestGraphWithData();

    // Create dimensions that are individually okay but together exceed pixel limit
    const width = 10000;
    const height = 10000; // 100M pixels

    try {
        await graph.captureScreenshot({width, height});
        assert.fail("Should have thrown ScreenshotError");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.ok(
            err.code === ScreenshotErrorCode.RESOLUTION_TOO_HIGH || err.code === ScreenshotErrorCode.DIMENSION_TOO_LARGE,
            `Error code should be RESOLUTION_TOO_HIGH or DIMENSION_TOO_LARGE, got ${err.code}`,
        );
    }
});

test("throws ASPECT_RATIO_MISMATCH with strictAspectRatio", async() => {
    graph = await createTestGraphWithData();

    // Get canvas dimensions to determine aspect ratio
    const {canvas} = graph as {canvas: HTMLCanvasElement};
    const canvasAspect = canvas.width / canvas.height;

    // Request dimensions with different aspect ratio
    let requestedWidth = 1920;
    let requestedHeight = 1080;

    // If canvas is already 16:9, use 4:3 instead
    if (Math.abs(canvasAspect - (16 / 9)) < 0.1) {
        requestedWidth = 800;
        requestedHeight = 600; // 4:3
    }

    try {
        await graph.captureScreenshot({
            width: requestedWidth,
            height: requestedHeight,
            strictAspectRatio: true,
        });
        assert.fail("Should have thrown ScreenshotError");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.equal(err.code, ScreenshotErrorCode.ASPECT_RATIO_MISMATCH, "Error code should be ASPECT_RATIO_MISMATCH");
        assert.match(err.message, /aspect ratio/i, "Error message should mention aspect ratio");
    }
});

test("throws TRANSPARENT_REQUIRES_PNG when using JPEG + transparent", async() => {
    graph = await createTestGraphWithData();

    try {
        await graph.captureScreenshot({
            transparentBackground: true,
            format: "jpeg",
        });
        assert.fail("Should have thrown ScreenshotError");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.equal(err.code, ScreenshotErrorCode.TRANSPARENT_REQUIRES_PNG, "Error code should be TRANSPARENT_REQUIRES_PNG");
        assert.match(err.message, /(transparent|png|jpeg)/i, "Error message should mention transparent, PNG, or JPEG");
    }
});

test("throws INVALID_DIMENSIONS for negative or zero dimensions", async() => {
    graph = await createTestGraphWithData();

    try {
        await graph.captureScreenshot({width: 0, height: 100});
        assert.fail("Should have thrown ScreenshotError for width=0");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.equal(err.code, ScreenshotErrorCode.INVALID_DIMENSIONS, "Error code should be INVALID_DIMENSIONS");
    }

    try {
        await graph.captureScreenshot({width: 100, height: -10});
        assert.fail("Should have thrown ScreenshotError for negative height");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.equal(err.code, ScreenshotErrorCode.INVALID_DIMENSIONS, "Error code should be INVALID_DIMENSIONS");
    }
});

test("throws INVALID_DIMENSIONS for NaN or Infinity dimensions", async() => {
    graph = await createTestGraphWithData();

    try {
        await graph.captureScreenshot({width: NaN, height: 100});
        assert.fail("Should have thrown ScreenshotError for NaN width");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.equal(err.code, ScreenshotErrorCode.INVALID_DIMENSIONS, "Error code should be INVALID_DIMENSIONS");
    }

    try {
        await graph.captureScreenshot({width: 100, height: Infinity});
        assert.fail("Should have thrown ScreenshotError for Infinity height");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.equal(err.code, ScreenshotErrorCode.INVALID_DIMENSIONS, "Error code should be INVALID_DIMENSIONS");
    }
});

test("error includes helpful details", async() => {
    graph = await createTestGraphWithData();

    try {
        await graph.captureScreenshot({width: 20000, height: 20000});
        assert.fail("Should have thrown ScreenshotError");
    } catch (err) {
        assert.ok(err instanceof ScreenshotError, "Error should be ScreenshotError");
        assert.ok(err.details, "Error should include details");
        assert.equal(err.name, "ScreenshotError", "Error name should be ScreenshotError");
    }
});
