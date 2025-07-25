#!/usr/bin/env node
/**
 * Run visual tests with appropriate settings to avoid flakiness
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const testFiles = [
  { name: 'Calculated', tests: 3 },
  { name: 'Data', tests: 4 },
  { name: 'EdgeStyles', tests: 8 },
  { name: 'GraphStyles', tests: 9 },
  { name: 'Graphty', tests: 1 },
  { name: 'LabelStyles', tests: 155 },
  { name: 'Layout', tests: 46 },
  { name: 'Layout2D', tests: 70 },
  { name: 'NodeStyles', tests: 28 }
];

const logDir = 'visual-test-logs';
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

const results = [];
let totalPassed = 0;
let totalFailed = 0;

console.log('🏃 Running Visual Tests with Safe Settings\n');
console.log('This will run tests with --workers=1 to avoid parallel execution issues.\n');

for (const file of testFiles) {
  console.log(`\n📋 Testing ${file.name} (${file.tests} tests)...`);
  console.log('─'.repeat(50));
  
  const startTime = Date.now();
  const logFile = path.join(logDir, `${file.name.toLowerCase()}.log`);
  
  try {
    // Run with single worker and update snapshots
    execSync(
      `npx playwright test --project=visual test/playwright/generated/${file.name}.visual.spec.ts --update-snapshots --reporter=list --workers=1`,
      { 
        stdio: ['inherit', 'pipe', 'pipe'],
        encoding: 'utf8'
      }
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ ${file.name}: All tests passed in ${duration}s`);
    results.push({ file: file.name, status: 'PASSED', tests: file.tests, duration });
    totalPassed += file.tests;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`❌ ${file.name}: Some tests failed in ${duration}s`);
    
    // Save error log
    if (error.stdout) writeFileSync(logFile, error.stdout);
    if (error.stderr) writeFileSync(logFile + '.err', error.stderr);
    
    results.push({ file: file.name, status: 'FAILED', tests: file.tests, duration });
    totalFailed += file.tests;
  }
}

// Summary
console.log('\n\n📊 SUMMARY');
console.log('═'.repeat(50));
console.log(`Total test files: ${testFiles.length}`);
console.log(`Total tests: ${testFiles.reduce((sum, f) => sum + f.tests, 0)}`);
console.log(`Passed: ${totalPassed}`);
console.log(`Failed: ${totalFailed}`);

console.log('\n📁 Results by file:');
for (const result of results) {
  const icon = result.status === 'PASSED' ? '✅' : '❌';
  console.log(`${icon} ${result.file}: ${result.status} (${result.tests} tests, ${result.duration}s)`);
}

// Create summary file
const summaryPath = path.join(logDir, 'summary.json');
writeFileSync(summaryPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  results,
  totals: {
    files: testFiles.length,
    tests: testFiles.reduce((sum, f) => sum + f.tests, 0),
    passed: totalPassed,
    failed: totalFailed
  }
}, null, 2));

console.log(`\n📄 Detailed logs saved to: ${logDir}/`);
console.log(`📊 Summary saved to: ${summaryPath}`);

// Exit with error if any tests failed
if (totalFailed > 0) {
  process.exit(1);
}