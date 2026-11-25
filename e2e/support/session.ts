import { setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Browser, BrowserContextOptions, Page } from "@playwright/test";
import { authFile, type TestRole } from "./testUsers";

export async function openAs(
  browser: Browser,
  role: TestRole,
  options: BrowserContextOptions = {},
): Promise<Page> {
  const context = await browser.newContext({
    ...options,
    storageState: authFile(role),
  });

  const page = await context.newPage();

  await setupClerkTestingToken({ page });

  return page;
}
