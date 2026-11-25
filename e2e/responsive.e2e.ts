import { expect, test, type Page } from "@playwright/test";
import { screenshot } from "./support/data";
import { openAs } from "./support/session";

const PHONE = { width: 375, height: 812 };

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
}

test("the public board fits a phone screen", async ({ page }) => {
  await page.setViewportSize(PHONE);
  await page.goto("/");
  await expectNoHorizontalScroll(page);
  await screenshot(page, "phone-public");
});

test("signed-in pages fit a phone screen", async ({ browser }) => {
  const page = await openAs(browser, "admin");

  await page.setViewportSize(PHONE);

  for (const path of ["/browse", "/listings", "/requests", "/admin"]) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await screenshot(page, `phone${path.replace("/", "-")}`);
  }
});
