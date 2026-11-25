import { expect, type Page } from "@playwright/test";

export function neighborRow(admin: Page, name: string) {
  return admin.getByRole("row").filter({ hasText: name });
}

export async function reinstateIfSuspended(admin: Page, name: string) {
  await expect(
    neighborRow(admin, name).getByRole("button", { name: /Suspend|Reinstate/ }),
  ).toBeVisible();

  const reinstate = neighborRow(admin, name).getByRole("button", {
    name: "Reinstate",
  });

  if ((await reinstate.count()) === 0) return;

  await reinstate.click();
  await admin.getByRole("button", { name: "Reinstate" }).last().click();
  await expect(reinstate).toHaveCount(0);
}
export async function suspendNeighbor(
  admin: Page,
  name: string,
  reason: string,
) {
  const row = neighborRow(admin, name);

  await row.getByRole("button", { name: "Suspend" }).click();
  await admin.getByLabel("Reason (kept in the audit log)").fill(reason);
  await admin.getByRole("button", { name: "Suspend user" }).click();
  await expect(row.getByText("Suspended", { exact: true })).toBeVisible();
}
