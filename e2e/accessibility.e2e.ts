import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { openAs } from "./support/session";

const WCAG_AA = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const SIGNED_IN_PAGES = [
  "/browse",
  "/listings",
  "/listings/new",
  "/requests",
  "/incoming",
  "/admin",
  "/admin/neighbors",
  "/admin/loans",
  "/admin/audit",
];

async function violationsOn(page: Page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState === "finished"),
  );

  const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();

  return results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.nodes
        .map((node) => node.target.join(" "))
        .join(", ")}`,
  );
}

test("the public board meets WCAG 2.2 AA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  expect(await violationsOn(page)).toEqual([]);
});

test("every signed-in page meets WCAG 2.2 AA", async ({ browser }) => {
  const page = await openAs(browser, "admin");
  const failures: string[] = [];

  for (const path of SIGNED_IN_PAGES) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("heading").first()).toBeVisible();

    for (const violation of await violationsOn(page)) {
      failures.push(`${path} ${violation}`);
    }
  }

  expect(failures).toEqual([]);
});

test("a tool page meets WCAG 2.2 AA", async ({ browser }) => {
  const page = await openAs(browser, "borrower");

  await page.goto("/browse");
  await page.getByRole("link", { name: /Cordless Drill/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  expect(await violationsOn(page)).toEqual([]);
});
