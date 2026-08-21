import { test, expect } from '@playwright/test';

test.describe('Real-Time Critical Threshold Alerting & Historical Trend Analytics (PRD Sec 8.3, FR8, FR12, FR16)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display Executive KPI Ribbon with all 4 core metrics (FR8)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();
    await expect(queueSection).toBeVisible();

    await expect(queueSection.locator('text=Active Incidents')).toBeVisible();
    await expect(queueSection.locator('text=Critical Incidents (≥75)')).toBeVisible();
    await expect(queueSection.locator('text=Total Customers Impacted')).toBeVisible();
    await expect(queueSection.locator('text=Average Resolution (MTTR)')).toBeVisible();

    await expect(queueSection.locator('text=126,700')).toBeVisible();
    await expect(queueSection.locator('text=1.8').first()).toBeVisible();
  });

  test('should display Critical Incident Alert Banner and support Triage & Acknowledge actions (FR16)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();

    // Verify Critical Alert Banner is visible
    const alertBanner = queueSection.locator('text=CRITICAL P1 ALERT (SCORE ≥ 75)');
    await expect(alertBanner).toBeVisible();
    await expect(queueSection.locator('text=OUT-8902 • Impact Score 94.2 / 100')).toBeVisible();

    // Click Triage Now button to open modal
    const triageBtn = queueSection.getByRole('button', { name: /Triage Now/i });
    await expect(triageBtn).toBeVisible();
    await triageBtn.click();

    // Modal should appear
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('OUT-8902', { exact: true })).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    // Click Acknowledge Alert button
    const ackBtn = queueSection.getByRole('button', { name: /Acknowledge Alert/i });
    await expect(ackBtn).toBeVisible();
    await ackBtn.click();

    // Alert banner should be dismissed
    await expect(alertBanner).not.toBeVisible();
  });

  test('should display Impact Trend Analytics section and toggle 7D / 30D rolling horizons (FR12)', async ({ page }) => {
    const trendSection = page.locator('#trend-analytics');
    await trendSection.scrollIntoViewIfNeeded();
    await expect(trendSection).toBeVisible();

    const heading = trendSection.getByRole('heading', { name: /Rolling Outage Volume & Impact Trends/i });
    await expect(heading).toBeVisible();

    // Verify 7-day default data
    await expect(trendSection.getByText('Mon', { exact: true }).first()).toBeVisible();
    await expect(trendSection.getByText('Sun', { exact: true }).first()).toBeVisible();

    // Toggle to 30-Day Monthly View
    const monthlyBtn = trendSection.getByRole('button', { name: /30-Day Monthly View/i });
    await expect(monthlyBtn).toBeVisible();
    await monthlyBtn.click();

    // Verify 30-day week intervals
    await expect(trendSection.getByText('Week 1', { exact: true }).first()).toBeVisible();
    await expect(trendSection.getByText('Week 4 (Current)', { exact: true }).first()).toBeVisible();

    // Toggle back to 7-Day Rolling View
    const weeklyBtn = trendSection.getByRole('button', { name: /7-Day Rolling View/i });
    await weeklyBtn.click();
    await expect(trendSection.getByText('Mon', { exact: true }).first()).toBeVisible();
  });
});
