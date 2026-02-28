import { expect, test } from "@playwright/test";

test.describe("Username and Public Booking Page", () => {
  test.beforeEach(async ({ page }) => {
    // Clean up test user if exists
    await page.goto("/");
  });

  test("should configure username and view public booking page", async ({
    page,
  }) => {
    const testUsername = `testuser${Date.now()}`;
    const testEmail = `${testUsername}@example.com`;

    // Register a new user
    await page.goto("/register");
    await page.fill("input#name", "Test User");
    await page.fill("input#email", testEmail);
    await page.fill("input#username", testUsername);
    await page.fill("input#password", "Password123!");
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Visit public booking page
    await page.goto(`/book/${testUsername}`);

    // Verify public page shows user name
    await expect(page.locator("h1")).toContainText("Test User");

    // Should show message about no event types (user hasn't created any yet)
    await expect(page.locator("text=No available event types")).toBeVisible();
  });

  test("should show error for duplicate username", async ({ page }) => {
    const testUsername = `duplicate${Date.now()}`;
    const testEmail1 = `user1-${testUsername}@example.com`;
    const testEmail2 = `user2-${testUsername}@example.com`;

    // Register first user with username
    await page.goto("/register");
    await page.fill("input#name", "User One");
    await page.fill("input#email", testEmail1);
    await page.fill("input#username", testUsername);
    await page.fill("input#password", "Password123!");
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Try to register second user with same username
    await page.goto("/register");
    await page.fill("input#name", "User Two");
    await page.fill("input#email", testEmail2);
    await page.fill("input#username", testUsername);
    await page.fill("input#password", "Password123!");
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should show username error
    await expect(page).toHaveURL(/\/register\?error=username/, {
      timeout: 10000,
    });
  });

  test("should show 404 for non-existent username", async ({ page }) => {
    await page.goto("/book/nonexistentuser999");

    // Next.js 404 page
    await expect(page.locator("text=404")).toBeVisible();
  });

  test("should copy booking link to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions for chromium only
    await context
      .grantPermissions(["clipboard-read", "clipboard-write"])
      .catch(() => {
        // Ignore for browsers that don't support these permissions
      });

    const testUsername = `cliptest${Date.now()}`;
    const testEmail = `${testUsername}@example.com`;

    // Register with username
    await page.goto("/register");
    await page.fill("input#name", "Clip Test");
    await page.fill("input#email", testEmail);
    await page.fill("input#username", testUsername);
    await page.fill("input#password", "Password123!");
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Login
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard");

    // Go to settings
    await page.goto("/dashboard/settings");

    // Click copy button in the booking link card
    const copyButton = page.locator('button:has-text("Copy")').first();
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Verify copied text shows
    await expect(
      page.locator('button:has-text("Copied")').first(),
    ).toBeVisible();
  });

  test("should update username from settings", async ({ page }) => {
    const initialUsername = `initial${Date.now()}`;
    const newUsername = `updated${Date.now()}`;
    const testEmail = `${initialUsername}@example.com`;

    // Register with initial username
    await page.goto("/register");
    await page.fill("input#name", "Username Update Test");
    await page.fill("input#email", testEmail);
    await page.fill("input#username", initialUsername);
    await page.fill("input#password", "Password123!");
    await page.getByRole("button", { name: "Create Account" }).click();
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Login
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill("Password123!");
    await page.getByRole("button", { name: "Sign In" }).click();
    await page.waitForURL("/dashboard");

    // Go to settings and update username
    await page.goto("/dashboard/settings");

    // Update username
    await page.fill('input[name="username"]', newUsername);
    await page.click('button[type="submit"]:has-text("Save Changes")');

    // Wait for success toast
    await expect(
      page.locator("text=Settings updated successfully"),
    ).toBeVisible({ timeout: 10000 });

    // Wait a bit for the page to update
    await page.waitForTimeout(1000);

    // Verify new public page works
    await page.goto(`/book/${newUsername}`);
    await expect(page.locator("h1")).toContainText("Username Update Test");

    // Verify old username gives 404
    await page.goto(`/book/${initialUsername}`);
    await expect(page.locator("text=404")).toBeVisible();
  });
});
