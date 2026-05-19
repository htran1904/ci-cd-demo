import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,   // CI thì retry 2 lần nếu fail
  reporter: [
    ['list'],                          // In ra terminal
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],  // Cho CI parse
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,                    // CI luôn chạy headless (không có màn hình)
    screenshot: 'only-on-failure',     // Chụp ảnh khi test fail
    video: 'retain-on-failure',        // Ghi video khi test fail
    trace: 'on-first-retry',           // Trace khi retry
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Tự động start/stop server trong quá trình test
  webServer: {
    command: 'node dist/server.js',
    url: 'http://localhost:3000/health',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
