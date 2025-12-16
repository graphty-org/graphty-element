/**
 * ViewMode Type and Schema Tests
 */
import {assert, describe, it} from "vitest";

import {DEFAULT_VIEW_MODE, isViewMode} from "../../src/config/ViewMode";

describe("ViewMode", () => {
    describe("DEFAULT_VIEW_MODE", () => {
        it("should be '3d'", () => {
            assert.strictEqual(DEFAULT_VIEW_MODE, "3d");
        });
    });

    describe("isViewMode", () => {
        it("should return true for '2d'", () => {
            assert.isTrue(isViewMode("2d"));
        });

        it("should return true for '3d'", () => {
            assert.isTrue(isViewMode("3d"));
        });

        it("should return true for 'ar'", () => {
            assert.isTrue(isViewMode("ar"));
        });

        it("should return true for 'vr'", () => {
            assert.isTrue(isViewMode("vr"));
        });

        it("should return false for invalid values", () => {
            assert.isFalse(isViewMode("1d"));
            assert.isFalse(isViewMode("4d"));
            assert.isFalse(isViewMode(""));
            assert.isFalse(isViewMode("VR"));
            assert.isFalse(isViewMode("AR"));
            assert.isFalse(isViewMode("2D"));
            assert.isFalse(isViewMode("3D"));
        });
    });
});
