import { expect, test, type Page } from "@playwright/test";
import {
  createListing,
  dayButton,
  loanCard,
  removeListing,
  requestDays,
  screenshot,
  uniqueName,
} from "./support/data";
import { openAs } from "./support/session";

test.describe.serial("borrow requests", () => {
  const toolName = uniqueName("Tile Cutter");
  let lender: Page;
  let borrower: Page;
  let admin: Page;
  let toolUrl: string;

  test.beforeAll(async ({ browser }) => {
    lender = await openAs(browser, "lender");
    borrower = await openAs(browser, "borrower");
    admin = await openAs(browser, "admin");
    toolUrl = await createListing(lender, toolName);
  });

  test.afterAll(async () => {
    await removeListing(lender, toolName);
  });

  test("the owner declines a request and sees the pending badge first", async () => {
    await requestDays(admin, toolUrl, { from: 2, to: 3 });

    await lender.goto("/incoming");

    await expect(
      lender.getByRole("link", { name: /Incoming Requests.*pending/ }),
    ).toBeVisible();

    await loanCard(lender, toolName)
      .getByRole("button", { name: "Decline" })
      .click();

    await expect(lender.getByText("Request declined.")).toBeVisible();

    await admin.goto("/requests");

    await expect(
      loanCard(admin, toolName).getByText("Declined", { exact: true }),
    ).toBeVisible();
  });

  test("the borrower cancels a pending request", async () => {
    await requestDays(admin, toolUrl, { from: 2, to: 3 });

    await admin.goto("/requests");
    const request = loanCard(admin, toolName);

    await request.getByRole("button", { name: "Cancel request" }).click();
    await expect(request.getByText("Cancelled", { exact: true })).toBeVisible();
  });

  test("approving one request declines the overlapping one and blocks those days", async () => {
    await requestDays(borrower, toolUrl, { from: 2, to: 3 });
    await requestDays(admin, toolUrl, { from: 3, to: 4 });

    await lender.goto("/incoming");
    const cards = lender.getByRole("listitem").filter({ hasText: toolName });
    const borrowerCard = cards.filter({ hasText: "Ben Borrower" }).first();

    await screenshot(lender, "requests-competing");
    await borrowerCard.getByRole("button", { name: "Approve" }).click();
    await expect(borrowerCard.getByText("upcoming")).toBeVisible();

    await admin.goto("/requests");

    await expect(
      loanCard(admin, toolName).getByText("Declined", { exact: true }),
    ).toBeVisible();

    await admin.goto(toolUrl);
    await expect(dayButton(admin, 2)).toBeDisabled();
  });

  test("the tool cannot be deleted while a loan is booked", async () => {
    await lender.goto("/listings");
    await lender.getByRole("button", { name: `Delete ${toolName}` }).click();
    await lender.getByRole("button", { name: "Delete listing" }).click();

    await expect(
      lender.getByText(/has an upcoming or active loan/),
    ).toBeVisible();
  });

  test("the owner cancels an upcoming loan", async () => {
    await lender.goto("/incoming");

    const upcoming = loanCard(lender, toolName, "upcoming");

    await upcoming.getByRole("button", { name: "Cancel loan" }).click();

    await expect(
      lender.getByText("Cancelled. The other neighbor is notified."),
    ).toBeVisible();
  });

  test("the borrower cancels an upcoming loan", async () => {
    await requestDays(admin, toolUrl, { from: 5, to: 6 });

    await lender.goto("/incoming");

    await loanCard(lender, toolName)
      .getByRole("button", { name: "Approve" })
      .click();

    await admin.goto("/requests");

    const loan = loanCard(admin, toolName, "upcoming");

    await loan.getByRole("button", { name: "Cancel loan" }).click();

    await expect(
      admin.getByText("Cancelled. The other neighbor is notified."),
    ).toBeVisible();
  });

  test("the owner cancels a loan when the borrower never picks it up", async () => {
    await requestDays(admin, toolUrl, { from: 0, to: 1 });

    await lender.goto("/incoming");
    const loan = loanCard(lender, toolName);

    await loan.getByRole("button", { name: "Approve" }).click();
    await expect(loan.getByText("awaiting handover")).toBeVisible();

    await expect(
      loan.getByText(/If they don't show up, cancel the loan/),
    ).toBeVisible();

    await loan.getByRole("button", { name: "Cancel loan" }).click();
    await expect(loan.getByText("Cancelled", { exact: true })).toBeVisible();
  });
});
