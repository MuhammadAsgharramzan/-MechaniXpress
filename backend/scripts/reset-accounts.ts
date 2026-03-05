import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const KEEP_EMAILS = [
    'customer@test.com',
    'bikemechanic@test.com',
    'carmechanic@test.com',
    'asgharusa@gmail.com',
];

async function main() {
    console.log('🔧 Resetting database accounts...\n');
    const password = await bcrypt.hash('password123', 10);

    // 1. Delete ALL related data first (foreign key constraints)
    console.log('Cleaning related data...');
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.mechanicProfile.deleteMany();

    // 2. Delete ALL users that are NOT in the keep list
    const deleted = await prisma.user.deleteMany({
        where: {
            email: { notIn: KEEP_EMAILS }
        }
    });
    console.log(`Deleted ${deleted.count} user(s).\n`);

    // 3. Upsert the 3 test accounts
    // Customer
    await prisma.user.upsert({
        where: { email: 'customer@test.com' },
        update: { password, name: 'Test Customer', role: 'CUSTOMER' },
        create: {
            email: 'customer@test.com',
            phone: '+923001110001',
            password,
            name: 'Test Customer',
            role: 'CUSTOMER',
            vehicles: {
                create: {
                    category: 'CAR',
                    make: 'Honda',
                    model: 'Civic',
                    year: 2021,
                    licensePlate: 'TST-001',
                },
            },
        },
    });
    console.log('✅ customer@test.com  (CUSTOMER, password123)');

    // Bike Mechanic
    const bikeMech = await prisma.user.upsert({
        where: { email: 'bikemechanic@test.com' },
        update: { password, name: 'Bike Mechanic', role: 'MECHANIC' },
        create: {
            email: 'bikemechanic@test.com',
            phone: '+923001110002',
            password,
            name: 'Bike Mechanic',
            role: 'MECHANIC',
            cnic: '42101-0000001-1',
        },
    });
    await prisma.mechanicProfile.upsert({
        where: { userId: bikeMech.id },
        update: { vehicleCategories: 'BIKE' },
        create: {
            userId: bikeMech.id,
            experienceYears: 5,
            rating: 4.5,
            totalReviews: 0,
            vehicleCategories: 'BIKE',
            isVerified: true,
            isOnline: true,
            address: 'Karachi',
        },
    });
    console.log('✅ bikemechanic@test.com  (MECHANIC/BIKE, password123)');

    // Car Mechanic
    const carMech = await prisma.user.upsert({
        where: { email: 'carmechanic@test.com' },
        update: { password, name: 'Car Mechanic', role: 'MECHANIC' },
        create: {
            email: 'carmechanic@test.com',
            phone: '+923001110003',
            password,
            name: 'Car Mechanic',
            role: 'MECHANIC',
            cnic: '42101-0000002-2',
        },
    });
    await prisma.mechanicProfile.upsert({
        where: { userId: carMech.id },
        update: { vehicleCategories: 'CAR' },
        create: {
            userId: carMech.id,
            experienceYears: 10,
            rating: 4.8,
            totalReviews: 0,
            vehicleCategories: 'CAR',
            isVerified: true,
            isOnline: true,
            address: 'Karachi',
        },
    });
    console.log('✅ carmechanic@test.com  (MECHANIC/CAR, password123)');

    // 4. Promote asgharusa@gmail.com to ADMIN (or note if not found yet)
    const adminUser = await prisma.user.findUnique({ where: { email: 'asgharusa@gmail.com' } });
    if (adminUser) {
        await prisma.user.update({
            where: { email: 'asgharusa@gmail.com' },
            data: { role: 'ADMIN' },
        });
        console.log('✅ asgharusa@gmail.com  (promoted to ADMIN)');
    } else {
        console.log('⚠️  asgharusa@gmail.com not found. Log in via Google first, then re-run this script to promote.');
    }

    // 5. Re-seed services if they were deleted
    const serviceCount = await prisma.service.count();
    if (serviceCount === 0) {
        const services = [
            { name: 'Oil Change Package', description: 'Complete oil change with filter replacement', category: 'CAR', basePrice: 3500, convenienceFee: 500, estimatedDuration: '45 mins' },
            { name: 'General Tuning', description: 'Engine tuning, spark plug cleaning, air filter check', category: 'CAR', basePrice: 2000, convenienceFee: 500, estimatedDuration: '1 hour' },
            { name: 'Brake Service', description: 'Brake pad replacement and disc inspection', category: 'CAR', basePrice: 1500, convenienceFee: 500, estimatedDuration: '1.5 hours' },
            { name: 'Battery Replacement', description: 'New battery installation and electrical check', category: 'CAR', basePrice: 500, convenienceFee: 300, estimatedDuration: '30 mins' },
            { name: 'Bike Tuning', description: 'Standard bike tuning and oil change', category: 'BIKE', basePrice: 800, convenienceFee: 200, estimatedDuration: '45 mins' },
        ];
        for (const s of services) {
            await prisma.service.create({ data: s });
        }
        console.log('✅ Services re-seeded');
    }

    console.log('\n🎉 Done! Database has been cleaned up.');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
