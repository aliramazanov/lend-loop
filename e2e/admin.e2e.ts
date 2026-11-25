import { expect, test } from "@playwright/test";
import { isBanned } from "./support/clerkUsers";
import {
  createListing,
  removeListing,
  screenshot,
  toolLink,
  uniqueName,
} from "./support/data";
import { neighborRow, reinstateIfSuspended } from "./support/neighbors";
import { openAs } from "./support/session";
import { fullName } from "./support/testUsers";

const SPARE = fullName("spare");
const LENDER = fullName("lender");

const SECTIONS = [
  ["Neighbors", "Trusted lender"],
  ["Loans", "Last automation"],
  ["Removed listings", "Removed"],
  ["Audit log", "Details"],
  ["Automation", "n8n"],
] as const;

test("an admin opens every admin page", async ({ browser }) => {
  const admin = await openAs(browser, "admin");
  const adminNav = admin.getByRole("navigation", { name: "Admin sections" });

  await admin.goto("/browse");

  await admin
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Admin" })
    .click();

  await expect(admin.getByText("Failed automations")).toBeVisible();
  await expect(admin.getByText("Loans by status").first()).toBeVisible();
  await screenshot(admin, "admin-overview");

  for (const [section, expectedText] of SECTIONS) {
    await adminNav.getByRole("link", { name: section }).click();
    await expect(admin.getByText(expectedText).first()).toBeVisible();

    await screenshot(
      admin,
      `admin-${section.toLowerCase().replaceAll(" ", "-")}`,
    );
  }

  await adminNav.getByRole("link", { name: "Neighbors" }).click();

  await expect(
    neighborRow(admin, fullName("admin")).getByText("Admin").last(),
  ).toBeVisible();

  await expect(
    neighborRow(admin, fullName("admin")).getByRole("button", {
      name: "Suspend",
    }),
  ).toHaveCount(0);
});

test("a trusted lender label appears for every neighbor once granted", async ({
  browser,
}) => {
  const admin = await openAs(browser, "admin");
  const lender = await openAs(browser, "lender");

  const toggle = neighborRow(admin, LENDER).getByRole("button", {
    name: /trusted/i,
  });

  await admin.goto("/admin/neighbors");
  await expect(toggle).toBeVisible();

  if ((await toggle.textContent()) === `Trusted ${LENDER}`) {
    await toggle.click();
    await admin.getByRole("button", { name: "Remove badge" }).click();
  }

  await expect(toggle).toHaveText(`Mark trusted ${LENDER}`);
  await toggle.click();
  await admin.getByRole("button", { name: "Cancel" }).click();
  await expect(toggle).toHaveText(`Mark trusted ${LENDER}`);

  await toggle.click();
  await admin.getByRole("button", { name: "Mark as trusted" }).click();
  await expect(toggle).toHaveText(`Trusted ${LENDER}`);

  await lender.goto("/browse");

  await expect(
    lender.getByRole("banner").getByText("Trusted lender"),
  ).toBeVisible();

  await toggle.click();
  await admin.getByRole("button", { name: "Remove badge" }).click();
  await expect(toggle).toHaveText(`Mark trusted ${LENDER}`);
});

test("an admin suspends a neighbor, who is banned in Clerk, then reinstates them", async ({
  browser,
}) => {
  const admin = await openAs(browser, "admin");
  const spare = await openAs(browser, "spare");
  const row = neighborRow(admin, SPARE);

  await admin.goto("/admin/neighbors");
  await reinstateIfSuspended(admin, SPARE);

  await row.getByRole("button", { name: "Suspend" }).click();
  const confirm = admin.getByRole("button", { name: "Suspend user" });

  await expect(confirm).toBeDisabled();

  await admin
    .getByLabel("Reason (kept in the audit log)")
    .fill("End-to-end test of suspension");

  await screenshot(admin, "admin-suspend-dialog");
  await confirm.click();

  await expect(row.getByText("Suspended", { exact: true })).toBeVisible();
  await expect(row.getByText("Not while suspended")).toBeVisible();
  await expect.poll(() => isBanned("spare")).toBe(true);

  await spare.goto("/browse");

  await expect(
    spare.getByRole("heading", {
      name: /Your account is suspended|Your session has ended|Sign in to LendLoop/,
    }),
  ).toBeVisible();

  await screenshot(spare, "suspended-neighbor");

  await reinstateIfSuspended(admin, SPARE);
  await expect.poll(() => isBanned("spare")).toBe(false);

  await admin.goto("/admin/audit");
  const auditRows = admin.getByRole("row").filter({ hasText: SPARE });

  await expect(
    auditRows.filter({ hasText: "Suspended" }).first(),
  ).toBeVisible();
  await expect(
    auditRows.filter({ hasText: "Reinstated" }).first(),
  ).toBeVisible();
});

test("an admin removes another neighbor's listing and restores it", async ({
  browser,
}) => {
  const owner = await openAs(browser, "borrower");
  const admin = await openAs(browser, "admin");
  const toolName = uniqueName("Leaf Blower");
  const toolUrl = await createListing(owner, toolName);

  await admin.goto(toolUrl);

  await admin
    .getByRole("button", { name: `Remove listing ${toolName}` })
    .click();

  await admin.getByRole("button", { name: "Remove listing" }).click();
  await expect(admin).toHaveURL(/\/browse$/);

  await admin.goto("/admin/removed");
  await expect(admin.getByText(toolName)).toBeVisible();
  await admin.getByRole("button", { name: `Restore ${toolName}` }).click();
  await expect(admin.getByText(toolName)).toHaveCount(0);

  await owner.goto("/listings");
  await expect(toolLink(owner, toolName)).toBeVisible();
  await removeListing(owner, toolName);
});
