import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

// --- Dashboard Stats ---
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalBookings = await prisma.booking.count();
        const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
        const totalMechanics = await prisma.user.count({ where: { role: 'MECHANIC' } });
        const pendingMechanics = await prisma.mechanicProfile.count({ where: { isVerified: false } });

        // Simple revenue calc (sum of completed bookings cost)
        const revenueAgg = await prisma.booking.aggregate({
            _sum: { totalCost: true },
            where: { status: 'COMPLETED' }
        });
        const totalRevenue = revenueAgg._sum.totalCost || 0;

        // Avg Rating
        const ratingAgg = await prisma.mechanicProfile.aggregate({
            _avg: { rating: true }
        });
        const avgRating = ratingAgg._avg.rating || 0;

        const bookingsByStatus = await prisma.booking.groupBy({
            by: ['status'],
            _count: { status: true }
        });

        res.json({
            success: true,
            stats: {
                totalBookings,
                totalCustomers,
                totalMechanics,
                pendingMechanics,
                totalRevenue,
                avgRating,
                bookingsByStatus
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Mechanic Management ---
export const getAllMechanics = async (req: Request, res: Response) => {
    try {
        const mechanics = await prisma.mechanicProfile.findMany({
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } }
            }
        });
        res.json({ success: true, mechanics });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveMechanic = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // MechanicProfile ID

        const mechanic = await prisma.mechanicProfile.update({
            where: { id },
            data: { isVerified: true }
        });

        // In a real app, send email/notification to mechanic here

        res.json({ success: true, message: 'Mechanic approved successfully', mechanic });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const rejectMechanic = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // MechanicProfile ID
        // For now, just un-verify or maybe delete? Let's just set verified false.
        const mechanic = await prisma.mechanicProfile.update({
            where: { id },
            data: { isVerified: false }
        });

        res.json({ success: true, message: 'Mechanic rejected/suspended', mechanic });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
