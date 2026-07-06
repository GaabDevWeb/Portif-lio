import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import puppeteer from "puppeteer";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const OUT = join(process.cwd(), ".frontend-review/2026-07-06-intro-validation");

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
}

async function state(page) {
  return page.evaluate(() => ({
    divCount: document.querySelectorAll("div").length,
    hasCanvas: !!document.querySelector("canvas"),
    hasTerminal: !!document.querySelector('[data-testid="terminal-shell"]'),
    buttons: Array.from(document.querySelectorAll("button")).map((b) => b.textContent?.trim()),
    bodyText: document.body.innerText.slice(0, 600),
  }));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const logs = [];
  const results = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
  page.on("pageerror", (err) => logs.push({ type: "pageerror", text: err.message }));

  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 120000 });
    await new Promise((r) => setTimeout(r, 500));
    await shot(page, "01-blackout");
    results.push({ step: "blackout", ...(await state(page)) });

    await new Promise((r) => setTimeout(r, 3500));
    await shot(page, "02-reveal");
    results.push({ step: "reveal", ...(await state(page)) });

    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent?.includes("POWER ON"),
        ),
      { timeout: 20000 },
    );
    await shot(page, "03-power-ready");
    results.push({ step: "power-ready", ...(await state(page)) });

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("POWER ON"),
      );
      btn?.click();
    });

    await new Promise((r) => setTimeout(r, 4000));
    await shot(page, "04-crt-on");
    results.push({ step: "crt-on", ...(await state(page)) });

    await new Promise((r) => setTimeout(r, 14000));
    await shot(page, "05-post");
    results.push({ step: "post", ...(await state(page)) });

    await new Promise((r) => setTimeout(r, 10000));
    await shot(page, "06-boot-login");
    results.push({ step: "boot-login", ...(await state(page)) });

    const scrollHint = await page.waitForFunction(
      () => document.body.innerText.includes("Scroll to enter"),
      { timeout: 20000 },
    ).then(() => true).catch(() => false);
    results.push({ step: "scroll-hint", ok: scrollHint });

    if (scrollHint) {
      await shot(page, "07-scroll-wait");
      await page.mouse.wheel({ deltaY: 500 });
      await new Promise((r) => setTimeout(r, 4500));
      await shot(page, "08-transition");
      results.push({ step: "transition", ...(await state(page)) });

      await new Promise((r) => setTimeout(r, 2000));
      await shot(page, "09-shell");
      const shell = await state(page);
      results.push({
        step: "shell",
        ...shell,
        ok: shell.hasTerminal && shell.bodyText.includes("guest@devbox"),
      });
    }
  } catch (error) {
    results.push({ step: "error", ok: false, message: String(error) });
    await shot(page, "error-state").catch(() => {});
  } finally {
    await writeFile(join(OUT, "console.log.json"), JSON.stringify(logs, null, 2));
    await writeFile(join(OUT, "results.json"), JSON.stringify({ out: OUT, results }, null, 2));
    await browser.close();
  }

  console.log(JSON.stringify({ out: OUT, results, logCount: logs.length }, null, 2));
}

main();
