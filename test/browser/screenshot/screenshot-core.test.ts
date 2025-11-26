import {afterEach, expect, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import type {ScreenshotResult} from "../../../src/screenshot/types.js";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("captureScreenshot returns valid ScreenshotResult with blob", async() => {
    graph = await createTestGraphWithData();

    const result: ScreenshotResult = await graph.captureScreenshot();

    expect(result.blob instanceof Blob, "result.blob should be a Blob").toBeTruthy();
    expect(result.metadata.width > 0, "width should be positive").toBeTruthy();
    expect(result.metadata.height > 0, "height should be positive").toBeTruthy();
    expect(result.metadata.byteSize > 0, "byteSize should be positive").toBeTruthy();
    expect(result.metadata.captureTime >= 0, "captureTime should be non-negative").toBeTruthy();
    expect(typeof result.downloaded, "downloaded should be boolean").toBe("boolean");
    expect(
        ["success", "not-supported", "permission-denied", "not-secure-context", "failed"].includes(
            result.clipboardStatus,
        ),
        "clipboardStatus should be a valid status",
    ).toBeTruthy();
});

test("captureScreenshot supports PNG format", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({format: "png"});

    expect(result.blob.type, "blob type should be image/png").toBe("image/png");
    expect(result.metadata.format, "metadata.format should be png").toBe("png");
});

test("captureScreenshot supports JPEG format", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({format: "jpeg"});

    expect(result.blob.type, "blob type should be image/jpeg").toBe("image/jpeg");
    expect(result.metadata.format, "metadata.format should be jpeg").toBe("jpeg");
});

test("captureScreenshot supports WebP format", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({format: "webp"});

    expect(result.blob.type, "blob type should be image/webp").toBe("image/webp");
    expect(result.metadata.format, "metadata.format should be webp").toBe("webp");
});

test("captureScreenshot defaults to PNG format", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot();

    expect(result.blob.type, "default format should be PNG").toBe("image/png");
    expect(result.metadata.format, "metadata should reflect PNG").toBe("png");
});

test("captureScreenshot uses canvas dimensions by default", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot();

    // Canvas dimensions should match the result
    expect(result.metadata.width > 0, "width should be positive").toBeTruthy();
    expect(result.metadata.height > 0, "height should be positive").toBeTruthy();
});

test("captureScreenshot with multiplier increases resolution", async() => {
    graph = await createTestGraphWithData();

    const base = await graph.captureScreenshot({multiplier: 1});
    const double = await graph.captureScreenshot({multiplier: 2});

    expect(
        double.metadata.width,
        "width should be doubled with multiplier: 2",
    ).toBe(base.metadata.width * 2);
    expect(
        double.metadata.height,
        "height should be doubled with multiplier: 2",
    ).toBe(base.metadata.height * 2);
});

test("captureScreenshot with explicit width/height overrides multiplier", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        multiplier: 4,
        width: 800,
        height: 600,
    });

    expect(result.metadata.width, "width should be 800 (explicit)").toBe(800);
    expect(result.metadata.height, "height should be 600 (explicit)").toBe(600);
});

test("captureScreenshot returns blob destination by default", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot();

    expect(result.blob instanceof Blob, "blob should always be returned").toBeTruthy();
});
