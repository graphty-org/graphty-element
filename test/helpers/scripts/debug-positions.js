import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navigate to ngraph story
  await page.goto(`http://dev.ato.ms:9025/iframe.html?id=layout-3d--ngraph&viewMode=story`);
  
  // Wait for graphty-element
  await page.waitForSelector('graphty-element', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Check node positions and layout state
  const debug = await page.evaluate(() => {
    const graphty = document.querySelector('graphty-element');
    if (!graphty || !graphty.graph) return null;
    
    const layout = graphty.graph.layoutManager?.layoutEngine;
    if (!layout) return null;
    
    // Get first few nodes
    const nodes = Array.from(layout.ngraph.forEachNode ? 
      (() => { const n = []; layout.ngraph.forEachNode(node => n.push(node)); return n; })() : 
      []);
    
    return {
      layoutType: layout.constructor.name,
      nodeCount: nodes.length,
      firstNodes: nodes.slice(0, 3).map(n => ({
        id: n.id,
        hasPosition: 'position' in n,
        position: n.position,
        data: n.data
      })),
      layoutConfig: layout.layoutConfig,
      seed: layout.layoutConfig?.seed,
      randomTest: layout.random ? [
        layout.random.nextDouble(),
        layout.random.nextDouble(),
        layout.random.nextDouble()
      ] : null
    };
  });
  
  console.log("Debug info:", JSON.stringify(debug, null, 2));
  
  await browser.close();
}

main().catch(console.error);