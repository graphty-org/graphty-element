import {afterEach, assert, expect, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {ScreenshotErrorCode} from "../../../src/screenshot/ScreenshotError.js";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("print preset applies correct options", async() => {
    graph = await createTestGraphWithData();

    const base = await graph.captureScreenshot({multiplier: 1});
    const result = await graph.captureScreenshot({preset: "print"});

    // Should use 4x multiplier and PNG format
    assert.equal(result.metadata.format, "png");
    assert.equal(result.metadata.width, base.metadata.width * 4);
    assert.equal(result.metadata.height, base.metadata.height * 4);
});

test("web-share preset applies correct options", async() => {
    graph = await createTestGraphWithData();

    const base = await graph.captureScreenshot({multiplier: 1});
    const result = await graph.captureScreenshot({preset: "web-share"});

    assert.equal(result.metadata.format, "png");
    assert.equal(result.metadata.width, base.metadata.width * 2);
    assert.equal(result.metadata.height, base.metadata.height * 2);
    // Should have attempted clipboard copy
    assert.ok(
        ["success", "permission-denied", "not-supported", "not-secure-context", "failed"].includes(
            result.clipboardStatus,
        ),
    );
});

test("thumbnail preset uses small dimensions and JPEG", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({preset: "thumbnail"});

    assert.equal(result.metadata.format, "jpeg");
    assert.equal(result.metadata.width, 400);
    assert.equal(result.metadata.height, 300);
});

test("documentation preset uses transparent PNG", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({preset: "documentation"});

    assert.equal(result.metadata.format, "png");
    // multiplier should be 2
    const base = await graph.captureScreenshot({multiplier: 1});
    assert.equal(result.metadata.width, base.metadata.width * 2);
});

test("preset options can be overridden", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        preset: "print",
        width: 2000, // Override width
    });

    assert.equal(result.metadata.format, "png");
    assert.equal(result.metadata.width, 2000);
});

test("unknown preset throws error", async() => {
    graph = await createTestGraphWithData();

    await expect(
        graph.captureScreenshot({
            preset: "unknown-preset" as "print",
        }),
    ).rejects.toMatchObject({
        name: "ScreenshotError",
        code: ScreenshotErrorCode.PRESET_NOT_FOUND,
    });
});
