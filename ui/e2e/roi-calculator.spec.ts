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
    const sliders = roiSection.locator('input[type="range"]');

    await sliders.nth(0).fill('200');
    await sliders.nth(0).dispatchEvent('input');

    await expect(roiSection.locator('text=360 hrs')).toBeVisible();
  });
});
