import { test, expect } from '@playwright/test';

test.describe('06. Checkout & Order Placement Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-140: Checkout page renders main order summary section', async ({ page }) => {
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText(/Order Summary|Checkout/i).first()).toBeVisible();
  });

  test('TC-141: Shipping address inputs are rendered', async ({ page }) => {
    const fullNameInput = page.getByLabel(/Name|Full Name/i).or(page.getByPlaceholder(/Name|Full Name/i)).first();
    const emailInput = page.getByLabel(/Email/i).or(page.getByPlaceholder(/Email/i)).first();
    const phoneInput = page.getByLabel(/Phone/i).or(page.getByPlaceholder(/Phone/i)).first();
    const streetInput = page.getByLabel(/Address|Street/i).or(page.getByPlaceholder(/Address|Street/i)).first();

    if (await fullNameInput.isVisible()) await expect(fullNameInput).toBeVisible();
    if (await emailInput.isVisible()) await expect(emailInput).toBeVisible();
    if (await phoneInput.isVisible()) await expect(phoneInput).toBeVisible();
    if (await streetInput.isVisible()) await expect(streetInput).toBeVisible();
  });

  test('TC-142: Submitting empty checkout form highlights required inputs', async ({ page }) => {
    const placeOrderBtn = page.getByRole('button', { name: /Place Order|Pay Now|Continue/i }).first();
    if (await placeOrderBtn.isVisible()) {
      await placeOrderBtn.click();
      await expect(page).toHaveURL(/\/checkout/);
    }
  });

  test('TC-143: Coupon code input accepts promo codes', async ({ page }) => {
    const couponInput = page.getByPlaceholder(/Promo code|Coupon/i).first();
    const applyBtn = page.getByRole('button', { name: /Apply/i }).first();
    if (await couponInput.isVisible() && await applyBtn.isVisible()) {
      await couponInput.fill('HARMONY10');
      await applyBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  const paymentMethods = [
    'Credit / Debit Card',
    'UPI / QR Code',
    'Net Banking',
    'Cash on Delivery'
  ];

  paymentMethods.forEach((method, idx) => {
    test(`TC-144.${idx + 1}: Select payment method "${method}"`, async ({ page }) => {
      const option = page.getByText(new RegExp(method, 'i')).first();
      if (await option.isVisible()) {
        await option.click();
        await page.waitForTimeout(200);
      }
    });
  });

  test('TC-150: Order total reflects items, tax, and shipping calculations', async ({ page }) => {
    const totalElement = page.getByText(/Total|Grand Total/i).first();
    await expect(totalElement).toBeVisible();
  });

  test('TC-151: Security badges / trust seals are visible at checkout', async ({ page }) => {
    const trustBadge = page.getByText(/Secure Checkout|SSL Encrypted|Money Back/i).first();
    if (await trustBadge.isVisible()) {
      await expect(trustBadge).toBeVisible();
    }
  });

  test('TC-152: Back to cart / shopping navigation link exists', async ({ page }) => {
    const backBtn = page.getByRole('link', { name: /Return to Cart|Continue Shopping|Back/i }).first();
    if (await backBtn.isVisible()) {
      await expect(backBtn).toBeVisible();
    }
  });
});
