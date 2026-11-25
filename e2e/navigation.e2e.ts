import { clerk } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";
import { screenshot } from "./support/data";
import { openAs } from "./support/session";
import { TEST_USERS } from "./support/testUsers";

const SECTIONS = [
  ["Browse Tools", "/browse", "Neighborhood Tools"],
  ["My Listings", "/listings", "My Listings"],
  ["My Requests", "/requests", "My Borrow Requests"],
  ["Incoming Requests", "/incoming", "Incoming Requests on My Tools"],
] as const;

test("the main navigation reaches every section and marks the current one", async ({
  browser,
}) => {
  const page = await openAs(browser, "borrower");
  const nav = page.getByRole("navigation", { name: "Main" });

  await page.goto("/browse");

  for (const [label, path, heading] of SECTIONS) {
    await nav.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();

    await expect(nav.getByRole("link", { name: label })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }

  await expect(nav.getByRole("link", { name: "Admin" })).toHaveCount(0);
});

test("the header buttons and brand link work", async ({ browser }) => {
  const page = await openAs(browser, "borrower");

  await page.goto("/requests");
  await page.getByRole("link", { name: "List a Tool" }).click();
  await expect(page).toHaveURL(/\/listings\/new$/);

  await expect(
    page.getByRole("heading", { name: "List a new tool" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Close form" }).click();
  await expect(page).toHaveURL(/\/listings$/);

  await page.getByRole("link", { name: "LendLoop" }).click();
  await expect(page).toHaveURL(/\/browse$/);
});

test("a regular neighbor gets a not-found page for the admin area", async ({
  browser,
}) => {
  const page = await openAs(browser, "borrower");

  await page.goto("/admin/neighbors");

  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});

test("a neighbor signs out from the user menu", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("/");
  await clerk.signIn({ page, emailAddress: TEST_USERS.borrower.email });
  await page.goto("/browse");
  await page.getByRole("button", { name: "Open user menu" }).click();
  await screenshot(page, "user-menu");
  await page.getByText("Sign out", { exact: true }).click();

  await expect(
    page.getByRole("button", { name: "Sign in to lend or borrow" }).first(),
  ).toBeVisible();

  await context.close();
});

test("the skip link is the first stop for keyboard users", async ({
  browser,
}) => {
  const page = await openAs(browser, "borrower");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });

  await page.goto("/browse");
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});
