import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not set in environment. Using insecure default.');
}

const app: Express = express();
const port = process.env.PORT || 5000;

// Routes
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import path from 'path';

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'https://mechani-xpress.vercel.app',
    process.env.FRONTEND_URL,           // Override via env if needed
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Basic Routes
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to MechaniXpress API 🚀' });
});

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

app.listen(port, () => {
    console.log(`✓ Server running on http://localhost:${port}`);
    console.log(`✓ Database connected (SQLite)`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});
