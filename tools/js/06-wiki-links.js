await page.goto("https://wiki.heptabase.com/", { waitUntil: "domcontentloaded", timeout: 45000 });
await page.waitForTimeout(2500);
return await page.evaluate(() => ({
  title: document.title,
  links: Array.from(document.querySelectorAll('a[href]'))
    .map(a => ({ t: (a.innerText || "").trim().slice(0, 70), h: a.getAttribute("href") }))
    .filter(x => x.t && x.h && x.h.startsWith("/"))
    .slice(0, 150)
}));
