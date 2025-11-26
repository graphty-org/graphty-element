import {assert, test} from "vitest";

import {estimateAnimationCapture} from "../../../src/video/estimation.js";
import {calculateDropRate} from "../../../src/video/VideoCapture.js";

test("calculates frame drop rate correctly", () => {
    const dropRate1 = calculateDropRate(90, 100);
    assert.equal(dropRate1, 10); // 10% drop rate

    const dropRate2 = calculateDropRate(100, 100);
    assert.equal(dropRate2, 0); // No drops

    const dropRate3 = calculateDropRate(50, 100);
    assert.equal(dropRate3, 50); // 50% drop rate

    const dropRate4 = calculateDropRate(99, 100);
    assert.equal(dropRate4, 1); // 1% drop rate
});

test("estimateAnimationCapture calculates total frames", () => {
    const estimate = estimateAnimationCapture({
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 5000,
    });

    // 5 seconds at 30fps = 150 frames
    assert.equal(estimate.totalFrames, 150);
});

test("estimateAnimationCapture detects likely frame drops for 4K @ 60fps", () => {
    const estimate = estimateAnimationCapture({
        width: 3840,
        height: 2160,
        fps: 60,
        duration: 5000,
    });

    assert.ok(estimate.likelyToDropFrames);
    assert.equal(estimate.totalFrames, 300); // 60fps * 5s
    assert.ok(estimate.recommendedFps);
    assert.ok(estimate.recommendedResolution);
});

test("estimateAnimationCapture considers HD @ 30fps safe", () => {
    const estimate = estimateAnimationCapture({
        width: 1920,
        height: 1080,
        fps: 30,
        duration: 5000,
    });

    assert.ok(!estimate.likelyToDropFrames);
    assert.equal(estimate.totalFrames, 150);
});

test("estimateAnimationCapture uses defaults for missing params", () => {
    const estimate = estimateAnimationCapture({
        duration: 2000,
    });

    // Should use default 30fps and 1920x1080
    assert.equal(estimate.totalFrames, 60); // 2s * 30fps
    assert.ok(!estimate.likelyToDropFrames);
});

test("estimateAnimationCapture warns about high resolution at moderate fps", () => {
    const estimate = estimateAnimationCapture({
        width: 3840,
        height: 2160,
        fps: 45, // Between 30 and 60
        duration: 1000,
    });

    // 4K at 45fps should warn
    assert.ok(estimate.likelyToDropFrames);
});

test("estimateAnimationCapture accepts 4K @ 30fps", () => {
    const estimate = estimateAnimationCapture({
        width: 3840,
        height: 2160,
        fps: 30,
        duration: 1000,
    });

    // 4K at 30fps is borderline but should be okay
    assert.ok(!estimate.likelyToDropFrames);
});
