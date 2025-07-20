import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test a few style stories
  const stories = [
    'styles-node--default',
    'styles-edge--default',
    'styles-graph--default'
  ];
  
  for (const storyId of stories) {
    console.log(`\nTesting ${storyId}...`);
    
    // Navigate to story
    await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
    
    // Wait for graphty-element
    await page.waitForSelector('graphty-element', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Check if graph is rendering
    const graphInfo = await page.evaluate(() => {
      const graphty = document.querySelector('graphty-element');
      if (!graphty) return { exists: false };
      
      return {
        exists: true,
        hasGraph: !!graphty.graph,
        nodeCount: graphty.graph?.nodes?.size || 0,
        edgeCount: graphty.graph?.edges?.size || 0,
        layoutEngine: graphty.graph?.layoutManager?.layoutEngine?.constructor.name || 'none',
        error: graphty.graph?.error || null,
        nodeData: graphty.nodeData,
        edgeData: graphty.edgeData,
        dataSource: graphty.dataSource,
        layout: graphty.layout
      };
    });
    
    console.log("Graph info:", JSON.stringify(graphInfo, null, 2));
    
    // Take screenshot
    const screenshot = await page.locator('graphty-element').screenshot();
    await page.screenshot({ path: `test/screenshots/${storyId}.png`, fullPage: true });
  }
  
  await browser.close();
}

main().catch(console.error);