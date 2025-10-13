#!/usr/bin/env node
/**
 * Hero capture script for Neural Terra.
 * Captures a hero screenshot/GIF for README and documentation.
 */

const { chromium } = require('playwright');
const path = require('path');

async function captureHero() {
  console.log('📸 Starting hero capture...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('🌐 Loading Neural Terra...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for the globe to load
    console.log('⏳ Waiting for globe to initialize...');
    await page.waitForSelector('.globe-container', { timeout: 15000 });
    
    // Enable weather layer
    console.log('🌤️  Enabling weather layer...');
    await page.click('button[data-testid="weather-toggle"]');
    await page.waitForTimeout(1000);
    
    // Enable ports layer
    console.log('🚢 Enabling ports layer...');
    await page.click('button[data-testid="ports-toggle"]');
    await page.waitForTimeout(1000);
    
    // Run Suez scenario
    console.log('⚡ Running Suez Canal scenario...');
    await page.click('button[data-testid="scenarios-button"]');
    await page.waitForTimeout(500);
    await page.click('button[data-testid="suez-scenario"]');
    
    // Wait for simulation to start
    console.log('⏳ Waiting for simulation...');
    await page.waitForTimeout(3000);
    
    // Take screenshot
    console.log('📷 Capturing hero screenshot...');
    const artifactsDir = path.join(__dirname, '..', 'artifacts');
    await page.screenshot({ 
      path: path.join(artifactsDir, 'hero.png'),
      fullPage: true,
      quality: 90
    });
    
    console.log('✅ Hero capture complete!');
    console.log(`📁 Saved to: ${path.join(artifactsDir, 'hero.png')}`);
    
  } catch (error) {
    console.error('❌ Hero capture failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Create artifacts directory if it doesn't exist
const fs = require('fs');
const artifactsDir = path.join(__dirname, '..', 'artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

captureHero().catch(console.error);
