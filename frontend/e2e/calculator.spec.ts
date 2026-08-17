import { test, expect } from '@playwright/test';

test.describe('Interactive Impact Calculator Component (PRD Sec 7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display initial default sub-scores and calculated Impact Score', async ({ page }) => {
    const calcSection = page.locator('#calculator');
    await expect(calcSection).toBeVisible();

    const header = calcSection.getByRole('heading', { name: /Interactive Impact Scoring Simulator/i });
    await expect(header).toBeVisible();

    const scoreDisplay = calcSection.locator('text=78').first();
    await expect(scoreDisplay).toBeVisible();

    await expect(calcSection.locator('text=CRITICAL TIER').first()).toBeVisible();
  });

  test('should update calculated score when sliders are adjusted', async ({ page }) => {
    const calcSection = page.locator('#calculator');
    const sliders = calcSection.locator('input[type="range"]');
    
    await sliders.nth(0).fill('10');
    await sliders.nth(1).fill('10');
    await sliders.nth(2).fill('10');
    await sliders.nth(3).fill('10');

    await expect(calcSection.locator('text=LOW TIER').first()).toBeVisible();
    await expect(calcSection.locator('text=10').first()).toBeVisible();
  });

  test('should apply preset scenario: Metro Fiber Cut (Critical)', async ({ page }) => {
    const calcSection = page.locator('#calculator');
    const fiberBtn = calcSection.getByRole('button', { name: /Metro Fiber Cut/i });
    
    await fiberBtn.click();

    await expect(calcSection.locator('text=89').first()).toBeVisible();
    await expect(calcSection.locator('text=CRITICAL TIER').first()).toBeVisible();
  });

  test('should apply preset scenario: Social Complaint Spike (High)', async ({ page }) => {
    const calcSection = page.locator('#calculator');
    const spikeBtn = calcSection.getByRole('button', { name: /Social Complaint Spike/i });

    await spikeBtn.click();

    await expect(calcSection.locator('text=65').first()).toBeVisible();
    await expect(calcSection.locator('text=HIGH TIER').first()).toBeVisible();
  });

  test('should apply preset scenario: Rural Tower Maintenance (Low)', async ({ page }) => {
    const calcSection = page.locator('#calculator');
    const ruralBtn = calcSection.getByRole('button', { name: /Rural Tower Maintenance/i });

    await ruralBtn.click();

    await expect(calcSection.locator('text=18').first()).toBeVisible();
    await expect(calcSection.locator('text=LOW TIER').first()).toBeVisible();
  });

  test('should render 4 weighted contribution breakdown rows (FR10)', async ({ page }) => {
    const calcSection = page.locator('#calculator');
    await expect(calcSection.locator('text=Reach (35%):')).toBeVisible();
    await expect(calcSection.locator('text=Complaints (30%):')).toBeVisible();
    await expect(calcSection.locator('text=Revenue (20%):')).toBeVisible();
    await expect(calcSection.locator('text=Duration (15%):')).toBeVisible();
  });
});
