import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import puppeteer from "puppeteer";

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
  const path = join(OUT, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

function reactLogin(page) {
  return page.evaluate(() => {
    const input = document.querySelector('input[placeholder="guest"]');
    if (!input) return { ok: false, reason: "no input" };
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(input, "guest");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const propsKey = Object.keys(input).find((k) => k.startsWith("__reactProps$"));
    if (propsKey) {
      const props = input[propsKey];
      props.onKeyDown?.({
        key: "Enter",
        preventDefault: () => {},
        stopPropagation: () => {},
      });
      return { ok: true, method: "react-props" };
    }
    return { ok: false, reason: "no react props" };
  });
}

async function runCmd(page, cmd) {
  await page.evaluate((command) => {
    window.dispatchEvent(new CustomEvent("rootos:run-command", { detail: command }));
  }, cmd);
  await new Promise((r) => setTimeout(r, 1800));
}

async function pageState(page) {
  return page.evaluate(() => ({
    hasTerminal: !!document.querySelector('[data-testid="terminal-shell"]'),
    divCount: document.querySelectorAll("div").length,
    bodyText: document.body.innerText.slice(0, 500),
  }));
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const logs = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
  page.on("pageerror", (err) => logs.push({ type: "pageerror", text: err.message }));

  const results = [];

  try {
    await page.goto(BASE, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForFunction(
      () =>
        Array.from(document.querySelectorAll("button")).some((b) =>
          b.textContent?.includes("Skip boot"),
        ),
      { timeout: 15000 },
    );
    await new Promise((r) => setTimeout(r, 500));
    await shot(page, "01-boot-blackout");
    results.push({ step: "boot", ...(await pageState(page)) });

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Skip boot"),
      );
      btn?.click();
    });
    await new Promise((r) => setTimeout(r, 3000));
    await shot(page, "02-login");
    results.push({ step: "login-screen", ...(await pageState(page)) });

    const login = await reactLogin(page);
    results.push({ step: "login-submit", ...login });
    await new Promise((r) => setTimeout(r, 6000));
    await shot(page, "03-shell");
    const shell = await pageState(page);
    const shellHtml = await page.evaluate(() => document.body.innerHTML.slice(0, 2000));
    results.push({ step: "shell", ...shell, htmlPreview: shellHtml.slice(0, 200) });

    if (!shell.hasTerminal) {
      throw new Error(`Terminal not found after login: ${JSON.stringify(shell)}`);
    }

    let i = 4;
    for (const cmd of COMMANDS) {
      await runCmd(page, cmd);
      const slug =
        String(i).padStart(2, "0") +
        "-" +
        cmd.replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      await shot(page, slug);
      results.push({ cmd, ok: true });

      if (cmd === "contact") {
        const mailVisible = await page.evaluate(() =>
          document.body.innerText.includes("Contact"),
        );
        results.push({ step: "mail-app", ok: mailVisible });
      }
      if (cmd === "shutdown -h now") {
        await new Promise((r) => setTimeout(r, 15000));
        await shot(page, "99-shutdown-halted");
        const halted = await page.evaluate(() =>
          document.body.innerText.includes("System halted"),
        );
        results.push({ step: "shutdown", ok: halted });
      }
      i += 1;
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
