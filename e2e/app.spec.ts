import { test, expect } from '@playwright/test';

test('danh sách hiển thị dòng họ demo với thành viên (seed IndexedDB)', async ({ page }) => {
  await page.goto('/danh-sach');
  await expect(page.getByText('Họ Nguyễn – Làng Demo')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Nguyễn Văn Cả')).toBeVisible();
  await expect(page.getByText('Đời 1')).toBeVisible();
});

test('tìm kiếm không dấu tìm ra người có dấu', async ({ page }) => {
  await page.goto('/tim-kiem');
  await page.getByPlaceholder('Nhập tên người cần tìm…').fill('nguyen van an');
  await expect(page.getByText('Nguyễn Văn An')).toBeVisible({ timeout: 15000 });
});

test('xác định quan hệ: Em gọi cha An là "Ba", An gọi lại "Con"', async ({ page }) => {
  await page.goto('/quan-he');
  await page.getByLabel('Người thứ nhất').selectOption({ label: 'Nguyễn Văn Em' });
  await page.getByLabel('Người thứ hai').selectOption({ label: 'Nguyễn Văn An' });
  await expect(page.getByText(/là\s*Ba/)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/là\s*Con/)).toBeVisible();
});

test('cây gia phả render các node SVG', async ({ page }) => {
  await page.goto('/cay');
  const svg = page.locator('svg');
  await expect(svg).toBeVisible({ timeout: 15000 });
  await expect(svg.locator('text', { hasText: 'Nguyễn' }).first()).toBeVisible();
});

test('chế độ người lớn tuổi bật data-elderly trên html', async ({ page }) => {
  await page.goto('/cai-dat');
  await page.getByRole('button', { name: /chữ to/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-elderly', 'true', { timeout: 5000 });
});
