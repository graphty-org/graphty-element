import {assert, beforeEach, describe, it} from "vitest";

import {ApiKeyManager} from "../../../src/ai/keys/ApiKeyManager";

describe("ApiKeyManager", () => {
    let manager: ApiKeyManager;

    beforeEach(() => {
        manager = new ApiKeyManager();
    });

    describe("session storage", () => {
        it("stores and retrieves a key", () => {
            manager.setKey("openai", "sk-test-key");
            assert.strictEqual(manager.getKey("openai"), "sk-test-key");
        });

        it("stores keys for different providers", () => {
            manager.setKey("openai", "sk-openai");
            manager.setKey("anthropic", "sk-anthropic");
            manager.setKey("google", "google-key");

            assert.strictEqual(manager.getKey("openai"), "sk-openai");
            assert.strictEqual(manager.getKey("anthropic"), "sk-anthropic");
            assert.strictEqual(manager.getKey("google"), "google-key");
        });

        it("returns undefined for unset key", () => {
            assert.strictEqual(manager.getKey("openai"), undefined);
        });

        it("overwrites existing key", () => {
            manager.setKey("openai", "old-key");
            manager.setKey("openai", "new-key");
            assert.strictEqual(manager.getKey("openai"), "new-key");
        });
    });

    describe("hasKey", () => {
        it("returns true when key is set", () => {
            manager.setKey("openai", "sk-test");
            assert.strictEqual(manager.hasKey("openai"), true);
        });

        it("returns false when key is not set", () => {
            assert.strictEqual(manager.hasKey("openai"), false);
        });

        it("returns false after key is removed", () => {
            manager.setKey("openai", "sk-test");
            manager.removeKey("openai");
            assert.strictEqual(manager.hasKey("openai"), false);
        });
    });

    describe("removeKey", () => {
        it("removes a stored key", () => {
            manager.setKey("openai", "sk-test");
            manager.removeKey("openai");
            assert.strictEqual(manager.getKey("openai"), undefined);
        });

        it("does nothing for non-existent key", () => {
            // Should not throw - using a valid provider type that hasn't had a key set
            manager.removeKey("openai");
        });
    });

    describe("getConfiguredProviders", () => {
        it("returns empty array when no keys set", () => {
            const providers = manager.getConfiguredProviders();
            assert.deepStrictEqual(providers, []);
        });

        it("returns providers with keys", () => {
            manager.setKey("openai", "sk-openai");
            manager.setKey("google", "google-key");

            const providers = manager.getConfiguredProviders();
            assert.ok(providers.includes("openai"));
            assert.ok(providers.includes("google"));
            assert.strictEqual(providers.length, 2);
        });

        it("excludes removed providers", () => {
            manager.setKey("openai", "sk-openai");
            manager.setKey("anthropic", "sk-anthropic");
            manager.removeKey("anthropic");

            const providers = manager.getConfiguredProviders();
            assert.ok(providers.includes("openai"));
            assert.ok(!providers.includes("anthropic"));
        });
    });

    describe("clear", () => {
        it("removes all stored keys", () => {
            manager.setKey("openai", "sk-openai");
            manager.setKey("anthropic", "sk-anthropic");
            manager.setKey("google", "google-key");

            manager.clear();

            assert.strictEqual(manager.getKey("openai"), undefined);
            assert.strictEqual(manager.getKey("anthropic"), undefined);
            assert.strictEqual(manager.getKey("google"), undefined);
        });
    });

    describe("type safety", () => {
        it("accepts valid provider types", () => {
            // These should all work without type errors
            manager.setKey("openai", "key1");
            manager.setKey("anthropic", "key2");
            manager.setKey("google", "key3");
            manager.setKey("mock", "key4");

            assert.ok(manager.hasKey("openai"));
            assert.ok(manager.hasKey("anthropic"));
            assert.ok(manager.hasKey("google"));
            assert.ok(manager.hasKey("mock"));
        });
    });

    describe("key validation", () => {
        it("rejects empty string keys", () => {
            assert.throws(() => {
                manager.setKey("openai", "");
            }, /empty/i);
        });

        it("rejects whitespace-only keys", () => {
            assert.throws(() => {
                manager.setKey("openai", "   ");
            }, /empty/i);
        });

        it("accepts keys with leading/trailing whitespace (trims them)", () => {
            manager.setKey("openai", "  sk-test  ");
            assert.strictEqual(manager.getKey("openai"), "sk-test");
        });
    });

    describe("security considerations", () => {
        it("keys are not exposed in toString", () => {
            manager.setKey("openai", "sk-secret-key");
            const str = String(manager);
            assert.ok(!str.includes("sk-secret-key"));
        });
    });
});
