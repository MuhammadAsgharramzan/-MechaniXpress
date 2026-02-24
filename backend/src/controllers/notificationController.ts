import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const getNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json({ success: true, notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const notif = await prisma.notification.findUnique({ where: { id } });
        if (!notif || notif.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
