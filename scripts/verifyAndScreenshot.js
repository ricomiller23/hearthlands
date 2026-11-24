import { chromium } from "playwright-core";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const DOWNLOADS_DIR = "/Users/ericmiller/Downloads";
const SCREENSHOTS_DIR = "/Users/ericmiller/.gemini/antigravity/scratch/hearthlands/screenshots";

async function run() {
  console.log("Starting preview server on port 4180...");
  const server = spawn("npx", ["vite", "preview", "--port", "4180", "--strictPort"], {
    cwd: "/Users/ericmiller/.gemini/antigravity/scratch/hearthlands",
    stdio: "inherit",
  });

  await new Promise((r) => setTimeout(r, 2500));

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  console.log("Navigating to http://localhost:4180...");
  await page.goto("http://localhost:4180", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Title Screen
  console.log("Capturing 01-title-screen.png...");
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01-title-screen.png") });

  // 2. Open Codex Rules Modal
  console.log("Opening Codex Rules...");
  const rulesBtn = await page.getByRole("button", { name: /Codex \/ Rules/i });
  if (rulesBtn) {
    await rulesBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02-codex-rules.png") });
    // Close modal
    const closeBtn = await page.getByRole("button", { name: /Return to the Realm/i });
    if (closeBtn) await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 3. Enter Realm
  console.log("Entering Realm...");
  const enterBtn = await page.getByRole("button", { name: /Enter the Realm/i });
  await enterBtn.click();
  await page.waitForTimeout(2000); // allow Three.js canvas to initialize and render
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03-board-diorama.png") });

  // 4. Rotate tile with hotkey 'R'
  console.log("Rotating tile...");
  await page.keyboard.press("r");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04-tile-rotated.png") });

  // 5. Switch to Top-Down view
  console.log("Switching to Top-Down view...");
  const topDownBtn = await page.getByTitle(/Top-Down Plan View/i);
  if (topDownBtn) {
    await topDownBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05-topdown-view.png") });
  }

  // 6. Switch to Hero view
  console.log("Switching to Hero view...");
  const heroBtn = await page.getByTitle(/Low Hero Diorama View/i);
  if (heroBtn) {
    await heroBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06-hero-view.png") });
  }

  // 7. Mobile Viewport 390x844
  console.log("Testing mobile viewport 390x844...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "07-mobile-viewport.png") });

  await browser.close();
  server.kill();

  console.log("Copying screenshots to Downloads...");
  const files = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith(".png"));
  for (const f of files) {
    fs.copyFileSync(
      path.join(SCREENSHOTS_DIR, f),
      path.join(DOWNLOADS_DIR, `hearthlands-${f}`)
    );
  }
  console.log(`Exported ${files.length} screenshots to ${DOWNLOADS_DIR}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
