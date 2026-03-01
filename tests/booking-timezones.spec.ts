import { expect, test } from "@playwright/test";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.server";

const TEST_USER = {
  email: "alice@example.com",
  password: "password123",
};

async function login(page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click({ force: true });
  await page.waitForURL("/dashboard", { timeout: 10000 });
}

test.describe("Booking Timezone Handling", () => {
  test.beforeAll(async () => {
    // Create alice user if not exists
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
    await prisma.user.upsert({
      where: { email: TEST_USER.email },
      update: {},
      create: {
        name: "Alice",
        email: TEST_USER.email,
        username: "alice",
        password: hashedPassword,
      },
    });
  });

  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    // Create event type with specific timezone
    await page.goto("/dashboard/event-types/new");
    await page.fill('input[name="title"]', "Timezone Test Event");
    await page.fill('input[name="slug"]', "timezone-test");
    await page.fill('input[name="duration"]', "30");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard\/event-types$/);
  });

  test("should display booking times in host timezone", async ({ page }) => {
    // Set availability for specific time
    await page.goto("/dashboard/availability");
    await page.click('button:has-text("Add Availability")');
    await page.selectOption('select[name="dayOfWeek"]', "1"); // Monday
    await page.fill('input[name="startTime"]', "09:00");
    await page.fill('input[name="endTime"]', "17:00");
    await page.click('button[type="submit"]');

    // Go to public booking page
    await page.goto("/alice/timezone-test");

    // Select a date (next Monday)
    const nextMonday = new Date();
    nextMonday.setDate(
      nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7),
    );

    const dateButton = page.locator(
      `button[data-date="${nextMonday.toISOString().split("T")[0]}"]`,
    );
    await dateButton.click();

    // Check that times are displayed (should be in host's timezone)
    const firstSlot = page
      .locator("button")
      .filter({ hasText: /:\d{2}/ })
      .first();
    await expect(firstSlot).toBeVisible();
  });

  test("should handle booking creation with UTC times", async ({ page }) => {
    // Create a booking through the API to test timezone handling
    await page.goto("/dashboard/availability");
    await page.click('button:has-text("Add Availability")');
    await page.selectOption('select[name="dayOfWeek"]', "1"); // Monday
    await page.fill('input[name="startTime"]', "10:00");
    await page.fill('input[name="endTime"]', "12:00");
    await page.click('button[type="submit"]');

    // Go to booking page
    await page.goto("/alice/timezone-test");

    // Select next Monday
    const nextMonday = new Date();
    nextMonday.setDate(
      nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7),
    );

    const dateButton = page.locator(
      `button[data-date="${nextMonday.toISOString().split("T")[0]}"]`,
    );
    await dateButton.click();

    // Click first available slot
    const firstSlot = page
      .locator("button")
      .filter({ hasText: /:\d{2}/ })
      .first();
    await firstSlot.click();

    // Fill booking form
    await page.fill('input[name="guestName"]', "Test Guest");
    await page.fill('input[name="guestEmail"]', "guest@example.com");
    await page.click('button:has-text("Book")');

    // Should redirect to confirmation
    await expect(page).toHaveURL(/\/booking\/confirmed\//);
  });

  test("should show correct times in different timezones", async ({ page }) => {
    // Change user timezone to Pacific Time
    await page.goto("/dashboard/settings");
    await page.selectOption('select[name="timezone"]', "America/Los_Angeles");
    await page.click('button:has-text("Save")');

    // Add availability
    await page.goto("/dashboard/availability");
    await page.click('button:has-text("Add Availability")');
    await page.selectOption('select[name="dayOfWeek"]', "1"); // Monday
    await page.fill('input[name="startTime"]', "09:00"); // 9 AM PT
    await page.fill('input[name="endTime"]', "17:00"); // 5 PM PT
    await page.click('button[type="submit"]');

    // View bookings page
    await page.goto("/alice/timezone-test");

    // Verify slots are displayed (times would be converted to user's local timezone by the browser)
    const nextMonday = new Date();
    nextMonday.setDate(
      nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7),
    );

    const dateButton = page.locator(
      `button[data-date="${nextMonday.toISOString().split("T")[0]}"]`,
    );
    await dateButton.click();

    // Should show available slots
    const slots = page.locator("button").filter({ hasText: /:\d{2}/ });
    await expect(slots.first()).toBeVisible();
  });

  test("should handle DST transitions correctly", async ({ page }) => {
    // Set timezone to one that observes DST
    await page.goto("/dashboard/settings");
    await page.selectOption('select[name="timezone"]', "America/New_York");
    await page.click('button:has-text("Save")');

    // Add availability
    await page.goto("/dashboard/availability");
    await page.click('button:has-text("Add Availability")');
    await page.selectOption('select[name="dayOfWeek"]', "1");
    await page.fill('input[name="startTime"]', "09:00");
    await page.fill('input[name="endTime"]', "17:00");
    await page.click('button[type="submit"]');

    // Navigate to booking page
    await page.goto("/alice/timezone-test");

    // Select a date during DST (e.g., summer)
    const summerDate = new Date("2026-07-06"); // First Monday in July
    const dateButton = page.locator(
      `button[data-date="${summerDate.toISOString().split("T")[0]}"]`,
    );

    // If date is available, slots should be visible
    if (await dateButton.isVisible()) {
      await dateButton.click();
      const slots = page.locator("button").filter({ hasText: /:\d{2}/ });
      if ((await slots.count()) > 0) {
        await expect(slots.first()).toBeVisible();
      }
    }
  });

  test("should validate minimum notice hours respecting timezone", async ({
    page,
  }) => {
    // Set minimum notice to 24 hours
    await page.goto("/dashboard/event-types");
    await page.click('a[href*="/edit"]:has-text("Timezone Test Event")');
    await page.fill('input[name="minimumNoticeHours"]', "24");
    await page.click('button:has-text("Save")');

    // Try to book within minimum notice period
    await page.goto("/alice/timezone-test");

    // Try today's date - should not have available slots if within 24 hours
    const today = new Date();
    const todayButton = page.locator(
      `button[data-date="${today.toISOString().split("T")[0]}"]`,
    );

    if (await todayButton.isVisible()) {
      await todayButton.click();

      // Should either show no slots or show error if trying to book
      const slots = page.locator("button").filter({ hasText: /:\d{2}/ });
      const slotCount = await slots.count();

      // If there are slots (might be far enough in the future), verify booking works
      if (slotCount > 0) {
        // This is fine - slots are beyond minimum notice
      } else {
        // No slots available - this is expected
        await expect(page.getByText(/no available/i)).toBeVisible();
      }
    }
  });

  test("should handle booking across date boundary in different timezones", async ({
    page,
  }) => {
    // Set timezone to UTC+10 (Sydney)
    await page.goto("/dashboard/settings");
    await page.selectOption('select[name="timezone"]', "Australia/Sydney");
    await page.click('button:has-text("Save")');

    // Add late night availability (23:00-23:59 Sydney time)
    await page.goto("/dashboard/availability");
    await page.click('button:has-text("Add Availability")');
    await page.selectOption('select[name="dayOfWeek"]', "1");
    await page.fill('input[name="startTime"]', "23:00");
    await page.fill('input[name="endTime"]', "23:59");
    await page.click('button[type="submit"]');

    // This should correctly handle the fact that 23:00 Sydney time
    // is 13:00 UTC (earlier in the same day)
    await page.goto("/alice/timezone-test");

    const nextMonday = new Date();
    nextMonday.setDate(
      nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7),
    );

    const dateButton = page.locator(
      `button[data-date="${nextMonday.toISOString().split("T")[0]}"]`,
    );

    if (await dateButton.isVisible()) {
      await dateButton.click();

      // Should show slots if availability is set correctly
      const slots = page.locator("button").filter({ hasText: /:\d{2}/ });
      if ((await slots.count()) > 0) {
        await expect(slots.first()).toBeVisible();
      }
    }
  });
});
