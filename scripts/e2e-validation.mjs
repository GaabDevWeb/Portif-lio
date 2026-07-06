import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const OUT = join(process.cwd(), ".frontend-review/2026-07-05-e2e-validation");

const COMMANDS = [
  "help",
  "whoami",
  "ls",
  "projects",
  "git log",
  "top",
  "cowsay hello",
  "matrix",
  "man ls",
  "contact",
  "shutdown -h now",
];

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
}

async function runCmd(page, cmd) {
  await page.evaluate((command) => {
    window.dispatchEvent(new CustomEvent("rootos:run-command", { detail: command }));
  }, cmd);
  await page.waitForTimeout(1800);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  try {
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shot(page, "01-boot-blackout");

    await page.click("button:has-text('Skip boot')");
    await page.waitForTimeout(2000);
    await shot(page, "02-login");

    await page.fill('input[placeholder="guest"]', "guest");
    await page.press('input[placeholder="guest"]', "Enter");
    await page.waitForTimeout(4000);
    await shot(page, "03-shell");

    const hasTerminal = await page.locator('[data-testid="terminal-shell"]').count();
    results.push({ step: "shell", ok: hasTerminal > 0 });

    if (hasTerminal === 0) {
      throw new Error("Terminal not found after login");
    }

    let i = 4;
    for (const cmd of COMMANDS) {
      await runCmd(page, cmd);
      const slug = String(i).padStart(2, "0") + "-" + cmd.replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      await shot(page, slug);
      results.push({ cmd, ok: true });
      i += 1;

      if (cmd === "contact") {
        const mailVisible = await page.locator("text=Contact").count();
        results.push({ step: "mail-app", ok: mailVisible > 0 });
      }
      if (cmd === "shutdown -h now") {
        await page.waitForTimeout(6000);
        await shot(page, "99-shutdown-halted");
        const halted = await page.locator("text=System halted").count();
        results.push({ step: "shutdown", ok: halted > 0 });
      }
    }
  } catch (error) {
    results.push({ step: "error", ok: false, message: String(error) });
    await shot(page, "error-state");
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ out: OUT, results }, null, 2));
}

main();
