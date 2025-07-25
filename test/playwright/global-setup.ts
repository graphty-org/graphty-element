import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for ultra-fast visual tests
 * Pre-warms browser and caches common resources
 */
async function globalSetup(config: FullConfig) {
    // Only run for visual tests
    const isVisualTestRun = config.projects.some(p => p.name === 'visual');
    if (!isVisualTestRun) {
        return;
    }
    
    console.log('🔥 Pre-warming Storybook for visual tests...');
    
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Pre-load Storybook to cache resources
    await page.goto('http://dev.ato.ms:9025', { waitUntil: 'networkidle' });
    
    // Pre-compile common stories to warm up browser cache
    const storiesToPreload = [
        'layout-2d--circular',
        'layout-3d--random',
        'layout-3d--d3',
        'styles-node--default',
        'styles-edge--default',
        'styles-graph--default',
        'data--basic',
        'data--json'
    ];
    
    for (const story of storiesToPreload) {
        try {
            await page.goto(`http://dev.ato.ms:9025/iframe.html?viewMode=story&id=${story}`, {
                waitUntil: 'domcontentloaded',
                timeout: 5000 // Give pre-warming more time
            });
            await page.waitForSelector('graphty-element', { timeout: 3000 });
            // Run a few frames to warm up WebGL
            await page.evaluate(() => {
                const element = document.querySelector("graphty-element") as any;
                if (element?.graph?.scene) {
                    for (let i = 0; i < 5; i++) {
                        element.graph.scene.render();
                    }
                }
            });
        } catch (e) {
            console.warn(`  ⚠️ Failed to preload ${story} - ${e.message}`);
        }
    }
    
    await browser.close();
    console.log('✅ Pre-warming complete');
}

export default globalSetup;