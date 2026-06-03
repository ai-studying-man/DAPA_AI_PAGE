import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const official = "https://www.dapa.go.kr/dapa/index.do";
const targetMenus = ["알림·소식", "업무·정책", "정보공개", "민원·참여", "방위사업청 소개"];
const outDir = path.join(process.cwd(), ".omo", "ulw-loop", "evidence");

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function absoluteUrl(value) {
  try {
    return new URL(value, official).toString();
  } catch {
    return "";
  }
}

function menuFilename(title) {
  return `official-dapa-menu-${title.replace(/[·\s]/g, "-")}.png`;
}

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
await page.goto(official, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: path.join(outDir, "official-dapa-menu-baseline.png"), fullPage: false });

const menus = [];
for (const title of targetMenus) {
  const locator = page.getByText(title, { exact: true }).first();
  if ((await locator.count()) > 0) {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    await locator.hover({ timeout: 5000 }).catch(async () => {
      await locator.click({ timeout: 5000 }).catch(() => {});
    });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(outDir, menuFilename(title)), fullPage: false });
  }

  const items = await page.evaluate(() => {
    const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
    return [...document.querySelectorAll("a")]
      .map((anchor) => {
        const rect = anchor.getBoundingClientRect();
        const style = getComputedStyle(anchor);
        return {
          label: normalize(anchor.textContent),
          href: anchor.href || anchor.getAttribute("href") || "",
          title: normalize(anchor.getAttribute("title") || ""),
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden"
        };
      })
      .filter((item) => item.visible && item.label && item.href && item.y > 120 && item.y < 760)
      .map((item) => ({ label: item.label, href: item.href, title: item.title }));
  });

  const deduped = [];
  const seen = new Set();
  for (const item of items) {
    const normalized = { label: clean(item.label), href: absoluteUrl(item.href), title: clean(item.title) };
    const key = `${normalized.label}|${normalized.href}`;
    if (!normalized.label || !normalized.href || seen.has(key)) continue;
    seen.add(key);
    deduped.push(normalized);
  }
  menus.push({ title, items: deduped });
}

const menuSeqAnchors = await page.evaluate(() => {
  const normalize = (value) => String(value || "").replace(/\s+/g, " ").trim();
  return [...document.querySelectorAll("a[href*='menuSeq']")]
    .map((anchor) => ({
      label: normalize(anchor.textContent),
      href: anchor.href || anchor.getAttribute("href") || "",
      title: normalize(anchor.getAttribute("title") || "")
    }))
    .filter((item) => item.label && item.href);
});

const payload = {
  capturedAt: new Date().toISOString(),
  source: official,
  menus,
  menuSeqAnchors: menuSeqAnchors.map((item) => ({ ...item, href: absoluteUrl(item.href) }))
};
fs.writeFileSync(path.join(outDir, "official-dapa-nav-scrape.raw.json"), JSON.stringify(payload, null, 2), "utf8");
await browser.close();

console.log(JSON.stringify({
  menus: payload.menus.map((menu) => ({ title: menu.title, count: menu.items.length })),
  menuSeqAnchors: payload.menuSeqAnchors.length
}, null, 2));
