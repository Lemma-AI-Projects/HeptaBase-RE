// Collect static product-image assets from the marketing page so originals can be fetched.
await page.goto("https://heptabase.com/", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(2000);

const assets = await page.evaluate(() => {
  const urls = new Set();
  document.querySelectorAll("img[src]").forEach(i => { if (i.currentSrc || i.src) urls.add(i.currentSrc || i.src); });
  document.querySelectorAll("video[src]").forEach(v => urls.add(v.src));
  document.querySelectorAll("video poster").forEach(v => urls.add(v.poster));
  document.querySelectorAll("source[src]").forEach(s => urls.add(s.src));
  return Array.from(urls)
    .filter(u => /\.(png|jpe?g|webp|avif|mp4|webm)/i.test(u) || u.startsWith("data:image"))
    .map(u => u.length > 300 ? u.slice(0, 300) : u)
    .slice(0, 80);
});

// Section headings with their vertical positions, to target scroll captures.
const sections = await page.evaluate(() =>
  Array.from(document.querySelectorAll("h1,h2,h3")).map(h => ({
    text: h.innerText.trim().slice(0, 90),
    top: Math.round(h.getBoundingClientRect().top + window.scrollY)
  })).filter(x => x.text)
);

return { assets, sections, pageHeight: await page.evaluate(() => document.body.scrollHeight) };
