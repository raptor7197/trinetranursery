import { test, expect } from '@playwright/test';

test('Verify Home Page UI', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/index.html');
  await page.screenshot({ path: 'home_page_final.png', fullPage: true });
});

test('Verify Gallery UI', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/gallery.html');
  await page.screenshot({ path: 'gallery_page_final.png', fullPage: true });
});

test('Verify Services UI', async ({ page }) => {
  await page.goto('file://' + process.cwd() + '/services.html');
  await page.screenshot({ path: 'services_page_final.png', fullPage: true });
});
