import { test, expect } from "@playwright/test";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma.server";

test.describe("Public Booking Flow", () => {
  const uniqueId = Date.now();
  const testUsername = `bookuser${uniqueId}`;
  let testUserId: string;
  let testEventTypeSlug: string;

  test.beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("TestPassword123!", 10);
    
    const user = await prisma.user.create({
      data: {
        name: "Booking Test User",
        email: `booking-${uniqueId}@test.com`,
        username: testUsername,
        password: hashedPassword,
      },
    });
    testUserId = user.id;

    await prisma.availability.createMany({
      data: [
        {
          userId: testUserId,
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "17:00",
        },
        {
          userId: testUserId,
          dayOfWeek: 2,
          startTime: "09:00",
          endTime: "17:00",
        },
      ],
    });

    const eventType = await prisma.eventType.create({
      data: {
        userId: testUserId,
        title: "Test Meeting",
        slug: `test-meeting-${uniqueId}`,
        description: "A test meeting for E2E tests",
        duration: 30,
        active: true,
      },
    });
    testEventTypeSlug = eventType.slug;
  });

  test.afterAll(async () => {
    await prisma.booking.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.eventType.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.availability.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  test("should display public booking page", async ({ page }) => {
    await page.goto(`/${testUsername}/${testEventTypeSlug}`);
    
    await expect(page.getByText("Booking Test User")).toBeVisible();
    await expect(page.getByText("Test Meeting")).toBeVisible();
    await expect(page.getByText("30 minutes")).toBeVisible();
    await expect(page.getByText("A test meeting for E2E tests")).toBeVisible();
  });

  test("should show availability on booking page", async ({ page }) => {
    await page.goto(`/${testUsername}/${testEventTypeSlug}`);
    
    await expect(page.getByText("Available Hours:")).toBeVisible();
    await expect(page.getByText("Monday:")).toBeVisible();
    await expect(page.getByText("09:00 - 17:00")).toBeVisible();
  });

  test("should show booking form with date and time params", async ({ page }) => {
    await page.goto(`/${testUsername}/${testEventTypeSlug}?date=2024-03-20&time=10:00`);
    
    await expect(page.getByText("Book Test Meeting")).toBeVisible();
    await expect(page.getByLabel("Your Name *")).toBeVisible();
    await expect(page.getByLabel("Your Email *")).toBeVisible();
    await expect(page.getByLabel("Additional Notes")).toBeVisible();
  });

  test("should create a booking", async ({ page }) => {
    await page.goto(`/${testUsername}/${testEventTypeSlug}?date=2024-03-20&time=14:00`);
    
    await page.fill('input[name="guestName"]', "John Doe");
    await page.fill('input[name="guestEmail"]', "john@example.com");
    await page.fill('textarea[name="guestNotes"]', "Looking forward to our meeting");
    
    await page.click('button[type="submit"]');
    
    await page.waitForURL("/booking/success");
    
    await expect(page.getByText("Booking Confirmed!")).toBeVisible();
    await expect(page.getByText("Your meeting has been successfully scheduled")).toBeVisible();
  });

  test("should return 404 for non-existent username", async ({ page }) => {
    const response = await page.goto("/nonexistentuser/meeting");
    expect(response?.status()).toBe(404);
  });

  test("should return 404 for non-existent event type", async ({ page }) => {
    const response = await page.goto(`/${testUsername}/nonexistent-event`);
    expect(response?.status()).toBe(404);
  });
});
