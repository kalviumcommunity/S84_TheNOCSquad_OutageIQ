import { test, expect } from '@playwright/test';

test.describe('Phase 4 Dynamic Priority Tiering, Confidence Flagging & Configurable Weights (FR7, NFR Reliability, NFR Extensibility)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display visual priority badges (Critical, High, Medium, Low) in triage queue', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();
    await expect(queueSection).toBeVisible();

    const tbody = queueSection.locator('tbody');
    await expect(tbody.locator('text=CRITICAL').first()).toBeVisible();
    await expect(tbody.locator('text=HIGH').first()).toBeVisible();
    await expect(tbody.locator('text=MEDIUM').first()).toBeVisible();
    await expect(tbody.locator('text=LOW').first()).toBeVisible();
  });

  test('should display telemetry confidence badges (High Confidence and Low Confidence Partial Data)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();

    await expect(queueSection.locator('text=High Confidence').first()).toBeVisible();
    await expect(queueSection.locator('text=Low Confidence - Partial Data').first()).toBeVisible();
  });

  test('should show confidence diagnostics inside outage drill-down modal', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();

    // Click on partial data outage (OUT-8895)
    await queueSection.locator('text=OUT-8895').click();

    await expect(page.locator('text=Data Completeness Status:')).toBeVisible();
    await expect(page.locator('text=Low Confidence — Partial Data')).toBeVisible();
    await expect(page.locator('text=Missing subscriber usage snapshot')).toBeVisible();

    await page.getByRole('button', { name: /Done Inspecting/i }).click();
  });

  test('should allow selecting scoring weight presets in calculator', async ({ page }) => {
    const calcSection = page.locator('#calculator');
    await calcSection.scrollIntoViewIfNeeded();

    const customerBtn = calcSection.getByRole('button', { name: /Customer-Centric/i });
    await expect(customerBtn).toBeVisible();
    await customerBtn.click();

    // Customer-Centric weights are 40% Reach and 40% Complaints
    await expect(calcSection.locator('text=(40% Wt)').first()).toBeVisible();
  });
});
