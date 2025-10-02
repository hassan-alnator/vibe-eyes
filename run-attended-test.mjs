#!/usr/bin/env node

/**
 * Standalone script to run E2E tests in attended mode
 * This bypasses the MCP server context limitation
 *
 * Usage: node run-attended-test.mjs
 */

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

async function runAttendedTest() {
  console.log('🎭 Starting Attended Mode Test...');
  console.log('👀 Browser window will open and you can watch the test execute!\n');

  let browser = null;
  let page = null;

  try {
    // Create artifacts directory
    await mkdir('.artifacts/screenshots', { recursive: true });

    // Launch browser in attended mode (non-headless)
    browser = await chromium.launch({
      headless: false,  // This makes the browser visible!
      slowMo: 500,      // Slow down actions by 500ms for visibility
      args: [
        '--window-size=1280,720',
        '--window-position=100,100'
      ]
    });

    page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });

    console.log('📍 Step 1: Navigating to test page...');
    await page.goto('http://localhost:8080/test-attended.html');
    await page.waitForTimeout(1000);

    console.log('📸 Step 2: Taking initial screenshot...');
    await page.screenshot({
      path: '.artifacts/screenshots/attended-initial.png',
      fullPage: false
    });

    console.log('🖱️ Step 3: Clicking demo button...');
    await page.click('#demo-button');
    await page.waitForTimeout(1500);

    console.log('📸 Step 4: Screenshot after button click...');
    await page.screenshot({
      path: '.artifacts/screenshots/attended-button-clicked.png',
      fullPage: false
    });

    console.log('⌨️ Step 5: Filling form fields...');
    await page.fill('#username', 'testuser');
    await page.fill('#email', 'test@example.com');

    console.log('🖱️ Step 6: Submitting form...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    console.log('📸 Step 7: Screenshot after form submission...');
    await page.screenshot({
      path: '.artifacts/screenshots/attended-form-submitted.png',
      fullPage: false
    });

    console.log('🖱️ Step 8: Loading dynamic content...');
    await page.click('button[onclick="loadDynamicContent()"]');
    await page.waitForTimeout(1500);

    console.log('📸 Step 9: Final screenshot...');
    await page.screenshot({
      path: '.artifacts/screenshots/attended-dynamic-content.png',
      fullPage: false
    });

    console.log('\n✅ Test completed successfully!');
    console.log('📁 Screenshots saved to .artifacts/screenshots/');

    // Keep browser open for 3 seconds before closing
    console.log('\n⏰ Browser will close in 3 seconds...');
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// Run the test
console.log('==================================');
console.log('   EYES MCP - ATTENDED MODE TEST ');
console.log('==================================\n');

runAttendedTest().catch(console.error);