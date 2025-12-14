import {afterEach, assert, test} from "vitest";

import type {Graph} from "../../../src/Graph.js";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("screenshot returns valid clipboardStatus", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    // Clipboard status should be one of the valid values
    const validStatuses = ["success", "not-supported", "permission-denied", "not-secure-context", "failed"];
    assert.ok(
        validStatuses.includes(result.clipboardStatus),
        `clipboardStatus should be one of ${validStatuses.join(", ")}, got ${result.clipboardStatus}`,
    );
});

test("screenshot provides clipboardError when clipboard fails", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    // If clipboard failed, there should be an error
    if (result.clipboardStatus !== "success") {
        assert.ok(result.clipboardError, "Should have clipboardError when clipboard operation fails");
        assert.ok(result.clipboardError.message, "clipboardError should have a message");
    }
});

test("screenshot still succeeds even if clipboard fails", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    // Screenshot should succeed even if clipboard fails
    assert.ok(result.blob, "Should have blob even if clipboard fails");
    assert.ok(result.blob instanceof Blob, "blob should be a Blob");
    assert.ok(result.metadata, "Should have metadata");
});

test("clipboard status is 'not-supported' or 'success' based on browser capability", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    // In most test environments, clipboard might not be supported
    // but in secure contexts it should work
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window.isSecureContext && navigator.clipboard) {
        // Clipboard API is available - status should be success or permission-denied
        assert.ok(
            ["success", "permission-denied", "failed"].includes(result.clipboardStatus),
            `In secure context with clipboard API, status should be success/permission-denied/failed, got ${result.clipboardStatus}`,
        );
    } else {
        // Clipboard API not available
        assert.ok(
            ["not-supported", "not-secure-context"].includes(result.clipboardStatus),
            `Without clipboard API or secure context, status should be not-supported or not-secure-context, got ${result.clipboardStatus}`,
        );
    }
});

test("clipboard operation does not throw error", async() => {
    graph = await createTestGraphWithData();

    // This should not throw even if clipboard is not supported
    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    assert.ok(result, "Should return result");
    assert.ok(result.blob, "Should have blob");
});

test("clipboard error has appropriate code", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    if (result.clipboardError) {
        // Error should have a code property if it's a ScreenshotError
        const errorCode = (result.clipboardError as {code?: string}).code;

        if (errorCode) {
            const validCodes = [
                "CLIPBOARD_NOT_SUPPORTED",
                "CLIPBOARD_PERMISSION_DENIED",
                "CLIPBOARD_NOT_SECURE_CONTEXT",
                "CLIPBOARD_WRITE_FAILED",
                "CLIPBOARD_FAILED",
            ];
            assert.ok(
                validCodes.includes(errorCode),
                `Error code should be one of the valid clipboard error codes, got ${errorCode}`,
            );
        }
    }
});

test("multiple screenshots can handle clipboard independently", async() => {
    graph = await createTestGraphWithData();

    // First screenshot with clipboard
    const result1 = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    // Second screenshot with clipboard
    const result2 = await graph.captureScreenshot({
        destination: {clipboard: true},
    });

    // Both should have completed
    assert.ok(result1.blob, "First screenshot should have blob");
    assert.ok(result2.blob, "Second screenshot should have blob");

    // Clipboard status should be consistent across calls
    assert.equal(
        result1.clipboardStatus,
        result2.clipboardStatus,
        "Clipboard status should be consistent across multiple calls",
    );
});

test("screenshot without clipboard destination has default clipboard status", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({
        destination: {blob: true},
    });

    // When clipboard is not requested, status should still be set (to not-supported or success depending on defaults)
    assert.ok(result.clipboardStatus, "Should have clipboardStatus even when not requested");
});
