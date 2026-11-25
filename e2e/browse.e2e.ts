import { categoryLabel } from "@/lib/categories";
import { CATEGORIES } from "@convex/shared/catalog";
import { expect, test } from "@playwright/test";
import { screenshot } from "./support/data";
import { openAs } from "./support/session";

test("every category chip filters the board", async ({ browser }) => {
  const page = await openAs(browser, "borrower");

  const filters = page.getByRole("navigation", {
    name: "Filter by category",
  });

  await page.goto("/browse");

  for (const category of CATEGORIES) {
    await filters
      .getByRole("link", { name: categoryLabel(category), exact: true })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`category=${category.replaceAll(" ", "-")}`),
    );

    await expect(
      filters.getByRole("link", { name: categoryLabel(category), exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }

  await filters.getByRole("link", { name: "Garden", exact: true }).click();
  await expect(page.getByRole("link", { name: /Hedge Trimmer/ })).toBeVisible();

  await expect(page.getByRole("link", { name: /Cordless Drill/ })).toHaveCount(
    0,
  );

  await filters.getByRole("link", { name: "All", exact: true }).click();
  await expect(page).toHaveURL(/\/browse$/);
});

test("search narrows the board and explains when nothing matches", async ({
  browser,
}) => {
  const page = await openAs(browser, "borrower");
  const search = page.getByLabel("Search tools by name");

  await page.goto("/browse");
  await search.fill("drill");

  await expect(
    page.getByRole("link", { name: /Cordless Drill/ }),
  ).toBeVisible();

  await expect(page.getByRole("link", { name: /Projector/ })).toHaveCount(0);
  await screenshot(page, "browse-search");

  await search.fill("no such tool here");

  await expect(
    page.getByText('No tools match "no such tool here".'),
  ).toBeVisible();
});

test("a card opens the tool page and the breadcrumbs lead back", async ({
  browser,
}) => {
  const page = await openAs(browser, "borrower");
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });

  await page.goto("/browse");
  await page.getByRole("link", { name: /Cordless Drill/ }).click();

  await expect(
    page.getByRole("heading", { level: 1, name: "Cordless Drill" }),
  ).toBeVisible();

  await expect(page.getByText("Choose your dates")).toBeVisible();
  await expect(page.getByText("Maya Chen")).toBeVisible();
  await screenshot(page, "tool-details");

  await breadcrumb.getByRole("link", { name: "power tools" }).click();
  await expect(page).toHaveURL(/category=power-tools/);

  await page.goBack();
  await breadcrumb.getByRole("link", { name: "All tools" }).click();
  await expect(page).toHaveURL(/\/browse$/);
});

test("an unknown tool shows a clear message", async ({ browser }) => {
  const page = await openAs(browser, "borrower");

  await page.goto("/tools/not-a-real-tool");

  await expect(
    page.getByRole("heading", { name: "This listing isn't available" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Back to all tools" }).click();
  await expect(page).toHaveURL(/\/browse$/);
});
