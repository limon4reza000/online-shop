const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 700, height: 900 } });
  await page.goto('http://localhost:5174/login');
  await page.waitForTimeout(800);
  await page.click('text=ডেমো অ্যাডমিন হিসেবে চালিয়ে যান');
  await page.waitForTimeout(1200);
  await page.goto('http://localhost:5174/');
  await page.waitForTimeout(1500);

  const card = page.locator('h3:has-text("আয়ের সারসংক্ষেপ")').locator('xpath=ancestor::div[contains(@class,"card-surface")][1]');
  const yAxisBefore = await card.locator('text=৳0k').first().boundingBox();

  const scrollBox = card.locator('div.overflow-x-auto').first();
  await scrollBox.evaluate((el) => { el.scrollLeft = el.scrollWidth; });
  await page.waitForTimeout(300);

  const yAxisAfter = await card.locator('text=৳0k').first().boundingBox();
  console.log('Y-axis label x position BEFORE scroll:', yAxisBefore.x);
  console.log('Y-axis label x position AFTER scrolling chart right:', yAxisAfter.x);
  console.log('Y-axis stayed fixed:', Math.abs(yAxisBefore.x - yAxisAfter.x) < 2);

  await page.screenshot({ path: 'dashboard-scrolled.png' });
  await browser.close();
})();
