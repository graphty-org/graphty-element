/**
 * TextInputAdapter Tests - Tests for text input adapter.
 * @module test/ai/input/TextInputAdapter.test
 */

import {assert, beforeEach, describe, it, vi} from "vitest";

import {TextInputAdapter} from "../../../src/ai/input/TextInputAdapter";
import type {InputCallback} from "../../../src/ai/input/types";

describe("TextInputAdapter", () => {
    let adapter: TextInputAdapter;

    beforeEach(() => {
        adapter = new TextInputAdapter();
    });

    describe("initialization", () => {
        it("has type 'text'", () => {
            assert.strictEqual(adapter.type, "text");
        });

        it("is always supported", () => {
            assert.strictEqual(adapter.isSupported, true);
        });

        it("starts inactive", () => {
            assert.strictEqual(adapter.isActive, false);
        });
    });

    describe("callback registration", () => {
        it("can register input callback", () => {
            const callback: InputCallback = vi.fn();
            adapter.onInput(callback);
        });

        it("can register multiple callbacks", () => {
            const callback1: InputCallback = vi.fn();
            const callback2: InputCallback = vi.fn();
            adapter.onInput(callback1);
            adapter.onInput(callback2);
        });
    });

    describe("start/stop lifecycle", () => {
        it("start sets isActive to true", () => {
            adapter.start();
            assert.strictEqual(adapter.isActive, true);
        });

        it("stop sets isActive to false", () => {
            adapter.start();
            adapter.stop();
            assert.strictEqual(adapter.isActive, false);
        });
    });

    describe("input submission", () => {
        it("submitInput calls registered callback with final text", () => {
            const callback = vi.fn<InputCallback>();
            adapter.onInput(callback);
            adapter.start();

            adapter.submitInput("test input");

            assert.strictEqual(callback.mock.calls.length, 1);
            assert.strictEqual(callback.mock.calls[0][0], "test input");
            assert.strictEqual(callback.mock.calls[0][1], true); // isFinal
        });

        it("submitInput does not call callback when not active", () => {
            const callback = vi.fn<InputCallback>();
            adapter.onInput(callback);
            // Not started

            adapter.submitInput("test input");

            assert.strictEqual(callback.mock.calls.length, 0);
        });

        it("submitInterim calls callback with interim text", () => {
            const callback = vi.fn<InputCallback>();
            adapter.onInput(callback);
            adapter.start();

            adapter.submitInterim("partial te");

            assert.strictEqual(callback.mock.calls.length, 1);
            assert.strictEqual(callback.mock.calls[0][0], "partial te");
            assert.strictEqual(callback.mock.calls[0][1], false); // not final
        });

        it("calls multiple callbacks", () => {
            const callback1 = vi.fn<InputCallback>();
            const callback2 = vi.fn<InputCallback>();
            adapter.onInput(callback1);
            adapter.onInput(callback2);
            adapter.start();

            adapter.submitInput("test");

            assert.strictEqual(callback1.mock.calls.length, 1);
            assert.strictEqual(callback2.mock.calls.length, 1);
        });
    });

    describe("dispose", () => {
        it("disposes cleanly", () => {
            adapter.onInput(vi.fn());
            adapter.start();
            adapter.dispose();
            assert.strictEqual(adapter.isActive, false);
        });

        it("callbacks not called after dispose", () => {
            const callback = vi.fn<InputCallback>();
            adapter.onInput(callback);
            adapter.start();
            adapter.dispose();

            adapter.submitInput("test");

            assert.strictEqual(callback.mock.calls.length, 0);
        });
    });
});
