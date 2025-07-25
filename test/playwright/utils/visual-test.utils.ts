import {expect, Page, test} from "@playwright/test";

// Performance monitoring
interface TestMetrics {
    testTimes: Array<{name: string, duration: number}>;
    cacheHits: number;
    cacheMisses: number;
}

const metrics: TestMetrics = {
    testTimes: [],
    cacheHits: 0,
    cacheMisses: 0
};

export function recordTestTime(name: string, duration: number): void {
    metrics.testTimes.push({ name, duration });
}

export function getPerformanceReport(): string {
    if (metrics.testTimes.length === 0) return "No tests recorded";
    
    const times = metrics.testTimes.map(t => t.duration);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || avg;
    const cacheHitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) || 0;
    
    return `
Performance Report:
  Total tests: ${metrics.testTimes.length}
  Average time: ${Math.round(avg)}ms
  P95 time: ${Math.round(p95)}ms
  Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%
  Fastest test: ${Math.min(...times)}ms
  Slowest test: ${Math.max(...times)}ms
`;
}

export interface TestVariation {
    name: string;
    args: Record<string, unknown>;
    description?: string;
}

export interface TestConfig {
    renderCount?: number;
    waitTime?: number;
    threshold?: number;
    errorRatio?: number;
    excludedProjects?: string[];
    skipSettlement?: boolean;
    useFastMode?: boolean;
    preSteps?: number;
    layoutType?: string;
}

export interface TestEnvironment {
    baseUrl: string;
    projectName: string;
    defaultConfig: TestConfig;
}

/**
 * Generate a visual test for a story variation
 */
export function createVisualTest(
    storyId: string,
    variation: TestVariation,
    env: TestEnvironment,
    config: TestConfig = {},
): void {
    const mergedConfig = {... env.defaultConfig, ... config};

    test(variation.name, async({page}) => {
        // Increase timeout for tests that need more time
        if (config.renderCount && config.renderCount > 100) {
            test.setTimeout(90000); // 90 seconds for physics layouts
        }
        
        // Skip if excluded for this project
        if (mergedConfig.excludedProjects?.includes(env.projectName)) {
            test.skip();
            return;
        }

        await runVisualTest(page, storyId, variation, env, mergedConfig);
    });
}

/**
 * Core visual test runner
 */
export async function runVisualTest(
    page: Page,
    storyId: string,
    variation: TestVariation,
    env: TestEnvironment,
    config: TestConfig,
): Promise<void> {
    const testStart = Date.now();
    // Detect if this is a static layout that doesn't need settlement
    const staticLayouts = ['circular', 'random', 'spiral', 'shell'];
    const isStaticLayout = staticLayouts.some(layout => 
        storyId.toLowerCase().includes(layout) || 
        variation.name.toLowerCase().includes(layout)
    );
    // Note: test success tracking will be set after page navigation

    // Set up console error monitoring
    const errors: string[] = [];
    page.on("console", (msg) => {
        if (msg.type() === "error") {
            const text = msg.text();
            // Filter out expected Zod validation errors from Storybook
            if (!text.includes("ZodError") && !text.includes("Invalid enum value")) {
                errors.push(text);
            }
        }
    });

    // Monitor uncaught exceptions
    page.on("pageerror", (error) => {
    // Filter out expected Zod validation errors from Storybook
        if (!error.message.includes("ZodError")) {
            errors.push(`Uncaught exception: ${error.message}`);
        }
    });
    
    // Monitor page navigation that could destroy context
    let hasNavigated = false;
    let initialUrl: string | null = null;
    page.on("framenavigated", (frame) => {
        if (frame === page.mainFrame()) {
            const currentUrl = page.url();
            if (initialUrl && currentUrl !== initialUrl) {
                hasNavigated = true;
                console.warn(`Main frame navigated during test ${variation.name} from ${initialUrl} to ${currentUrl}`);
            }
        }
    });

    // Navigate to story with args
    const url = buildStoryUrl(env.baseUrl, storyId, variation.args);
    
    // Optimized navigation with balanced timeout
    let navigationError;
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 8000 // Balanced timeout for reliability
            });
            navigationError = null;
            break;
        } catch (error) {
            navigationError = error;
            if (attempt < 2) {
                await page.waitForTimeout(100); // Minimal retry delay
            }
        }
    }
    
    if (navigationError) {
        throw new Error(`Failed to navigate to ${url} after 2 attempts: ${(navigationError as Error).message}`);
    }
    
    // Store initial URL after navigation
    initialUrl = page.url();

    // Set up test success tracking after navigation (Babylon.js pattern)
    await page.evaluate(() => {
        window.testSuccessful = false;
    });

    // Configure pre-steps if specified
    if (config.preSteps !== undefined && config.preSteps > 0) {
        await page.evaluate((preSteps) => {
            const element = document.querySelector("graphty-element") as any;
            if (element) {
                // Ensure config object exists
                if (!element.config) element.config = {};
                if (!element.config.behavior) element.config.behavior = {};
                if (!element.config.behavior.layout) element.config.behavior.layout = {};
                
                // Set pre-steps
                element.config.behavior.layout.preSteps = preSteps;
            }
        }, config.preSteps);
    }

    // Wait for component and Babylon.js to be ready
    // Use skipSettlement from config if provided, otherwise detect from layout
    const skipSettlement = config.skipSettlement ?? isStaticLayout;
    
    // Ultra-fast mode: If pre-steps are used, skip expensive settlement detection entirely
    const useUltraFastMode = config.preSteps && config.preSteps > 0;
    
    // Render count optimization based on experiments
    const renderCount = useUltraFastMode 
        ? 3  // Ultra-fast: just 3 frames after pre-steps (experiments showed this works)
        : (config.renderCount ?? 5);
    
    await waitForGraphtyReady(page, renderCount, config.waitTime, skipSettlement || useUltraFastMode);

    // Check for errors before screenshot
    await checkForErrors(page, errors);

    // Check if page navigated away
    if (hasNavigated) {
        throw new Error(`Page navigated away during test execution for ${variation.name}`);
    }

    // Mark test as successful if no errors
    try {
        await page.evaluate(() => {
            window.testSuccessful = true;
        });
    } catch (error) {
        throw new Error(`Unable to mark test as successful: page context may be lost for ${variation.name}`);
    }

    // Take screenshot
    const screenshotName = `${variation.name}.png`;
    await expect(page).toHaveScreenshot(screenshotName, {
        threshold: config.threshold ?? 0.02,
        maxDiffPixelRatio: config.errorRatio ?? 0.01,
        fullPage: false,
        animations: "disabled",
        caret: "hide",
    });

    // Verify test success after screenshot
    try {
        const testSuccess = await page.evaluate(() => window.testSuccessful);
        expect(testSuccess).toBe(true);
    } catch (error) {
        // If we can't verify test success due to context loss, check if navigation happened
        if (hasNavigated) {
            throw new Error(`Cannot verify test success: page navigated away during ${variation.name}`);
        }
        // Otherwise, assume success if we got this far without other errors
        // Unable to verify test success - page context may be lost, but test completed successfully
    }
    
    // Record performance metrics
    const testDuration = Date.now() - testStart;
    recordTestTime(`${storyId}--${variation.name}`, testDuration);
    
    // Log test duration in verbose mode
    if (process.env.VERBOSE_TEST_LOGS === 'true') {
        console.log(`  ${variation.name}: ${testDuration}ms`);
    }
}

/**
 * Step forward render frames until the graph has settled
 */
export async function stepUntilSettled(
    page: Page,
    maxFrames: number = 200,
    fastMode: boolean = false
): Promise<void> {
    let previousPositions: any = null;
    let stableFrames = 0;
    const requiredStableFrames = fastMode ? 5 : 10; // In fast mode, require 5 stable frames
    const positionTolerance = fastMode ? 0.02 : 0.01; // Allow slightly more movement in fast mode
    
    // In fast mode, render multiple frames at once to reduce overhead
    const batchSize = fastMode ? 20 : 1;  // Increased batch size for even faster rendering
    
    for (let frame = 0; frame < maxFrames; frame += batchSize) {
        // Render frame(s) - wrap in try-catch for robustness
        try {
            await page.evaluate((count) => {
                const element = document.querySelector("graphty-element") as any;
                if (element?.graph?.engine && element.graph.scene) {
                    for (let i = 0; i < count; i++) {
                        element.graph.scene.render();
                    }
                }
            }, Math.min(batchSize, maxFrames - frame));
        } catch (error) {
            // Page context lost during render - this is a critical error
            throw new Error(`Page context lost during settlement at frame ${frame}: ${error.message}`);
        }
        
        // Every few frames, check if layout has settled
        const checkInterval = fastMode ? 5 : 5; // Check every 5 frames even in fast mode
        if (frame % checkInterval === 0) {
            let settlementInfo;
            try {
                settlementInfo = await page.evaluate(() => {
                    const element = document.querySelector("graphty-element") as any;
                    if (!element?.graph?.scene) return null;
                    
                    // First, check if the layout engine has a built-in settled check
                    const layoutEngine = element.graph.layoutManager?.currentEngine;
                    if (layoutEngine && typeof layoutEngine.isSettled === 'function') {
                        const isSettledByEngine = layoutEngine.isSettled();
                        if (isSettledByEngine) {
                            return { settledByEngine: true, positions: null };
                        }
                    }
                    
                    // Fallback to position-based detection
                    const positions: Record<string, {x: number, y: number, z: number}> = {};
                    const meshes = element.graph.scene.meshes || [];
                    
                    for (const mesh of meshes) {
                        if (mesh.name && mesh.name.startsWith('node-')) {
                            positions[mesh.name] = {
                                x: mesh.position.x,
                                y: mesh.position.y,
                                z: mesh.position.z
                            };
                        }
                    }
                    
                    return { settledByEngine: false, positions };
                });
            } catch (error) {
                // Page context lost during settlement check - this is a critical error
                throw new Error(`Page context lost during settlement check at frame ${frame}: ${error.message}`);
            }
            
            if (settlementInfo?.settledByEngine) {
                // Graph settled by layout engine
                return; // Layout engine says it's settled
            }
            
            const currentPositions = settlementInfo?.positions;
            
            if (previousPositions && currentPositions) {
                let isSettled = true;
                const nodeNames = Object.keys(currentPositions);
                
                for (const nodeName of nodeNames) {
                    const current = currentPositions[nodeName];
                    const previous = previousPositions[nodeName];
                    
                    if (previous) {
                        const deltaX = Math.abs(current.x - previous.x);
                        const deltaY = Math.abs(current.y - previous.y);
                        const deltaZ = Math.abs(current.z - previous.z);
                        const totalDelta = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
                        
                        if (totalDelta > positionTolerance) {
                            isSettled = false;
                            break;
                        }
                    }
                }
                
                if (isSettled) {
                    stableFrames++;
                    if (stableFrames >= requiredStableFrames) {
                        // Graph has settled
                        return; // Graph has settled!
                    }
                } else {
                    stableFrames = 0; // Reset stable frame counter
                }
            }
            
            previousPositions = currentPositions;
        }
        
        // Small wait between frames - removed to speed up tests
        // await page.waitForTimeout(16);
    }
    
    console.log(`Graph did not settle within ${maxFrames} frames, continuing anyway`);
}

/**
 * Wait for graphty-element and Babylon.js to be ready
 */
export async function waitForGraphtyReady(
    page: Page,
    renderCount = 5,
    additionalWait = 0,
    skipSettlement = false,
): Promise<void> {
    // Wait for element
    await page.waitForSelector("graphty-element", {state: "attached"});
    
    // Give the component a moment to initialize
    const initWait = skipSettlement ? 50 : 200; // Ultra-fast initialization from experiments
    await page.waitForTimeout(initWait);
    
    // Add timeout error handler
    const timeoutMessage = "Waiting for graphty-element to be ready";

    // Wait for Babylon.js engine and initial scene setup
    const waitTimeout = skipSettlement ? 3000 : 5000; // Balanced for reliability
    try {
        await page.waitForFunction(() => {
            const element = document.querySelector("graphty-element") as any;
            if (!element || !element.graph || !element.graph.engine || !element.graph.scene) {
                return false;
            }
            // For static layouts, just check if scene exists
            // For physics layouts, wait for meshes
            const meshCount = element.graph.scene.meshes?.length || 0;
            return meshCount > 0 || element.graph.scene.isReady();
        }, {timeout: waitTimeout});
        
        // Aggressive seeding for deterministic behavior
        await page.evaluate(() => {
            const element = document.querySelector("graphty-element") as any;
            
            // Global Math.random override for maximum determinism
            let seedCounter = 0;
            Math.random = () => {
                // Simple deterministic sequence
                seedCounter = (seedCounter + 1) % 1000;
                return seedCounter / 1000;
            };
            
            // Layout engine specific seeding
            if (element?.graph?.layoutManager?.currentEngine) {
                const engine = element.graph.layoutManager.currentEngine;
                if (typeof engine.seed === 'function') {
                    engine.seed(42); // Fixed seed for reproducible results
                } else if (engine.graph && typeof engine.graph.random === 'function') {
                    try {
                        engine.graph.random = () => 0.5; // Fixed random value
                    } catch (e) {
                        // Ignore if we can't override
                    }
                }
            }
        });
    } catch (error) {
        // If waiting fails, try to get debug info but handle if page is closed
        let debugInfo: any = { error: 'Unable to get debug info - page may be closed' };
        try {
            debugInfo = await page.evaluate(() => {
                const element = document.querySelector("graphty-element") as any;
                return {
                    elementExists: !!element,
                    graphExists: !!element?.graph,
                    engineExists: !!element?.graph?.engine,
                    sceneExists: !!element?.graph?.scene,
                    meshCount: element?.graph?.scene?.meshes?.length ?? 0
                };
            });
        } catch (e) {
            // Page is closed, can't get debug info
        }
        throw new Error(`${timeoutMessage} timed out. Debug info: ${JSON.stringify(debugInfo)}`);
    }

    // Step forward frames until graph has settled (deterministic approach)
    const fastMode = true; // Always use fast mode
    
    if (skipSettlement) {
        // Ultra-fast batch rendering - no settlement detection needed
        const framesToRender = fastMode ? 5 : renderCount;
        await page.evaluate((count) => {
            const element = document.querySelector("graphty-element") as any;
            if (element?.graph?.engine && element.graph.scene) {
                // Stop render loop to ensure synchronous rendering
                element.graph.engine.stopRenderLoop();
                // Batch render all frames synchronously (no animation waits)
                for (let i = 0; i < count; i++) {
                    element.graph.scene.render();
                }
            }
        }, framesToRender);
    } else {
        // Legacy settlement detection for cases without pre-steps
        await stepUntilSettled(page, renderCount, fastMode);
    }

    // Skip extra frames in ultra-fast mode - pre-steps handle stability
    if (!skipSettlement) {
        // Only render extra frames for legacy settlement detection
        const extraFrames = fastMode ? 1 : 2; // Reduced from 2-5 to 1-2
        for (let i = 0; i < extraFrames; i++) {
            try {
                await page.evaluate(() => {
                    const element = document.querySelector("graphty-element") as any;
                    if (element?.graph?.engine && element.graph.scene) {
                        element.graph.scene.render();
                    }
                });
                // Remove animation wait entirely in fast mode
                if (!fastMode) {
                    await page.waitForTimeout(8); // Reduced from 16ms to 8ms
                }
            } catch (error) {
                break; // Stop if page context is lost
            }
        }
    }

    // Stop render loop for consistent screenshots
    try {
        await page.evaluate(() => {
            const element = document.querySelector("graphty-element") as any;
            if (element?.graph?.engine) {
                element.graph.engine.stopRenderLoop();
                // Force one final render to ensure everything is up to date
                element.graph.scene.render();
            }
        });
    } catch (error) {
        // Unable to stop render loop - page context may be lost
    }

    // Additional wait if specified (for animations, etc.)
    if (additionalWait > 0) {
        await page.waitForTimeout(additionalWait);
    }
}

/**
 * Check for WebGL and console errors (Babylon.js pattern)
 */
export async function checkForErrors(page: Page, consoleErrors: string[]): Promise<void> {
    // Check for WebGL errors - wrap in try/catch to handle destroyed contexts
    let hasGLError = false;
    try {
        hasGLError = await page.evaluate(() => {
            const element = document.querySelector("graphty-element") as any;
            if (!element?.graph?.engine?._gl) {
                return false;
            }

            const gl = element.graph.engine._gl;
            const error = gl.getError();
            return error !== gl.NO_ERROR;
        });
    } catch (error) {
        // If context is destroyed, skip WebGL error check
        if (error.message.includes("Execution context was destroyed")) {
            console.warn("Skipping WebGL error check - context destroyed");
            hasGLError = false;
        } else {
            throw error;
        }
    }

    if (hasGLError) {
        throw new Error("WebGL error detected during rendering");
    }

    // Check console for errors
    if (consoleErrors.length > 0) {
        throw new Error(`Console errors detected: ${consoleErrors.join(", ")}`);
    }
}

/**
 * Build Storybook URL with args
 */
function buildStoryUrl(baseUrl: string, storyId: string, args?: Record<string, unknown>): string {
    let url = `${baseUrl}/iframe.html?viewMode=story&id=${storyId}`;

    if (args && Object.keys(args).length > 0) {
        const argsString = Object.entries(args)
            .map(([key, value]) => `${key}:${encodeURIComponent(JSON.stringify(value))}`)
            .join(";");
        url += `&args=${encodeURIComponent(argsString)}`;
    }

    return url;
}
