import { test, expect } from '@playwright/test';

test.describe('Regional Impact Heatmap & Geo-Operational Analytics (PRD Sec 8.3 & FR11)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display Regional Impact Overview section and default region metrics', async ({ page }) => {
    const regionalSection = page.locator('#regional-analytics');
    await regionalSection.scrollIntoViewIfNeeded();
    await expect(regionalSection).toBeVisible();

    const heading = regionalSection.getByRole('heading', { name: /Regional Impact & Density Analytics/i });
    await expect(heading).toBeVisible();

    // Verify all 5 regions are present in cards
    await expect(regionalSection.getByRole('heading', { name: 'North Region' })).toBeVisible();
    await expect(regionalSection.getByRole('heading', { name: 'West Region' })).toBeVisible();
    await expect(regionalSection.getByRole('heading', { name: 'South Region' })).toBeVisible();
    await expect(regionalSection.getByRole('heading', { name: 'East Region' })).toBeVisible();
    await expect(regionalSection.getByRole('heading', { name: 'Central Region' })).toBeVisible();
  });

  test('should display density status badges, subscribers and SLA compliance per region', async ({ page }) => {
    const regionalSection = page.locator('#regional-analytics');
    await regionalSection.scrollIntoViewIfNeeded();

    await expect(regionalSection.locator('text=High Impact Concentration').first()).toBeVisible();
    await expect(regionalSection.getByText('46,200').first()).toBeVisible();
    await expect(regionalSection.getByText('$45,950 / hr').first()).toBeVisible();
    await expect(regionalSection.getByText('50%').first()).toBeVisible();
  });

  test('should trigger quick queue filtering when region card filter button is clicked (FR11)', async ({ page }) => {
    const regionalSection = page.locator('#regional-analytics');
    await regionalSection.scrollIntoViewIfNeeded();

    const filterNorthBtn = regionalSection.getByRole('button', { name: /Filter Queue by North Region/i });
    await expect(filterNorthBtn).toBeVisible();
    await filterNorthBtn.click();

    // Queue preview should now be filtered to North Region
    const queueSection = page.locator('#queue-preview');
    await expect(queueSection.getByText('OUT-8902', { exact: true })).toBeVisible();
    await expect(queueSection.getByText('OUT-8904', { exact: true })).not.toBeVisible();
  });

  test('should render comparative heatmap matrix and support sorting', async ({ page }) => {
    const regionalSection = page.locator('#regional-analytics');
    await regionalSection.scrollIntoViewIfNeeded();

    await expect(regionalSection.locator('text=Comparative Regional Heatmap Matrix')).toBeVisible();

    const sortSelect = regionalSection.locator('select');
    await sortSelect.selectOption('revenue');

    const matrixTable = regionalSection.locator('table');
    await expect(matrixTable.locator('text=$45,950 / hr')).toBeVisible();
  });
});
