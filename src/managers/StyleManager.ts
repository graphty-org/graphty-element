import type {CalculatedValue} from "../CalculatedValue";
import type {AdHocData, EdgeStyleConfig, NodeStyleConfig, StyleLayerType} from "../config";
import {type EdgeStyleId, type NodeStyleId, Styles} from "../Styles";
import type {EventManager} from "./EventManager";
import type {Manager} from "./interfaces";

/**
 * Manages graph styling, wrapping the Styles class with additional caching
 * and event-driven updates.
 */
export class StyleManager implements Manager {
    private styles: Styles;
    private nodeStyleCache = new Map<string, NodeStyleId>();
    private edgeStyleCache = new Map<string, EdgeStyleId>();
    private cacheEnabled = true;

    /**
     * Creates a new style manager
     * @param eventManager - Event manager for emitting style events
     * @param styles - Optional initial styles configuration
     */
    constructor(
        private eventManager: EventManager,
        styles?: Styles,
    ) {
        // Initialize with provided styles or create default
        this.styles = styles ?? Styles.default();

        // Listen for style change events
        // TODO: "style-changed" is a custom event type, not in the standard EventType enum
        // We use the graph observable directly for now
        // TODO: Add proper event type when EventManager is extended
    }

    /**
     * Initialize the style manager
     */
    async init(): Promise<void> {
        // No async initialization needed
    }

    /**
     * Dispose the style manager and clear caches
     */
    dispose(): void {
        this.clearCache();
    }

    /**
     * Get the underlying Styles instance
     * @returns The Styles instance
     */
    getStyles(): Styles {
        return this.styles;
    }

    /**
     * Get style ID for a node, with caching
     * @param data - Node data for style matching
     * @param algorithmResults - Optional algorithm results for style matching
     * @returns The computed node style ID
     */
    getStyleForNode(data: AdHocData, algorithmResults?: AdHocData): NodeStyleId {
        if (!this.cacheEnabled) {
            return this.styles.getStyleForNode(data, algorithmResults);
        }

        const cacheKey = this.createCacheKey(data, algorithmResults);
        const cached = this.nodeStyleCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        const styleId = this.styles.getStyleForNode(data, algorithmResults);
        this.nodeStyleCache.set(cacheKey, styleId);
        return styleId;
    }

    /**
     * Get calculated styles for a node
     * @param data - Node data
     * @returns Array of calculated values for this node
     */
    getCalculatedStylesForNode(data: AdHocData): CalculatedValue[] {
        // No caching for calculated styles as they may change frequently
        return this.styles.getCalculatedStylesForNode(data);
    }

    /**
     * Get style ID for an edge, with caching
     * @param data - Edge data for style matching
     * @param algorithmResults - Optional algorithm results for style matching
     * @returns The computed edge style ID
     */
    getStyleForEdge(data: AdHocData, algorithmResults?: AdHocData): EdgeStyleId {
        if (!this.cacheEnabled) {
            return this.styles.getStyleForEdge(data, algorithmResults);
        }

        const cacheKey = this.createCacheKey(data, algorithmResults);
        const cached = this.edgeStyleCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        const styleId = this.styles.getStyleForEdge(data, algorithmResults);
        this.edgeStyleCache.set(cacheKey, styleId);
        return styleId;
    }

    /**
     * Get node style configuration by ID
     * @param id - The node style ID
     * @returns Node style configuration
     */
    static getStyleForNodeStyleId(id: NodeStyleId): NodeStyleConfig {
        return Styles.getStyleForNodeStyleId(id);
    }

    /**
     * Get edge style configuration by ID
     * @param id - The edge style ID
     * @returns Edge style configuration
     */
    static getStyleForEdgeStyleId(id: EdgeStyleId): EdgeStyleConfig {
        return Styles.getStyleForEdgeStyleId(id);
    }

    /**
     * Add a new style layer
     * @param layer - The style layer to add
     */
    addLayer(layer: StyleLayerType): void {
        this.styles.addLayer(layer);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Insert a style layer at a specific position
     * @param position - Position to insert at (0-based index)
     * @param layer - The style layer to insert
     */
    insertLayer(position: number, layer: StyleLayerType): void {
        this.styles.insertLayer(position, layer);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Remove style layers matching a metadata predicate
     * @param predicate - Function to test layer metadata
     */
    removeLayersByMetadata(predicate: (metadata: unknown) => boolean): void {
        const removed = this.styles.removeLayersByMetadata(predicate);
        if (removed) {
            this.clearCache();
            this.eventManager.emitGraphEvent("style-changed", {});
        }
    }

    /**
     * Load styles from an object
     * @param obj - Object containing style configuration
     */
    loadStylesFromObject(obj: object): void {
        this.styles = Styles.fromObject(obj);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Load styles from a URL
     * @param url - URL to load styles from
     */
    async loadStylesFromUrl(url: string): Promise<void> {
        this.styles = await Styles.fromUrl(url);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Update the styles configuration
     * @param newStyles - New Styles instance to use
     */
    updateStyles(newStyles: Styles): void {
        this.styles = newStyles;
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Clear the style cache
     */
    clearCache(): void {
        this.nodeStyleCache.clear();
        this.edgeStyleCache.clear();
    }

    /**
     * Enable or disable caching
     * @param enabled - Whether to enable caching
     */
    setCacheEnabled(enabled: boolean): void {
        this.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
    }

    /**
     * Create a cache key from node/edge data and algorithmResults
     * This is a simple implementation - could be optimized
     * @param data - Node or edge data
     * @param algorithmResults - Optional algorithm results
     * @returns String cache key
     */
    private createCacheKey(data: AdHocData, algorithmResults?: AdHocData): string {
        // Use JSON stringify for now - could be optimized with a hash function
        if (algorithmResults) {
            return JSON.stringify({data, algorithmResults});
        }

        return JSON.stringify(data);
    }
}
