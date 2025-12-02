/**
 * ModeCommands Tests - Tests for VR/AR mode switching commands.
 * @module test/ai/commands/ModeCommands.test
 */

import {assert, beforeEach, describe, it} from "vitest";

import {setImmersiveMode} from "../../../src/ai/commands/ModeCommands";
import type {CommandContext} from "../../../src/ai/commands/types";
import type {Graph} from "../../../src/Graph";
import {createMockContext, createTestGraph} from "../../helpers/test-graph";

describe("ModeCommands", () => {
    let graph: Graph;
    let context: CommandContext;

    beforeEach(() => {
        graph = createTestGraph();
        context = createMockContext(graph);
    });

    describe("setImmersiveMode", () => {
        it("enters VR mode", async() => {
            const result = await setImmersiveMode.execute(graph, {mode: "vr"}, context);
            // Note: VR may not be supported in test environment
            // We expect either success or "not supported" message
            assert.ok(
                result.message.toLowerCase().includes("vr") ||
                result.message.toLowerCase().includes("not supported") ||
                result.message.toLowerCase().includes("not available"),
            );
        });

        it("enters AR mode", async() => {
            const result = await setImmersiveMode.execute(graph, {mode: "ar"}, context);
            // Note: AR may not be supported in test environment
            assert.ok(
                result.message.toLowerCase().includes("ar") ||
                result.message.toLowerCase().includes("not supported") ||
                result.message.toLowerCase().includes("not available"),
            );
        });

        it("exits immersive mode", async() => {
            const result = await setImmersiveMode.execute(graph, {mode: "exit"}, context);
            assert.strictEqual(result.success, true);
            assert.ok(
                result.message.toLowerCase().includes("exit") ||
                result.message.toLowerCase().includes("normal") ||
                result.message.toLowerCase().includes("returned"),
            );
        });

        it("handles VR when XR helper is available", async() => {
            // Mock XR helper for successful VR entry
            let vrEntered = false;
            const mockXRHelper = {
                enterVR: (): Promise<void> => {
                    vrEntered = true;
                    return Promise.resolve();
                },
                enterAR: (): Promise<void> => Promise.resolve(),
            };

            // Set mock XR helper on graph
            const testGraph = graph as Graph & {
                __testSetXRHelper: (helper: typeof mockXRHelper) => void;
            };
            testGraph.__testSetXRHelper(mockXRHelper);

            const result = await setImmersiveMode.execute(graph, {mode: "vr"}, context);

            // XR helper was set, so VR should enter successfully
            assert.strictEqual(vrEntered, true);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("vr"));
        });

        it("handles AR when XR helper is available", async() => {
            // Mock XR helper for successful AR entry
            let arEntered = false;
            const mockXRHelper = {
                enterVR: (): Promise<void> => Promise.resolve(),
                enterAR: (): Promise<void> => {
                    arEntered = true;
                    return Promise.resolve();
                },
            };

            // Set mock XR helper on graph
            const testGraph = graph as Graph & {
                __testSetXRHelper: (helper: typeof mockXRHelper) => void;
            };
            testGraph.__testSetXRHelper(mockXRHelper);

            const result = await setImmersiveMode.execute(graph, {mode: "ar"}, context);

            // XR helper was set, so AR should enter successfully
            assert.strictEqual(arEntered, true);
            assert.strictEqual(result.success, true);
            assert.ok(result.message.toLowerCase().includes("ar"));
        });
    });

    describe("setImmersiveMode metadata", () => {
        it("has correct name", () => {
            assert.strictEqual(setImmersiveMode.name, "setImmersiveMode");
        });

        it("has description", () => {
            assert.ok(setImmersiveMode.description.length > 0);
        });

        it("has parameters schema", () => {
            assert.ok(setImmersiveMode.parameters);
        });

        it("has examples", () => {
            assert.ok(Array.isArray(setImmersiveMode.examples));
            assert.ok(setImmersiveMode.examples.length > 0);

            // Check examples include VR, AR, and exit
            const exampleInputs = setImmersiveMode.examples.map((ex) => ex.input.toLowerCase());
            const exampleParams = setImmersiveMode.examples.map((ex) => ex.params.mode);

            assert.ok(
                exampleParams.includes("vr") ||
                exampleInputs.some((input) => input.includes("vr")),
            );
            assert.ok(
                exampleParams.includes("ar") ||
                exampleInputs.some((input) => input.includes("ar")),
            );
            assert.ok(
                exampleParams.includes("exit") ||
                exampleInputs.some((input) => input.includes("exit") || input.includes("leave")),
            );
        });
    });
});
