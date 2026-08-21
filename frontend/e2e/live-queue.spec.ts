import { test, expect } from '@playwright/test';

test.describe('Live Prioritized Outage Queue Component (PRD Sec 8.3 & FR8-FR16)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display prioritized outage queue section and default list', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await expect(queueSection).toBeVisible();

    const heading = queueSection.getByRole('heading', { name: /Prioritized Outage Triage Queue/i });
    await expect(heading).toBeVisible();

    await expect(queueSection.getByText('OUT-8902', { exact: true })).toBeVisible();
    await expect(queueSection.getByText('OUT-8904', { exact: true })).toBeVisible();
    await expect(queueSection.getByText('OUT-8901', { exact: true })).toBeVisible();
  });

  test('should display top-ranked incident in slot #1 with rank badge #1', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    const firstRow = queueSection.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.locator('text=#1')).toBeVisible();
    await expect(firstRow.getByText('OUT-8902', { exact: true })).toBeVisible();
  });

  test('should sort triage queue when column headers are clicked', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();

    // Default order has OUT-8902 as #1
    const firstRowBefore = queueSection.locator('tbody tr').first();
    await expect(firstRowBefore.getByText('OUT-8902', { exact: true })).toBeVisible();

    // Click on Impact Score header to toggle to ascending order (lowest score first)
    const scoreHeader = queueSection.locator('th', { hasText: 'Impact Score' });
    await scoreHeader.click();

    // Now lowest score outage (OUT-8890 with 21.4) should be first
    const firstRowAfterAsc = queueSection.locator('tbody tr').first();
    await expect(firstRowAfterAsc.getByText('OUT-8890', { exact: true })).toBeVisible();

    // Click again to toggle back to descending order
    await scoreHeader.click();
    const firstRowAfterDesc = queueSection.locator('tbody tr').first();
    await expect(firstRowAfterDesc.getByText('OUT-8902', { exact: true })).toBeVisible();
  });

  test('should filter outages by region', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    const regionSelect = queueSection.locator('select').first();

    await regionSelect.selectOption('North Region');

    await expect(queueSection.getByText('OUT-8902', { exact: true })).toBeVisible();
    await expect(queueSection.getByText('OUT-8904', { exact: true })).not.toBeVisible();

    await regionSelect.selectOption('ALL');
    await expect(queueSection.getByText('OUT-8904', { exact: true })).toBeVisible();
  });

  test('should filter outages by priority tier', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    const prioritySelect = queueSection.locator('select').nth(1);

    await prioritySelect.selectOption('HIGH');

    await expect(queueSection.getByText('OUT-8898', { exact: true })).toBeVisible();
    await expect(queueSection.getByText('OUT-8902', { exact: true })).not.toBeVisible();

    await prioritySelect.selectOption('ALL');
    await expect(queueSection.getByText('OUT-8902', { exact: true })).toBeVisible();
  });

  test('should filter outages by search query and reset filters (Phase 6 / FR13)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    const searchInput = queueSection.locator('input[type="text"]');

    await searchInput.fill('DEL-991');

    await expect(queueSection.getByText('OUT-8902', { exact: true })).toBeVisible();
    await expect(queueSection.getByText('OUT-8904', { exact: true })).not.toBeVisible();

    const resetBtn = queueSection.getByRole('button', { name: /Reset Filters/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    await expect(queueSection.getByText('OUT-8904', { exact: true })).toBeVisible();
  });

  test('should display SLA countdown timers in triage table (Phase 6 / FR13)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();

    await expect(queueSection.locator('text=SLA Countdown')).toBeVisible();
    await expect(queueSection.locator('text=Breached by').first()).toBeVisible();
    await expect(queueSection.locator('text=remaining').first()).toBeVisible();
  });

  test('should support Executive View toggle (FR15)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    const execToggle = queueSection.locator('button').filter({ has: page.locator('span.rounded-full') });

    await execToggle.click();

    await expect(queueSection.locator('text=Executive View Active')).toBeVisible();
    await expect(queueSection.locator('text=Top 5 Exec View ON')).toBeVisible();

    const exportBtn = queueSection.getByRole('button', { name: /Export PDF Summary/i });
    await expect(exportBtn).toBeVisible();

    await execToggle.click();
    await expect(queueSection.locator('text=Executive View Active')).not.toBeVisible();
  });

  test('should support Export CSV and Export Briefing summary (FR14 & Phase 10)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    await queueSection.scrollIntoViewIfNeeded();

    const exportCsvBtn = queueSection.getByRole('button', { name: /Export CSV/i }).first();
    await expect(exportCsvBtn).toBeVisible();

    const exportBriefingBtn = queueSection.getByRole('button', { name: /Export Briefing/i }).first();
    await expect(exportBriefingBtn).toBeVisible();
  });

  test('should open and inspect explainable outage detail modal (FR10)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    
    const outageRow = queueSection.locator('tr').filter({ hasText: 'OUT-8902' });
    await outageRow.click();

    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();

    await expect(modal.getByText('OUT-8902', { exact: true })).toBeVisible();
    await expect(modal.locator('text=CRITICAL TIER')).toBeVisible();
    await expect(modal.locator('text=Major Backhaul Fiber Cut near Core Data Center')).toBeVisible();

    await expect(modal.locator('text=Customer Reach (35% Wt):')).toBeVisible();
    await expect(modal.locator('text=Complaint Pressure (30% Wt):')).toBeVisible();
    await expect(modal.locator('text=Revenue Exposure (20% Wt):')).toBeVisible();
    await expect(modal.locator('text=Duration & Severity (15% Wt):')).toBeVisible();
    await expect(modal.locator('text=SLA Target & Resolution Status (FR13):')).toBeVisible();

    const closeBtn = modal.getByRole('button', { name: /Done Inspecting/i });
    await closeBtn.click();

    await expect(modal).not.toBeVisible();
  });

  test('should display regional demographics, linked complaints stream, affected services, and support ESC to close modal (Phase 7)', async ({ page }) => {
    const queueSection = page.locator('#queue-preview');
    
    const outageRow = queueSection.locator('tr').filter({ hasText: 'OUT-8902' });
    await outageRow.click();

    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();

    // Regional demographics
    await expect(modal.locator('text=Regional Demographic Context & Exposure')).toBeVisible();
    await expect(modal.getByText('45,000', { exact: true })).toBeVisible();
    await expect(modal.locator('text=$45,000 / hr').first()).toBeVisible();

    // Linked complaints stream
    await expect(modal.locator('text=Linked Customer Complaints Stream (Sample)')).toBeVisible();
    await expect(modal.locator('text=CMP-OUT-8902-01')).toBeVisible();
    await expect(modal.locator('text=Explicit Tag').first()).toBeVisible();

    // Affected network services
    await expect(modal.locator('text=Affected Network Services')).toBeVisible();
    await expect(modal.locator('text=VoLTE Voice & E911 Emergency Calls')).toBeVisible();

    // Test ESC key closes modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});
