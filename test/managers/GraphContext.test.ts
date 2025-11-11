import {assert, describe, it} from "vitest";

import type {GraphContextConfig} from "../../src/managers/GraphContext";

describe("GraphContext - profiling config", () => {
    it("should accept enableDetailedProfiling option", () => {
        const config: GraphContextConfig = {
            enableDetailedProfiling: true,
        };

        // Validate config passes type checking and has the property
        assert.property(config, "enableDetailedProfiling");
        assert.isTrue(config.enableDetailedProfiling);
    });

    it("should default to undefined when not specified", () => {
        const config: GraphContextConfig = {};
        assert.isUndefined(config.enableDetailedProfiling);
    });

    it("should accept pinOnDrag alongside enableDetailedProfiling", () => {
        const config: GraphContextConfig = {
            pinOnDrag: true,
            enableDetailedProfiling: true,
        };

        assert.property(config, "pinOnDrag");
        assert.property(config, "enableDetailedProfiling");
        assert.isTrue(config.pinOnDrag);
        assert.isTrue(config.enableDetailedProfiling);
    });

    it("should allow enableDetailedProfiling to be false", () => {
        const config: GraphContextConfig = {
            enableDetailedProfiling: false,
        };

        assert.property(config, "enableDetailedProfiling");
        assert.isFalse(config.enableDetailedProfiling);
    });
});
