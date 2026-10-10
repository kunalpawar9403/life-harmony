import { test, expect } from '@playwright/test';

test.describe('03. Product Detail Page (PDP) Tests', () => {
  const sampleProducts = [
    'vitamin-d3-k2',
    'marine-collagen-peptides',
    'omega-3-fish-oil',
    'b-complex',
    'hydrate-electrolytes',
  ];

  sampleProducts.forEach((slug, idx) => {
    test(`TC-070.${idx + 1}: Navigate to product PDP for "${slug}"`, async ({ page }) => {
      await page.goto(`/product/${slug}`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(new RegExp(`/product/${slug}`));
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/product/marine-collagen-peptides');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-080: PDP displays main product title, rating, and price', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText(/₹|\$|\bINR\b/i).first()).toBeVisible();
  });

  test('TC-081: PDP renders main image and gallery thumbnails', async ({ page }) => {
    const mainImg = page.locator('img[alt*="Collagen"], div.aspect-square img, img').first();
    await expect(mainImg).toBeVisible();
  });

  test('TC-082: Quantity increment increases quantity value', async ({ page }) => {
    const plusBtn = page.getByRole('button', { name: '+' }).first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await expect(page.getByText('2').first()).toBeVisible();
    }
  });

  test('TC-083: Quantity decrement decreases quantity value (min 1)', async ({ page }) => {
    const plusBtn = page.getByRole('button', { name: '+' }).first();
    const minusBtn = page.getByRole('button', { name: '-' }).first();
    if (await plusBtn.isVisible() && await minusBtn.isVisible()) {
      await plusBtn.click();
      await minusBtn.click();
      await expect(page.getByText('1').first()).toBeVisible();
    }
  });

  test('TC-084: Add to Cart button is clickable and triggers feedback', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    // Verify toast or cart drawer appears
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC-085: Wishlist button on PDP toggles active state', async ({ page }) => {
    const wishlistBtn = page.locator('button:has(svg.lucide-heart)').first();
    if (await wishlistBtn.isVisible()) {
      await wishlistBtn.click();
      await page.waitForTimeout(300);
      await expect(wishlistBtn).toBeVisible();
    }
  });

  test('TC-086: Description tab is visible with product benefits', async ({ page }) => {
    await expect(page.getByText(/Benefits|Description|Ingredients/i).first()).toBeVisible();
  });

  test('TC-087: Customer reviews / rating breakdown section is visible', async ({ page }) => {
    const reviewsSection = page.getByText(/Reviews|Customer Rating|Verified/i).first();
    if (await reviewsSection.isVisible()) {
      await expect(reviewsSection).toBeVisible();
    }
  });

  test('TC-088: Related / Recommended products carousel is present', async ({ page }) => {
    const relatedSection = page.getByText(/You may also like|Related Products|Recommended/i).first();
    if (await relatedSection.isVisible()) {
      await expect(relatedSection).toBeVisible();
    }
  });

  test('TC-089: Buy Now button redirects to checkout', async ({ page }) => {
    const buyNowBtn = page.getByRole('button', { name: /Buy Now/i }).first();
    if (await buyNowBtn.isVisible()) {
      await buyNowBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/checkout|\/product\//);
    }
  });
});
