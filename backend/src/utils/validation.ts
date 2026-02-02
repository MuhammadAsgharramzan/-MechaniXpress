import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    phone: z.string().min(10), // Basic phone validation
    role: z.enum(['CUSTOMER', 'MECHANIC']),
    // Mechanic specific fields (optional in schema, handled in logic)
    cnic: z.string().optional(),
    experienceYears: z.number().optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
