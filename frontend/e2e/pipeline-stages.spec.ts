import { test, expect } from '@playwright/test';

test.describe('Phase 2 Pipeline Stage & Temporal Complaint Associator (FR3, FR4, PRD Sec 6)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display pipeline stage visualization and 4 processing stages', async ({ page }) => {
    const pipelineView = page.locator('#pipeline-stage-view');
    await pipelineView.scrollIntoViewIfNeeded();
    await expect(pipelineView).toBeVisible();

    await expect(pipelineView.locator('text=STAGE 1')).toBeVisible();
    await expect(pipelineView.locator('text=STAGE 2')).toBeVisible();
    await expect(pipelineView.locator('text=STAGE 3')).toBeVisible();
    await expect(pipelineView.locator('text=STAGE 4')).toBeVisible();
    await expect(pipelineView.locator('text=520 Records')).toBeVisible();
    await expect(pipelineView.locator('text=500 Valid Records')).toBeVisible();
    await expect(pipelineView.locator('text=100% Joined')).toBeVisible();
  });

  test('should update temporal complaint correlation metrics when sliding window changes', async ({ page }) => {
    const pipelineView = page.locator('#pipeline-stage-view');
    await pipelineView.scrollIntoViewIfNeeded();

    const slider = pipelineView.locator('input[type="range"]');
    await expect(slider).toBeVisible();

    // Verify initial values with default ±2.0h window
    await expect(pipelineView.locator('text=±2.0 Hours')).toBeVisible();
    await expect(pipelineView.locator('text=Explicit Outage Tags:')).toBeVisible();
    await expect(pipelineView.locator('text=Temporally Correlated Matches (±2h):')).toBeVisible();

    // Adjust slider to 4.0 hours
    await slider.evaluate((el: HTMLInputElement) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set;
      nativeSetter!.call(el, '4.0');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await expect(pipelineView.locator('text=±4.0 Hours')).toBeVisible();
  });

  test('should render complaint stream with explicit and temporal match tags', async ({ page }) => {
    const pipelineView = page.locator('#pipeline-stage-view');
    await pipelineView.scrollIntoViewIfNeeded();

    await expect(pipelineView.locator('text=CMP-901')).toBeVisible();
    await expect(pipelineView.locator('text=Explicit Tag').first()).toBeVisible();
    await expect(pipelineView.locator('text=Temporal Match').first()).toBeVisible();
    await expect(pipelineView.locator('text=OUT-101').first()).toBeVisible();
  });
});
