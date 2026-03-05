import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const targetEmail = 'asgharusa@gmail.com';

async function main() {
    console.log(`Setting up sole admin for: ${targetEmail}`);

    // 1. Ensure the target user exists
    const targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!targetUser) {
        console.error(`User with email ${targetEmail} not found! Have you logged in with Google at least once to create the account?`);
        process.exit(1);
    }

    // 2. Find other admins
    const otherAdmins = await prisma.user.findMany({
        where: {
            role: 'ADMIN',
            email: { not: targetEmail }
        }
    });

    console.log(`Found ${otherAdmins.length} other admin(s) to remove.`);

    // 3. Delete other admins
    for (const admin of otherAdmins) {
        console.log(`Deleting existing admin: ${admin.email}`);
        await prisma.user.delete({ where: { id: admin.id } });
    }

    // 4. Promote target user
    if (targetUser.role !== 'ADMIN') {
        console.log(`Promoting ${targetEmail} to ADMIN...`);
        await prisma.user.update({
            where: { email: targetEmail },
            data: { role: 'ADMIN' }
        });
        console.log(`✅ Successfully promoted ${targetEmail} to ADMIN!`);
    } else {
        console.log(`✅ ${targetEmail} is already an ADMIN.`);
    }

    console.log(`Process complete. All other admins have been deleted.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
