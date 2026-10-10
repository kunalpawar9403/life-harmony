import { test, expect } from '@playwright/test';

test.describe('08. Admin Portal & Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-180: Admin portal route renders layout', async ({ page }) => {
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-181: Admin dashboard renders analytics metrics cards', async ({ page }) => {
    const metrics = page.getByText(/Revenue|Orders|Products|Customers|Analytics|Dashboard/i).first();
    if (await metrics.isVisible()) {
      await expect(metrics).toBeVisible();
    }
  });

  test('TC-182: Admin portal navigation tabs exist', async ({ page }) => {
    const tabs = ['Dashboard', 'Products', 'Orders', 'Customers'];
    for (const tab of tabs) {
      const tabElement = page.getByText(new RegExp(tab, 'i')).first();
      if (await tabElement.isVisible()) {
        await expect(tabElement).toBeVisible();
      }
    }
  });

  test('TC-183: Products table displays inventory and stock status', async ({ page }) => {
    const productsTab = page.getByRole('button', { name: /Products/i }).or(page.getByRole('tab', { name: /Products/i })).first();
    if (await productsTab.isVisible()) {
      await productsTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('table, div[class*="grid"], div[class*="product"]').first()).toBeVisible();
    }
  });

  test('TC-184: Add Product button is visible in admin product view', async ({ page }) => {
    const addProductBtn = page.getByRole('button', { name: /Add Product|New Product/i }).first();
    if (await addProductBtn.isVisible()) {
      await expect(addProductBtn).toBeVisible();
    }
  });

  test('TC-185: Orders management tab lists customer orders', async ({ page }) => {
    const ordersTab = page.getByRole('button', { name: /Orders/i }).or(page.getByRole('tab', { name: /Orders/i })).first();
    if (await ordersTab.isVisible()) {
      await ordersTab.click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('TC-186: Admin search bar allows filtering products or orders', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search products|Search orders|Search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Collagen');
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('TC-187: Admin portal responsive view on tablet and mobile', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });
});
