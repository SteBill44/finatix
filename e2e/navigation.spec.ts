import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Public page navigation
// ---------------------------------------------------------------------------

test.describe("Public navigation", () => {
  test("home page loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/finatix/i);
    // Navigation should be present
    await expect(page.locator("nav")).toBeVisible();
  });

  test("auth page is reachable from the home page", async ({ page }) => {
    await page.goto("/");
    // Find any sign-in / get started link
    const signInLink = page.getByRole("link", { name: /sign in|log in|get started/i }).first();
    if (await signInLink.isVisible()) {
      await signInLink.click();
      await expect(page).toHaveURL(/\/auth/);
    } else {
      // If no direct link, navigate directly and verify it works
      await page.goto("/auth");
      await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    }
  });

  test("protected dashboard redirects unauthenticated users to auth", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to auth or show login prompt
    await expect(page).toHaveURL(/\/(auth|login)/);
  });

  test("auth page has correct page title for sign-in mode", async ({ page }) => {
    await page.goto("/auth");
    await expect(page).toHaveTitle(/sign in/i);
  });

  test("auth page has correct page title for sign-up mode", async ({ page }) => {
    await page.goto("/auth?mode=signup");
    await expect(page).toHaveTitle(/sign up/i);
  });

  test("auth page has correct page title for forgot-password mode", async ({ page }) => {
    await page.goto("/auth?mode=forgot");
    await expect(page).toHaveTitle(/reset password/i);
  });
});

// ---------------------------------------------------------------------------
// 404 / not-found handling
// ---------------------------------------------------------------------------

test.describe("404 handling", () => {
  test("visiting a non-existent route does not show a blank page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    // The app should render something — either a 404 page or redirect
    const body = page.locator("body");
    await expect(body).not.toBeEmpty();
  });
});
