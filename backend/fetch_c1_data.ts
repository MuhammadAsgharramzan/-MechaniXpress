import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'customer1@example.com' },
        include: { vehicles: true }
    });

    const service = await prisma.service.findFirst();

    if (user && user.vehicles.length > 0) {
        console.log(`VEHICLE_ID=${user.vehicles[0].id}`);
    } else {
        console.log('User or Vehicle not found');
    }

    if (service) {
        console.log(`SERVICE_ID=${service.id}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
