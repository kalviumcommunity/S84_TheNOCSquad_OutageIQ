import { test, expect } from '@playwright/test';

test.describe('ROI Savings Calculator Component (PRD Sec 10)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display ROI section and default calculations', async ({ page }) => {
    const roiSection = page.locator('section').filter({ hasText: /Calculate Your Telecom ROI & Savings/i });
    await expect(roiSection).toBeVisible();

    await expect(roiSection.locator('text=$170,000')).toBeVisible();
    await expect(roiSection.locator('text=216 hrs')).toBeVisible();
  });

  test('should recalculate annual savings when sliders are adjusted', async ({ page }) => {
    const roiSection = page.locator('section').filter({ hasText: /Calculate Your Telecom ROI & Savings/i });
    const slider = roiSection.locator('input[type="range"]').nth(0);

    await slider.evaluate((el: HTMLInputElement) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set;
      nativeSetter!.call(el, '200');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(roiSection.locator('text=360 hrs')).toBeVisible();
  });
});
