import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'http://localhost:3007';

export default defineConfig({
    testDir: './e2e',

    /** Timeout for each test in milliseconds. Defaults to 30 seconds. */
    timeout: 30_000,

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: Boolean(process.env.CI),

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 3,

    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',

    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: BASE_URL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',

        /* Dark color scheme so our eyes don't bleed while debugging the tests */
        colorScheme: 'dark'
    },

    /** Start the development server before running tests */
    // webServer: [
    //     {
    //         command: 'pnpm dev',
    //         reuseExistingServer: !process.env.CI,
    //         timeout: 120_000
    //     }
    // ],

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome']
            }
        }
        // Add firefox/webkit later if you care
    ]
});
