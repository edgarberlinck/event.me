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

test.describe("Event Type Constraints", () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async ({ page }) => {
    // Register a new user for each test
    testUser = generateTestUser();
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
  });

  test("should create event type with booking constraints", async ({
    page,
  }) => {
    const uniqueSlug = `limited-consultation-${Date.now()}`;

    // Navigate to create event type
    await page.goto("/dashboard/event-types/new");

    // Fill in basic details
    await page.fill('input[name="title"]', "Limited Consultation");
    await page.fill('input[name="slug"]', uniqueSlug);
    await page.fill(
      'textarea[name="description"]',
      "Consultation with booking limits",
    );
    await page.fill('input[name="duration"]', "60");

    // Fill in constraints
    await page.fill('input[name="maxBookingsPerWeek"]', "3");
    await page.fill('input[name="minimumNoticeHours"]', "48");
    await page.fill('input[name="maximumNoticeDays"]', "7");

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to event types list
    await page.waitForURL("/dashboard/event-types");

    // Verify event type appears in list with constraints badges
    await expect(page.locator("text=Limited Consultation")).toBeVisible();
    await expect(page.locator("text=Max 3/week")).toBeVisible();
    await expect(page.locator("text=48h notice")).toBeVisible();
    await expect(page.locator("text=7 days max")).toBeVisible();
  });

  test("should edit event type constraints", async ({ page }) => {
    const uniqueSlug = `test-event-constraints-${Date.now()}`;

    // First create an event type
    await page.goto("/dashboard/event-types/new");
    await page.fill('input[name="title"]', "Test Event");
    await page.fill('input[name="slug"]', uniqueSlug);
    await page.fill('input[name="duration"]', "30");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard/event-types");

    // Find and click edit button (look for the link with Edit icon)
    await page
      .locator(`a[href*="/dashboard/event-types/"][href$="/edit"]`)
      .first()
      .click();

    // Update constraints
    await page.fill('input[name="maxBookingsPerWeek"]', "5");
    await page.fill('input[name="minimumNoticeHours"]', "24");
    await page.fill('input[name="maximumNoticeDays"]', "14");

    // Save
    await page.click('button:has-text("Save Changes")');
    await page.waitForURL("/dashboard/event-types");

    // Verify changes
    await expect(page.locator("text=Max 5/week")).toBeVisible();
    // 24h is default so it won't show badge
    await expect(page.locator("text=14 days max")).toBeVisible();
  });

  test("should display unlimited when no max bookings set", async ({
    page,
  }) => {
    const uniqueSlug = `unlimited-event-${Date.now()}`;

    await page.goto("/dashboard/event-types/new");
    await page.fill('input[name="title"]', "Unlimited Event");
    await page.fill('input[name="slug"]', uniqueSlug);
    await page.fill('input[name="duration"]', "30");
    // Don't fill maxBookingsPerWeek
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard/event-types");

    // Verify no "Max X/week" badge is shown
    const eventCard = page.locator("text=Unlimited Event").locator("..");
    await expect(eventCard.locator("text=/Max \\d+\\/week/")).not.toBeVisible();
  });

  test("should show constraints in edit form", async ({ page }) => {
    const uniqueSlug = `constrained-event-form-${Date.now()}`;

    // Create event with constraints
    await page.goto("/dashboard/event-types/new");
    await page.fill('input[name="title"]', "Constrained Event");
    await page.fill('input[name="slug"]', uniqueSlug);
    await page.fill('input[name="duration"]', "45");
    await page.fill('input[name="maxBookingsPerWeek"]', "2");
    await page.fill('input[name="minimumNoticeHours"]', "72");
    await page.fill('input[name="maximumNoticeDays"]', "10");
    await page.click('button[type="submit"]');
    await page.waitForURL("/dashboard/event-types");

    // Navigate to edit (find the first edit link on the page)
    await page
      .locator(`a[href*="/dashboard/event-types/"][href$="/edit"]`)
      .first()
      .click();

    // Verify form shows current values
    await expect(page.locator('input[name="maxBookingsPerWeek"]')).toHaveValue(
      "2",
    );
    await expect(page.locator('input[name="minimumNoticeHours"]')).toHaveValue(
      "72",
    );
    await expect(page.locator('input[name="maximumNoticeDays"]')).toHaveValue(
      "10",
    );
  });
});
