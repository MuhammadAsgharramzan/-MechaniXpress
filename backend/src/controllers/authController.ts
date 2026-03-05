import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import { registerSchema, loginSchema } from '../utils/validation.js';

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: validatedData.email }, { phone: validatedData.phone }],
            },
        });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists (email or phone)' });
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Transaction to create user and mechanic profile if needed
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    phone: validatedData.phone,
                    password: hashedPassword,
                    name: validatedData.name,
                    role: validatedData.role,
                    cnic: validatedData.cnic,
                },
            });

            if (validatedData.role === 'MECHANIC') {

                // Handle vehicle categories (Expect CSV string or Array)
                let categories = 'CAR';
                if (req.body.vehicleCategories) {
                    categories = Array.isArray(req.body.vehicleCategories)
                        ? req.body.vehicleCategories.join(',')
                        : req.body.vehicleCategories;
                }

                await tx.mechanicProfile.create({
                    data: {
                        userId: user.id,
                        experienceYears: req.body.experienceYears || 0,
                        vehicleCategories: categories,
                        address: req.body.address || 'Mobile Mechanic',
                    },
                });
            }
            return user;
        });

        const token = jwt.sign(
            { id: result.id, role: result.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({ success: true, token, user: { id: result.id, name: result.name, role: result.role } });

    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { mechanicProfile: true, vehicles: true },
        });
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { email, name, googleId } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required from Google.' });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            // Allow Admins to log in seamlessly via Google even if they have standard passwords
            if (user.role === 'ADMIN') {
                const token = jwt.sign(
                    { id: user.id, role: user.role },
                    process.env.JWT_SECRET || 'secret',
                    { expiresIn: '24h' }
                );
                return res.json({ success: true, token, user: { id: user.id, name: user.name, role: user.role } });
            }

            // If the user already exists, we must ensure they are actually a Google-originated user.
            // Since we don't have a linked 'provider' table, we will reject Google logins for existing standard accounts
            // to prevent the "I don't know my password" confusion.
            if (!user.phone.startsWith('google-')) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered with a standard password. Please use the standard Login form.'
                });
            }

            // Existing Google User Login
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );
            return res.json({ success: true, token, user: { id: user.id, name: user.name, role: user.role } });

        } else {
            // NEW Google User - Send them to role selection
            return res.json({
                success: true,
                requireRoleSelection: true,
                email,
                name: name || 'Google User',
                googleId
            });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error occurred during Google login' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Security: We still return success even if not found to prevent email enumeration
            return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
        }

        // Generate Secure Token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 Hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        // For local development without an email provider (e.g. Resend/SendGrid):
        // We will just log the token so we can manually hit the frontend route
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        console.log(`\n\n[DEV ONLY] Password Reset Link Requested:`);
        console.log(`${frontendUrl}/auth/reset-password?token=${resetToken}\n\n`);

        res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error handling forgot password request' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token and new password are required' });
        }

        // Find user by valid token (we'll check expiry manually to avoid SQLite timezone bugs)
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
            },
        });

        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        // Update password and clear tokens
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        res.json({ success: true, message: 'Password has been successfully reset.' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error executing password reset' });
    }
};

export const googleCompleteRegistration = async (req: Request, res: Response) => {
    try {
        const { email, name, googleId, role, vehicleCategories, experienceYears } = req.body;

        if (!email || !googleId || !role) {
            return res.status(400).json({ success: false, message: 'Missing required fields for registration' });
        }

        let user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    name: name || 'Google User',
                    phone: `google-${googleId}`, // Mock unique phone
                    password: await bcrypt.hash(googleId + (process.env.JWT_SECRET || 'secret'), 10),
                    role: role,
                },
            });

            if (role === 'MECHANIC') {
                let categories = 'CAR';
                if (vehicleCategories) {
                    categories = Array.isArray(vehicleCategories)
                        ? vehicleCategories.join(',')
                        : vehicleCategories;
                }

                await tx.mechanicProfile.create({
                    data: {
                        userId: newUser.id,
                        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 0,
                        vehicleCategories: categories,
                        address: req.body.address || 'Mobile Mechanic',
                    },
                });
            }
            return newUser;
        });

        const token = jwt.sign(
            { id: result.id, role: result.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );

        res.json({ success: true, token, user: { id: result.id, name: result.name, role: result.role } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message || 'Error occurred during Google registration completion' });
    }
};
