import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";
import { createHash } from "crypto";

async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function getStoriesFromIndex(page) {
  // Navigate to index.json to get story list
  const response = await page.goto('http://dev.ato.ms:9025/index.json');
  const index = await response.json();
  
  const stories = [];
  Object.entries(index.entries).forEach(([id, entry]) => {
    if (entry.type === 'story') {
      stories.push({
        id: id,
        title: entry.title,
        name: entry.name
      });
    }
  });
  
  return stories;
}

async function captureStoryScreenshot(page, storyId, outputPath) {
  await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
  
  // Wait for graphty-element to exist
  await page.waitForSelector('graphty-element', { timeout: 10000 });
  
  // Wait for graph-settled event
  const settled = await page.evaluate(() => {
    return new Promise((resolve) => {
      const graphty = document.querySelector('graphty-element');
      if (!graphty) {
        resolve(false);
        return;
      }
      
      let settledCount = 0;
      const checkSettled = () => {
        if (graphty.graph && graphty.graph.layoutManager && graphty.graph.layoutManager.layoutEngine) {
          const isSettled = graphty.graph.layoutManager.layoutEngine.isSettled;
          if (isSettled) {
            settledCount++;
            if (settledCount >= 5) { // Wait for 5 consecutive settled checks
              console.log('Graph is settled');
              setTimeout(() => resolve(true), 2000);
              return true;
            }
          } else {
            settledCount = 0;
          }
        }
        return false;
      };
      
      // Check initially
      if (checkSettled()) return;
      
      // Set up periodic check
      const interval = setInterval(() => {
        if (checkSettled()) {
          clearInterval(interval);
        }
      }, 100);
      
      const timeout = setTimeout(() => {
        clearInterval(interval);
        console.log('Timeout waiting for graph-settled');
        resolve(false);
      }, 30000);
      
      graphty.addEventListener('graph-settled', () => {
        clearTimeout(timeout);
        clearInterval(interval);
        console.log('Graph settled event received!');
        setTimeout(() => resolve(true), 2000); // Extra wait for rendering
      }, { once: true });
    });
  });
  
  if (!settled) {
    console.log('  Warning: Graph may not have settled properly');
  }
  
  await page.locator('graphty-element').screenshot({ path: outputPath });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await ensureDir('test/screenshots');
  
  const stories = await getStoriesFromIndex(page);
  console.log(`Found ${stories.length} stories to test\n`);
  
  const results = {
    consistent: [],
    inconsistent: [],
    errors: []
  };
  
  // Focus on stories with animated layouts
  const animatedLayoutStories = stories.filter(story => 
    story.id === 'layout-3d--ngraph' || 
    story.id === 'layout-3d--d-3'
  );
  
  console.log(`Testing ${animatedLayoutStories.length} stories with potentially animated layouts\n`);
  
  for (const story of animatedLayoutStories) {
    console.log(`Testing ${story.id}...`);
    
    try {
      const hashes = [];
      
      // Capture 3 screenshots
      for (let i = 0; i < 3; i++) {
        const filename = `test/screenshots/${story.id.replace(/[^a-z0-9-]/gi, '_')}-attempt${i}.png`;
        console.log(`  Capturing attempt ${i + 1}/3...`);
        
        await captureStoryScreenshot(page, story.id, filename);
        
        // Calculate hash of the image
        const { readFileSync } = await import('fs');
        const buffer = readFileSync(filename);
        const hash = createHash('sha256').update(buffer).digest('hex');
        hashes.push(hash);
        console.log(`    Hash: ${hash.substring(0, 16)}...`);
        
        // Add delay between captures
        await page.waitForTimeout(1000);
      }
      
      // Check if all hashes are identical
      const allIdentical = hashes.every(hash => hash === hashes[0]);
      
      if (allIdentical) {
        console.log(`  ✅ Consistent`);
        results.consistent.push(story.id);
      } else {
        console.log(`  ❌ Inconsistent - different hashes detected`);
        results.inconsistent.push(story.id);
      }
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
      results.errors.push({ story: story.id, error: error.message });
    }
    
    console.log('');
  }
  
  // Summary
  console.log('\n=== SUMMARY ===');
  console.log(`Consistent: ${results.consistent.length}`);
  console.log(`Inconsistent: ${results.inconsistent.length}`);
  console.log(`Errors: ${results.errors.length}`);
  
  if (results.inconsistent.length > 0) {
    console.log('\nInconsistent stories:');
    results.inconsistent.forEach(id => console.log(`  - ${id}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(({ story, error }) => console.log(`  - ${story}: ${error}`));
  }
  
  await browser.close();
  
  process.exit(results.inconsistent.length > 0 ? 1 : 0);
}

main().catch(console.error);