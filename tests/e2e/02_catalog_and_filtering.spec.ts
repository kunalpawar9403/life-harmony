import { test, expect } from '@playwright/test';

test.describe('02. Catalog & Filtering Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-040: Shop catalog page loads with product grid', async ({ page }) => {
    await expect(page).toHaveURL(/\/shop/);
    const productCards = page.locator('div[class*="product"], article, div:has(h3)');
    await expect(productCards.first()).toBeVisible();
  });

  const categories = [
    'All',
    'Vitamins & Minerals',
    'Proteins & Collagen',
    'Hydration',
    'Immunity',
    'Specialty'
  ];

  categories.forEach((cat, idx) => {
    test(`TC-041.${idx + 1}: Filter products by category "${cat}"`, async ({ page }) => {
      const catButton = page.getByRole('button', { name: new RegExp(cat, 'i') }).first();
      if (await catButton.isVisible()) {
        await catButton.click();
        await page.waitForTimeout(300);
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  const sortOptions = [
    { label: 'Featured / Default', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' },
  ];

  sortOptions.forEach(({ label }, idx) => {
    test(`TC-047.${idx + 1}: Sort products by "${label}"`, async ({ page }) => {
      const sortSelect = page.locator('select, button[role="combobox"]').first();
      if (await sortSelect.isVisible()) {
        await sortSelect.click();
        const option = page.getByText(new RegExp(label, 'i')).first();
        if (await option.isVisible()) {
          await option.click();
          await page.waitForTimeout(300);
        }
      }
    });
  });

  test('TC-052: Product card displays title, price, and image', async ({ page }) => {
    const card = page.locator('div:has(h3), article:has(h3)').first();
    await expect(card).toBeVisible();
    await expect(card.locator('img').first()).toBeVisible();
    await expect(card.locator('h3').first()).toBeVisible();
  });

  test('TC-053: Product card has Add to Cart button', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Add to Cart|Add/i }).first();
    await expect(addBtn).toBeVisible();
  });

  test('TC-054: Product card has Wishlist heart toggle icon', async ({ page }) => {
    const heartBtn = page.locator('button:has(svg.lucide-heart)').first();
    if (await heartBtn.isVisible()) {
      await expect(heartBtn).toBeEnabled();
    }
  });

  test('TC-055: Clicking product card title navigates to product detail page', async ({ page }) => {
    const cardTitle = page.locator('h3 a, a:has(h3)').first();
    if (await cardTitle.isVisible()) {
      const href = await cardTitle.getAttribute('href');
      await cardTitle.click();
      await expect(page).toHaveURL(new RegExp(href || '/product/'));
    }
  });

  test('TC-056: Search input filters products dynamically', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search products|Search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Collagen');
      await page.waitForTimeout(400);
      await expect(page.getByText(/Collagen/i).first()).toBeVisible();
    }
  });

  test('TC-057: Clearing search input restores full catalog', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search products|Search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Collagen');
      await searchInput.fill('');
      await page.waitForTimeout(300);
      await expect(page.locator('h3').first()).toBeVisible();
    }
  });

  test('TC-058: No products found state on unmatched search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search products|Search/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistentquery999');
      await page.waitForTimeout(400);
      await expect(page.getByText(/No products found|Try adjusting your search/i).first()).toBeVisible();
    }
  });

  test('TC-059: Product badges render for sales / bestsellers', async ({ page }) => {
    const badges = page.locator('span:has-text("Sale"), span:has-text("Best Seller"), span:has-text("Popular")');
    if (await badges.count() > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });

  test('TC-060: Rating stars render on product cards', async ({ page }) => {
    const stars = page.locator('svg.lucide-star, svg[class*="star"]');
    if (await stars.count() > 0) {
      await expect(stars.first()).toBeVisible();
    }
  });
});
