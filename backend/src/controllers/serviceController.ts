import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllServices = async (req: Request, res: Response) => {
    try {
        const services = await prisma.service.findMany();
        res.json({ success: true, services });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
