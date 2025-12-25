import type {AnimationOptions} from "./VideoCapture.js";

export interface CaptureEstimate {
    totalFrames: number;
    likelyToDropFrames: boolean;
    recommendedFps?: number;
    recommendedResolution?: string;
    estimatedFileSize?: number;
}

/**
 * Estimates performance and potential issues for animation capture.
 * Predicts frame drops and provides recommendations based on resolution and FPS.
 * @param options - Animation options to analyze
 * @returns Capture estimate with warnings and recommendations
 */
export function estimateAnimationCapture(
    options: Pick<AnimationOptions, "duration" | "fps" | "width" | "height">,
): CaptureEstimate {
    const fps = options.fps ?? 30;
    const width = options.width ?? 1920;
    const height = options.height ?? 1080;

    const totalFrames = Math.floor((options.duration / 1000) * fps);
    const pixelCount = width * height;

    // Heuristics for frame drop prediction
    // - 4K (3840x2160 = 8,294,400 pixels) at 60fps is very demanding
    // - 1080p (1920x1080 = 2,073,600 pixels) at 30fps is usually safe
    // - 4K at 30fps is borderline (acceptable)

    const is4K = pixelCount > 2073600; // More than 1080p
    const isHighFps = fps > 30;

    // Predict frame drops if both high resolution and high fps
    const likelyToDropFrames = is4K && isHighFps;

    const result: CaptureEstimate = {
        totalFrames,
        likelyToDropFrames,
    };

    if (likelyToDropFrames) {
        result.recommendedFps = 30;
        result.recommendedResolution = "1920x1080";
    }

    // Rough file size estimation (very approximate)
    // WebM VP9: ~0.1-0.2 bits per pixel per frame at medium quality
    const bitsPerPixel = 0.15;
    const estimatedBits = totalFrames * pixelCount * bitsPerPixel;
    result.estimatedFileSize = Math.ceil(estimatedBits / 8); // Convert to bytes

    return result;
}
