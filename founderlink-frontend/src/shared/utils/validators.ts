import { z } from 'zod';

export const isValidEmail = (email: string) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

// Standard Zod Schemas for the application
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const startupProfileSchema = z.object({
  companyName: z.string().min(3, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  fundingGoal: z.number().positive('Funding goal must be positive'),
  description: z.string().min(50, 'Please provide a detailed description (min 50 chars)'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type StartupFormData = z.infer<typeof startupProfileSchema>;
