import { test, expect } from '@playwright/test';

test.describe('Neural Terra E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.globe-container', { timeout: 15000 });
  });

  test('should load the globe and show initial state', async ({ page }) => {
    // Check that the globe container is visible
    await expect(page.locator('.globe-container')).toBeVisible();
    
    // Check that the title is present
    await expect(page.locator('h2')).toContainText('Neural Terra');
    
    // Check that control panel is visible
    await expect(page.locator('.control-panel')).toBeVisible();
  });

  test('should toggle data layers', async ({ page }) => {
    // Test weather layer toggle
    const weatherToggle = page.locator('button').filter({ hasText: 'Weather' });
    await weatherToggle.click();
    await page.waitForTimeout(500);
    
    // Test ports layer toggle
    const portsToggle = page.locator('button').filter({ hasText: 'Ports' });
    await portsToggle.click();
    await page.waitForTimeout(500);
    
    // Test grid layer toggle
    const gridToggle = page.locator('button').filter({ hasText: 'Power Grid' });
    await gridToggle.click();
    await page.waitForTimeout(500);
    
    // Test alerts layer toggle
    const alertsToggle = page.locator('button').filter({ hasText: 'Alerts' });
    await alertsToggle.click();
    await page.waitForTimeout(500);
    
    // All toggles should be functional
    await expect(weatherToggle).toBeVisible();
    await expect(portsToggle).toBeVisible();
    await expect(gridToggle).toBeVisible();
    await expect(alertsToggle).toBeVisible();
  });

  test('should run Suez Canal scenario', async ({ page }) => {
    // Open scenarios drawer
    const scenariosButton = page.locator('button').filter({ hasText: 'Scenarios' });
    await scenariosButton.click();
    await page.waitForTimeout(500);
    
    // Click Suez scenario
    const suezScenario = page.locator('button').filter({ hasText: 'Suez Canal Disruption' });
    await suezScenario.click();
    
    // Wait for simulation to start
    await page.waitForTimeout(2000);
    
    // Check that timeline is visible
    await expect(page.locator('.timeline')).toBeVisible();
    
    // Check that playback controls are present
    await expect(page.locator('button').filter({ hasText: 'Pause' })).toBeVisible();
  });

  test('should handle natural language queries', async ({ page }) => {
    // Open NL command bar
    await page.keyboard.press('Meta+k'); // Cmd+K on Mac, Ctrl+K on Windows
    await page.waitForTimeout(500);
    
    // Check that command bar is visible
    await expect(page.locator('textarea')).toBeVisible();
    
    // Type a query
    await page.fill('textarea', 'Simulate 30% slowdown in Panama Canal for 7 days');
    
    // Submit the query
    await page.click('button[type="submit"]');
    
    // Wait for processing
    await page.waitForTimeout(3000);
    
    // Command bar should close
    await expect(page.locator('textarea')).not.toBeVisible();
  });

  test('should show status indicators', async ({ page }) => {
    // Check status bar
    await expect(page.locator('.status-bar')).toBeVisible();
    
    // Check connection status
    await expect(page.locator('text=Live Data')).toBeVisible();
    
    // Check current time display
    await expect(page.locator('text=Current Time')).toBeVisible();
  });

  test('should have responsive timeline controls', async ({ page }) => {
    // Check timeline is present
    await expect(page.locator('.timeline')).toBeVisible();
    
    // Check playback controls
    await expect(page.locator('button').filter({ hasText: 'Play' })).toBeVisible();
    
    // Check speed control
    await expect(page.locator('select')).toBeVisible();
  });
});
