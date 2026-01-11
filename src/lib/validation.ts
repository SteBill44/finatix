import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((pwd) => /[A-Z]/.test(pwd), "Password must contain an uppercase letter")
  .refine((pwd) => /[a-z]/.test(pwd), "Password must contain a lowercase letter")
  .refine((pwd) => /[0-9]/.test(pwd), "Password must contain a number")
  .refine(
    (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    "Password must contain a special character"
  );

export const nameSchema = z
  .string()
  .trim()
  .min(1, "This field is required")
  .max(100, "Must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Only letters, spaces, hyphens, and apostrophes allowed");

export const messageSchema = z
  .string()
  .trim()
  .min(1, "Message is required")
  .max(2000, "Message must be less than 2000 characters");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[\d\s+()-]*$/, "Please enter a valid phone number")
  .max(20, "Phone number is too long")
  .optional()
  .or(z.literal(""));

// Password requirements for UI display
export const passwordRequirements = [
  { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
  { label: "One uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
  { label: "One lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
  { label: "One number", test: (pwd: string) => /[0-9]/.test(pwd) },
  { label: "One special character (!@#$%^&*)", test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

// Helper to check if password meets all requirements
export const validatePassword = (password: string): boolean => {
  return passwordRequirements.every((req) => req.test(password));
};

// Common form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    cimaId: z.string().trim().max(20).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
  message: messageSchema,
  phone: phoneSchema,
});

// Helper function to parse Zod errors into a Record
export function parseZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    if (err.path[0]) {
      fieldErrors[err.path[0] as string] = err.message;
    }
  });
  return fieldErrors;
}

// Type-safe form validation function
export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: parseZodErrors(result.error) };
}
