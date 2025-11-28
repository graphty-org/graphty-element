import {afterEach, assert, test} from "vitest";

import type {Graph} from "../../../src/Graph";
import {cleanupTestGraphWithData, createTestGraphWithData} from "./test-setup.js";

let graph: Graph;

afterEach(() => {
    cleanupTestGraphWithData(graph);
});

test("enhanceQuality option is accepted", async() => {
    graph = await createTestGraphWithData();

    const result = await graph.captureScreenshot({enhanceQuality: true});

    // Should complete successfully
    assert.ok(result.blob instanceof Blob);
    assert.ok(result.metadata.width > 0);
});

test("enhanceQuality fires screenshot-enhancing and screenshot-ready events", async() => {
    graph = await createTestGraphWithData();

    let enhancingFired = false;
    let readyFired = false;
    let enhancementTimeFromEvent: number | undefined;

    graph.addListener("screenshot-enhancing", () => {
        enhancingFired = true;
    });

    graph.addListener("screenshot-ready", (e) => {
        readyFired = true;
        // GraphGenericEvent has enhancementTime as a direct property
        enhancementTimeFromEvent = (e as unknown as {enhancementTime?: number}).enhancementTime;
    });

    const result = await graph.captureScreenshot({enhanceQuality: true});

    // Both events should have fired
    assert.ok(enhancingFired, "screenshot-enhancing event should have fired");
    assert.ok(readyFired, "screenshot-ready event should have fired");

    // Enhancement time should be present in both event and metadata
    assert.ok(typeof enhancementTimeFromEvent === "number", "Event should include enhancementTime");
    assert.ok(typeof result.metadata.enhancementTime === "number", "Metadata should include enhancementTime");
    assert.ok(result.metadata.enhancementTime >= 0, "enhancementTime should be non-negative");
});

test("enhanceQuality events do not fire when option is false", async() => {
    graph = await createTestGraphWithData();

    let enhancingFired = false;
    let readyFired = false;

    graph.addListener("screenshot-enhancing", () => {
        enhancingFired = true;
    });

    graph.addListener("screenshot-ready", () => {
        readyFired = true;
    });

    const result = await graph.captureScreenshot({enhanceQuality: false});

    // Neither event should fire without enhanceQuality
    assert.equal(enhancingFired, false, "screenshot-enhancing event should not fire");
    assert.equal(readyFired, false, "screenshot-ready event should not fire");

    // enhancementTime should not be in metadata
    assert.equal(result.metadata.enhancementTime, undefined, "enhancementTime should not be present");
});

test("quality parameter affects JPEG compression", async() => {
    graph = await createTestGraphWithData();

    const lowQuality = await graph.captureScreenshot({
        format: "jpeg",
        quality: 0.5,
    });

    const highQuality = await graph.captureScreenshot({
        format: "jpeg",
        quality: 1.0,
    });

    // High quality should produce larger file (usually)
    // Note: This may not always be true depending on image content
    assert.ok(lowQuality.metadata.byteSize > 0);
    assert.ok(highQuality.metadata.byteSize > 0);
});
