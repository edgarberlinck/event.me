import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123456';
  const testName = 'Test User';

  test('should display landing page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Simple Scheduling');
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: 'Get Started' }).click();
    
    await expect(page).toHaveURL('/register');
    await expect(page.getByText('Create Account')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    await page.getByLabel('Name').fill(testName);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Should redirect to login with success message
    await expect(page).toHaveURL(/\/login/);
    
    // Wait for toast (it appears after page load)
    await page.waitForTimeout(500);
  });

  test('should not allow duplicate email registration', async ({ page }) => {
    // Register first user
    await page.goto('/register');
    await page.getByLabel('Name').fill(testName);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Try to register again with same email
    await page.goto('/register');
    await page.getByLabel('Name').fill('Another User');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill('AnotherPass123');
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Should stay on register page with error
    await expect(page).toHaveURL(/\/register\?error=exists/);
    
    // Wait for toast
    await page.waitForTimeout(500);
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    await page.goto('/register');
    await page.getByLabel('Name').fill(testName);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Now login
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText(testEmail)).toBeVisible();
  });

  test('should not login with invalid password', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should stay on login page with error
    await expect(page).toHaveURL(/\/login\?error=invalid/);
    
    // Wait for toast
    await page.waitForTimeout(500);
  });

  test('should not login with non-existent email', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('nonexistent@example.com');
    await page.getByLabel('Password').fill('anypassword');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should stay on login page with error
    await expect(page).toHaveURL(/\/login\?error=invalid/);
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/register');
    await page.getByLabel('Name').fill(testName);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Click logout button
    await page.getByRole('button', { name: '' }).click(); // Logout icon button
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should protect dashboard route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should redirect from login to dashboard if already logged in', async ({ page }) => {
    // First login
    await page.goto('/register');
    await page.getByLabel('Name').fill(testName);
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    await expect(page).toHaveURL('/dashboard');
    
    // Try to go to login again
    await page.goto('/login');
    
    // Should redirect back to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
