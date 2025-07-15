import {assert, beforeEach, describe, it, vi} from "vitest";

import type {AdHocData} from "../../src/config";
import type {EventManager} from "../../src/managers/EventManager";
import {StyleManager} from "../../src/managers/StyleManager";
import {type EdgeStyleId, type NodeStyleId, Styles} from "../../src/Styles";

describe("StyleManager", () => {
    let styleManager: StyleManager;
    let mockStyles: Styles;
    let mockEventManager: EventManager;

    beforeEach(() => {
        // Create mock EventManager
        mockEventManager = {
            emitGraphEvent: vi.fn(),
        } as unknown as EventManager;

        // Create mock Styles
        mockStyles = {
            getStyleForNode: vi.fn().mockReturnValue(1),
            getStyleForEdge: vi.fn().mockReturnValue(1),
            getCalculatedStylesForNode: vi.fn().mockReturnValue([]),
            addLayer: vi.fn(),
            insertLayer: vi.fn(),
        } as unknown as Styles;

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

            assert.isTrue(vi.mocked(Styles.fromObject).mock.calls.length === 1);
        });

        it("should load styles from URL", async() => {
            const templateUrl = "https://example.com/template.json";
            vi.spyOn(Styles, "fromUrl").mockResolvedValue(mockStyles);

            await styleManager.loadStylesFromUrl(templateUrl);

            assert.isTrue(vi.mocked(Styles.fromUrl).mock.calls.length === 1);
        });
    });

    describe("style computation", () => {
        it("should get style for node", () => {
            const nodeData = {type: "special"} as unknown as AdHocData;

            const styleId = styleManager.getStyleForNode(nodeData);

            assert.isTrue(vi.mocked(mockStyles.getStyleForNode).mock.calls.length === 1);
            assert.isTrue(vi.mocked(mockStyles.getStyleForNode).mock.calls[0][0] === nodeData);
            assert.equal(styleId, 1);
        });

        it("should get style for edge", () => {
            const edgeData = {type: "strong"} as unknown as AdHocData;

            const styleId = styleManager.getStyleForEdge(edgeData);

            assert.isTrue(vi.mocked(mockStyles.getStyleForEdge).mock.calls.length === 1);
            assert.isTrue(vi.mocked(mockStyles.getStyleForEdge).mock.calls[0][0] === edgeData);
            assert.equal(styleId, 1);
        });

        it("should get calculated styles for node", () => {
            const nodeData = {type: "special"} as unknown as AdHocData;

            const calculatedStyles = styleManager.getCalculatedStylesForNode(nodeData);

            assert.isTrue(vi.mocked(mockStyles.getCalculatedStylesForNode).mock.calls.length === 1);
            assert.isTrue(vi.mocked(mockStyles.getCalculatedStylesForNode).mock.calls[0][0] === nodeData);
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
            assert.equal(vi.mocked(mockStyles.getStyleForNode).mock.calls.length, 1);
        });

        it("should cache edge styles", () => {
            const edgeData = {type: "strong"} as unknown as AdHocData;

            // First call
            styleManager.getStyleForEdge(edgeData);
            // Second call - should use cache
            styleManager.getStyleForEdge(edgeData);

            // Should only call the underlying method once
            assert.equal(vi.mocked(mockStyles.getStyleForEdge).mock.calls.length, 1);
        });

        it("should disable caching when requested", () => {
            const nodeData = {type: "special"} as unknown as AdHocData;

            styleManager.setCacheEnabled(false);

            // Multiple calls should not use cache
            styleManager.getStyleForNode(nodeData);
            styleManager.getStyleForNode(nodeData);

            assert.equal(vi.mocked(mockStyles.getStyleForNode).mock.calls.length, 2);
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

            assert.isTrue(vi.mocked(mockStyles.addLayer).mock.calls.length === 1);
            assert.isTrue(vi.mocked(mockStyles.addLayer).mock.calls[0][0] === layer);
        });

        it("should insert style layer at position", () => {
            const layer = {
                edge: {
                    selector: "[weight>10]",
                    style: {enabled: true},
                },
            };

            styleManager.insertLayer(1, layer);

            assert.isTrue(vi.mocked(mockStyles.insertLayer).mock.calls.length === 1);
            assert.isTrue(vi.mocked(mockStyles.insertLayer).mock.calls[0][0] === 1 && vi.mocked(mockStyles.insertLayer).mock.calls[0][1] === layer);
        });
    });

    describe("static methods", () => {
        it("should get style for node style ID", () => {
            const nodeStyle = {enabled: true};
            vi.spyOn(Styles, "getStyleForNodeStyleId").mockReturnValue(nodeStyle);

            const result = StyleManager.getStyleForNodeStyleId(1 as NodeStyleId);

            assert.deepEqual(result, nodeStyle);
        });

        it("should get style for edge style ID", () => {
            const edgeStyle = {enabled: true};
            vi.spyOn(Styles, "getStyleForEdgeStyleId").mockReturnValue(edgeStyle);

            const result = StyleManager.getStyleForEdgeStyleId(1 as EdgeStyleId);

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

            assert.equal(vi.mocked(mockStyles.getStyleForNode).mock.calls.length, 2);
        });

        it("should clear cache when updating styles", () => {
            const newStyles = {} as unknown as Styles;
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
