import {assert} from "chai";
import {beforeEach, describe, it, vi} from "vitest";

import type {AdHocData} from "../../src/config";
import type {EventManager} from "../../src/managers/EventManager";
import {StyleManager} from "../../src/managers/StyleManager";
import {Styles} from "../../src/Styles";

describe("StyleManager", () => {
    let styleManager: StyleManager;
    let mockStyles: Styles;
    let mockEventManager: EventManager;

    beforeEach(() => {
        // Create mock EventManager
        mockEventManager = {
            emitGraphEvent: vi.fn(),
        } as any;

        // Create mock Styles
        mockStyles = {
            getStyleForNode: vi.fn().mockReturnValue(1),
            getStyleForEdge: vi.fn().mockReturnValue(1),
            getCalculatedStylesForNode: vi.fn().mockReturnValue([]),
            addLayer: vi.fn(),
            insertLayer: vi.fn(),
        } as any;

        styleManager = new StyleManager(mockEventManager, mockStyles);
    });

    describe("initialization", () => {
        it("should initialize without errors", async() => {
            await styleManager.init();
            assert.isNotNull(styleManager);
        });

        it("should dispose without errors", () => {
            styleManager.dispose();
            assert.isNotNull(styleManager);
        });
    });

    describe("styles access", () => {
        it("should provide access to styles object", () => {
            const styles = styleManager.getStyles();
            assert.equal(styles, mockStyles);
        });
    });

    describe("styles loading", () => {
        it("should load styles from object", () => {
            const styleObj = {layers: []};
            vi.spyOn(Styles, "fromObject").mockReturnValue(mockStyles);

            styleManager.loadStylesFromObject(styleObj);

            assert.isTrue((Styles.fromObject as any).calledOnce);
        });

        it("should load styles from URL", async() => {
            const templateUrl = "https://example.com/template.json";
            vi.spyOn(Styles, "fromUrl").mockResolvedValue(mockStyles);

            await styleManager.loadStylesFromUrl(templateUrl);

            assert.isTrue((Styles.fromUrl as any).calledOnce);
        });
    });

    describe("style computation", () => {
        it("should get style for node", () => {
            const nodeData = {type: "special"} as unknown as AdHocData;

            const styleId = styleManager.getStyleForNode(nodeData);

            assert.isTrue((mockStyles.getStyleForNode as any).calledOnce);
            assert.isTrue((mockStyles.getStyleForNode as any).calledWith(nodeData));
            assert.equal(styleId, 1);
        });

        it("should get style for edge", () => {
            const edgeData = {type: "strong"} as unknown as AdHocData;

            const styleId = styleManager.getStyleForEdge(edgeData);

            assert.isTrue((mockStyles.getStyleForEdge as any).calledOnce);
            assert.isTrue((mockStyles.getStyleForEdge as any).calledWith(edgeData));
            assert.equal(styleId, 1);
        });

        it("should get calculated styles for node", () => {
            const nodeData = {type: "special"} as unknown as AdHocData;

            const calculatedStyles = styleManager.getCalculatedStylesForNode(nodeData);

            assert.isTrue((mockStyles.getCalculatedStylesForNode as any).calledOnce);
            assert.isTrue((mockStyles.getCalculatedStylesForNode as any).calledWith(nodeData));
            assert.deepEqual(calculatedStyles, []);
        });
    });

    describe("caching", () => {
        it("should cache node styles", () => {
            const nodeData = {type: "special"} as unknown as AdHocData;

            // First call
            styleManager.getStyleForNode(nodeData);
            // Second call - should use cache
            styleManager.getStyleForNode(nodeData);

            // Should only call the underlying method once
            assert.equal((mockStyles.getStyleForNode as any).callCount, 1);
        });

        it("should cache edge styles", () => {
            const edgeData = {type: "strong"} as unknown as AdHocData;

            // First call
            styleManager.getStyleForEdge(edgeData);
            // Second call - should use cache
            styleManager.getStyleForEdge(edgeData);

            // Should only call the underlying method once
            assert.equal((mockStyles.getStyleForEdge as any).callCount, 1);
        });

        it("should disable caching when requested", () => {
            const nodeData = {type: "special"} as unknown as AdHocData;

            styleManager.setCacheEnabled(false);

            // Multiple calls should not use cache
            styleManager.getStyleForNode(nodeData);
            styleManager.getStyleForNode(nodeData);

            assert.equal((mockStyles.getStyleForNode as any).callCount, 2);
        });
    });

    describe("style layers", () => {
        it("should add style layer", () => {
            const layer = {
                node: {
                    selector: "[type='special']",
                    style: {enabled: true},
                },
            };

            styleManager.addLayer(layer);

            assert.isTrue((mockStyles.addLayer as any).calledOnce);
            assert.isTrue((mockStyles.addLayer as any).calledWith(layer));
        });

        it("should insert style layer at position", () => {
            const layer = {
                edge: {
                    selector: "[weight>10]",
                    style: {enabled: true},
                },
            };

            styleManager.insertLayer(1, layer);

            assert.isTrue((mockStyles.insertLayer as any).calledOnce);
            assert.isTrue((mockStyles.insertLayer as any).calledWith(1, layer));
        });
    });

    describe("static methods", () => {
        it("should get style for node style ID", () => {
            const nodeStyle = {enabled: true};
            vi.spyOn(Styles, "getStyleForNodeStyleId").mockReturnValue(nodeStyle as any);

            const result = StyleManager.getStyleForNodeStyleId(1 as any);

            assert.deepEqual(result, nodeStyle);
        });

        it("should get style for edge style ID", () => {
            const edgeStyle = {enabled: true};
            vi.spyOn(Styles, "getStyleForEdgeStyleId").mockReturnValue(edgeStyle as any);

            const result = StyleManager.getStyleForEdgeStyleId(1 as any);

            assert.deepEqual(result, edgeStyle);
        });
    });

    describe("cache management", () => {
        it("should clear cache when styles change", () => {
            const nodeData = {type: "test"} as unknown as AdHocData;

            // Fill cache
            styleManager.getStyleForNode(nodeData);

            // Clear cache
            styleManager.clearCache();

            // Next call should not use cache
            styleManager.getStyleForNode(nodeData);

            assert.equal((mockStyles.getStyleForNode as any).callCount, 2);
        });

        it("should clear cache when updating styles", () => {
            const newStyles = {} as any;
            const nodeData = {type: "test"} as unknown as AdHocData;

            // Fill cache
            styleManager.getStyleForNode(nodeData);

            // Update styles (should clear cache)
            styleManager.updateStyles(newStyles);

            // Verify styles were updated
            assert.equal(styleManager.getStyles(), newStyles);
        });
    });
});
