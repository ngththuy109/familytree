import { test, expect } from '@playwright/test';

test('trang chủ khai báo manifest PWA', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toContain('manifest');
});

test('có thẻ theme-color cho PWA', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
});
