import { chromium } from "playwright";
import { createHash } from "crypto";

async function testStoryConsistency(page, storyId) {
  console.log(`\nTesting consistency of ${storyId}...`);
  
  const hashes = [];
  
  for (let i = 0; i < 3; i++) {
    console.log(`  Taking screenshot ${i + 1}/3...`);
    
    // Navigate to story
    await page.goto(`http://dev.ato.ms:9025/iframe.html?id=${storyId}&viewMode=story`);
    await page.waitForSelector('graphty-element', { timeout: 15000 });
    
    // Wait for Storybook play function to complete (if any)
    await page.waitForTimeout(8000);
    
    const screenshot = await page.locator('graphty-element').screenshot();
    const hash = createHash('sha256').update(screenshot).digest('hex');
    hashes.push(hash);
    console.log(`    Screenshot ${i + 1} hash: ${hash.substring(0, 16)}...`);
    
    // Save screenshot for debugging
    await page.locator('graphty-element').screenshot({ 
      path: `test/screenshots/${storyId}-consistency-${i}.png` 
    });
  }
  
  // Check consistency
  const allIdentical = hashes.every(hash => hash === hashes[0]);
  if (allIdentical) {
    console.log(`  ✅ ${storyId} is consistent!`);
  } else {
    console.log(`  ❌ ${storyId} is inconsistent`);
    console.log(`    Hash differences: ${hashes.map(h => h.substring(0, 8)).join(', ')}`);
  }
  
  return { storyId, consistent: allIdentical, hashes };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const stories = [
    'layout-3d--ngraph',
    'layout-3d--d-3'
  ];
  
  const results = [];
  
  for (const storyId of stories) {
    const result = await testStoryConsistency(page, storyId);
    results.push(result);
  }
  
  console.log('\n=== SUMMARY ===');
  results.forEach(result => {
    const status = result.consistent ? '✅' : '❌';
    console.log(`${status} ${result.storyId}: ${result.consistent ? 'Consistent' : 'Inconsistent'}`);
  });
  
  await browser.close();
}

main().catch(console.error);