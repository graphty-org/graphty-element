/**
 * AiManager Key Persistence Tests - Tests for key persistence via AiManager config.
 * @module test/ai/AiManager.keyPersistence.test
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {AiManager} from "../../../src/ai/AiManager";
import {ApiKeyManager} from "../../../src/ai/keys";
import type {Graph} from "../../../src/Graph";
import {createMockGraphContext} from "../../helpers/mock-graph-context";

describe("AiManager key persistence", () => {
    let mockGraph: Graph;
    let testPrefix: string;

    beforeEach(() => {
        mockGraph = createMockGraphContext({nodeCount: 10, edgeCount: 15});
        // Generate unique prefix for each test
        testPrefix = `@graphty-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        // Clear any existing test data
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        // Clean up storage after each test
        localStorage.clear();
        sessionStorage.clear();
    });

    describe("default behavior", () => {
        it("should not enable persistence by default", () => {
            const manager = new AiManager();
            manager.init(mockGraph, {provider: "mock"});

            const keyManager = manager.getApiKeyManager();
            assert.strictEqual(keyManager.isPersistenceEnabled(), false);

            manager.dispose();
        });
    });

    describe("persistence configuration", () => {
        it("should enable persistence when configured", () => {
            const manager = new AiManager();
            manager.init(mockGraph, {
                provider: "mock",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    prefix: testPrefix,
                },
            });

            const keyManager = manager.getApiKeyManager();
            assert.strictEqual(keyManager.isPersistenceEnabled(), true);

            manager.dispose();
        });

        it("should persist API key when persistence enabled", () => {
            const manager = new AiManager();
            manager.init(mockGraph, {
                provider: "openai",
                apiKey: "sk-test-key-12345",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    storage: "localStorage",
                    prefix: testPrefix,
                },
            });

            const keyManager = manager.getApiKeyManager();
            assert.strictEqual(keyManager.hasKey("openai"), true);
            assert.strictEqual(keyManager.getKey("openai"), "sk-test-key-12345");

            manager.dispose();
        });

        it("should use sessionStorage when specified", () => {
            const manager = new AiManager();
            manager.init(mockGraph, {
                provider: "openai",
                apiKey: "sk-session-test",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    storage: "sessionStorage",
                    prefix: testPrefix,
                },
            });

            // Check that key is stored in sessionStorage (encrypted)
            const storedValue = sessionStorage.getItem(`${testPrefix}:keys`);
            assert.ok(storedValue !== null, "key should be stored in sessionStorage");

            // Verify localStorage is empty for this prefix
            const localValue = localStorage.getItem(`${testPrefix}:keys`);
            assert.strictEqual(localValue, null, "localStorage should not have key");

            manager.dispose();
        });

        it("should use custom storage prefix", () => {
            const customPrefix = "@my-custom-app-prefix";
            const manager = new AiManager();
            manager.init(mockGraph, {
                provider: "openai",
                apiKey: "sk-prefixed-key",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    prefix: customPrefix,
                },
            });

            // Verify prefix is used
            const storedValue = localStorage.getItem(`${customPrefix}:keys`);
            assert.ok(storedValue !== null, "key should use custom prefix");

            manager.dispose();
        });

        it("should not enable persistence when enabled is false", () => {
            const manager = new AiManager();
            manager.init(mockGraph, {
                provider: "mock",
                keyPersistence: {
                    enabled: false,
                    encryptionKey: "test-secret-key-long",
                    prefix: testPrefix,
                },
            });

            const keyManager = manager.getApiKeyManager();
            assert.strictEqual(keyManager.isPersistenceEnabled(), false);

            manager.dispose();
        });
    });

    describe("cross-instance persistence", () => {
        it("should load persisted keys on re-init", () => {
            // First init with persistence - save a key
            const manager1 = new AiManager();
            manager1.init(mockGraph, {
                provider: "openai",
                apiKey: "sk-persisted-key",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    prefix: testPrefix,
                },
            });
            manager1.dispose();

            // Second init should load persisted key (without providing apiKey)
            const manager2 = new AiManager();
            manager2.init(mockGraph, {
                provider: "openai",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    prefix: testPrefix,
                },
            });

            const keyManager = manager2.getApiKeyManager();
            assert.strictEqual(keyManager.getKey("openai"), "sk-persisted-key");

            manager2.dispose();
        });

        it("should not decrypt with wrong encryption key", () => {
            // Save with one key
            const manager1 = new AiManager();
            manager1.init(mockGraph, {
                provider: "openai",
                apiKey: "sk-secret-key-value",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "correct-key-long-enough",
                    prefix: testPrefix,
                },
            });
            manager1.dispose();

            // Try to load with wrong key
            const manager2 = new AiManager();
            manager2.init(mockGraph, {
                provider: "openai",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "wrong-key-long-enough-xx",
                    prefix: testPrefix,
                },
            });

            const keyManager = manager2.getApiKeyManager();
            // Should not have the key (decryption failed silently)
            assert.strictEqual(keyManager.hasKey("openai"), false);

            manager2.dispose();
        });
    });

    describe("getApiKeyManager method", () => {
        it("should expose ApiKeyManager via getter", () => {
            const manager = new AiManager();
            manager.init(mockGraph, {provider: "mock"});

            const keyManager = manager.getApiKeyManager();
            assert.ok(keyManager instanceof ApiKeyManager);

            manager.dispose();
        });

        it("should return the same instance on multiple calls", () => {
            const manager = new AiManager();
            manager.init(mockGraph, {provider: "mock"});

            const keyManager1 = manager.getApiKeyManager();
            const keyManager2 = manager.getApiKeyManager();
            assert.strictEqual(keyManager1, keyManager2);

            manager.dispose();
        });
    });
});
