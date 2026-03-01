import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

const createReviewSchema = z.object({
    bookingId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

export const createReview = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { bookingId, rating, comment } = createReviewSchema.parse(req.body);

        // 1. Check Booking existence and ownership
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { mechanic: true }
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.customerId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        if (booking.status !== 'COMPLETED') {
            return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
        }

        // 2. Create Review
        const review = await prisma.review.create({
            data: {
                bookingId,
                customerId: userId,
                rating,
                comment
            }
        });

        // 3. Update Mechanic Rating
        if (booking.mechanicId) {
            const mechanicId = booking.mechanicId;

            // Calculate new average
            const aggregations = await prisma.review.aggregate({
                _avg: { rating: true },
                _count: { rating: true },
                where: {
                    booking: { mechanicId: mechanicId }
                }
            });

            await prisma.mechanicProfile.update({
                where: { id: mechanicId },
                data: {
                    rating: aggregations._avg.rating || 0,
                    totalReviews: aggregations._count.rating || 0
                }
            });
        }

        res.status(201).json({ success: true, review });

    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getMechanicReviews = async (req: Request, res: Response) => {
    try {
        const { mechanicId } = req.params;

        const reviews = await prisma.review.findMany({
            where: { booking: { mechanicId: mechanicId } },
            include: { customer: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, reviews });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
