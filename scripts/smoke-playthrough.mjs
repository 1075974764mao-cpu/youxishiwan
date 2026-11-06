import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://127.0.0.1:5173";
const OUT = process.env.SHOT_DIR || "/cursor/stores/bc-e347b02d-a9c0-4a98-98a7-ba3febb976f0/media/prologue";

fs.mkdirSync(OUT, { recursive: true });

async function clickChoice(page, textPart) {
  const btn = page.locator(".choice", { hasText: textPart }).first();
  await btn.waitFor({ state: "visible", timeout: 10000 });
  await btn.click();
}

async function runPath(page, name, steps, expectText) {
  await page.goto(BASE);
  await page.getByRole("button", { name: "开始序章" }).click();
  for (const step of steps) {
    await clickChoice(page, step);
    await page.waitForTimeout(350);
  }
  await page.waitForSelector(".ending", { timeout: 10000 });
  const body = await page.locator(".ending").innerText();
  if (!body.includes(expectText)) {
    throw new Error(`[${name}] expected "${expectText}" in ending, got:\n${body.slice(0, 400)}`);
  }
  const shot = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: shot, fullPage: true });
  console.log(`OK ${name} -> ${shot}`);
  return shot;
}

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// Title screenshot
await page.goto(BASE);
await page.waitForSelector(".brand");
await page.screenshot({ path: path.join(OUT, "title.png"), fullPage: true });
console.log("OK title");

// Death: store help
await runPath(
  page,
  "death-store",
  ["下楼去便利店看看", "想办法帮他包扎"],
  "死亡结局"
);

// Survival path
await runPath(
  page,
  "survive",
  [
    "先把门锁死",
    "装作没看见",
    "带上手电，撤离",
    "走消防通道下地库取车",
    "继续下楼去地库",
    "冲出闸机，上公路",
    "不停车，直接往青埠开",
  ],
  "序章通关"
);

await browser.close();
console.log("All playthroughs passed.");
