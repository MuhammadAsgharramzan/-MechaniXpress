import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Cleanup existing data
  try {
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.mechanicProfile.deleteMany();
    await prisma.service.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log('Cleanup skipped or failed (first run)');
  }

  // 1. Create Services
  const services = [
    {
      name: 'Oil Change Package',
      description: 'Complete oil change with filter replacement and fluid check',
      category: 'CAR',
      basePrice: 3500,
      convenienceFee: 500,
      estimatedDuration: '45 mins',
    },
    {
      name: 'General Tuning',
      description: 'Engine tuning, spark plug cleaning, and air filter check',
      category: 'CAR',
      basePrice: 2000,
      convenienceFee: 500,
      estimatedDuration: '1 hour',
    },
    {
      name: 'Brake Service',
      description: 'Brake pad replacement and disc inspection',
      category: 'CAR',
      basePrice: 1500,
      convenienceFee: 500,
      estimatedDuration: '1.5 hours',
    },
    {
      name: 'Battery Replacement',
      description: 'New battery installation and electrical check',
      category: 'CAR',
      basePrice: 500,
      convenienceFee: 300,
      estimatedDuration: '30 mins',
    },
    {
      name: 'Bike Tuning',
      description: 'Standard bike tuning and oil change',
      category: 'BIKE',
      basePrice: 800,
      convenienceFee: 200,
      estimatedDuration: '45 mins',
    },
  ];

  for (const s of services) {
    await prisma.service.create({ data: s });
  }
  console.log('✅ Services created');

  // 2. Create Customers
  const password = await bcrypt.hash('password123', 10);

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@example.com',
      phone: '+923001111111',
      password,
      name: 'Ali Khan',
      role: 'CUSTOMER',
      vehicles: {
        create: [
          {
            category: 'CAR',
            make: 'Honda',
            model: 'Civic',
            year: 2019,
            licensePlate: 'ABC-123',
          },
        ],
      },
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      phone: '+923002222222',
      password,
      name: 'Sara Ahmed',
      role: 'CUSTOMER',
      vehicles: {
        create: [
          {
            category: 'CAR',
            make: 'Toyota',
            model: 'Corolla',
            year: 2021,
            licensePlate: 'XYZ-789',
          },
        ],
      },
    },
  });

  console.log('✅ Customers created');

  // 3. Create Mechanics
  const mechanic1 = await prisma.user.create({
    data: {
      email: 'mechanic1@example.com',
      phone: '+923003333333',
      password,
      name: 'Ustad Bashir',
      role: 'MECHANIC',
      mechanicProfile: {
        create: {
          cnic: '42101-1234567-1',
          experienceYears: 15,
          rating: 4.8,
          totalReviews: 24,
          serviceRadius: 15,
          vehicleCategories: 'CAR,BIKE', // CSV for SQLite
          isVerified: true,
          isOnline: true,
          latitude: 24.8607,
          longitude: 67.0011, // Karachi center
          address: 'Saddar, Karachi',
        },
      },
    },
  });

  const mechanic2 = await prisma.user.create({
    data: {
      email: 'mechanic2@example.com',
      phone: '+923004444444',
      password,
      name: 'Aslam Mechanic',
      role: 'MECHANIC',
      mechanicProfile: {
        create: {
          cnic: '42101-7654321-9',
          experienceYears: 8,
          rating: 4.5,
          totalReviews: 12,
          serviceRadius: 10,
          vehicleCategories: 'CAR', // CSV for SQLite
          isVerified: true,
          isOnline: false,
          latitude: 24.8200,
          longitude: 67.0300, // Clifton area
          address: 'Clifton, Karachi',
        },
      },
    },
  });

  console.log('✅ Mechanics created');

  // 4. Create Admin
  await prisma.user.create({
    data: {
      email: 'admin@mechanixpress.pk',
      phone: '+923000000000',
      password,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin created');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
