import {assert, beforeEach, describe, it} from "vitest";

import {type AiStatus, AiStatusManager, type ToolCallStatus} from "../../src/ai/AiStatus";

describe("AiStatusManager", () => {
    let manager: AiStatusManager;

    beforeEach(() => {
        manager = new AiStatusManager();
    });

    describe("initialization", () => {
        it("starts in ready state", () => {
            assert.strictEqual(manager.current.state, "ready");
            assert.strictEqual(manager.current.canCancel, false);
        });

        it("has undefined optional fields initially", () => {
            assert.strictEqual(manager.current.startTime, undefined);
            assert.strictEqual(manager.current.elapsed, undefined);
            assert.strictEqual(manager.current.stage, undefined);
            assert.strictEqual(manager.current.stageMessage, undefined);
            assert.strictEqual(manager.current.streamedText, undefined);
            assert.strictEqual(manager.current.toolCalls, undefined);
            assert.strictEqual(manager.current.error, undefined);
            assert.strictEqual(manager.current.canRetry, undefined);
        });
    });

    describe("submit", () => {
        it("transitions from ready to submitted", () => {
            manager.submit();
            assert.strictEqual(manager.current.state, "submitted");
        });

        it("sets startTime on submit", () => {
            const before = Date.now();

            manager.submit();
            const after = Date.now();

            assert.ok(manager.current.startTime !== undefined);
            assert.ok(manager.current.startTime >= before);
            assert.ok(manager.current.startTime <= after);
        });

        it("sets canCancel to true", () => {
            manager.submit();
            assert.strictEqual(manager.current.canCancel, true);
        });

        it("clears previous error state", () => {
            manager.setError(new Error("previous error"), true);
            manager.submit();
            assert.strictEqual(manager.current.state, "submitted");
            assert.strictEqual(manager.current.error, undefined);
            assert.strictEqual(manager.current.canRetry, undefined);
        });
    });

    describe("updateElapsed", () => {
        it("tracks elapsed time", () => {
            manager.submit();
            // Add a small delay to ensure measurable elapsed time
            manager.updateElapsed();
            assert.ok(manager.current.elapsed !== undefined);
            assert.ok(manager.current.elapsed >= 0);
        });

        it("calculates correct elapsed time", async() => {
            manager.submit();
            await new Promise((resolve) => setTimeout(resolve, 50));
            manager.updateElapsed();

            assert.ok(manager.current.elapsed !== undefined);
            assert.ok(manager.current.elapsed >= 45, `Expected at least 45ms, got ${manager.current.elapsed}ms`);
        });
    });

    describe("setStage", () => {
        it("tracks stage and stageMessage", () => {
            manager.submit();
            manager.setStage("processing", "Analyzing graph structure...");
            assert.strictEqual(manager.current.stage, "processing");
            assert.strictEqual(manager.current.stageMessage, "Analyzing graph structure...");
        });

        it("can update stage multiple times", () => {
            manager.submit();
            manager.setStage("processing", "Starting...");
            manager.setStage("generating", "Generating response...");
            assert.strictEqual(manager.current.stage, "generating");
            assert.strictEqual(manager.current.stageMessage, "Generating response...");
        });
    });

    describe("streaming", () => {
        it("transitions to streaming state", () => {
            manager.submit();
            manager.startStreaming();
            assert.strictEqual(manager.current.state, "streaming");
        });

        it("canCancel is true during streaming", () => {
            manager.submit();
            manager.startStreaming();
            assert.strictEqual(manager.current.canCancel, true);
        });

        it("initializes streamedText as empty string", () => {
            manager.submit();
            manager.startStreaming();
            assert.strictEqual(manager.current.streamedText, "");
        });
    });

    describe("appendStreamedText", () => {
        it("accumulates streamed text", () => {
            manager.submit();
            manager.startStreaming();
            manager.appendStreamedText("Hello ");
            manager.appendStreamedText("world");
            assert.strictEqual(manager.current.streamedText, "Hello world");
        });

        it("handles empty appends", () => {
            manager.submit();
            manager.startStreaming();
            manager.appendStreamedText("Hello");
            manager.appendStreamedText("");
            manager.appendStreamedText(" world");
            assert.strictEqual(manager.current.streamedText, "Hello world");
        });
    });

    describe("tool calls", () => {
        it("tracks tool call status", () => {
            manager.submit();
            manager.startStreaming();
            manager.addToolCall("findAndStyleNodes");
            assert.strictEqual(manager.current.toolCalls?.length, 1);
            assert.strictEqual(manager.current.toolCalls?.[0].name, "findAndStyleNodes");
            assert.strictEqual(manager.current.toolCalls?.[0].status, "pending");
        });

        it("updates tool call status to executing", () => {
            manager.submit();
            manager.startStreaming();
            manager.addToolCall("findAndStyleNodes");
            manager.updateToolCallStatus("findAndStyleNodes", "executing");
            assert.strictEqual(manager.current.toolCalls?.[0].status, "executing");
        });

        it("updates tool call status to complete with result", () => {
            manager.submit();
            manager.startStreaming();
            manager.addToolCall("findAndStyleNodes");
            manager.updateToolCallStatus("findAndStyleNodes", "complete", {affectedNodes: 12});
            assert.strictEqual(manager.current.toolCalls?.[0].status, "complete");
            assert.deepStrictEqual(manager.current.toolCalls?.[0].result, {affectedNodes: 12});
        });

        it("updates tool call status to error", () => {
            manager.submit();
            manager.startStreaming();
            manager.addToolCall("findAndStyleNodes");
            manager.updateToolCallStatus("findAndStyleNodes", "error", {error: "Tool failed"});
            assert.strictEqual(manager.current.toolCalls?.[0].status, "error");
            assert.deepStrictEqual(manager.current.toolCalls?.[0].result, {error: "Tool failed"});
        });

        it("tracks multiple tool calls", () => {
            manager.submit();
            manager.startStreaming();
            manager.addToolCall("setLayout");
            manager.addToolCall("zoomToFit");
            assert.strictEqual(manager.current.toolCalls?.length, 2);
            assert.strictEqual(manager.current.toolCalls?.[0].name, "setLayout");
            assert.strictEqual(manager.current.toolCalls?.[1].name, "zoomToFit");
        });

        it("handles non-existent tool call update gracefully", () => {
            manager.submit();
            manager.startStreaming();
            manager.addToolCall("existingTool");
            // Should not throw, just ignore
            manager.updateToolCallStatus("nonExistentTool", "executing");
            assert.strictEqual(manager.current.toolCalls?.[0].status, "pending");
        });
    });

    describe("executing state", () => {
        it("transitions to executing state", () => {
            manager.submit();
            manager.startStreaming();
            manager.startExecuting();
            assert.strictEqual(manager.current.state, "executing");
        });

        it("canCancel remains true during execution", () => {
            manager.submit();
            manager.startStreaming();
            manager.startExecuting();
            assert.strictEqual(manager.current.canCancel, true);
        });
    });

    describe("complete", () => {
        it("transitions back to ready state", () => {
            manager.submit();
            manager.startStreaming();
            manager.startExecuting();
            manager.complete();
            assert.strictEqual(manager.current.state, "ready");
        });

        it("resets canCancel to false", () => {
            manager.submit();
            manager.startStreaming();
            manager.complete();
            assert.strictEqual(manager.current.canCancel, false);
        });

        it("preserves streamedText after completion", () => {
            manager.submit();
            manager.startStreaming();
            manager.appendStreamedText("Final response");
            manager.complete();
            assert.strictEqual(manager.current.streamedText, "Final response");
        });
    });

    describe("error handling", () => {
        it("can transition to error from ready state", () => {
            manager.setError(new Error("ready error"), true);
            assert.strictEqual(manager.current.state, "error");
            assert.strictEqual(manager.current.error?.message, "ready error");
            assert.strictEqual(manager.current.canRetry, true);
        });

        it("can transition to error from submitted state", () => {
            manager.submit();
            manager.setError(new Error("submitted error"), false);
            assert.strictEqual(manager.current.state, "error");
            assert.strictEqual(manager.current.canRetry, false);
        });

        it("can transition to error from streaming state", () => {
            manager.submit();
            manager.startStreaming();
            manager.setError(new Error("streaming error"), true);
            assert.strictEqual(manager.current.state, "error");
        });

        it("can transition to error from executing state", () => {
            manager.submit();
            manager.startStreaming();
            manager.startExecuting();
            manager.setError(new Error("execution error"), true);
            assert.strictEqual(manager.current.state, "error");
        });

        it("sets canCancel to false on error", () => {
            manager.submit();
            manager.setError(new Error("test error"), true);
            assert.strictEqual(manager.current.canCancel, false);
        });
    });

    describe("full lifecycle", () => {
        it("transitions through complete lifecycle", () => {
            // Start
            assert.strictEqual(manager.current.state, "ready");

            // Submit
            manager.submit();
            assert.strictEqual(manager.current.state, "submitted");
            assert.strictEqual(manager.current.canCancel, true);

            // Start streaming
            manager.startStreaming();
            assert.strictEqual(manager.current.state, "streaming");
            assert.strictEqual(manager.current.canCancel, true);

            // Stream some text
            manager.appendStreamedText("Processing...");

            // Add tool call
            manager.addToolCall("testTool");

            // Start executing
            manager.startExecuting();
            assert.strictEqual(manager.current.state, "executing");

            // Complete tool call
            manager.updateToolCallStatus("testTool", "complete", {result: "success"});

            // Complete
            manager.complete();
            assert.strictEqual(manager.current.state, "ready");
            assert.strictEqual(manager.current.canCancel, false);
        });
    });

    describe("subscribe", () => {
        it("notifies listeners on state change", () => {
            const states: string[] = [];

            manager.subscribe((s) => states.push(s.state));

            manager.submit();
            manager.startStreaming();
            manager.complete();

            assert.deepStrictEqual(states, ["submitted", "streaming", "ready"]);
        });

        it("returns unsubscribe function", () => {
            const states: string[] = [];
            const unsubscribe = manager.subscribe((s) => states.push(s.state));

            manager.submit();
            unsubscribe();
            manager.startStreaming();

            assert.deepStrictEqual(states, ["submitted"]);
        });

        it("notifies on error", () => {
            const statuses: AiStatus[] = [];

            manager.subscribe((s) => statuses.push({... s}));

            manager.setError(new Error("test error"), true);

            assert.strictEqual(statuses.length, 1);
            assert.strictEqual(statuses[0].state, "error");
            assert.strictEqual(statuses[0].error?.message, "test error");
        });

        it("notifies on streamed text updates", () => {
            let updateCount = 0;

            manager.subscribe(() => {
                updateCount++;
            });

            manager.submit();
            manager.startStreaming();
            manager.appendStreamedText("Hello");
            manager.appendStreamedText(" world");

            // submit + streaming + 2 text appends = 4 updates
            assert.strictEqual(updateCount, 4);
        });
    });

    describe("reset", () => {
        it("resets all state to initial", () => {
            manager.submit();
            manager.startStreaming();
            manager.appendStreamedText("Some text");
            manager.addToolCall("tool");
            manager.setStage("processing", "message");

            manager.reset();

            assert.strictEqual(manager.current.state, "ready");
            assert.strictEqual(manager.current.canCancel, false);
            assert.strictEqual(manager.current.startTime, undefined);
            assert.strictEqual(manager.current.elapsed, undefined);
            assert.strictEqual(manager.current.stage, undefined);
            assert.strictEqual(manager.current.stageMessage, undefined);
            assert.strictEqual(manager.current.streamedText, undefined);
            assert.strictEqual(manager.current.toolCalls, undefined);
            assert.strictEqual(manager.current.error, undefined);
            assert.strictEqual(manager.current.canRetry, undefined);
        });

        it("notifies listeners on reset", () => {
            const states: string[] = [];

            manager.subscribe((s) => states.push(s.state));

            manager.submit();
            manager.reset();

            assert.strictEqual(states[states.length - 1], "ready");
        });
    });

    describe("getSnapshot", () => {
        it("returns a copy of current state", () => {
            manager.submit();
            const snapshot = manager.getSnapshot();

            // Modify the snapshot
            (snapshot as {state: string}).state = "modified";

            // Original should be unchanged
            assert.strictEqual(manager.current.state, "submitted");
        });
    });

    describe("edge cases", () => {
        it("handles rapid state transitions", () => {
            manager.submit();
            manager.startStreaming();
            manager.appendStreamedText("a");
            manager.appendStreamedText("b");
            manager.appendStreamedText("c");
            manager.startExecuting();
            manager.complete();

            assert.strictEqual(manager.current.state, "ready");
            assert.strictEqual(manager.current.streamedText, "abc");
        });

        it("handles transition from error back to ready via submit", () => {
            manager.setError(new Error("error"), true);
            assert.strictEqual(manager.current.state, "error");

            manager.submit();
            assert.strictEqual(manager.current.state, "submitted");
            assert.strictEqual(manager.current.error, undefined);
        });
    });
});

describe("ToolCallStatus type", () => {
    it("has correct structure", () => {
        const status: ToolCallStatus = {
            name: "testTool",
            status: "pending",
        };

        assert.strictEqual(status.name, "testTool");
        assert.strictEqual(status.status, "pending");
        assert.strictEqual(status.result, undefined);
    });

    it("supports result field", () => {
        const status: ToolCallStatus = {
            name: "testTool",
            status: "complete",
            result: {data: "value"},
        };

        assert.deepStrictEqual(status.result, {data: "value"});
    });
});
