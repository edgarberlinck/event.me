import { expect, test } from "@playwright/test";

function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    name: "Test User",
    email: `test-${timestamp}-${random}@example.com`,
    username: `testuser${timestamp}${random}`,
    password: "Test123456!",
  };
}

test.describe("Event Types Management", () => {
  test("should create and view event type", async ({ page }) => {
    const testUser = generateTestUser();
    const uniqueSlug = `30min-${Date.now()}`;

    // Register
    await page.goto("/register");
    await page
      .getByRole("textbox", { name: "Name", exact: true })
      .fill(testUser.name);
    await page.getByRole("textbox", { name: "Email" }).fill(testUser.email);
    await page
      .getByRole("textbox", { name: "Username" })
      .fill(testUser.username);
    await page.getByLabel("Password").fill(testUser.password);
    await page
      .getByRole("button", { name: "Create Account" })
      .click({ force: true });

    await page.waitForTimeout(2000);

    // Login
    await page.goto("/login");
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: "Sign In" }).click({ force: true });

    await page.waitForTimeout(2000);

    // Go to event types (will redirect if not logged in)
    await page.goto("/dashboard/event-types");
    await expect(page.locator("h1")).toContainText("Event Types");

    // Create event type
    await page.goto("/dashboard/event-types/new");
    await expect(page.locator("h1")).toContainText("Create Event Type");

    await page.fill("#title", "30 Minute Meeting");
    await page.fill("#slug", uniqueSlug);
    await page.fill("#description", "A quick 30-minute meeting");
    await page.fill("#duration", "30");

    // Click submit
    await page.getByRole("button", { name: "Create Event Type" }).click();

    // Wait for redirect - the server action should redirect us
    await page.waitForURL("/dashboard/event-types");

    // Wait a bit for the page to fully load
    await page.waitForLoadState("domcontentloaded");

    // Verify event type was created
    await expect(page.getByText("30 Minute Meeting")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("30 minutes")).toBeVisible();
  });
});
