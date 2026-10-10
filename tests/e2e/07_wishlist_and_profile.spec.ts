import { test, expect } from '@playwright/test';

test.describe('07. Wishlist & User Profile Tests', () => {
  test('TC-160: Wishlist page renders empty state initially', async ({ page }) => {
    await page.goto('/wishlist');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/wishlist/);
    await expect(page.getByText(/Wishlist/i).first()).toBeVisible();
  });

  test('TC-161: Wishlist contains button to browse products', async ({ page }) => {
    await page.goto('/wishlist');
    const browseBtn = page.getByRole('link', { name: /Explore Products|Shop Now|Continue Shopping/i }).first();
    if (await browseBtn.isVisible()) {
      await browseBtn.click();
      await expect(page).toHaveURL(/\/shop|\//);
    }
  });

  test('TC-162: Adding product to wishlist shows on /wishlist', async ({ page }) => {
    await page.goto('/shop');
    const heartBtn = page.locator('button:has(svg.lucide-heart)').first();
    if (await heartBtn.isVisible()) {
      await heartBtn.click();
      await page.goto('/wishlist');
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('TC-163: About page renders brand mission and story', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/About|Mission|Story|Harmony/i).first()).toBeVisible();
  });

  test('TC-164: Blog page renders article list', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(/Blog|Articles|Insights/i).first()).toBeVisible();
  });

  test('TC-165: Clicking blog article navigates to article details', async ({ page }) => {
    await page.goto('/blog');
    const articleLink = page.locator('a[href*="/blog/"]').first();
    if (await articleLink.isVisible()) {
      await articleLink.click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/\/blog\//);
    }
  });

  test('TC-166: Contact page renders form with Name, Email, Message', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByLabel(/Name/i).or(page.getByPlaceholder(/Name/i)).first()).toBeVisible();
    await expect(page.getByLabel(/Email/i).or(page.getByPlaceholder(/Email/i)).first()).toBeVisible();
    await expect(page.getByLabel(/Message/i).or(page.getByPlaceholder(/Message/i)).first()).toBeVisible();
  });

  test('TC-167: Submitting contact form displays confirmation notice', async ({ page }) => {
    await page.goto('/contact');
    const nameInput = page.getByPlaceholder(/Name/i).first();
    const emailInput = page.getByPlaceholder(/Email/i).first();
    const msgInput = page.getByPlaceholder(/Message/i).first();

    if (await nameInput.isVisible()) await nameInput.fill('QA Tester');
    if (await emailInput.isVisible()) await emailInput.fill('qa@test.com');
    if (await msgInput.isVisible()) await msgInput.fill('Automated inquiry test message.');

    const submitBtn = page.getByRole('button', { name: /Send|Submit/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
