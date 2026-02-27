import { test, expect } from "@playwright/test";

test.describe("Event Types Management", () => {
  test("should create and manage event types", async ({ page }) => {
    const uniqueId = Date.now();
    const testEmail = `eventtype-${uniqueId}@test.com`;
    const testUsername = `eventuser${uniqueId}`;
    const testPassword = "TestPassword123!";

    // 1. Register new user
    await page.goto("/register");
    await page.getByRole("textbox", { name: "Name", exact: true }).fill("Event Type Test User");
    await page.getByRole("textbox", { name: "Email" }).fill(testEmail);
    await page.getByRole("textbox", { name: "Username" }).fill(testUsername);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Create Account" }).click({ force: true });
    
    await page.waitForURL(/\/login/, { timeout: 10000 });
    
    // 2. Login
    await page.getByLabel("Email").fill(testEmail);
    await page.getByLabel("Password").fill(testPassword);
    await page.getByRole("button", { name: "Sign In" }).click({ force: true });
    await page.waitForURL("/dashboard", { timeout: 10000 });
    
    // 3. Check empty state
    await page.goto("/dashboard/event-types");
    await expect(page.getByText("No event types yet")).toBeVisible();
    
    // 4. Create event type
    await page.getByRole("link", { name: /Create Event Type|New Event Type/ }).first().click();
    await page.waitForURL("/dashboard/event-types/new");
    
    await page.getByLabel("Title").fill("30 Minute Meeting");
    await page.getByLabel(/URL Slug/).fill("30min");
    await page.getByLabel("Description").fill("A quick 30-minute meeting");
    await page.getByLabel(/Duration/).fill("30");
    
    await page.getByRole("button", { name: "Create Event Type" }).click({ force: true });
    await page.waitForURL("/dashboard/event-types", { timeout: 10000 });
    
    // 5. Verify event type was created
    await expect(page.getByText("30 Minute Meeting")).toBeVisible();
    await expect(page.getByText("A quick 30-minute meeting")).toBeVisible();
    await expect(page.getByText("30 minutes")).toBeVisible();
    await expect(page.getByText("Active")).toBeVisible();
  });
});
