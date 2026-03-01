import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

const addVehicleSchema = z.object({
    category: z.enum(['CAR', 'BIKE']),
    make: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    licensePlate: z.string().min(1).optional(),
});

export const addVehicle = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const data = addVehicleSchema.parse(req.body);

        const vehicle = await prisma.vehicle.create({
            data: {
                customerId: userId,
                ...data,
            },
        });

        res.status(201).json({ success: true, vehicle });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getVehicles = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const vehicles = await prisma.vehicle.findMany({
            where: { customerId: userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, vehicles });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteVehicle = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const vehicle = await prisma.vehicle.findUnique({ where: { id } });

        if (!vehicle || vehicle.customerId !== userId) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        await prisma.vehicle.delete({ where: { id } });

        res.json({ success: true, message: 'Vehicle deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
