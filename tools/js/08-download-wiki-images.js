const base = "D:\\github projects\\HeptaBase RE\\Plan\\references\\heptabase-wiki\\";
const uiNums = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "16"];
const feNums = ["01", "02", "03", "05", "06", "07", "08", "09", "10", "11", "12"];

const hashes = {
  ui: {
    "01": "aec80619961858f92adff764f01b9bbd", "02": "1794cadd52038918bc2fafd917e693c2",
    "03": "9d900145b992e7745c7f4e7b720ed4fe", "04": "18a6879b2eac2ad34d68d0dcde19021b",
    "05": "d86bd24f1104b4559d1f9619d870f475", "06": "b35ecd91a4566d97c7f4246da39a08d8",
    "07": "992a1fe90f87883d6430ef7ccecb5ada", "08": "b5eccc96281aabcb232af65307b536f3",
    "09": "b823f3367e81bc25a16d70eed01e046a", "10": "f2347706f95a19dbd3c5e8eba096213c",
    "11": "83a2cd6c3f826be199531f95d02d84a8", "12": "d274734ed7026feb3541d01c80c8c386",
    "13": "273787db7c17acd790d613ca20b18208", "14": "c1fded9b956c958442d040a5be2bdb65",
    "16": "0400c08af2921a95bc0a9fc5d68e8b51"
  },
  fe: {
    "01": "c8cd2e5d77f971c81fb76fe755eb4551", "02": "cf8a8a234f5edcf53e8421f5b314d0d4",
    "03": "77f3c71847992b92c9402aab3315df2f", "05": "09bdcef0387e799f8ca0ded0d6599e19",
    "06": "b566b3fb7036472c703adfbe5b417419", "07": "69430ae1b3e85e9b1c8e2df58948de03",
    "08": "383573b88396bf5643978baf51a90221", "09": "09754f182865c610a7b1a4d0a832601f",
    "10": "b67160a9791547ce95e59e69725191ec", "11": "0fc07f4a466eb3225d5619f0c4127470",
    "12": "75a7d4545e39db3a20bb8e7535ffe843"
  }
};

if (!page.url().includes("wiki.heptabase.com")) {
  await page.goto("https://wiki.heptabase.com/fundamental-elements", { waitUntil: "domcontentloaded", timeout: 45000 });
}
await page.waitForTimeout(1500);

const saved = [];
for (const n of uiNums) {
  const url = `https://wiki.heptabase.com/assets/images/user-interface-logic-${n}-${hashes.ui[n]}.png`;
  try {
    const r = await page.fetch(url, { as: "file", savePath: base + `ui-${n}.png`, timeoutMs: 20000 });
    saved.push({ f: `ui-${n}.png`, ok: r.ok !== false });
  } catch (e) { saved.push({ f: `ui-${n}.png`, error: String(e).slice(0, 80) }); }
}
for (const n of feNums) {
  const url = `https://wiki.heptabase.com/assets/images/fundamental-elements-${n}-${hashes.fe[n]}.png`;
  try {
    const r = await page.fetch(url, { as: "file", savePath: base + `fe-${n}.png`, timeoutMs: 20000 });
    saved.push({ f: `fe-${n}.png`, ok: r.ok !== false });
  } catch (e) { saved.push({ f: `fe-${n}.png`, error: String(e).slice(0, 80) }); }
}
return { count: saved.length, failed: saved.filter(s => s.error) };
