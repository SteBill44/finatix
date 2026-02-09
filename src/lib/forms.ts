/**
 * Form Utilities
 * Standardized form patterns with react-hook-form + zod
 */

import { useForm, UseFormReturn, FieldValues, DefaultValues, Path, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodSchema } from "zod";
import { useCallback, useState } from "react";
import { toast } from "sonner";

// Common validation schemas
export const schemas = {
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  required: (fieldName: string) => z.string().min(1, `${fieldName} is required`),
  optional: z.string().optional(),
  uuid: z.string().uuid("Invalid ID format"),
};

// Common form schemas
export const formSchemas = {
  login: z.object({
    email: schemas.email,
    password: z.string().min(1, "Password is required"),
  }),
  signup: z.object({
    email: schemas.email,
    password: schemas.password,
    fullName: schemas.name,
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),
  profile: z.object({
    firstName: schemas.name.optional(),
    lastName: schemas.name.optional(),
    fullName: schemas.name.optional(),
  }),
  contact: z.object({
    name: schemas.name,
    email: schemas.email,
    message: z.string().min(10, "Message must be at least 10 characters"),
  }),
};

// Type helpers
export type LoginFormData = z.infer<typeof formSchemas.login>;
export type SignupFormData = z.infer<typeof formSchemas.signup>;
export type ProfileFormData = z.infer<typeof formSchemas.profile>;
export type ContactFormData = z.infer<typeof formSchemas.contact>;

// Form state interface
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

// Hook for creating type-safe forms
export function useTypedForm<TSchema extends ZodSchema>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, "resolver">
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...options,
  });
}

// Hook for form submission with loading/error states
export function useFormSubmit<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSubmit: (data: T) => Promise<void>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    resetOnSuccess?: boolean;
  }
) {
  const [state, setState] = useState<FormState>({
    isSubmitting: false,
    isSuccess: false,
    error: null,
  });

  const handleSubmit = useCallback(
    async (data: T) => {
      setState({ isSubmitting: true, isSuccess: false, error: null });
      
      try {
        await onSubmit(data);
        setState({ isSubmitting: false, isSuccess: true, error: null });
        
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        
        if (options?.resetOnSuccess) {
          form.reset();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : options?.errorMessage || "An error occurred";
        setState({ isSubmitting: false, isSuccess: false, error: message });
        toast.error(message);
      }
    },
    [form, onSubmit, options]
  );

  return {
    ...state,
    handleSubmit: form.handleSubmit(handleSubmit),
    reset: () => setState({ isSubmitting: false, isSuccess: false, error: null }),
  };
}

// Field error helper
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>
): string | undefined {
  const error = form.formState.errors[name];
  return error?.message as string | undefined;
}

// Check if field is touched and has error
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>
): boolean {
  const { errors, touchedFields } = form.formState;
  // @ts-expect-error - Path<T> is valid for these objects
  return !!(touchedFields[name] && errors[name]);
}

// Form field wrapper props helper
export function getFieldProps<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: Path<T>
) {
  return {
    ...form.register(name),
    error: hasFieldError(form, name),
    helperText: getFieldError(form, name),
  };
}

// Create default values from schema (for ZodObject schemas only)
export function createDefaultValues<T extends z.ZodObject<any>>(
  schema: T
): DefaultValues<z.infer<T>> {
  const shape = schema.shape;
  if (!shape) return {} as DefaultValues<z.infer<T>>;

  const defaults: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(shape)) {
    if (value instanceof z.ZodString) {
      defaults[key] = "";
    } else if (value instanceof z.ZodNumber) {
      defaults[key] = 0;
    } else if (value instanceof z.ZodBoolean) {
      defaults[key] = false;
    } else if (value instanceof z.ZodArray) {
      defaults[key] = [];
    } else if (value instanceof z.ZodObject) {
      defaults[key] = {};
    } else if (value instanceof z.ZodOptional) {
      defaults[key] = undefined;
    }
  }
  return defaults as DefaultValues<z.infer<T>>;
}
