import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().min(10), // Basic phone validation
    role: z.enum(['CUSTOMER', 'MECHANIC']),
    cnic: z.string().min(13, "CNIC must be 13 characters").max(13, "CNIC must be 13 characters"), // Required universally now
    // Mechanic specific fields (optional in schema, handled in logic)
    experienceYears: z.number().optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
