import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Testing NGraph layout with proper parameters...\n");
  
  // Navigate to ngraph story
  await page.goto(`http://dev.ato.ms:9025/iframe.html?id=layout-3d--ngraph&viewMode=story`);
  
  // Wait for graphty-element
  await page.waitForSelector('graphty-element', { timeout: 10000 });
  
  // Give it time to initialize
  await page.waitForTimeout(2000);
  
  // Check the layout configuration
  const layoutInfo = await page.evaluate(() => {
    const graphty = document.querySelector('graphty-element');
    if (!graphty || !graphty.graph) return null;
    
    const layout = graphty.graph.layoutManager?.layoutEngine;
    if (!layout) return null;
    
    return {
      type: layout.constructor.name,
      config: layout.layoutConfig,
      isSettled: layout.isSettled,
      physicsSettings: layout.ngraphLayout?.simulator?.settings || null
    };
  });
  
  console.log("Layout info:", JSON.stringify(layoutInfo, null, 2));
  
  // Monitor settling over time
  console.log("\nMonitoring layout settling...");
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    
    const status = await page.evaluate(() => {
      const graphty = document.querySelector('graphty-element');
      const layout = graphty?.graph?.layoutManager?.layoutEngine;
      return {
        isSettled: layout?.isSettled,
        nodeCount: graphty?.graph?.nodes?.size || 0
      };
    });
    
    console.log(`  ${i+1}s: Settled=${status.isSettled}, Nodes=${status.nodeCount}`);
    
    if (status.isSettled) {
      console.log("\nLayout has settled!");
      break;
    }
  }
  
  // Take a screenshot
  await page.locator('graphty-element').screenshot({ 
    path: 'test/screenshots/ngraph-fixed.png' 
  });
  console.log("\nScreenshot saved to test/screenshots/ngraph-fixed.png");
  
  await browser.close();
}

main().catch(console.error);