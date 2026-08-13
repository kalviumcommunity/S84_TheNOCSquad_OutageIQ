import { test, expect } from '@playwright/test';

test.describe('Hero Section Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display main heading and product taglines', async ({ page }) => {
    const mainHeading = page.getByRole('heading', { level: 1, name: /Transform Telecom Outage Triage/i });
    await expect(mainHeading).toBeVisible();

    const subtitle = page.locator('text=Telecom teams receive network alerts');
    await expect(subtitle).toBeVisible();
  });

  test('should render CTA buttons and support navigation', async ({ page }) => {
    const primaryCta = page.getByRole('link', { name: /Try Live Impact Calculator/i });
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toHaveAttribute('href', '#calculator');

    const secondaryCta = page.getByRole('link', { name: /Explore Prioritized Queue/i });
    await expect(secondaryCta).toBeVisible();
    await expect(secondaryCta).toHaveAttribute('href', '#queue-preview');
  });

  test('should display feature highlights and stats', async ({ page }) => {
    await expect(page.locator('text=Unified Fusion').first()).toBeVisible();
    await expect(page.locator('text=Explainable AI').first()).toBeVisible();
  });
});
