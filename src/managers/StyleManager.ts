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

    async init(): Promise<void> {
        // No async initialization needed
    }

    dispose(): void {
        this.clearCache();
    }

    /**
     * Get the underlying Styles instance
     */
    getStyles(): Styles {
        return this.styles;
    }

    /**
     * Get style ID for a node, with caching
     */
    getStyleForNode(data: AdHocData): NodeStyleId {
        if (!this.cacheEnabled) {
            return this.styles.getStyleForNode(data);
        }

        const cacheKey = this.createCacheKey(data);
        const cached = this.nodeStyleCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        const styleId = this.styles.getStyleForNode(data);
        this.nodeStyleCache.set(cacheKey, styleId);
        return styleId;
    }

    /**
     * Get calculated styles for a node
     */
    getCalculatedStylesForNode(data: AdHocData): CalculatedValue[] {
        // No caching for calculated styles as they may change frequently
        return this.styles.getCalculatedStylesForNode(data);
    }

    /**
     * Get style ID for an edge, with caching
     */
    getStyleForEdge(data: AdHocData): EdgeStyleId {
        if (!this.cacheEnabled) {
            return this.styles.getStyleForEdge(data);
        }

        const cacheKey = this.createCacheKey(data);
        const cached = this.edgeStyleCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }

        const styleId = this.styles.getStyleForEdge(data);
        this.edgeStyleCache.set(cacheKey, styleId);
        return styleId;
    }

    /**
     * Get node style configuration by ID
     */
    static getStyleForNodeStyleId(id: NodeStyleId): NodeStyleConfig {
        return Styles.getStyleForNodeStyleId(id);
    }

    /**
     * Get edge style configuration by ID
     */
    static getStyleForEdgeStyleId(id: EdgeStyleId): EdgeStyleConfig {
        return Styles.getStyleForEdgeStyleId(id);
    }

    /**
     * Add a new style layer
     */
    addLayer(layer: StyleLayerType): void {
        this.styles.addLayer(layer);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Insert a style layer at a specific position
     */
    insertLayer(position: number, layer: StyleLayerType): void {
        this.styles.insertLayer(position, layer);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Load styles from an object
     */
    loadStylesFromObject(obj: object): void {
        this.styles = Styles.fromObject(obj);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Load styles from a URL
     */
    async loadStylesFromUrl(url: string): Promise<void> {
        this.styles = await Styles.fromUrl(url);
        this.clearCache();
        this.eventManager.emitGraphEvent("style-changed", {});
    }

    /**
     * Update the styles configuration
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
     */
    setCacheEnabled(enabled: boolean): void {
        this.cacheEnabled = enabled;
        if (!enabled) {
            this.clearCache();
        }
    }

    /**
     * Create a cache key from node/edge data
     * This is a simple implementation - could be optimized
     */
    private createCacheKey(data: AdHocData): string {
        // Use JSON stringify for now - could be optimized with a hash function
        return JSON.stringify(data);
    }
}
