import {afterEach, expect, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("captureScreenshot with blob destination returns blob", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {blob: true},
    });

    expect(result.blob instanceof Blob, "blob should be returned").toBeTruthy();
});

test("captureScreenshot with download destination", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {download: true},
    });

    expect(result.blob instanceof Blob, "blob should still be returned").toBeTruthy();
    expect(typeof result.downloaded, "downloaded status should be boolean").toBe("boolean");
});

test("captureScreenshot with clipboard destination", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    expect(result.blob instanceof Blob, "blob should still be returned").toBeTruthy();
    expect(
        ["success", "not-supported", "permission-denied", "not-secure-context", "failed"].includes(
            result.clipboardStatus,
        ),
        "clipboardStatus should be valid",
    ).toBeTruthy();

    // If clipboard failed, there should be an error
    if (result.clipboardStatus !== "success") {
        expect(result.clipboardError instanceof Error, "clipboardError should be provided on failure").toBeTruthy();
    }
});

test("captureScreenshot with multiple destinations works", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {
            blob: true,
            download: true,
            clipboard: true,
        },
    });

    expect(result.blob instanceof Blob, "blob should be returned").toBeTruthy();
    expect(typeof result.downloaded, "downloaded status should be boolean").toBe("boolean");
    expect(
        ["success", "not-supported", "permission-denied", "not-secure-context", "failed"].includes(
            result.clipboardStatus,
        ),
        "clipboardStatus should be valid",
    ).toBeTruthy();
});

test("captureScreenshot with custom filename", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {download: true},
        downloadFilename: "my-graph.png",
    });

    expect(result.blob instanceof Blob, "blob should be returned").toBeTruthy();
    // Filename is used internally for download, but we can't easily verify it was used
    // This test mainly ensures the option doesn't cause errors
});

test("captureScreenshot clipboard handles not-secure-context gracefully", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    // In test environment, clipboard might not be supported or might fail
    // Just ensure we get a valid status
    expect(
        ["success", "not-supported", "permission-denied", "not-secure-context", "failed"].includes(
            result.clipboardStatus,
        ),
        "should handle clipboard gracefully",
    ).toBeTruthy();
});
