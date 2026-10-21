// Product UI on the marketing page, gallery index, and one public whiteboard.
const out = {};

// 1) Scroll to the product screenshot section on the homepage.
await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(1200);
await page.screenshot({ fullPage: false });

await page.evaluate(() => window.scrollTo(0, 1500));
await page.waitForTimeout(1200);
await page.screenshot({ fullPage: false });

// 2) Public gallery of whiteboards.
await page.goto("https://heptabase.com/gallery", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(2500);
out.galleryTitle = await page.title();
out.galleryLinks = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a[href*="/gallery/whiteboards/"]')).map(a => a.getAttribute("href")).slice(0, 6)
);
await page.screenshot({ fullPage: false });

return out;
