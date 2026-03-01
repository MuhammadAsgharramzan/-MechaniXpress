import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const service = await prisma.service.findFirst();
    const user = await prisma.user.findFirst({
        where: { email: 'testuser_v2@example.com' }, // The user we just created
        include: { vehicles: true }
    });

    // If new user doesn't have vehicle, create one
    let vehicleId = user?.vehicles[0]?.id;
    if (user && !vehicleId) {
        console.log('Creating vehicle for test user...');
        const v = await prisma.vehicle.create({
            data: {
                customerId: user.id,
                category: 'CAR',
                make: 'Honda',
                model: 'City',
                year: 2022,
                licensePlate: 'TEST-999'
            }
        });
        vehicleId = v.id;
    }

    console.log('--- TEST DATA ---');
    console.log(`SERVICE_ID=${service?.id}`);
    console.log(`VEHICLE_ID=${vehicleId}`);
    console.log(`USER_TOKEN= (You need to login again to get this)`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
