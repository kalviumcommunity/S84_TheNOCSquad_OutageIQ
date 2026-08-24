import { test, expect } from '@playwright/test';

test.describe('Sidebar & Outage Queue Filters Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/queue');
  });

  test('should filter outages by region from the left sidebar', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // Select "Mumbai" in the sidebar region dropdown
    const sidebarRegionSelect = sidebar.locator('select');
    await sidebarRegionSelect.selectOption('Mumbai');

    // Verify Outage Queue table reflects Mumbai only
    const table = page.locator('table');
    await expect(table.getByText('OUT-2026-0723-N91')).toBeVisible();
    await expect(table.getByText('OUT-2026-0722-N44')).not.toBeVisible();

    // Verify active filter chip is displayed in queue view
    await expect(page.locator('text=Region: Mumbai')).toBeVisible();

    // Reset region filter from sidebar
    await sidebarRegionSelect.selectOption('ALL');
    await expect(table.getByText('OUT-2026-0722-N44')).toBeVisible();
  });

  test('should filter outages by priority tier from the left sidebar', async ({ page }) => {
    const sidebar = page.locator('aside');

    // Click P1 — Critical button in sidebar
    const p1Button = sidebar.getByRole('button', { name: /P1 — Critical/i });
    await p1Button.click();

    // Verify only P1 outages are in the queue table
    const table = page.locator('table');
    await expect(table.getByText('OUT-2026-0723-N91')).toBeVisible();
    await expect(table.getByText('OUT-2026-0722-N44')).toBeVisible();
    await expect(table.getByText('OUT-2026-0723-N12')).not.toBeVisible();

    // Click P1 button again to toggle back to ALL
    await p1Button.click();
    await expect(table.getByText('OUT-2026-0723-N12')).toBeVisible();
  });

  test('should filter outages by status checkboxes from the left sidebar', async ({ page }) => {
    const sidebar = page.locator('aside');
    const table = page.locator('table');

    // Uncheck "Resolved"
    const resolvedCheckbox = sidebar.locator('label', { hasText: 'Resolved' }).locator('input[type="checkbox"]');
    await resolvedCheckbox.uncheck();

    // Resolved outages (e.g. Ahmedabad OUT-2026-0721-N29, Jaipur OUT-2026-0722-N77) should not be visible
    await expect(table.getByText('OUT-2026-0721-N29')).not.toBeVisible();
    await expect(table.getByText('OUT-2026-0722-N77')).not.toBeVisible();
    await expect(table.getByText('OUT-2026-0723-N91')).toBeVisible();

    // Check "Resolved" again
    await resolvedCheckbox.check();
    await expect(table.getByText('OUT-2026-0721-N29')).toBeVisible();
  });

  test('should reset all filters using the reset button', async ({ page }) => {
    const sidebar = page.locator('aside');
    const table = page.locator('table');

    // Select region and priority
    await sidebar.locator('select').selectOption('Mumbai');
    await sidebar.getByRole('button', { name: /P1 — Critical/i }).click();

    await expect(table.getByText('OUT-2026-0723-N91')).toBeVisible();
    await expect(table.getByText('OUT-2026-0722-N44')).not.toBeVisible();

    // Click Reset in the sidebar
    const resetBtn = sidebar.getByRole('button', { name: /Reset/i }).first();
    await resetBtn.click();

    // All outages should be restored
    await expect(table.getByText('OUT-2026-0722-N44')).toBeVisible();
  });

  test('should persist filter state when navigating across views (Overview, Queue, Export)', async ({ page }) => {
    const sidebar = page.locator('aside');

    // Filter by Delhi NCR in sidebar
    await sidebar.locator('select').selectOption('Delhi NCR');

    // Check Outage Queue table
    const queueTable = page.locator('table');
    await expect(queueTable.getByText('OUT-2026-0722-N44')).toBeVisible();
    await expect(queueTable.getByText('OUT-2026-0723-N91')).not.toBeVisible();

    // Navigate to Overview via Sidebar
    await sidebar.getByRole('link', { name: /Overview/i }).click();
    await expect(page).toHaveURL(/overview|\/$/);

    // Overview should reflect Delhi NCR filter
    await expect(page.locator('text=Region: Delhi NCR')).toBeVisible();

    // Navigate to Exportable Data via Sidebar
    await sidebar.getByRole('link', { name: /Exportable Data/i }).click();
    await expect(page).toHaveURL(/export/);

    // Export view should reflect Delhi NCR filter in data preview
    await expect(page.locator('text=Region: Delhi NCR')).toBeVisible();
  });
});
