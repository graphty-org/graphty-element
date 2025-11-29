import {afterEach, assert, test} from "vitest";

import type {Graph} from "../../../src/Graph.js";
import type {CapabilityCheck} from "../../../src/screenshot/capability-check.js";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("canCaptureScreenshot returns supported for normal dimensions", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        width: 1920,
        height: 1080,
    });

    assert.equal(check.supported, true, "Should be supported");
    assert.ok(typeof check.estimatedMemoryMB === "number", "Should have memory estimate");
    assert.ok(check.estimatedMemoryMB > 0, "Memory estimate should be positive");
});

test("canCaptureScreenshot warns about large dimensions", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        width: 3840, // 4K
        height: 2160,
    });

    assert.equal(check.supported, true, "4K should be supported");
    assert.ok(check.warnings, "Should have warnings for large screenshot");
    assert.ok(check.warnings.some((w) => w.includes("Large screenshot") || w.includes("large")), "Warning should mention large screenshot");
});

test("canCaptureScreenshot rejects excessive dimensions", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        width: 20000,
        height: 20000,
    });

    assert.equal(check.supported, false, "Excessive dimensions should not be supported");
    assert.ok(check.reason, "Should provide reason");
    assert.match(check.reason, /exceeds.*limit/i, "Reason should mention exceeding limit");
});

test("canCaptureScreenshot warns about high memory usage", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        width: 7680, // 8K
        height: 4320,
    });

    assert.ok(typeof check.estimatedMemoryMB === "number", "Should have memory estimate");

    // 8K should either be not supported or have warnings
    if (check.supported) {
        assert.ok(check.warnings, "8K should have warnings if supported");
        assert.ok(
            check.warnings.some((w) => w.toLowerCase().includes("memory") || w.includes("large")),
            "Should have memory-related warning",
        );
    } else {
        assert.ok(check.reason, "Should provide reason for not being supported");
    }
});

test("canCaptureScreenshot estimates memory usage accurately", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        width: 1920,
        height: 1080,
    });

    // 1920 * 1080 * 4 bytes (RGBA) = 8,294,400 bytes ≈ 7.9 MB
    const expectedMemoryMB = (1920 * 1080 * 4) / (1024 * 1024);

    assert.ok(typeof check.estimatedMemoryMB === "number", "Should have memory estimate");
    assert.ok(Math.abs(check.estimatedMemoryMB - expectedMemoryMB) < 0.1, `Memory estimate should be ~${expectedMemoryMB.toFixed(1)}MB, got ${check.estimatedMemoryMB.toFixed(1)}MB`);
});

test("canCaptureScreenshot works with multiplier", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        multiplier: 2,
    });

    assert.equal(check.supported, true, "2x multiplier should be supported");
    assert.ok(typeof check.estimatedMemoryMB === "number", "Should have memory estimate");
});

test("canCaptureScreenshot warns about very high multiplier", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        multiplier: 10,
    });

    // Very high multiplier should either fail or have warnings
    if (check.supported) {
        assert.ok(check.warnings, "Very high multiplier should have warnings if supported");
    } else {
        assert.ok(check.reason, "Should provide reason for not being supported");
    }
});

test("canCaptureScreenshot works with default options", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot();

    assert.equal(check.supported, true, "Default options should be supported");
    assert.ok(typeof check.estimatedMemoryMB === "number", "Should have memory estimate");
});

test("canCaptureScreenshot checks format support", async() => {
    graph = await createTestGraphWithData();

    // WebP should be supported in modern browsers
    const checkWebP: CapabilityCheck = await graph.canCaptureScreenshot({
        format: "webp",
    });

    // WebP might not be supported in all test environments
    if (!checkWebP.supported) {
        assert.ok(checkWebP.reason, "Should provide reason if WebP not supported");
        assert.match(checkWebP.reason, /webp/i, "Reason should mention WebP");
    }
});

test("canCaptureScreenshot handles edge case: very small dimensions", async() => {
    graph = await createTestGraphWithData();

    const check: CapabilityCheck = await graph.canCaptureScreenshot({
        width: 100,
        height: 100,
    });

    assert.equal(check.supported, true, "Small dimensions should be supported");
    assert.ok(check.estimatedMemoryMB < 1, "Small dimensions should use minimal memory");
});
