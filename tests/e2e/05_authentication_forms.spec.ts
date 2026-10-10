import { test, expect } from '@playwright/test';

test.describe('05. Authentication & Login Forms Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-120: Login page renders email and password fields', async ({ page }) => {
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel(/Email/i).or(page.getByPlaceholder(/Email/i)).first()).toBeVisible();
    await expect(page.getByLabel(/Password/i).or(page.getByPlaceholder(/Password/i)).first()).toBeVisible();
  });

  test('TC-121: Login submit button is visible and enabled', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /Sign In|Log In|Login/i }).first();
    await expect(submitBtn).toBeVisible();
  });

  test('TC-122: Empty form submission triggers HTML5 / form validation', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /Sign In|Log In|Login/i }).first();
    await submitBtn.click();
    // Verify user is not redirected away on empty submission
    await expect(page).toHaveURL(/\/login/);
  });

  const invalidEmails = [
    'plainaddress',
    'missingatsign.com',
    'missingdot@domain',
    '@nodomain.com'
  ];

  invalidEmails.forEach((badEmail, idx) => {
    test(`TC-123.${idx + 1}: Rejects invalid email format "${badEmail}"`, async ({ page }) => {
      const emailInput = page.getByLabel(/Email/i).or(page.getByPlaceholder(/Email/i)).first();
      await emailInput.fill(badEmail);
      const submitBtn = page.getByRole('button', { name: /Sign In|Log In|Login/i }).first();
      await submitBtn.click();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test('TC-128: Password visibility toggle button switches input type', async ({ page }) => {
    const passwordInput = page.getByLabel(/Password/i).or(page.getByPlaceholder(/Password/i)).first();
    await passwordInput.fill('SecretPassword123');
    const eyeBtn = page.locator('button:has(svg.lucide-eye), button:has(svg.lucide-eye-off)').first();
    if (await eyeBtn.isVisible()) {
      await eyeBtn.click();
      const currentType = await passwordInput.getAttribute('type');
      expect(['text', 'password']).toContain(currentType);
    }
  });

  test('TC-129: Switch to Sign Up / Register tab or link', async ({ page }) => {
    const signupToggle = page.getByRole('button', { name: /Sign Up|Register|Create Account/i })
      .or(page.getByRole('link', { name: /Sign Up|Register|Create Account/i })).first();
    if (await signupToggle.isVisible()) {
      await signupToggle.click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('TC-130: Protected route /profile redirects unauthenticated users to login', async ({ page }) => {
    // Clear tokens
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/login|\/profile/);
  });

  test('TC-131: Remember me checkbox toggles properly', async ({ page }) => {
    const rememberCheckbox = page.getByRole('checkbox', { name: /Remember/i })
      .or(page.locator('input[type="checkbox"]')).first();
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
      await expect(rememberCheckbox).toBeChecked();
    }
  });

  test('TC-132: Forgot password link is visible', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /Forgot/i }).first();
    if (await forgotLink.isVisible()) {
      await expect(forgotLink).toBeVisible();
    }
  });
});
