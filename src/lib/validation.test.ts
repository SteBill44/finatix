import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  messageSchema,
  phoneSchema,
  passwordRequirements,
  validatePassword,
  loginSchema,
  signupSchema,
  resetPasswordSchema,
  contactSchema,
  parseZodErrors,
  validateForm,
} from "./validation";
import { z } from "zod";

// ---------------------------------------------------------------------------
// emailSchema
// ---------------------------------------------------------------------------
describe("emailSchema", () => {
  it("accepts a valid email", () => {
    expect(emailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects an empty string", () => {
    const result = emailSchema.safeParse("");
    expect(result.success).toBe(false);
  });

  it("rejects a string without @", () => {
    expect(emailSchema.safeParse("notanemail").success).toBe(false);
  });

  it("rejects an email longer than 255 characters", () => {
    const long = "a".repeat(250) + "@b.com";
    expect(emailSchema.safeParse(long).success).toBe(false);
  });

  it("trims surrounding whitespace before validating", () => {
    expect(emailSchema.safeParse("  user@example.com  ").success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// passwordSchema
// ---------------------------------------------------------------------------
describe("passwordSchema", () => {
  const valid = "Secure1!";

  it("accepts a password that meets all requirements", () => {
    expect(passwordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(passwordSchema.safeParse("Ab1!").success).toBe(false);
  });

  it("rejects a password with no uppercase letter", () => {
    expect(passwordSchema.safeParse("secure1!").success).toBe(false);
  });

  it("rejects a password with no lowercase letter", () => {
    expect(passwordSchema.safeParse("SECURE1!").success).toBe(false);
  });

  it("rejects a password with no digit", () => {
    expect(passwordSchema.safeParse("SecureAA!").success).toBe(false);
  });

  it("rejects a password with no special character", () => {
    expect(passwordSchema.safeParse("Secure12").success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// nameSchema
// ---------------------------------------------------------------------------
describe("nameSchema", () => {
  it("accepts a simple name", () => {
    expect(nameSchema.safeParse("Alice").success).toBe(true);
  });

  it("accepts a hyphenated name", () => {
    expect(nameSchema.safeParse("Mary-Jane").success).toBe(true);
  });

  it("accepts a name with an apostrophe", () => {
    expect(nameSchema.safeParse("O'Brien").success).toBe(true);
  });

  it("rejects an empty string", () => {
    expect(nameSchema.safeParse("").success).toBe(false);
  });

  it("rejects a name with digits", () => {
    expect(nameSchema.safeParse("Alice1").success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    expect(nameSchema.safeParse("A".repeat(101)).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// messageSchema
// ---------------------------------------------------------------------------
describe("messageSchema", () => {
  it("accepts a normal message", () => {
    expect(messageSchema.safeParse("Hello there").success).toBe(true);
  });

  it("rejects an empty message", () => {
    expect(messageSchema.safeParse("").success).toBe(false);
  });

  it("rejects a message longer than 2000 characters", () => {
    expect(messageSchema.safeParse("x".repeat(2001)).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// phoneSchema
// ---------------------------------------------------------------------------
describe("phoneSchema", () => {
  it("accepts a standard phone number", () => {
    expect(phoneSchema.safeParse("+44 7700 900000").success).toBe(true);
  });

  it("accepts an empty string (optional field)", () => {
    expect(phoneSchema.safeParse("").success).toBe(true);
  });

  it("accepts undefined (optional field)", () => {
    expect(phoneSchema.safeParse(undefined).success).toBe(true);
  });

  it("rejects a phone number with letters", () => {
    expect(phoneSchema.safeParse("abc123").success).toBe(false);
  });

  it("rejects a phone number longer than 20 characters", () => {
    expect(phoneSchema.safeParse("1".repeat(21)).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// passwordRequirements
// ---------------------------------------------------------------------------
describe("passwordRequirements", () => {
  it("has 5 requirement entries", () => {
    expect(passwordRequirements).toHaveLength(5);
  });

  it("length requirement passes for 8+ chars and fails for fewer", () => {
    const req = passwordRequirements.find((r) => r.label.includes("8 characters"))!;
    expect(req.test("12345678")).toBe(true);
    expect(req.test("1234567")).toBe(false);
  });

  it("uppercase requirement detects uppercase letters", () => {
    const req = passwordRequirements.find((r) => r.label.includes("uppercase"))!;
    expect(req.test("A")).toBe(true);
    expect(req.test("abc")).toBe(false);
  });

  it("lowercase requirement detects lowercase letters", () => {
    const req = passwordRequirements.find((r) => r.label.includes("lowercase"))!;
    expect(req.test("a")).toBe(true);
    expect(req.test("ABC")).toBe(false);
  });

  it("number requirement detects digits", () => {
    const req = passwordRequirements.find((r) => r.label.includes("number"))!;
    expect(req.test("abc1")).toBe(true);
    expect(req.test("abcd")).toBe(false);
  });

  it("special character requirement detects allowed specials", () => {
    const req = passwordRequirements.find((r) => r.label.includes("special"))!;
    expect(req.test("abc!")).toBe(true);
    expect(req.test("abcd")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validatePassword
// ---------------------------------------------------------------------------
describe("validatePassword", () => {
  it("returns true for a fully valid password", () => {
    expect(validatePassword("Secure1!")).toBe(true);
  });

  it("returns false when any requirement is missing", () => {
    expect(validatePassword("secure1!")).toBe(false); // no uppercase
    expect(validatePassword("SECURE1!")).toBe(false); // no lowercase
    expect(validatePassword("SecureAA!")).toBe(false); // no digit
    expect(validatePassword("Secure12")).toBe(false); // no special char
    expect(validatePassword("Se1!")).toBe(false); // too short
  });
});

// ---------------------------------------------------------------------------
// loginSchema
// ---------------------------------------------------------------------------
describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    expect(loginSchema.safeParse({ email: "u@e.com", password: "abc" }).success).toBe(true);
  });

  it("rejects missing email", () => {
    expect(loginSchema.safeParse({ email: "", password: "abc" }).success).toBe(false);
  });

  it("rejects missing password", () => {
    expect(loginSchema.safeParse({ email: "u@e.com", password: "" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// signupSchema
// ---------------------------------------------------------------------------
describe("signupSchema", () => {
  const base = {
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    password: "Secure1!",
    confirmPassword: "Secure1!",
  };

  it("accepts valid signup data", () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
  });

  it("rejects when passwords don't match", () => {
    const result = signupSchema.safeParse({ ...base, confirmPassword: "Different1!" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const flat = result.error.flatten();
      expect(flat.fieldErrors.confirmPassword).toBeDefined();
    }
  });

  it("rejects an invalid email", () => {
    expect(signupSchema.safeParse({ ...base, email: "notvalid" }).success).toBe(false);
  });

  it("accepts an optional cimaId", () => {
    expect(signupSchema.safeParse({ ...base, cimaId: "CIMA123" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resetPasswordSchema
// ---------------------------------------------------------------------------
describe("resetPasswordSchema", () => {
  it("accepts matching strong passwords", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "Secure1!", confirmPassword: "Secure1!" }).success
    ).toBe(true);
  });

  it("rejects when passwords don't match", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Secure1!",
      confirmPassword: "Other1!A",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a weak password", () => {
    expect(
      resetPasswordSchema.safeParse({ password: "weak", confirmPassword: "weak" }).success
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// contactSchema
// ---------------------------------------------------------------------------
describe("contactSchema", () => {
  const base = {
    name: "Alice Smith",
    email: "alice@example.com",
    subject: "Test subject",
    message: "Hello there",
  };

  it("accepts a valid contact form", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an empty subject", () => {
    expect(contactSchema.safeParse({ ...base, subject: "" }).success).toBe(false);
  });

  it("rejects a subject over 200 characters", () => {
    expect(contactSchema.safeParse({ ...base, subject: "x".repeat(201) }).success).toBe(false);
  });

  it("accepts with an optional phone number", () => {
    expect(contactSchema.safeParse({ ...base, phone: "+44 7700 900000" }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseZodErrors
// ---------------------------------------------------------------------------
describe("parseZodErrors", () => {
  it("maps field paths to their first error message", () => {
    const result = loginSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = parseZodErrors(result.error);
      expect(errors).toHaveProperty("email");
      expect(errors).toHaveProperty("password");
      expect(typeof errors.email).toBe("string");
    }
  });

  it("returns an empty object when there are no field-level errors", () => {
    const schema = z.string().min(1);
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (!result.success) {
      // Root-level error has no path[0], so the record should be empty
      const errors = parseZodErrors(result.error);
      expect(errors).toEqual({});
    }
  });
});

// ---------------------------------------------------------------------------
// validateForm
// ---------------------------------------------------------------------------
describe("validateForm", () => {
  it("returns success with parsed data for valid input", () => {
    const result = validateForm(loginSchema, { email: "u@e.com", password: "pass" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("u@e.com");
    }
  });

  it("returns failure with field errors for invalid input", () => {
    const result = validateForm(loginSchema, { email: "", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toHaveProperty("email");
    }
  });

  it("works with arbitrary zod schemas", () => {
    const schema = z.object({ age: z.number().min(18) });
    expect(validateForm(schema, { age: 17 }).success).toBe(false);
    expect(validateForm(schema, { age: 18 }).success).toBe(true);
  });
});
