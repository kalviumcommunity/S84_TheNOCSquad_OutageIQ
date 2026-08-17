import { test, expect } from '@playwright/test';

test.describe('PRD Technical Requirements Explorer Component (PRD Sec 6, 8, 9)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display functional requirements tab (FR1–FR16) by default', async ({ page }) => {
    const prdSection = page.locator('#prd-spec');
    await expect(prdSection).toBeVisible();

    const frTab = prdSection.getByRole('button', { name: /^Functional Requirements/i });
    await expect(frTab).toBeVisible();

    await expect(prdSection.locator('text=FR1').first()).toBeVisible();
    await expect(prdSection.locator('text=FR5').first()).toBeVisible();
    await expect(prdSection.locator('text=FR10').first()).toBeVisible();
    await expect(prdSection.locator('text=FR16').first()).toBeVisible();
  });

  test('should switch to Data Sources & Schemas tab', async ({ page }) => {
    const prdSection = page.locator('#prd-spec');
    const schemasTab = prdSection.getByRole('button', { name: /Data Sources & Schemas/i });

    await schemasTab.click();

    await expect(prdSection.locator('text=Network Outage Alerts')).toBeVisible();
    await expect(prdSection.locator('text=Customer Complaint Logs')).toBeVisible();
    await expect(prdSection.locator('text=Region Usage Metrics')).toBeVisible();
    await expect(prdSection.locator('text=subscriber_count')).toBeVisible();
  });

  test('should switch to Non-Functional Requirements tab (NFRs)', async ({ page }) => {
    const prdSection = page.locator('#prd-spec');
    const nfrTab = prdSection.getByRole('button', { name: /^Non-Functional Requirements/i });

    await nfrTab.click();

    await expect(prdSection.locator('text=Performance').first()).toBeVisible();
    await expect(prdSection.locator('text=Usability').first()).toBeVisible();
    await expect(prdSection.locator('text=Transparency').first()).toBeVisible();
    await expect(prdSection.locator('text=Reliability').first()).toBeVisible();
    await expect(prdSection.locator('text=Extensibility').first()).toBeVisible();
  });
});
