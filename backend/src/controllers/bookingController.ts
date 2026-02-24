import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { z } from 'zod';

// Validation Schemas
const createBookingSchema = z.object({
    serviceId: z.string(),
    vehicleId: z.string(),
    scheduledDate: z.string().datetime(), // ISO 8601 string
    scheduledTime: z.string(),
    locationAddress: z.string(),
    locationLat: z.number(),
    locationLng: z.number(),
    problemDescription: z.string(),
});

// --- Customer Endpoints ---

export const createBooking = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const data = createBookingSchema.parse(req.body);

        // 1. Verify User owns Vehicle
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: data.vehicleId },
        });

        if (!vehicle || vehicle.customerId !== userId) {
            return res.status(403).json({ success: false, message: 'Invalid vehicle for this user' });
        }

        // 2. Get Service details for pricing
        const service = await prisma.service.findUnique({
            where: { id: data.serviceId },
        });

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        // 3. Generate Booking Number (Simple timestamp-based for now)
        const count = await prisma.booking.count();
        const bookingNumber = `MX-2026-${String(count + 1).padStart(3, '0')}`;

        // 4. Create Booking
        const booking = await prisma.booking.create({
            data: {
                bookingNumber,
                customerId: userId,
                vehicleId: data.vehicleId,
                serviceId: data.serviceId,
                scheduledDate: data.scheduledDate,
                scheduledTime: data.scheduledTime,
                locationAddress: data.locationAddress,
                locationLat: data.locationLat,
                locationLng: data.locationLng,
                problemDescription: data.problemDescription,
                status: 'PENDING',
                totalCost: service.basePrice + service.convenienceFee, // Initial estimate
            },
        });

        res.status(201).json({ success: true, booking });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getCustomerBookings = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const bookings = await prisma.booking.findMany({
            where: { customerId: userId },
            include: {
                service: true,
                vehicle: true,
                mechanic: {
                    include: {
                        user: { select: { name: true, phone: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, bookings });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBookingDetails = async (req: any, res: Response) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.id; // Could be customer or mechanic

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                customer: { select: { name: true, phone: true } },
                mechanic: {
                    include: {
                        user: { select: { name: true, phone: true } }
                    }
                },
                service: true,
                vehicle: true,
            },
        });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Access Control: Only Customer or Assigned Mechanic (or Admin)
        const isOwner = booking.customerId === userId;
        const isAssignedMechanic = booking.mechanic?.userId === userId;

        if (!isOwner && !isAssignedMechanic) {
            // In a real app, check Admin role too
            return res.status(403).json({ success: false, message: 'Unauthorized access to this booking' });
        }

        res.json({ success: true, booking });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- Mechanic Endpoints ---

export const getAvailableJobs = async (req: any, res: Response) => {
    try {
        const mechanicUserId = req.user.id;

        // Get mechanic profile to check location/radius
        const mechanicProfile = await prisma.mechanicProfile.findUnique({
            where: { userId: mechanicUserId }
        });

        if (!mechanicProfile) {
            return res.status(400).json({ success: false, message: 'Mechanic profile not found' });
        }

        // Filter by mechanic's supported vehicle categories.
        const categories = mechanicProfile.vehicleCategories.split(',');

        const jobs = await prisma.booking.findMany({
            where: {
                status: 'PENDING',
                vehicle: {
                    category: { in: categories }
                }
            },
            include: {
                service: true,
                vehicle: true,
                customer: { select: { name: true } } // Don't show full phone until accepted
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json({ success: true, jobs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMechanicBookings = async (req: any, res: Response) => {
    try {
        const mechanicUserId = req.user.id;
        const mechanicProfile = await prisma.mechanicProfile.findUnique({ where: { userId: mechanicUserId } });

        if (!mechanicProfile) return res.status(400).json({ success: false, message: 'Profile not found' });

        const activeJobs = await prisma.booking.findMany({
            where: {
                mechanicId: mechanicProfile.id,
                status: { in: ['CONFIRMED', 'IN_PROGRESS'] } // Active jobs only
            },
            include: {
                service: true,
                vehicle: true,
                customer: { select: { name: true, phone: true } } // Include phone for contact
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, jobs: activeJobs });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const acceptJob = async (req: any, res: Response) => {
    try {
        const mechanicUserId = req.user.id;
        const { bookingId } = req.params;

        const mechanicProfile = await prisma.mechanicProfile.findUnique({
            where: { userId: mechanicUserId }
        });

        if (!mechanicProfile) {
            return res.status(400).json({ success: false, message: 'Mechanic profile not found' });
        }

        // Transaction to ensure atomicity
        const booking = await prisma.$transaction(async (tx) => {
            const b = await tx.booking.findUnique({ where: { id: bookingId } });

            if (!b) throw new Error('Booking not found');
            if (b.status !== 'PENDING') throw new Error('Booking is no longer available');

            const updated = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CONFIRMED',
                    mechanicId: mechanicProfile.id,
                    acceptedAt: new Date()
                },
                include: { service: true, customer: true }
            });

            return updated;
        });

        res.json({ success: true, message: 'Job accepted!', booking });

    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateJobStatus = async (req: any, res: Response) => {
    try {
        // Status: IN_PROGRESS, COMPLETED
        const { status } = req.body;
        const { bookingId } = req.params;
        const mechanicUserId = req.user.id;

        const mechanicProfile = await prisma.mechanicProfile.findUnique({
            where: { userId: mechanicUserId }
        });

        if (!mechanicProfile) return res.status(403).json({ success: false });

        // Verify ownership
        const currentBooking = await prisma.booking.findUnique({ where: { id: bookingId } });
        if (!currentBooking || currentBooking.mechanicId !== mechanicProfile.id) {
            return res.status(403).json({ success: false, message: 'Not authorized for this job' });
        }

        const updates: any = { status };
        if (status === 'IN_PROGRESS') {
            updates.startedAt = new Date();
        } else if (status === 'COMPLETED') {
            updates.completedAt = new Date();
            // In real app, calculate final costs here from req.body inputs
        }

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: updates
        });

        res.json({ success: true, booking: updatedBooking });

    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
