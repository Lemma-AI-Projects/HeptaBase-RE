const out = {};
for (const slug of ["user-interface-logic", "fundamental-elements"]) {
  await page.goto("https://wiki.heptabase.com/" + slug, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    return {
      title: document.title,
      text: (main.innerText || "").replace(/\n{3,}/g, "\n\n").slice(0, 7000),
      imgs: Array.from(document.querySelectorAll("main img, article img")).map(i => i.currentSrc || i.src).slice(0, 25)
    };
  });
  out[slug] = data;
  try {
    await page.screenshot({ fullPage: false, animations: "disabled", timeout: 60000 });
  } catch (e) {
    out[slug].shotError = String(e).slice(0, 100);
  }
}
return out;
