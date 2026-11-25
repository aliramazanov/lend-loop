import { expect, test, type Page } from "@playwright/test";
import {
  createListing,
  loanCard,
  requestDays,
  screenshot,
  uniqueName,
} from "./support/data";
import { reinstateIfSuspended, suspendNeighbor } from "./support/neighbors";
import { openAs } from "./support/session";
import { fullName } from "./support/testUsers";

const OWNER = fullName("spare");

async function setOwnerSuspended(admin: Page, suspended: boolean) {
  await admin.goto("/admin/neighbors");
  await reinstateIfSuspended(admin, OWNER);

  if (suspended) {
    await suspendNeighbor(admin, OWNER, "Testing an unfinished loan");
  }
}

test("an admin confirms the return when the owner is suspended mid-loan", async ({
  browser,
}) => {
  const admin = await openAs(browser, "admin");

  await setOwnerSuspended(admin, false);

  const owner = await openAs(browser, "spare");
  const borrower = await openAs(browser, "borrower");
  const toolName = uniqueName("Extension Ladder");
  const toolUrl = await createListing(owner, toolName);

  await requestDays(borrower, toolUrl, { from: 0, to: 1 });
  await owner.goto("/incoming");

  const incoming = loanCard(owner, toolName);

  await incoming.getByRole("button", { name: "Approve" }).click();
  await incoming.getByRole("button", { name: "Confirm handover" }).click();
  await expect(incoming.getByText("on loan")).toBeVisible();

  await setOwnerSuspended(admin, true);
  await admin.goto("/admin/loans");

  const row = admin.getByRole("row").filter({ hasText: toolName });

  await expect(row.getByText("Owner unavailable")).toBeVisible();
  await row.getByRole("button", { name: "Confirm return" }).click();
  await expect(admin.getByText(/confirming it for them/)).toBeVisible();
  await screenshot(admin, "admin-confirm-return");
  await admin.getByRole("button", { name: "Confirm return" }).last().click();

  await expect(row.getByText("Returned", { exact: true })).toBeVisible();

  await expect(row.getByRole("button", { name: "Confirm return" })).toHaveCount(
    0,
  );

  await borrower.goto("/requests");

  await expect(
    loanCard(borrower, toolName).getByText("Returned", { exact: true }),
  ).toBeVisible();

  await setOwnerSuspended(admin, false);
});
