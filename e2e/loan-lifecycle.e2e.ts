import { expect, test, type Page } from "@playwright/test";
import {
  createListing,
  isoDateFromToday,
  loanCard,
  removeListing,
  requestDays,
  screenshot,
  uniqueName,
} from "./support/data";
import { openAs } from "./support/session";

test.describe.serial("loan lifecycle", () => {
  const toolName = uniqueName("Pressure Washer");
  let lender: Page;
  let borrower: Page;
  let toolUrl: string;

  async function startLoan(days: { from: number; to: number }) {
    await requestDays(borrower, toolUrl, days);
    await lender.goto("/incoming");

    const incoming = loanCard(lender, toolName);

    await expect(incoming.getByText("History:")).toBeVisible();
    await incoming.getByRole("button", { name: "Approve" }).click();
    await incoming.getByRole("button", { name: "Confirm handover" }).click();
    await expect(incoming.getByText("on loan")).toBeVisible();
    await borrower.goto("/requests");

    return { incoming, request: loanCard(borrower, toolName) };
  }

  async function returnAs(condition: RegExp, note?: string) {
    const incoming = loanCard(lender, toolName);

    await loanCard(borrower, toolName)
      .getByRole("button", { name: "I've returned it" })
      .click();

    await expect(incoming.getByText(/says it's back/)).toBeVisible();
    await incoming.getByRole("button", { name: "Confirm return" }).click();
    await lender.getByRole("radio", { name: condition }).check();

    if (note) {
      await expect(
        lender.getByRole("button", { name: "Report and close loan" }),
      ).toBeDisabled();

      await lender.getByLabel("What happened? (required)").fill(note);
      await screenshot(lender, "loan-return-dialog");

      await lender
        .getByRole("button", { name: "Report and close loan" })
        .click();
    } else {
      await lender
        .getByRole("button", { name: "Confirm return" })
        .last()
        .click();
    }
  }

  test.beforeAll(async ({ browser }) => {
    lender = await openAs(browser, "lender");
    borrower = await openAs(browser, "borrower");
    toolUrl = await createListing(lender, toolName);
  });

  test.afterAll(async () => {
    await removeListing(lender, toolName);
  });

  test("an approved extension, then a damage report", async () => {
    const { incoming, request } = await startLoan({ from: 0, to: 1 });

    await request.getByRole("button", { name: "Request more days" }).click();
    await borrower.getByLabel("New end date").fill(isoDateFromToday(3));
    await borrower.getByRole("button", { name: "Send request" }).click();
    await expect(request.getByText(/Extension to .* requested/)).toBeVisible();

    await expect(incoming.getByText(/asks to keep it until/)).toBeVisible();
    await screenshot(lender, "loan-extension-request");
    await incoming.getByRole("button", { name: "Approve extension" }).click();
    await expect(incoming.getByText(/asks to keep it/)).toHaveCount(0);

    await returnAs(/Damaged/, "The hose connector cracked.");
    await expect(incoming.getByText("returned damaged")).toBeVisible();

    await expect(
      request.getByText("Return note: The hose connector cracked."),
    ).toBeVisible();
  });

  test("a declined extension, then a return as expected", async () => {
    const { incoming, request } = await startLoan({ from: 0, to: 1 });

    await request.getByRole("button", { name: "Request more days" }).click();
    await borrower.getByLabel("New end date").fill(isoDateFromToday(2));
    await borrower.getByRole("button", { name: "Send request" }).click();
    await incoming.getByRole("button", { name: "Decline" }).click();
    await expect(request.getByText(/Extension to .* requested/)).toHaveCount(0);

    await returnAs(/As expected/);
    await expect(incoming.getByText("Returned", { exact: true })).toBeVisible();
  });

  test("a tool that never comes back leaves the board until restored", async () => {
    const { incoming } = await startLoan({ from: 0, to: 0 });

    await returnAs(/Not returned/, "Borrower stopped answering messages.");
    await expect(incoming.getByText("not returned")).toBeVisible();

    await borrower.goto("/browse");
    await expect(borrower.getByText(toolName)).toHaveCount(0);

    await lender.goto("/listings");
    await lender.getByRole("button", { name: `Restore ${toolName}` }).click();

    await expect(
      lender.getByRole("link", { name: `Edit ${toolName}`, exact: true }),
    ).toBeVisible();
  });

  test("the borrower confirms pickup, and a disputed handover goes back to waiting", async () => {
    await requestDays(borrower, toolUrl, { from: 0, to: 0 });
    await lender.goto("/incoming");

    const incoming = loanCard(lender, toolName);
    const request = loanCard(borrower, toolName);
    const dialog = lender.getByRole("alertdialog");

    await incoming.getByRole("button", { name: "Approve" }).click();
    await borrower.goto("/requests");
    await request.getByRole("button", { name: "I picked it up" }).click();
    await expect(request.getByText("on loan")).toBeVisible();

    await expect(incoming.getByText(/says they picked it up/)).toBeVisible();
    await incoming.getByRole("button", { name: "It didn't happen" }).click();
    await dialog.getByRole("button", { name: "It didn't happen" }).click();
    await expect(incoming.getByText("awaiting handover")).toBeVisible();
    await expect(request.getByText("awaiting handover")).toBeVisible();

    await request.getByRole("button", { name: "I picked it up" }).click();
    await incoming.getByRole("button", { name: "Yes, handed over" }).click();

    await expect(
      incoming.getByRole("button", { name: "It didn't happen" }),
    ).toHaveCount(0);

    await returnAs(/As expected/);
  });

  test("every loan keeps its own activity log", async () => {
    await lender.goto("/incoming");

    const toggles = lender
      .getByRole("listitem")
      .filter({ hasText: toolName })
      .getByRole("button", { name: "Show history" });

    await toggles.first().click();

    await expect(
      lender
        .getByRole("listitem")
        .filter({ hasText: toolName })
        .getByRole("button", { name: "Hide history" }),
    ).toHaveCount(1);
    await screenshot(lender, "loan-activity-log");
  });

  test("a loan already at 30 days cannot be extended", async () => {
    const { request } = await startLoan({ from: 0, to: 29 });

    await expect(
      request.getByRole("button", { name: "Request more days" }),
    ).toBeDisabled();

    await returnAs(/As expected/);
  });
});
