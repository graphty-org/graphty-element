/**
 * Camera Commands LLM Regression Tests
 * @module test/ai/llm-regression/camera-commands
 *
 * Tests that verify LLMs correctly call camera commands (setCameraPosition, zoomToNodes)
 * in response to natural language prompts.
 *
 * These tests run against real LLM APIs and verify correct tool selection
 * and parameter extraction for camera positioning and zoom operations.
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {skipIfNoApiKey} from "../../helpers/llm-regression-env";
import {LlmRegressionTestHarness} from "../../helpers/llm-regression-harness";
import {serverNetworkFixture} from "./fixtures/test-graph-fixtures";

/**
 * Camera preset synonyms that map natural language to expected presets.
 */
const CAMERA_PRESET_SYNONYMS: Record<string, string[]> = {
    topView: ["topView", "top", "above", "bird's eye", "overhead"],
    sideView: ["sideView", "side"],
    frontView: ["frontView", "front"],
    fitToGraph: ["fitToGraph", "fit", "all nodes", "zoom to fit"],
    isometric: ["isometric", "iso"],
};

/**
 * Check if a camera preset matches expected values.
 *
 * @param actual - The actual preset from the LLM
 * @param expected - The base expected preset
 * @returns True if the preset matches expected or its synonyms
 */
function isValidCameraPreset(actual: unknown, expected: string): boolean {
    if (typeof actual !== "string") {
        return false;
    }

    const normalizedActual = actual.toLowerCase().trim();
    const normalizedExpected = expected.toLowerCase().trim();

    // Direct match
    if (normalizedActual === normalizedExpected) {
        return true;
    }

    // Check synonyms for expected preset
    const synonyms = CAMERA_PRESET_SYNONYMS[expected] as string[] | undefined;
    if (synonyms) {
        return synonyms.some((s) => normalizedActual.toLowerCase().includes(s.toLowerCase()));
    }

    return false;
}

describe.skipIf(skipIfNoApiKey())("Camera Commands LLM Regression", () => {
    let harness: LlmRegressionTestHarness;

    beforeEach(async() => {
        harness = await LlmRegressionTestHarness.create({
            graphData: serverNetworkFixture,
        });
    });

    afterEach(() => {
        harness.dispose();
    });

    describe("setCameraPosition", () => {
        it("calls setCameraPosition for 'Show the graph from above'", async() => {
            const result = await harness.testPrompt("Show the graph from above");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "setCameraPosition");
            assert.ok(result.toolParams, "Expected tool parameters");

            // Verify preset is topView or similar
            const {preset} = result.toolParams;
            assert.ok(
                isValidCameraPreset(preset, "topView"),
                `Expected topView preset but got '${String(preset)}'`,
            );
        });

        it("calls setCameraPosition for 'View from the side'", async() => {
            const result = await harness.testPrompt("View from the side");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            assert.strictEqual(result.toolName, "setCameraPosition");
            assert.ok(result.toolParams, "Expected tool parameters");

            // Verify preset is sideView or similar
            const {preset} = result.toolParams;
            assert.ok(
                isValidCameraPreset(preset, "sideView"),
                `Expected sideView preset but got '${String(preset)}'`,
            );
        });

        it("calls setCameraPosition for 'Fit all nodes in view'", async() => {
            const result = await harness.testPrompt("Fit all nodes in view");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            // This could be either setCameraPosition with fitToGraph preset OR zoomToNodes
            assert.ok(
                result.toolName === "setCameraPosition" || result.toolName === "zoomToNodes",
                `Expected setCameraPosition or zoomToNodes but got '${result.toolName}'`,
            );

            // If setCameraPosition, verify preset is fitToGraph
            if (result.toolName === "setCameraPosition" && result.toolParams) {
                const {preset} = result.toolParams;
                assert.ok(
                    isValidCameraPreset(preset, "fitToGraph"),
                    `Expected fitToGraph preset but got '${String(preset)}'`,
                );
            }
        });
    });

    describe("zoomToNodes", () => {
        it("calls zoomToNodes for 'Zoom to fit all nodes'", async() => {
            const result = await harness.testPrompt("Zoom to fit all nodes");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            // This could be either zoomToNodes OR setCameraPosition with fitToGraph
            assert.ok(
                result.toolName === "zoomToNodes" || result.toolName === "setCameraPosition",
                `Expected zoomToNodes or setCameraPosition but got '${result.toolName}'`,
            );
        });

        it("calls zoomToNodes for 'Focus on server nodes'", async() => {
            const result = await harness.testPrompt("Focus on server nodes");

            assert.ok(result.toolWasCalled, "Expected a tool to be called");
            // This should specifically call zoomToNodes since it's filtering by selector
            assert.strictEqual(
                result.toolName,
                "zoomToNodes",
                `Expected zoomToNodes for selector-based focus but got '${result.toolName}'`,
            );
            assert.ok(result.toolParams, "Expected tool parameters");

            // Verify selector targets server type
            const selector = result.toolParams.selector as string | undefined;
            if (selector && selector.length > 0) {
                assert.ok(
                    selector.includes("server") || selector.includes("type"),
                    `Expected selector to include 'server' or 'type' but got '${selector}'`,
                );
            }
        });
    });

    describe("command result validation", () => {
        it("returns command result for setCameraPosition", async() => {
            const result = await harness.testPrompt("Move camera to front view");

            assert.ok(result.toolWasCalled, "Expected setCameraPosition to be called");
            assert.strictEqual(result.toolName, "setCameraPosition");

            // Command result should exist
            assert.ok(result.commandResult, "Expected command result");
            assert.ok(result.commandResult.message, "Expected result message");
        });

        it("returns command result for zoomToNodes", async() => {
            const result = await harness.testPrompt("Zoom in on the database nodes");

            assert.ok(result.toolWasCalled, "Expected zoomToNodes to be called");
            assert.strictEqual(result.toolName, "zoomToNodes");

            // Command result should exist
            assert.ok(result.commandResult, "Expected command result");
            assert.ok(result.commandResult.message, "Expected result message");
        });

        it("tracks latency for camera commands", async() => {
            const result = await harness.testPrompt("Show isometric view");

            assert.ok(result.latencyMs > 0, "Expected positive latency");
            assert.ok(result.latencyMs < 60000, "Expected latency under 60 seconds");
        });

        it("captures token usage for camera commands", async() => {
            const result = await harness.testPrompt("View graph from the top");

            // Token usage may not always be available depending on provider configuration
            if (result.tokenUsage) {
                assert.ok(result.tokenUsage.prompt > 0, "Expected positive prompt tokens");
                assert.ok(result.tokenUsage.completion >= 0, "Expected non-negative completion tokens");
            }
        });
    });
});
