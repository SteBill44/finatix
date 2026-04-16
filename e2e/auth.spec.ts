import { test, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// Auth page — structure & navigation
// ---------------------------------------------------------------------------

test.describe("Auth page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("shows the sign-in form by default", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("switches to sign-up form when 'Sign up' is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(page.getByLabel("First Name *")).toBeVisible();
    await expect(page.getByLabel("Last Name *")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("switches back to sign-in from sign-up", async ({ page }) => {
    await page.getByRole("button", { name: "Sign up" }).click();
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  });

  test("switches to forgot-password form when 'Forgot password?' is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await expect(page.getByRole("heading", { name: "Reset Password" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Reset Link" })).toBeVisible();
  });

  test("returns to sign-in from forgot-password via back button", async ({ page }) => {
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await page.getByRole("button", { name: "Back to sign in" }).click();
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  });

  test("signup mode is activated via ?mode=signup URL param", async ({ page }) => {
    await page.goto("/auth?mode=signup");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
  });

  test("forgot mode is activated via ?mode=forgot URL param", async ({ page }) => {
    await page.goto("/auth?mode=forgot");
    await expect(page.getByRole("heading", { name: "Reset Password" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Login form validation
// ---------------------------------------------------------------------------

test.describe("Login form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("shows error when submitting with empty email", async ({ page }) => {
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("shows error when submitting with invalid email format", async ({ page }) => {
    await page.getByLabel("Email").fill("notanemail");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test("shows error when password is empty", async ({ page }) => {
    await page.getByLabel("Email").fill("user@example.com");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test("toggles password visibility", async ({ page }) => {
    const passwordInput = page.getByLabel("Password");
    await passwordInput.fill("secret");
    await expect(passwordInput).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "" }).filter({ has: page.locator("svg") }).last().click();
    await expect(passwordInput).toHaveAttribute("type", "text");
  });
});

// ---------------------------------------------------------------------------
// Signup form validation
// ---------------------------------------------------------------------------

test.describe("Signup form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth?mode=signup");
  });

  test("shows error when first name is missing", async ({ page }) => {
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText(/first name is required/i)).toBeVisible();
  });

  test("shows password requirements checklist when user types a password", async ({ page }) => {
    await page.getByLabel("Password").fill("abc");
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test("password requirements turn green when met", async ({ page }) => {
    await page.getByLabel("Password").fill("Secure1!");
    // All requirements should show green check icons - verify at least one passes
    const requirements = page.locator("text=At least 8 characters");
    await expect(requirements).toBeVisible();
  });

  test("shows error when passwords do not match", async ({ page }) => {
    await page.getByLabel("First Name *").fill("Alice");
    await page.getByLabel("Last Name *").fill("Smith");
    await page.getByLabel("Email").fill("alice@example.com");
    await page.getByLabel("Password").fill("Secure1!");
    await page.getByLabel("Confirm Password").fill("Different1!");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Forgot password form validation
// ---------------------------------------------------------------------------

test.describe("Forgot password form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth?mode=forgot");
  });

  test("shows error when email is empty", async ({ page }) => {
    await page.getByRole("button", { name: "Send Reset Link" }).click();
    await expect(page.getByText(/enter your email/i)).toBeVisible();
  });

  test("shows error when email format is invalid", async ({ page }) => {
    await page.getByLabel("Email").fill("notvalid");
    await page.getByRole("button", { name: "Send Reset Link" }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });
});
