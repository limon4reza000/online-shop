const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();

  // Wide viewport — should NOT need to scroll, full names should show fully.
  const wide = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await wide.goto('http://localhost:5174/login');
  await wide.waitForTimeout(800);
  await wide.click('text=ডেমো অ্যাডমিন হিসেবে চালিয়ে যান');
  await wide.waitForTimeout(1200);
  await wide.goto('http://localhost:5174/');
  await wide.waitForTimeout(1500);
  await wide.screenshot({ path: 'dashboard-wide.png' });

  // Narrow viewport inside the admin main content — should force horizontal scroll.
  const narrow = await browser.newPage({ viewport: { width: 700, height: 900 } });
  await narrow.goto('http://localhost:5174/');
  await narrow.evaluate(() => localStorage.setItem('shop-token', localStorage.getItem('shop-token') || ''));
  await narrow.goto('http://localhost:5174/login');
  await narrow.waitForTimeout(800);
  await narrow.click('text=ডেমো অ্যাডমিন হিসেবে চালিয়ে যান');
  await narrow.waitForTimeout(1200);
  await narrow.goto('http://localhost:5174/');
  await narrow.waitForTimeout(1500);
  await narrow.screenshot({ path: 'dashboard-narrow.png' });

  // Check the last month tick text isn't truncated (full month name present).
  const lastTickTexts = await narrow.locator('svg text').allTextContents();
  console.log('all rendered SVG text (narrow view):', lastTickTexts.filter((t) => t.length > 1));

  await narrow.goto('http://localhost:5174/reports');
  await narrow.waitForTimeout(1200);
  await narrow.screenshot({ path: 'reports-narrow.png' });

  await browser.close();
})();
