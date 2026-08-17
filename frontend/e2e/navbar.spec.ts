import { test, expect } from '@playwright/test';

test.describe('Navbar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display brand logo and title', async ({ page }) => {
    const brand = page.locator('header').locator('text=OutageIQ');
    await expect(brand).toBeVisible();

    const prdBadge = page.locator('header').locator('text=v1.0 PRD');
    await expect(prdBadge).toBeVisible();

    const subtitle = page.locator('header').locator('text=The NOC Squad • Telecom Impact Engine');
    await expect(subtitle).toBeVisible();
  });

  test('should display desktop navigation links', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Scoring Simulator' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Live Queue Demo' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Personas' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Methodology' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'PRD Spec' })).toBeVisible();
  });

  test('should display action CTAs in header', async ({ page }) => {
    const header = page.locator('header');
    await expect(header.getByRole('link', { name: /View PRD/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /Launch Interactive Queue/i })).toBeVisible();
  });

  test('should support mobile drawer menu toggling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    const mobileDrawer = page.locator('div.md\\:hidden');
    await expect(mobileDrawer).toBeVisible();

    const mobileSimLink = mobileDrawer.getByRole('link', { name: 'Scoring Simulator' });
    await expect(mobileSimLink).toBeVisible();

    await mobileSimLink.click();
    await expect(mobileDrawer).not.toBeVisible();
  });
});
