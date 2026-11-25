import { expect, type Page } from "@playwright/test";
import { millisecondsInDay } from "date-fns/constants";

export const PHOTO_FIXTURES = [
  "e2e/fixtures/photo-green.png",
  "e2e/fixtures/photo-amber.png",
];

const TEST_LISTING_PREFIX = "E2E";

const TEST_LISTING_DELETE_LABEL = new RegExp(`^Delete ${TEST_LISTING_PREFIX} `);

export function uniqueName(base: string): string {
  return `${TEST_LISTING_PREFIX} ${base} ${Date.now().toString(36)}`;
}

export function isoDateFromToday(days: number): string {
  const [date] = new Date(Date.now() + days * millisecondsInDay)
    .toISOString()
    .split("T");

  return date;
}

export async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screens/${name}.png` });
}

export function dayButton(page: Page, daysFromToday: number) {
  const isoDate = isoDateFromToday(daysFromToday);

  return page.locator(`[data-day="${isoDate}"] button`).first();
}

export function toolLink(page: Page, toolName: string) {
  return page.getByRole("link", { name: toolName, exact: true });
}

export function loanCard(page: Page, toolName: string, status?: string) {
  const cards = page.getByRole("listitem").filter({ hasText: toolName });

  return (status ? cards.filter({ hasText: status }) : cards).first();
}

export async function startListing(
  page: Page,
  toolName: string,
  description = "Well looked after and ready for the weekend.",
) {
  await page.goto("/listings/new");
  await page.getByLabel("Tool name").fill(toolName);
  await page.getByLabel("Short description").fill(description);
}

export async function createListing(
  page: Page,
  toolName: string,
  photos: string[] = [],
) {
  await startListing(page, toolName);

  if (photos.length > 0) {
    await page.locator('input[type="file"]').setInputFiles(photos);
  }

  await page.getByRole("button", { name: "Publish listing" }).click();
  await expect(page).toHaveURL(/\/listings$/);
  await toolLink(page, toolName).click();
  await expect(page.getByRole("heading", { name: toolName })).toBeVisible();

  return page.url();
}

export async function removeListing(page: Page, toolName: string) {
  await page.goto("/listings");
  await page.getByRole("button", { name: `Delete ${toolName}` }).click();
  await page.getByRole("button", { name: "Delete listing" }).click();

  await expect(
    page.getByRole("button", { name: `Restore ${toolName}` }),
  ).toBeVisible();
}

export async function removeLeftoverListings(page: Page) {
  await page.goto("/listings");

  await expect(
    page.getByRole("heading", { name: "My Listings" }),
  ).toBeVisible();

  const leftovers = page.getByRole("button", {
    name: TEST_LISTING_DELETE_LABEL,
  });

  const labels = await leftovers.evaluateAll((buttons) =>
    buttons.map((button) => button.getAttribute("aria-label") ?? ""),
  );

  for (const label of labels) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: "Delete listing" }).click();

    await expect(
      page.getByRole("button", { name: label, exact: true }),
    ).toHaveCount(0);
  }
}

export async function requestDays(
  page: Page,
  toolUrl: string,
  { from, to }: { from: number; to: number },
) {
  const days = to - from + 1;
  const label = `Request ${days} ${days === 1 ? "day" : "days"}`;

  await page.goto(toolUrl);
  await dayButton(page, from).click();

  if (to !== from) await dayButton(page, to).click();

  await page.getByRole("button", { name: label }).click();
  await expect(page.getByText("Request sent")).toBeVisible();
}
