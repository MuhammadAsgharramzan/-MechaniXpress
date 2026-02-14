import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { registerSchema, loginSchema } from '../utils/validation.js';

const prisma = new PrismaClient();

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
                },
            });

            if (validatedData.role === 'MECHANIC') {
                if (!req.body.cnic) {
                    throw new Error('CNIC is required for mechanics');
                }

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
                        cnic: req.body.cnic,
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
