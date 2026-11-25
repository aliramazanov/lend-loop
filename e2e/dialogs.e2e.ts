import { expect, test, type Page } from "@playwright/test";
import {
  createListing,
  isoDateFromToday,
  loanCard,
  removeListing,
  requestDays,
  uniqueName,
} from "./support/data";
import { neighborRow, reinstateIfSuspended } from "./support/neighbors";
import { openAs } from "./support/session";
import { fullName } from "./support/testUsers";

test.describe.serial("dialogs and double clicks", () => {
  const toolName = uniqueName("Hammer Drill");
  let owner: Page;
  let borrower: Page;
  let toolUrl: string;

  test.beforeAll(async ({ browser }) => {
    owner = await openAs(browser, "admin");
    borrower = await openAs(browser, "lender");
    toolUrl = await createListing(owner, toolName);
  });

  test.afterAll(async () => {
    await removeListing(owner, toolName);
  });

  test("a double-clicked approve is sent only once", async () => {
    await requestDays(borrower, toolUrl, { from: 0, to: 1 });
    await owner.goto("/incoming");

    const card = loanCard(owner, toolName);

    await card.getByRole("button", { name: "Approve" }).dblclick();
    await expect(owner.getByText("Request approved.")).toHaveCount(1);
    await expect(owner.getByText(/Only pending loans/)).toHaveCount(0);

    await card.getByRole("button", { name: "Confirm handover" }).click();
    await expect(card.getByText("on loan")).toBeVisible();
  });

  test("the extension dialog only accepts dates inside the loan limit", async () => {
    await borrower.goto("/requests");

    await loanCard(borrower, toolName)
      .getByRole("button", { name: "Request more days" })
      .click();

    const endDate = borrower.getByLabel("New end date");
    const send = borrower.getByRole("button", { name: "Send request" });

    await expect(endDate).toHaveValue(isoDateFromToday(2));
    await expect(endDate).toHaveAttribute("min", isoDateFromToday(2));
    await expect(endDate).toHaveAttribute("max", isoDateFromToday(29));

    await endDate.fill(isoDateFromToday(1));
    await expect(send).toBeDisabled();
    await endDate.fill(isoDateFromToday(30));
    await expect(send).toBeDisabled();
    await endDate.fill(isoDateFromToday(29));
    await expect(send).toBeEnabled();

    await borrower.keyboard.press("Escape");
    await expect(borrower.getByRole("dialog")).toHaveCount(0);
  });

  test("the return dialog requires a note for problems and resets on cancel", async () => {
    await owner.goto("/incoming");

    await loanCard(owner, toolName)
      .getByRole("button", { name: "Confirm return" })
      .click();

    const note = owner.getByLabel(/What happened|Note \(optional\)/);
    const report = owner.getByRole("button", { name: "Report and close loan" });

    await owner.getByRole("radio", { name: /Damaged/ }).check();
    await expect(report).toBeDisabled();
    await note.fill("Bent");
    await expect(report).toBeDisabled();
    await note.fill("     ");
    await expect(report).toBeDisabled();
    await note.fill("Bent bit");
    await expect(report).toBeEnabled();

    await owner.getByRole("button", { name: "Cancel" }).click();

    await loanCard(owner, toolName)
      .getByRole("button", { name: "Confirm return" })
      .click();

    await expect(
      owner.getByRole("radio", { name: /As expected/ }),
    ).toBeChecked();

    await expect(note).toHaveValue("");

    await note.fill("All good, thanks!");
    await owner.getByRole("button", { name: "Confirm return" }).last().click();

    await expect(
      loanCard(owner, toolName).getByText("Returned", { exact: true }),
    ).toBeVisible();

    await expect(
      loanCard(owner, toolName).getByText("Return note: All good, thanks!"),
    ).toBeVisible();
  });

  test("the suspension dialog needs a real reason and forgets it on cancel", async ({
    browser,
  }) => {
    const admin = await openAs(browser, "admin");
    const row = neighborRow(admin, fullName("spare"));
    const reason = admin.getByLabel("Reason (kept in the audit log)");
    const suspend = admin.getByRole("button", { name: "Suspend user" });

    await admin.goto("/admin/neighbors");
    await reinstateIfSuspended(admin, fullName("spare"));
    await row.getByRole("button", { name: "Suspend" }).click();
    await expect(reason).toHaveAttribute("maxlength", "200");

    await reason.fill("      ");
    await expect(suspend).toBeDisabled();
    await reason.fill("Spam");
    await expect(suspend).toBeDisabled();
    await reason.fill("Spam!");
    await expect(suspend).toBeEnabled();

    await admin.getByRole("button", { name: "Cancel" }).click();
    await row.getByRole("button", { name: "Suspend" }).click();
    await expect(reason).toHaveValue("");
    await admin.keyboard.press("Escape");
    await expect(row.getByText("Suspended", { exact: true })).toHaveCount(0);
  });
});
