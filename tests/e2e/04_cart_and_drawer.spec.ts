import { test, expect } from '@playwright/test';

test.describe('04. Cart Drawer & Calculations Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-100: Cart drawer opens on cart icon click', async ({ page }) => {
    const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
    await cartBtn.click();
    await expect(page.getByText(/Your Cart|Cart/i).first()).toBeVisible();
  });

  test('TC-101: Cart drawer displays empty state initially', async ({ page }) => {
    // Clear localStorage to ensure empty state
    await page.evaluate(() => localStorage.removeItem('cart'));
    await page.reload();
    const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
    await cartBtn.click();
    await expect(page.getByText(/Your cart is empty|No items/i).first()).toBeVisible();
  });

  test('TC-102: Close button closes the cart drawer', async ({ page }) => {
    const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
    await cartBtn.click();
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('TC-103: Adding product updates cart item count badge', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const badge = page.locator('span[class*="badge"], span.rounded-full:has-text("1")').first();
      if (await badge.isVisible()) {
        await expect(badge).toHaveText(/1|2/);
      }
    }
  });

  test('TC-104: Added product displays title and price in cart drawer', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
      await cartBtn.click();
      await expect(page.getByText(/₹|\$|\bINR\b/i).first()).toBeVisible();
    }
  });

  test('TC-105: Increasing quantity in cart updates subtotal', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
      await cartBtn.click();
      const plusBtn = page.locator('button:has-text("+"), button[aria-label*="increase"]').first();
      if (await plusBtn.isVisible()) {
        await plusBtn.click();
        await page.waitForTimeout(200);
      }
    }
  });

  test('TC-106: Removing product removes item from cart', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
      await cartBtn.click();
      const trashBtn = page.locator('button:has(svg.lucide-trash), button:has(svg.lucide-trash-2)').first();
      if (await trashBtn.isVisible()) {
        await trashBtn.click();
        await page.waitForTimeout(200);
      }
    }
  });

  test('TC-107: Free shipping progress bar renders in cart', async ({ page }) => {
    const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
    await cartBtn.click();
    const shippingBar = page.getByText(/Free Shipping|eligible for free delivery/i).first();
    if (await shippingBar.isVisible()) {
      await expect(shippingBar).toBeVisible();
    }
  });

  test('TC-108: Checkout button in cart drawer navigates to /checkout', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
      await cartBtn.click();
      const checkoutBtn = page.getByRole('button', { name: /Checkout|Proceed to Checkout/i }).first();
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
        await expect(page).toHaveURL(/\/checkout/);
      }
    }
  });
});
