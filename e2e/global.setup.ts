import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { expect, test as setup } from "@playwright/test";
import { ensureTestUser } from "./support/clerkUsers";
import { removeLeftoverListings } from "./support/data";
import { authFile, TEST_ROLES, TEST_USERS } from "./support/testUsers";

setup.describe.configure({ mode: "serial" });

setup("configure Clerk testing tokens", async () => {
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
});

for (const role of TEST_ROLES) {
  setup(`sign in the ${role}`, async ({ page }) => {
    await ensureTestUser(role);
    await page.goto("/");
    await clerk.signIn({ page, emailAddress: TEST_USERS[role].email });
    await page.goto("/browse");

    await expect(
      page.getByRole("heading", {
        name: /Neighborhood Tools|Your account is suspended/,
      }),
    ).toBeVisible();

    if (role !== "spare") await removeLeftoverListings(page);

    await page.context().storageState({ path: authFile(role) });
  });
}
