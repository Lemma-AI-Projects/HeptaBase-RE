// Download original-resolution product UI images into the workspace reference folder.
const base = "D:\\github projects\\HeptaBase RE\\Plan\\references\\heptabase-ui\\";
const targets = [
  ["whiteboard-feature", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fwhiteboard-feature.dded7d9e.png&w=3840&q=75"],
  ["hero-poster", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fhero-poster.6c3a44b6.png&w=3840&q=75"],
  ["kb-block-editor", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-block-editor.2579cdb3.png&w=3840&q=75"],
  ["kb-bidirectional-links-front", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-bidirectional-links-front-note.aa974d9e.png&w=3840&q=75"],
  ["kb-bidirectional-links-back", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-bidirectional-links-back-note.d4577931.png&w=3840&q=75"],
  ["kb-readwise", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-readwise-integration.3b693c1a.png&w=3840&q=75"],
  ["kb-pdf-annot-note", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-pdf-annotation-note.bd06fff2.png&w=3840&q=75"],
  ["kb-pdf-annot-menu", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-pdf-annotation-menu.88643476.png&w=3840&q=75"],
  ["kb-daily-journals", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-daily-journals.a0d382c4.png&w=3840&q=75"],
  ["kb-web-clipper", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-web-cliper-menu.b7a7c926.png&w=3840&q=75"],
  ["kb-zotero-tag", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkb-zotero-integration-tag.5aeb576c.png&w=1920&q=75"],
  ["ai-research-note", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fai-research-note.a95d2bbb.png&w=1920&q=75"],
  ["ai-research-journal", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fai-research-journal.370279f3.png&w=1920&q=75"],
  ["ai-research-pdf", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fai-research-pdf.66ba41c4.png&w=1920&q=75"],
  ["learning-screenshot", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2F10-AI-Learning-Screenshot.4a7ff64c.png&w=3840&q=75"],
  ["reading-knowledge", "https://heptabase.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2F11-Reading-Knowledge-Screenshot.118258ec.png&w=3840&q=75"],
  ["gallery-1", "https://heptabase.com/_next/image?url=%2Fassets%2Fimages%2Fgallery%2Fwhiteboards%2Ffab30d1b-c71b-402f-9dab-ee99ac48ef7c.png&w=3840&q=75"],
  ["gallery-2", "https://heptabase.com/_next/image?url=%2Fassets%2Fimages%2Fgallery%2Fwhiteboards%2F82a19c72-5132-447c-b6f7-f167f6d4cda8.png&w=3840&q=75"],
  ["gallery-3", "https://heptabase.com/_next/image?url=%2Fassets%2Fimages%2Fgallery%2Fwhiteboards%2F32400b6f-1567-48a1-bcad-c88bf533902a.png&w=3840&q=75"]
];

// The page must be on an allowed origin for page.fetch.
if (!page.url().startsWith("https://heptabase.com")) {
  await page.goto("https://heptabase.com/", { waitUntil: "domcontentloaded", timeout: 45000 });
}

const saved = [];
for (const [name, url] of targets) {
  try {
    const res = await page.fetch(url, { as: "file", savePath: base + name + ".png", timeoutMs: 25000 });
    saved.push({ name, ok: res && res.ok !== false, size: res && res.byteLength ? res.byteLength : null });
  } catch (e) {
    saved.push({ name, error: String(e).slice(0, 120) });
  }
}
return saved;
