import {afterEach, assert, expect, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {ScreenshotErrorCode} from "../../../src/screenshot/ScreenshotError.js";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("transparentBackground works with PNG", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        transparentBackground: true,
        format: "png",
    });

    assert.equal(result.metadata.format, "png");
    assert.ok(result.blob instanceof Blob);
});

test("transparentBackground works with WebP", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        transparentBackground: true,
        format: "webp",
    });

    assert.equal(result.metadata.format, "webp");
    assert.ok(result.blob instanceof Blob);
});

test("transparent background with JPEG format throws error", async() => {
    graph = await createTestGraphWithData();

    await expect(
        graph.captureScreenshot({
            transparentBackground: true,
            format: "jpeg",
        }),
    ).rejects.toMatchObject({
        name: "ScreenshotError",
        code: ScreenshotErrorCode.TRANSPARENT_REQUIRES_PNG,
    });
});

test("transparentBackground disables and restores scene background", async() => {
    graph = await createTestGraphWithData();

    const scene = graph.getScene();
    const originalClearColor = scene.clearColor.clone();

    await graph.captureScreenshot({transparentBackground: true});

    // After capture, state should be restored
    assert.equal(scene.clearColor.r, originalClearColor.r);
    assert.equal(scene.clearColor.g, originalClearColor.g);
    assert.equal(scene.clearColor.b, originalClearColor.b);
    assert.equal(scene.clearColor.a, originalClearColor.a);
});
