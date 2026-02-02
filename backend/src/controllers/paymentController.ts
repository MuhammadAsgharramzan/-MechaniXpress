import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { paymentService } from '../services/paymentService.js';

const prisma = new PrismaClient();

export const initiateBookingPayment = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { bookingId, mobileNumber } = req.body;

        const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.customerId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const result = await paymentService.initiatePayment(
            booking.totalCost,
            booking.bookingNumber,
            mobileNumber
        );

        // Update booking with txn id locally if needed, or wait for callback
        // For this mock, we assume user gets a push notification

        res.json({ success: true, payment: result });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const paymentCallback = async (req: Request, res: Response) => {
    // This is where JazzCash would hit us back
    console.log('Payment Callback Received:', req.body);

    // In a real app, verify signature and update DB

    res.json({ status: 'success' });
};
