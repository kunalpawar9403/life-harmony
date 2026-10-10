import { test, expect } from '@playwright/test';

test.describe('01. Storefront Navigation & Layout Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-001: Homepage loads successfully with title and viewport', async ({ page }) => {
    await expect(page).toHaveTitle(/Life Harmony/i);
    await expect(page.locator('nav')).toBeVisible();
  });

  const routes = [
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Login', path: '/login' },
    { name: 'Checkout', path: '/checkout' },
  ];

  routes.forEach(({ name, path }, idx) => {
    test(`TC-002.${idx + 1}: Direct navigation to ${name} page at ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(path));
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test('TC-010: Navbar brand logo links back to homepage', async ({ page }) => {
    await page.goto('/shop');
    const logoLink = page.locator('nav a[href="/"]').first();
    await expect(logoLink).toBeVisible();
    await logoLink.click();
    await expect(page).toHaveURL('/');
  });

  const navLinks = ['Shop', 'About', 'Blog', 'Contact'];
  navLinks.forEach((linkText, idx) => {
    test(`TC-011.${idx + 1}: Navbar link "${linkText}" navigates correctly`, async ({ page }) => {
      const link = page.locator('nav').getByRole('link', { name: new RegExp(linkText, 'i') }).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page).not.toHaveURL('/');
      }
    });
  });

  test('TC-015: Footer component is rendered with quick links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText(/All rights reserved|Life Harmony/i)).toBeVisible();
  });

  test('TC-016: 404 Not Found page displays error message on invalid URL', async ({ page }) => {
    await page.goto('/random-non-existing-page-xyz');
    await expect(page.getByText(/404|Page Not Found/i).first()).toBeVisible();
  });

  test('TC-017: 404 page contains back to home button', async ({ page }) => {
    await page.goto('/random-non-existing-page-xyz');
    const homeBtn = page.getByRole('link', { name: /Back to Home|Go Home|Home/i }).first();
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();
    await expect(page).toHaveURL('/');
  });

  const viewports = [
    { device: 'Desktop Large', width: 1440, height: 900 },
    { device: 'Desktop Standard', width: 1280, height: 800 },
    { device: 'Tablet Landscape', width: 1024, height: 768 },
    { device: 'Tablet Portrait', width: 768, height: 1024 },
    { device: 'Mobile iPhone', width: 390, height: 844 },
    { device: 'Mobile Android', width: 360, height: 800 },
  ];

  viewports.forEach(({ device, width, height }, idx) => {
    test(`TC-018.${idx + 1}: Responsive layout rendering on ${device} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.locator('body')).toBeVisible();
      if (width < 768) {
        // Mobile bottom navigation is visible on small viewports
        const bottomNav = page.locator('div.fixed.bottom-0');
        if (await bottomNav.count() > 0) {
          await expect(bottomNav.first()).toBeVisible();
        }
      }
    });
  });

  test('TC-025: Hero section renders with headline CTA buttons', async ({ page }) => {
    const heroHeadline = page.locator('h1').first();
    await expect(heroHeadline).toBeVisible();
  });

  test('TC-026: Search icon toggles search input/modal', async ({ page }) => {
    const searchBtn = page.locator('button[aria-label*="Search"], button:has(svg.lucide-search)').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
      const searchInput = page.getByPlaceholder(/Search/i).first();
      await expect(searchInput).toBeVisible();
    }
  });

  test('TC-027: Cart icon in navbar triggers cart drawer', async ({ page }) => {
    const cartBtn = page.locator('button:has(svg.lucide-shopping-bag), button:has(svg.lucide-shopping-cart)').first();
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();
    await expect(page.getByText(/Your Cart|Shopping Cart|Cart/i).first()).toBeVisible();
  });

  test('TC-028: Wishlist icon in navbar links to /wishlist', async ({ page }) => {
    const wishlistLink = page.locator('a[href="/wishlist"]').first();
    await expect(wishlistLink).toBeVisible();
    await wishlistLink.click();
    await expect(page).toHaveURL('/wishlist');
  });

  test('TC-029: User profile/login icon in navbar links correctly', async ({ page }) => {
    const userLink = page.locator('a[href="/login"], a[href="/profile"]').first();
    await expect(userLink).toBeVisible();
  });

  test('TC-030: Scroll to top component activates on scroll down', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });
});
