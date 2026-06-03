import { chromium } from "@playwright/test";
import fs from "node:fs";

const outDir = ".omo/ulw-loop/evidence";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
await page.goto("http://127.0.0.1:3112/", { waitUntil: "networkidle" });
await page.locator(".mainNav button").nth(2).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/local-official-info-menu.png`, fullPage: false });
await page.locator(".mainNav button").nth(3).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/local-civil-participation-menu.png`, fullPage: false });

await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3112/", { waitUntil: "networkidle" });
await page.locator(".mainNav button").nth(4).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}/local-intro-menu-mobile.png`, fullPage: false });

const response = await fetch("http://127.0.0.1:3112/api/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ message: "정보공개 연결 메뉴를 알려줘", section: "정보공개" })
});
const text = await response.text();
fs.writeFileSync(`${outDir}/official-menu-api-status.txt`, String(response.status), "utf8");
fs.writeFileSync(`${outDir}/official-menu-api-response.json`, text, "utf8");

await browser.close();
console.log(JSON.stringify({ status: response.status, cleanup: "browser closed" }, null, 2));
