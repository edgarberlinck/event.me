import { test, expect } from "@playwright/test";

function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    name: "Test User",
    email: `test-${timestamp}-${random}@example.com`,
    username: `testuser${timestamp}${random}`,
    password: "Test123456!",
    slug: `test-${timestamp}-${random}`,
  };
}

test.describe("Booking Flow", () => {
  test("should display booking page for event type", async ({ page, context }) => {
    const testUser = generateTestUser();

    // 1. Register
    await page.goto("/register");
    await page.getByRole("textbox", { name: "Name", exact: true }).fill(testUser.name);
    await page.getByRole("textbox", { name: "Email" }).fill(testUser.email);
    await page.getByRole("textbox", { name: "Username" }).fill(testUser.username);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: "Create Account" }).click({ force: true });

    await page.waitForTimeout(2000);

    // 2. Login
    await page.goto("/login");
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByRole("button", { name: "Sign In" }).click({ force: true });

    await page.waitForTimeout(2000);

    // 3. Create event type
    await page.goto("/dashboard/event-types/new");
    
    await page.fill("#title", "Test Consultation");
    await page.fill("#slug", testUser.slug);
    await page.fill("#description", "A test consultation meeting");
    await page.fill("#duration", "30");

    await page.getByRole("button", { name: "Create Event Type" }).click();
    
    await page.waitForTimeout(2000);

    // 4. Open booking page in new context (incognito-like)
    const bookingPage = await context.newPage();
    await bookingPage.goto(`/${testUser.username}/${testUser.slug}`);
    
    // 5. Verify booking page content
    await expect(bookingPage.getByText("Test Consultation").first()).toBeVisible();
    await expect(bookingPage.getByText("30 minutes")).toBeVisible();

    await bookingPage.close();
  });
});