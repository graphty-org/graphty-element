import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture all messages
  page.on('console', msg => {
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });
  
  console.log("Testing with minimal working configuration...");
  
  await page.goto('http://dev.ato.ms:9025');
  await page.waitForTimeout(2000);
  
  // Try the absolute minimal case to see if the issue is with our template structure
  const result = await page.evaluate(() => {
    const graphty = document.createElement('graphty-element');
    
    // Set the most basic configuration without any layout config
    graphty.nodeData = [
      {id: 'a'}, {id: 'b'}, {id: 'c'}
    ];
    graphty.edgeData = [
      {src: 'a', dst: 'b'}, {src: 'b', dst: 'c'}
    ];
    
    // Don't set layout initially, let it use default
    
    document.body.appendChild(graphty);
    
    // Wait for initialization
    return new Promise(resolve => {
      setTimeout(() => {
        const state = {
          hasGraph: !!graphty.graph,
          error: null
        };
        
        try {
          if (graphty.graph) {
            state.hasLayoutManager = !!graphty.graph.layoutManager;
            state.hasLayoutEngine = !!graphty.graph.layoutManager?.layoutEngine;
            state.layoutType = graphty.graph.layoutManager?.layoutEngine?.constructor?.name;
            state.nodeCount = graphty.graph.nodes?.size || 0;
            state.edgeCount = graphty.graph.edges?.size || 0;
          }
        } catch (e) {
          state.error = e.message;
        }
        
        resolve(state);
      }, 5000);
    });
  });
  
  console.log("Minimal test result:", JSON.stringify(result, null, 2));
  
  await browser.close();
}

main().catch(console.error);