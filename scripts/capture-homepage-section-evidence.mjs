import { chromium } from "@playwright/test";
import fs from "node:fs";

const outDir = ".omo/ulw-loop/evidence";
const baseUrl = process.env.CAPTURE_BASE_URL || "http://127.0.0.1:3123";
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.getByRole("region", { name: "공식 홈페이지 섹션 AI 검색" }).scrollIntoViewIfNeeded();
await page.screenshot({ path: `${outDir}/local-homepage-sections.png`, fullPage: false });
await page.getByRole("region", { name: "공식 홈페이지 섹션 AI 검색" }).getByRole("button", { name: "AI로 검색" }).nth(4).click();
await page.locator(".answerPanel").waitFor({ state: "visible" });
await page.screenshot({ path: `${outDir}/local-homepage-sns-answer.png`, fullPage: false });

const response = await fetch(`${baseUrl}/api/chat`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ message: "방위사업청 SNS에 나오는 홈페이지 내용을 알려줘", section: "방위사업청 SNS" })
});
fs.writeFileSync(`${outDir}/homepage-section-api-status.txt`, String(response.status), "utf8");
fs.writeFileSync(`${outDir}/homepage-section-api-response.json`, await response.text(), "utf8");
await browser.close();

console.log(JSON.stringify({ status: response.status, cleanup: "browser closed" }, null, 2));
