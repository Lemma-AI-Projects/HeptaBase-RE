await page.goto("https://wiki.heptabase.com/", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('a[href]'))
    .map(a => ({ t: (a.innerText || "").trim().slice(0, 60), h: a.getAttribute("href") }))
    .filter(x => x.t && x.h && !x.h.startsWith("https://twitter") && !x.h.startsWith("mailto"))
    .slice(0, 120);
  const imgs = Array.from(document.querySelectorAll("img[src]")).map(i => i.currentSrc || i.src).slice(0, 20);
  return { title: document.title, links, imgs };
});
await page.screenshot({ fullPage: false });
return info;
