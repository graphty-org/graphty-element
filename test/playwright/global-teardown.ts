import { FullConfig } from '@playwright/test';
import { getPerformanceReport } from './utils/visual-test.utils';

/**
 * Global teardown to show performance report after tests
 */
async function globalTeardown(config: FullConfig) {
    // Only show report if we ran visual tests
    if (process.env.TEST_PROJECT_NAME === 'visual' || process.env.FAST_VISUAL_TESTS === 'true') {
        console.log('\n' + '='.repeat(60));
        console.log(getPerformanceReport());
        console.log('='.repeat(60) + '\n');
    }
}

export default globalTeardown;