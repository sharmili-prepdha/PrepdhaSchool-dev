import { z } from "zod";

export const loginSchema = z.object({
  schoolKeyword: z
    .string({ message: "School keyword is required" })
    .trim()
    .min(2, { message: "School keyword must be at least 2 characters" }).transform((val) => val.toLowerCase()),

  loginId: z
    .string()
    .trim()
    .min(1, { message: "Login ID is required" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: "Login ID contains invalid characters",
    }).transform((val) => val.toLowerCase()),
  password: z
    .string({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const changePasswordSchema = z
  .object({
    password: z
      .string({ message: "New password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(50, { message: "Password is too long" }),

    confirmPassword: z.string({
      message: "Confirm password is required",
    }),

    email: z
      .string({ message: "Email is required" })
      .email({ message: "Invalid email address" }),

    mobile: z
      .string({ message: "Mobile number is required" })
      .min(10, { message: "Mobile must be at least 10 digits" })
      .max(15, { message: "Mobile must not exceed 15 digits" })
      .regex(/^[0-9]+$/, {
        message: "Mobile must contain only digits",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
