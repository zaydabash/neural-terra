import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function snap(url: string, file: string, width=1600, height=900) {
  console.log(`📸 Capturing ${url} → ${file}`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Wait for the globe to render and any animations to stabilize
  await page.waitForTimeout(2000);
  
  // Ensure docs directory exists
  fs.mkdirSync(path.dirname(file), { recursive: true });
  
  await page.screenshot({ 
    path: file, 
    fullPage: false,
    type: 'png'
  });
  
  await browser.close();
  console.log(`✅ Saved: ${file}`);
}

(async () => {
  const base = process.env.APP_URL || 'http://localhost:3001';
  console.log(`🌍 Using base URL: ${base}`);

  try {
    // Earth hero
    await snap(`${base}/`, `../docs/hero-earth.png`);

    // Mars hero (reuse Earth for now since we don't have Mars toggle yet)
    await snap(`${base}/`, `../docs/hero-mars.png`);
    
    console.log('🎉 All hero images captured successfully!');
  } catch (error) {
    console.error('❌ Capture failed:', error);
    process.exit(1);
  }
})();
