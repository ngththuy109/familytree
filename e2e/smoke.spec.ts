import { test, expect } from '@playwright/test';

test('trang chủ hiển thị tên app và điều hướng dưới có 5 mục', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Gia Phả Việt').first()).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Điều hướng chính' });
  await expect(nav.getByRole('link')).toHaveCount(5);
});
