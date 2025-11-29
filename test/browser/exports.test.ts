import {assert, test} from "vitest";

import {
    AnimationCancelledError,
    ScreenshotError,
    ScreenshotErrorCode,
} from "../../index.js";

test("ScreenshotError is exported and can be instantiated", () => {
    const error = new ScreenshotError(
        "Test error",
        ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED,
    );

    assert.equal(error.name, "ScreenshotError");
    assert.equal(error.code, ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED);
    assert.equal(error.message, "Test error");
});

test("ScreenshotErrorCode enum is exported with expected values", () => {
    // Verify common error codes exist by using them
    assert.equal(ScreenshotErrorCode.ENGINE_NOT_CONFIGURED, "ENGINE_NOT_CONFIGURED");
    assert.equal(ScreenshotErrorCode.SCREENSHOT_CAPTURE_FAILED, "SCREENSHOT_CAPTURE_FAILED");
    assert.equal(ScreenshotErrorCode.DIMENSION_TOO_LARGE, "DIMENSION_TOO_LARGE");
    assert.equal(ScreenshotErrorCode.CLIPBOARD_NOT_SUPPORTED, "CLIPBOARD_NOT_SUPPORTED");
    assert.equal(ScreenshotErrorCode.VIDEO_CAPTURE_FAILED, "VIDEO_CAPTURE_FAILED");
});

test("AnimationCancelledError is exported and can be instantiated", () => {
    const error = new AnimationCancelledError();

    assert.equal(error.name, "AnimationCancelledError");
    assert.ok(error.message.includes("cancel"), "Error message should mention cancellation");
});
