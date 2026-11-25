import { expect, test, type Page } from "@playwright/test";
import { LOAN_POLICY } from "@convex/shared/policy";
import {
  createListing,
  dayButton,
  PHOTO_FIXTURES,
  removeListing,
  screenshot,
  uniqueName,
} from "./support/data";
import { openAs } from "./support/session";

const UTC_HOUR_WHEN_KIRITIMATI_IS_TOMORROW = 10;

function timezoneOnAnotherDay(): string {
  return new Date().getUTCHours() >= UTC_HOUR_WHEN_KIRITIMATI_IS_TOMORROW
    ? "Pacific/Kiritimati"
    : "Pacific/Pago_Pago";
}

const MAX_LOAN_DAYS = LOAN_POLICY.maxDays;

test.describe.serial("tool page", () => {
  const toolName = uniqueName("Camping Stove");
  let owner: Page;
  let visitor: Page;
  let toolUrl: string;

  test.beforeAll(async ({ browser }) => {
    owner = await openAs(browser, "admin");
    visitor = await openAs(browser, "lender");
    toolUrl = await createListing(owner, toolName, PHOTO_FIXTURES);
  });

  test.afterAll(async () => {
    await removeListing(owner, toolName);
  });

  test("the owner sees availability but no request button", async () => {
    await owner.goto(toolUrl);

    await expect(owner.getByText("This is your listing.")).toBeVisible();

    await expect(
      owner.getByRole("heading", { name: "Availability" }),
    ).toBeVisible();

    await expect(owner.getByRole("button", { name: /^Request/ })).toHaveCount(
      0,
    );

    await expect(owner.getByText("(you)")).toBeVisible();
  });

  test("the photo carousel moves with arrows and thumbnails", async () => {
    await visitor.goto(toolUrl);

    const previous = visitor.getByRole("button", { name: "Previous slide" });
    const next = visitor.getByRole("button", { name: "Next slide" });

    await expect(previous).toBeDisabled();
    await next.click();
    await expect(next).toBeDisabled();
    await expect(visitor.getByText("2 / 2")).toBeVisible();

    await previous.click();
    await expect(visitor.getByText("1 / 2")).toBeVisible();

    await visitor.getByRole("button", { name: "Show photo 2" }).click();
    await expect(visitor.getByText("2 / 2")).toBeVisible();
    await screenshot(visitor, "tool-carousel");
  });

  test("dates can be picked, counted and cleared", async () => {
    const requestButton = visitor.getByRole("button", {
      name: /Request|Select dates/,
    });

    await visitor.goto(toolUrl);
    await expect(requestButton).toHaveText("Select dates to request");
    await expect(requestButton).toBeDisabled();

    await dayButton(visitor, 1).click();
    await dayButton(visitor, 3).click();
    await expect(requestButton).toHaveText("Request 3 days");

    await visitor.getByRole("button", { name: "Clear dates" }).click();

    await expect(
      visitor.getByText("Free to borrow for up to 30 days."),
    ).toBeVisible();

    await expect(requestButton).toBeDisabled();
  });

  test("a loan cannot be longer than the 30-day limit", async () => {
    await visitor.goto(toolUrl);
    await expect(dayButton(visitor, -1)).toBeDisabled();
    await dayButton(visitor, 0).click();
    await expect(dayButton(visitor, MAX_LOAN_DAYS)).toBeDisabled();
    await dayButton(visitor, MAX_LOAN_DAYS - 1).click();

    await expect(
      visitor.getByRole("button", { name: `Request ${MAX_LOAN_DAYS} days` }),
    ).toBeEnabled();
  });

  test("the calendar follows the server's UTC date in any timezone", async ({
    browser,
  }) => {
    const page = await openAs(browser, "lender", {
      timezoneId: timezoneOnAnotherDay(),
    });

    await page.goto(toolUrl);
    await expect(dayButton(page, 0)).toBeEnabled();
    await expect(dayButton(page, -1)).toBeDisabled();
  });
});
