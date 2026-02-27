import { expect, test } from "@playwright/test";

test.describe("Availability Management", () => {
  test.beforeEach(async ({ page }) => {
    // Register
    const timestamp = Date.now();
    const email = `availability-test-${timestamp}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/register");
    await page.fill('input[name="name"]', "Availability Test User");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await page.waitForURL(/\/login/);

    // Now login
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to availability page from dashboard", async ({
    page,
  }) => {
    // Click on availability link
    await page.click('a[href="/availability"]');

    // Verify we're on the availability page
    await expect(page).toHaveURL("/availability");
    await expect(page.locator("h1")).toContainText("Availability");
  });

  test("should show empty state when no availability is set", async ({
    page,
  }) => {
    await page.goto("/availability");

    // Check empty state message
    await expect(page.locator("text=No availability set yet")).toBeVisible();
  });

  test("should add new availability slot", async ({ page }) => {
    await page.goto("/availability");

    // Fill the form
    await page.selectOption('select[name="dayOfWeek"]', "1"); // Monday
    await page.fill('input[name="startTime"]', "09:00");
    await page.fill('input[name="endTime"]', "17:00");

    // Submit form
    await page.click('button[type="submit"]:has-text("Add Availability")');

    // Wait for redirect and page load
    await page.waitForURL("/availability");
    await page.waitForLoadState("networkidle");

    // Verify the availability was added
    await expect(page.getByText("09:00 - 17:00")).toBeVisible();
  });

  test("should add multiple availability slots", async ({ page }) => {
    await page.goto("/availability");

    // Add Monday
    await page.selectOption('select[name="dayOfWeek"]', "1");
    await page.fill('input[name="startTime"]', "09:00");
    await page.fill('input[name="endTime"]', "12:00");
    await page.click('button[type="submit"]:has-text("Add Availability")');
    await page.waitForURL("/availability");
    await page.waitForLoadState("networkidle");

    // Add Wednesday
    await page.selectOption('select[name="dayOfWeek"]', "3");
    await page.fill('input[name="startTime"]', "14:00");
    await page.fill('input[name="endTime"]', "18:00");
    await page.click('button[type="submit"]:has-text("Add Availability")');
    await page.waitForURL("/availability");
    await page.waitForLoadState("networkidle");

    // Verify both slots exist
    await expect(page.getByText("09:00 - 12:00")).toBeVisible();
    await expect(page.getByText("14:00 - 18:00")).toBeVisible();
  });

  test("should delete availability slot", async ({ page }) => {
    await page.goto("/availability");

    // Add a slot
    await page.selectOption('select[name="dayOfWeek"]', "2"); // Tuesday
    await page.fill('input[name="startTime"]', "10:00");
    await page.fill('input[name="endTime"]', "16:00");
    await page.click('button[type="submit"]:has-text("Add Availability")');
    await page.waitForURL("/availability");
    await page.waitForLoadState("networkidle");

    // Verify it was added
    await expect(page.getByText("10:00 - 16:00")).toBeVisible();

    // Delete it
    await page.click('button:has-text("Delete")');

    // Wait for redirect and load
    await page.waitForURL("/availability");
    await page.waitForLoadState("networkidle");

    // Verify empty state is back
    await expect(page.locator("text=No availability set yet")).toBeVisible();
  });

  test("should navigate back to dashboard", async ({ page }) => {
    await page.goto("/availability");

    // Click back button
    await page.click('a:has-text("Back to Dashboard")');

    // Verify we're on dashboard
    await expect(page).toHaveURL("/dashboard");
  });

  test("should require authentication to access availability page", async ({
    page,
    context,
  }) => {
    // Clear cookies to logout
    await context.clearCookies();

    // Try to access availability page
    await page.goto("/availability");

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });

  test("should validate time inputs are required", async ({ page }) => {
    await page.goto("/availability");

    // Try to submit without times
    await page.selectOption('select[name="dayOfWeek"]', "1");

    // Check that submit button is present but form validation prevents submission
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Add Availability")',
    );
    await expect(submitButton).toBeVisible();

    // The browser's built-in validation should prevent submission
    // We can verify the required attributes exist
    await expect(page.locator('input[name="startTime"]')).toHaveAttribute(
      "required",
      "",
    );
    await expect(page.locator('input[name="endTime"]')).toHaveAttribute(
      "required",
      "",
    );
  });

  test("should show all days of the week in dropdown", async ({ page }) => {
    await page.goto("/availability");

    const select = page.locator('select[name="dayOfWeek"]');

    // Verify all days are present by checking option count
    const options = await select.locator("option").all();
    expect(options.length).toBe(7);

    // Verify specific days exist
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const day of days) {
      const option = select.locator(`option:has-text("${day}")`);
      await expect(option).toHaveCount(1);
    }
  });

  test("should persist availability across sessions", async ({ page }) => {
    await page.goto("/availability");

    // Add availability
    await page.selectOption('select[name="dayOfWeek"]', "5"); // Friday
    await page.fill('input[name="startTime"]', "08:00");
    await page.fill('input[name="endTime"]', "12:00");
    await page.click('button[type="submit"]:has-text("Add Availability")');

    // Verify it's there
    await expect(page.getByText("08:00 - 12:00")).toBeVisible();

    // Reload page
    await page.reload();

    // Verify it's still there
    await expect(page.getByText("08:00 - 12:00")).toBeVisible();
  });
});
