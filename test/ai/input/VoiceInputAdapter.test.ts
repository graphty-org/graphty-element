/**
 * VoiceInputAdapter Tests - Tests for voice input adapter.
 * @module test/ai/input/VoiceInputAdapter.test
 */

import {assert, beforeEach, describe, it, vi} from "vitest";

import type {InputCallback, InputOptions} from "../../../src/ai/input/types";
import {VoiceInputAdapter} from "../../../src/ai/input/VoiceInputAdapter";

describe("VoiceInputAdapter", () => {
    let adapter: VoiceInputAdapter;

    beforeEach(() => {
        adapter = new VoiceInputAdapter();
    });

    describe("initialization", () => {
        it("detects browser support", () => {
            assert.strictEqual(typeof adapter.isSupported, "boolean");
        });

        it("has type 'voice'", () => {
            assert.strictEqual(adapter.type, "voice");
        });

        it("starts inactive", () => {
            assert.strictEqual(adapter.isActive, false);
        });
    });

    describe("unsupported browser handling", () => {
        it("handles unsupported gracefully", () => {
            // When Web Speech API is not supported
            if (!adapter.isSupported) {
                // Should not throw
                adapter.start();
                assert.strictEqual(adapter.isActive, false);
            }
        });

        it("stop does not throw when unsupported", () => {
            if (!adapter.isSupported) {
                // Should not throw
                adapter.stop();
                assert.strictEqual(adapter.isActive, false);
            }
        });
    });

    describe("callback registration", () => {
        it("can register input callback", () => {
            const callback: InputCallback = vi.fn();
            // Should not throw
            adapter.onInput(callback);
        });

        it("can register multiple callbacks", () => {
            const callback1: InputCallback = vi.fn();
            const callback2: InputCallback = vi.fn();
            // Should not throw
            adapter.onInput(callback1);
            adapter.onInput(callback2);
        });
    });

    describe("start/stop lifecycle", () => {
        it("start sets isActive to true when supported", () => {
            if (adapter.isSupported) {
                adapter.start();
                assert.strictEqual(adapter.isActive, true);
            }
        });

        it("stop sets isActive to false", () => {
            if (adapter.isSupported) {
                adapter.start();
                adapter.stop();
                assert.strictEqual(adapter.isActive, false);
            }
        });

        it("accepts options on start", () => {
            const options: InputOptions = {
                continuous: true,
                interimResults: true,
                language: "en-US",
            };
            // Should not throw
            adapter.start(options);
        });
    });

    describe("dispose", () => {
        it("disposes cleanly", () => {
            adapter.onInput(vi.fn());
            adapter.dispose();
            assert.strictEqual(adapter.isActive, false);
        });

        it("can be disposed multiple times", () => {
            adapter.dispose();
            adapter.dispose();
            // Should not throw
        });
    });
});
