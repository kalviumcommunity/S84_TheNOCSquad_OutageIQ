import { test, expect } from '@playwright/test';

test.describe('OutageIQ Full User Journey & Responsiveness E2E', () => {
  test('should execute complete user journey through all PRD features on desktop', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await expect(page.locator('header').locator('text=OutageIQ')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Transform Telecom Outage Triage');

    const calcSection = page.locator('#calculator');
    await calcSection.scrollIntoViewIfNeeded();
    await expect(calcSection).toBeVisible();

    const fiberBtn = calcSection.getByRole('button', { name: /Metro Fiber Cut/i });
    await fiberBtn.click();
    await expect(calcSection.locator('text=CRITICAL TIER').first()).toBeVisible();

    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();
    await expect(queueSection).toBeVisible();

    const regionSelect = queueSection.locator('select').first();
    await regionSelect.selectOption('North Region');
    await expect(queueSection.getByText('OUT-8902', { exact: true })).toBeVisible();

    await queueSection.locator('tr').filter({ hasText: 'OUT-8902' }).click();
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();
    await modal.getByRole('button', { name: /Done Inspecting/i }).click();
    await expect(modal).not.toBeVisible();

    const prdSection = page.locator('#prd-spec');
    await prdSection.scrollIntoViewIfNeeded();
    await prdSection.getByRole('button', { name: /Data Sources & Schemas/i }).click();
    await expect(prdSection.locator('text=Network Outage Alerts')).toBeVisible();

    await prdSection.getByRole('button', { name: /^Non-Functional Requirements/i }).click();
    await expect(prdSection.locator('text=Performance').first()).toBeVisible();

    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
  });

  test('should render properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:3000');

    await expect(page.locator('header').locator('text=OutageIQ')).toBeVisible();
    const menuButton = page.locator('button[aria-label="Toggle menu"]');
    await expect(menuButton).toBeVisible();

    await menuButton.click();
    await expect(page.locator('div.md\\:hidden')).toBeVisible();
  });
});
