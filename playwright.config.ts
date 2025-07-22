import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './test',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : undefined,
  
  reporter: process.env.CI ? [
    ['line'],
    ['junit', { outputFile: 'junit.xml' }],
    ['html', { 
      outputFolder: 'playwright-report',
      host: process.env.PLAYWRIGHT_REPORT_HOST || 'localhost',
      port: process.env.PLAYWRIGHT_REPORT_PORT ? parseInt(process.env.PLAYWRIGHT_REPORT_PORT) : undefined
    }]
  ] : [
    ['html', { 
      outputFolder: 'playwright-report',
      host: process.env.PLAYWRIGHT_REPORT_HOST || 'localhost',
      port: process.env.PLAYWRIGHT_REPORT_PORT ? parseInt(process.env.PLAYWRIGHT_REPORT_PORT) : undefined
    }]
  ],
  
  use: {
    // Consistent viewport for visual tests
    viewport: { width: 1280, height: 720 },
    // Capture traces and videos on retry for debugging
    trace: 'on-first-retry',
    video: 'on-first-retry',
    // Device scale factor for consistent rendering
    deviceScaleFactor: 1,
  },
  
  // Multiple projects for different test scenarios
  projects: [
    {
      name: 'webgl2-visual',
      testMatch: '**/*.visual.spec.ts',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--use-angle=default', '--ignore-gpu-blacklist']
        }
      }
    },
    {
      name: 'webgl1-visual',
      testMatch: '**/*.visual.spec.ts',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--use-angle=default', '--disable-webgl2']
        }
      }
    },
    {
      name: 'interaction',
      testMatch: '**/interaction/**/*.spec.ts',
      use: { browserName: 'chromium' }
    },
    {
      name: 'performance',
      testMatch: '**/performance/**/*.spec.ts',
      use: { browserName: 'chromium' }
    }
  ],
  
  // Snapshot path configuration
  snapshotPathTemplate: '{testDir}/playwright/visual/screenshots-baseline/{projectName}/{testFileDir}/{testFileName}-{arg}{ext}'
});