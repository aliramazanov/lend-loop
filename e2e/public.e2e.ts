import { expect, test } from "@playwright/test";
import { screenshot } from "./support/data";

test.describe("signed-out visitor", () => {
  test("sees the public board with names and categories only", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Borrow what you need. Lend what you don't.",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Sign in to lend or borrow" }),
    ).toHaveCount(2);

    await expect(
      page.getByText("Owner details hidden until sign-in"),
    ).toBeVisible();

    await expect(page.getByText("Maya Chen")).toHaveCount(0);
    await screenshot(page, "public-board");
  });

  test("opens the Clerk sign-in modal from the call to action", async ({
    page,
  }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: "Sign in to lend or borrow" })
      .first()
      .click();

    const signIn = page.getByRole("dialog");

    await expect(
      signIn.getByRole("heading", { name: "Continue to LendLoop" }),
    ).toBeVisible();

    await expect(signIn.getByLabel(/Email address/i)).toBeVisible();
    await screenshot(page, "public-sign-in-modal");
  });

  test("is sent to sign in when opening the signed-in area", async ({
    page,
  }) => {
    for (const path of ["/browse", "/listings", "/admin", "/tools/abc"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/sign-in/);
    }
  });

  test("gets a not-found page with a way back", async ({ page }) => {
    await page.goto("/no-such-page");

    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Back to all tools" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
