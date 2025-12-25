/**
 * API Key Manager Module - Session and persistent storage for API keys.
 * Uses encrypt-storage for AES encryption of persisted keys.
 * @module ai/keys/ApiKeyManager
 */

import {EncryptStorage} from "encrypt-storage";

import type {ProviderType} from "../providers";

/**
 * Configuration options for enabling persistence.
 */
export interface PersistenceConfig {
    /** Encryption key used to encrypt stored API keys (minimum 10 characters) */
    encryptionKey: string;
    /** Storage type: localStorage or sessionStorage */
    storage: "localStorage" | "sessionStorage";
    /** Optional prefix for storage keys (default: "@graphty-ai-keys") */
    prefix?: string;
}

/** Default storage key prefix */
const DEFAULT_STORAGE_PREFIX = "@graphty-ai-keys";

/** Minimum encryption key length required by encrypt-storage */
const MIN_ENCRYPTION_KEY_LENGTH = 10;

/**
 * Manages API keys for LLM providers.
 * Supports both session-only and persistent encrypted storage.
 * Uses encrypt-storage package for AES encryption when persistence is enabled.
 */
export class ApiKeyManager {
    private keys = new Map<ProviderType, string>();
    private persistenceConfig: PersistenceConfig | null = null;
    private encryptStorage: EncryptStorage | null = null;

    /**
     * Enable persistent storage for API keys with AES encryption.
     * @param config - Persistence configuration
     * @throws Error if encryption key is empty or too short (minimum 10 characters)
     */
    enablePersistence(config: PersistenceConfig): void {
        if (!config.encryptionKey || config.encryptionKey.trim().length === 0) {
            throw new Error("Encryption key cannot be empty");
        }

        if (config.encryptionKey.length < MIN_ENCRYPTION_KEY_LENGTH) {
            throw new Error(`Encryption key must be at least ${MIN_ENCRYPTION_KEY_LENGTH} characters`);
        }

        this.persistenceConfig = {
            ... config,
            prefix: config.prefix ?? DEFAULT_STORAGE_PREFIX,
        };

        // Create EncryptStorage instance
        if (typeof window !== "undefined") {
            this.encryptStorage = new EncryptStorage(config.encryptionKey, {
                prefix: this.persistenceConfig.prefix,
                storageType: config.storage,
            });

            // Load any existing persisted keys
            this.loadPersistedKeys();
        }
    }

    /**
     * Disable persistent storage.
     * @param clearStorage - Whether to clear stored keys from storage (default: true)
     */
    disablePersistence(clearStorage = true): void {
        if (clearStorage && this.encryptStorage) {
            this.encryptStorage.removeItem("keys");
        }

        this.persistenceConfig = null;
        this.encryptStorage = null;
    }

    /**
     * Check if persistence is enabled.
     * @returns True if persistence is enabled
     */
    isPersistenceEnabled(): boolean {
        return this.persistenceConfig !== null;
    }

    /**
     * Set an API key for a provider.
     * @param provider - The provider type
     * @param key - The API key
     * @throws Error if key is empty or whitespace-only
     */
    setKey(provider: ProviderType, key: string): void {
        const trimmedKey = key.trim();
        if (trimmedKey.length === 0) {
            throw new Error("API key cannot be empty");
        }

        this.keys.set(provider, trimmedKey);

        // Persist if enabled
        if (this.encryptStorage) {
            this.persistKeys();
        }
    }

    /**
     * Get the API key for a provider.
     * @param provider - The provider type
     * @returns The API key or undefined if not set
     */
    getKey(provider: ProviderType): string | undefined {
        return this.keys.get(provider);
    }

    /**
     * Check if a key is set for a provider.
     * @param provider - The provider type
     * @returns True if a key is set
     */
    hasKey(provider: ProviderType): boolean {
        return this.keys.has(provider);
    }

    /**
     * Remove the API key for a provider.
     * @param provider - The provider type
     */
    removeKey(provider: ProviderType): void {
        this.keys.delete(provider);

        // Update persisted storage
        if (this.encryptStorage) {
            this.persistKeys();
        }
    }

    /**
     * Get a list of providers that have keys configured.
     * @returns Array of provider types with keys
     */
    getConfiguredProviders(): ProviderType[] {
        return Array.from(this.keys.keys());
    }

    /**
     * Clear all stored keys.
     */
    clear(): void {
        this.keys.clear();

        // Clear from storage
        if (this.encryptStorage) {
            this.encryptStorage.removeItem("keys");
        }
    }

    /**
     * Custom toString to avoid exposing keys.
     * @returns String representation without sensitive data
     */
    toString(): string {
        const providers = this.getConfiguredProviders();
        const persistenceStatus = this.isPersistenceEnabled() ? "enabled" : "disabled";
        return `ApiKeyManager(configured: ${providers.join(", ") || "none"}, persistence: ${persistenceStatus})`;
    }

    /**
     * Persist keys to storage with AES encryption via encrypt-storage.
     */
    private persistKeys(): void {
        if (!this.encryptStorage) {
            return;
        }

        const keysObject: Record<string, string> = {};
        for (const [provider, key] of this.keys) {
            keysObject[provider] = key;
        }

        this.encryptStorage.setItem("keys", keysObject);
    }

    /**
     * Load persisted keys from storage.
     */
    private loadPersistedKeys(): void {
        if (!this.encryptStorage) {
            return;
        }

        try {
            const keysObject = this.encryptStorage.getItem<Record<string, string>>("keys");

            if (keysObject && typeof keysObject === "object") {
                for (const [provider, key] of Object.entries(keysObject)) {
                    this.keys.set(provider as ProviderType, key);
                }
            }
        } catch {
            // Failed to decrypt or parse - likely wrong encryption key or corrupted data
            // Silently ignore and start fresh
            this.keys.clear();
        }
    }
}
