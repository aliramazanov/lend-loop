import { expect, test, type Locator } from "@playwright/test";
import {
  removeListing,
  startListing,
  toolLink,
  uniqueName,
} from "./support/data";
import { openAs } from "./support/session";

const ZERO_WIDTH_SPACE = String.fromCodePoint(0x200b);
const HOT_BEVERAGE = String.fromCodePoint(0x2615);
const VALID_DESCRIPTION = "Clean, sharp and ready to use.";

async function validity(field: Locator) {
  return await field.evaluate((element: HTMLInputElement) => ({
    valueMissing: element.validity.valueMissing,
    tooShort: element.validity.tooShort,
    valid: element.validity.valid,
  }));
}

test("the tool form enforces required fields and lengths in the browser", async ({
  browser,
}) => {
  const page = await openAs(browser, "lender");
  const name = page.getByLabel("Tool name");
  const description = page.getByLabel("Short description");

  await page.goto("/listings/new");
  await page.getByRole("button", { name: "Publish listing" }).click();
  await expect(page).toHaveURL(/\/listings\/new$/);
  expect(await validity(name)).toMatchObject({ valueMissing: true });

  await name.fill("A");
  await description.fill("Tiny");
  expect(await validity(name)).toMatchObject({ tooShort: true });
  expect(await validity(description)).toMatchObject({ tooShort: true });
  await expect(page.getByText("4/280")).toBeVisible();

  await expect(name).toHaveAttribute("maxlength", "80");
  await expect(description).toHaveAttribute("maxlength", "280");
  await name.fill("");
  await name.pressSequentially("x".repeat(85));
  await expect(name).toHaveValue("x".repeat(80));

  await name.fill("Drill");
  await description.fill(VALID_DESCRIPTION);
  expect(await validity(name)).toMatchObject({ valid: true });
  expect(await validity(description)).toMatchObject({ valid: true });
});

test("the server rejects input the browser cannot catch", async ({
  browser,
}) => {
  const page = await openAs(browser, "lender");
  const notifications = page.getByRole("region", { name: /Notifications/ });
  const name = page.getByLabel("Tool name");
  const publish = page.getByRole("button", { name: "Publish listing" });

  await page.goto("/listings/new");
  await page.getByLabel("Short description").fill(VALID_DESCRIPTION);

  await name.fill("   ");
  await publish.click();

  await expect(
    notifications.getByText("Tool name must be between 2 and 80 characters."),
  ).toBeVisible();

  await expect(page).toHaveURL(/\/listings\/new$/);

  await name.fill(`Saw${ZERO_WIDTH_SPACE}blade`);
  await publish.click();

  await expect(
    notifications.getByText("Tool name contains hidden or control characters."),
  ).toBeVisible();

  await expect(page).toHaveURL(/\/listings\/new$/);
});

test("markup in a listing is shown as text and never runs", async ({
  browser,
}) => {
  const page = await openAs(browser, "lender");

  const toolName = uniqueName(
    `<img src=x onerror=alert(1)> Kettle ${HOT_BEVERAGE}`,
  );

  const dialogs: string[] = [];

  page.on("dialog", async (dialog) => {
    dialogs.push(dialog.message());
    await dialog.dismiss();
  });

  await startListing(page, toolName, "<script>alert(2)</script>\nSecond line");

  await page.getByRole("button", { name: "Publish listing" }).click();
  await expect(toolLink(page, toolName)).toBeVisible();

  await toolLink(page, toolName).click();

  await expect(
    page.getByRole("heading", { level: 1, name: toolName }),
  ).toBeVisible();

  await expect(page.getByText("<script>alert(2)</script>")).toBeVisible();
  await expect(page.locator("img[src='x']")).toHaveCount(0);
  expect(dialogs).toEqual([]);

  await removeListing(page, toolName);
});

test("the edit form opens with the saved values", async ({ browser }) => {
  const page = await openAs(browser, "lender");
  const toolName = uniqueName("Hedge Shears");

  await startListing(page, toolName, VALID_DESCRIPTION);
  await page.getByLabel("Category").click();
  await page.getByRole("option", { name: "Garden" }).click();
  await page.getByLabel("Condition").click();
  await page.getByRole("option", { name: "Fair" }).click();
  await page.getByRole("button", { name: "Publish listing" }).click();

  await page.getByRole("link", { name: `Edit ${toolName}` }).click();
  await expect(page.getByRole("heading", { name: "Edit tool" })).toBeVisible();
  await expect(page.getByLabel("Tool name")).toHaveValue(toolName);

  await expect(page.getByLabel("Short description")).toHaveValue(
    VALID_DESCRIPTION,
  );

  await expect(page.getByLabel("Category")).toHaveText("Garden");
  await expect(page.getByLabel("Condition")).toHaveText("Fair");
  await expect(page.getByText(`${VALID_DESCRIPTION.length}/280`)).toBeVisible();

  await removeListing(page, toolName);
});
