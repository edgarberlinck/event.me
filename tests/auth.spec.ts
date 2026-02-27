import { expect, test } from "@playwright/test";

// Generate unique test data for each test run
function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    name: "Test User",
    email: `test-${timestamp}-${random}@example.com`,
    password: "Test123456!",
  };
}

test.describe("Authentication Flow", () => {
  test("should display landing page", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("Simple Scheduling");
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
    await expect(
      page.getByRole("navigation").getByRole("button", { name: "Sign In" }),
    ).toBeVisible();
  });

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Get Started" }).click();

    await expect(page).toHaveURL("/register");
    // CardTitle is a div, not a heading - use text locator
    await expect(
      page.locator('[data-slot="card-title"]', { hasText: "Create Account" }),
    ).toBeVisible();
  });

  test("should register a new user and redirect to login", async ({ page }) => {
    const user = generateTestUser();

    await page.goto("/register");

    // Fill registration form
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Username").fill(`user${Date.now()}`);
    await page.getByLabel("Password").fill(user.password);

    // Submit form
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test("should not allow duplicate email registration", async ({ page }) => {
    const user = generateTestUser();
    const username = `user${Date.now()}`;

    // Register first time
    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Username").fill(username);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait for redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Try to register again with same email
    await page.goto("/register");
    await page.getByLabel("Name").fill("Another User");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Username").fill(`other${Date.now()}`);
    await page.getByLabel("Password").fill("AnotherPass123");
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should stay on register page with error in URL
    await expect(page).toHaveURL(/\/register\?error=exists/, {
      timeout: 10000,
    });
  });

  test("should login with valid credentials", async ({ page }) => {
    const user = generateTestUser();

    // First register
    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    // Wait for redirect
    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Now login
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText(user.email)).toBeVisible();
  });

  test("should not login with invalid password", async ({ page }) => {
    const user = generateTestUser();

    // First register
    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    await page.waitForURL(/\/login/, { timeout: 10000 });

    // Try to login with wrong password
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should stay on login page with error
    await expect(page).toHaveURL(/\/login\?error=invalid/, { timeout: 10000 });
  });

  test("should not login with non-existent email", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("anypassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should stay on login page with error
    await expect(page).toHaveURL(/\/login\?error=invalid/, { timeout: 10000 });
  });

  test("should logout successfully", async ({ page }) => {
    const user = generateTestUser();

    // Register and login
    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    await page.waitForURL(/\/login/, { timeout: 10000 });

    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Find and click logout button (it's a form with a button)
    await page
      .locator('form:has(button[type="submit"]:has(svg))')
      .getByRole("button")
      .click();

    // Should redirect to home
    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("should protect dashboard route when not logged in", async ({
    page,
  }) => {
    // Try to access dashboard without login
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 10000 });
  });

  test("should redirect logged-in users from login page to dashboard", async ({
    page,
  }) => {
    const user = generateTestUser();

    // Register and login
    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    await page.waitForURL(/\/login/, { timeout: 10000 });

    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });

    // Try to go to login again
    await page.goto("/login");

    // Should redirect back to dashboard
    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });
});
