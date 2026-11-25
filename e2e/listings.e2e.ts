import { expect, test } from "@playwright/test";
import {
  startListing,
  PHOTO_FIXTURES,
  removeListing,
  screenshot,
  toolLink,
  uniqueName,
} from "./support/data";
import { openAs } from "./support/session";

const SIX_PHOTOS = [...PHOTO_FIXTURES, ...PHOTO_FIXTURES, ...PHOTO_FIXTURES];

test("a lender manages a listing from creation to restore", async ({
  browser,
}) => {
  const page = await openAs(browser, "lender");
  const toolName = uniqueName("Orbital Sander");
  const renamed = `${toolName} Pro`;
  const fileInput = page.locator('input[type="file"]');

  await startListing(
    page,
    toolName,
    "Random orbit sander with five sanding discs.",
  );

  await expect(page.getByText("44/280")).toBeVisible();

  await fileInput.setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("not a photo"),
  });

  await expect(
    page.getByText("notes.txt: use a JPEG, PNG or WebP photo."),
  ).toBeVisible();

  await fileInput.setInputFiles(SIX_PHOTOS);

  await expect(
    page.getByText("A listing can have at most 5 photos."),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: /Remove photo/ })).toHaveCount(
    5,
  );

  await expect(page.getByText("Add", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Remove photo 5" }).click();
  await page.getByRole("button", { name: "Remove photo 4" }).click();
  await page.getByRole("button", { name: "Remove photo 3" }).click();

  await expect(page.getByRole("button", { name: /Remove photo/ })).toHaveCount(
    2,
  );

  await screenshot(page, "listing-form");

  await page.getByRole("button", { name: "Publish listing" }).click();
  await expect(page.getByText("Tool listed for your neighbors.")).toBeVisible();
  await page.getByRole("button", { name: "Close toast" }).first().click();

  await expect(page.getByText("Tool listed for your neighbors.")).toHaveCount(
    0,
  );

  await expect(toolLink(page, toolName)).toBeVisible();

  await page.getByRole("link", { name: `Edit ${toolName}` }).click();
  await page.getByRole("link", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/listings$/);

  await page.getByRole("link", { name: `Edit ${toolName}` }).click();
  await page.getByLabel("Tool name").fill(renamed);
  await page.getByLabel("Category").click();
  await page.getByRole("option", { name: "Garden" }).click();
  await page.getByLabel("Condition").click();
  await page.getByRole("option", { name: "Like new" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Tool listing updated.")).toBeVisible();

  const row = page.getByRole("listitem").filter({ hasText: renamed });

  await expect(row.getByText(/^Garden ·/)).toBeVisible();

  await toolLink(page, renamed).click();
  await expect(page.getByText("Like new condition")).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Show photo 2" }),
  ).toBeVisible();

  await removeListing(page, renamed);
  await screenshot(page, "listing-removed");

  await page.getByRole("button", { name: `Restore ${renamed}` }).click();
  await expect(toolLink(page, renamed)).toBeVisible();

  const borrower = await openAs(browser, "borrower");

  const editUrl = await page
    .getByRole("link", { name: `Edit ${renamed}` })
    .getAttribute("href");

  await borrower.goto(editUrl ?? "/");

  await expect(
    borrower.getByRole("heading", { name: "This listing can't be edited" }),
  ).toBeVisible();

  await removeListing(page, renamed);
});
