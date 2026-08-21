import { test, expect } from '@playwright/test';

test.describe('OutageIQ Comprehensive Production End-to-End Journey (Phases 1-10)', () => {
  test('should execute complete user journey through all PRD features on desktop', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // 1. Navbar & Hero Section
    await expect(page.locator('header').locator('text=OutageIQ')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Transform Telecom Outage Triage');

    // 2. Impact Calculator & Preset Scenarios (Phase 3 & 4)
    const calcSection = page.locator('#calculator');
    await calcSection.scrollIntoViewIfNeeded();
    await expect(calcSection).toBeVisible();

    const fiberBtn = calcSection.getByRole('button', { name: /Metro Fiber Cut/i });
    await fiberBtn.click();
    await expect(calcSection.locator('text=CRITICAL TIER').first()).toBeVisible();

    // 3. Regional Geo-Operational Analytics (Phase 8)
    const regionalSection = page.locator('#regional-analytics');
    await regionalSection.scrollIntoViewIfNeeded();
    await expect(regionalSection).toBeVisible();
    await expect(regionalSection.getByRole('heading', { name: 'North Region' })).toBeVisible();

    // 4. Live Queue Preview, KPI Ribbon, Critical Alert, & Executive Mode (Phases 5, 6, 7, 9, 10)
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();
    await expect(queueSection).toBeVisible();

    // KPI Summary Ribbon (FR8)
    await expect(queueSection.locator('text=Active Incidents')).toBeVisible();
    await expect(queueSection.locator('text=Critical Incidents (≥75)')).toBeVisible();

    // Critical Alert Banner (FR16)
    await expect(queueSection.locator('text=CRITICAL P1 ALERT (SCORE ≥ 75)')).toBeVisible();

    // Filter by Region (FR13)
    const regionSelect = queueSection.locator('select').first();
    await regionSelect.selectOption('North Region');
    await expect(queueSection.getByText('OUT-8902', { exact: true })).toBeVisible();

    // Export CSV and Briefing buttons (FR14 & Phase 10)
    await expect(queueSection.getByRole('button', { name: /Export CSV/i }).first()).toBeVisible();
    await expect(queueSection.getByRole('button', { name: /Export Briefing/i }).first()).toBeVisible();

    // Outage Detail Drill-down Modal (FR10 & Phase 7)
    await queueSection.locator('tr').filter({ hasText: 'OUT-8902' }).click();
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('OUT-8902', { exact: true })).toBeVisible();
    await expect(modal.locator('text=Customer Reach (35% Wt):')).toBeVisible();
    await modal.getByRole('button', { name: /Done Inspecting/i }).click();
    await expect(modal).not.toBeVisible();

    // Reset region filter
    await regionSelect.selectOption('ALL');

    // 5. Impact Trend Analytics (Phase 9 & FR12)
    const trendSection = page.locator('#trend-analytics');
    await trendSection.scrollIntoViewIfNeeded();
    await expect(trendSection).toBeVisible();
    await expect(trendSection.getByRole('heading', { name: /Rolling Outage Volume & Impact Trends/i })).toBeVisible();

    // 6. Methodology Pipeline & Sliding Window (Phase 2 & FR4)
    const methodologySection = page.locator('#methodology');
    await methodologySection.scrollIntoViewIfNeeded();
    await expect(methodologySection).toBeVisible();
    await expect(methodologySection.locator('text=Multi-Source Data Ingestion')).toBeVisible();
    await expect(methodologySection.locator('text=Spatio-Temporal Fusion & Join')).toBeVisible();

    // 7. PRD Requirements & Schema Health Explorer (Phase 1, 2, 4)
    const prdSection = page.locator('#prd-spec');
    await prdSection.scrollIntoViewIfNeeded();
    await prdSection.getByRole('button', { name: /Data Sources & Schemas/i }).click();
    await expect(prdSection.locator('text=Network Outage Alerts')).toBeVisible();

    await prdSection.getByRole('button', { name: /^Non-Functional Requirements/i }).click();
    await expect(prdSection.locator('text=Performance').first()).toBeVisible();

    // 8. Business ROI Calculator (Phase 10 & PRD Section 10)
    const roiSection = page.locator('#roi');
    await roiSection.scrollIntoViewIfNeeded();
    await expect(roiSection).toBeVisible();
    await expect(roiSection.locator('text=Estimated Annual SLA Penalty Savings')).toBeVisible();

    // 9. Footer
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
