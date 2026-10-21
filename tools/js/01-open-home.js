await page.goto("https://heptabase.com/", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(2500);
const title = await page.title();
const url = page.url();
const shot = await page.screenshot({ path: "D:\\github projects\\HeptaBase RE\\Plan\\references\\01-heptabase-home.png", fullPage: false });
const headings = await page.evaluate(() => {
  const hs = Array.from(document.querySelectorAll("h1,h2,h3")).map(e => e.innerText.trim()).filter(Boolean);
  const links = Array.from(document.querySelectorAll("a[href]")).map(a => a.getAttribute("href")).filter(Boolean);
  return { headings: hs.slice(0, 40), links: Array.from(new Set(links)).slice(0, 60) };
});
return { title, url, shotBytes: shot ? shot.length : 0, headings: headings.headings, links: headings.links };
