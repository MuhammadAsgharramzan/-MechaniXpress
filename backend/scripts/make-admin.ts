import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const email = process.argv[2];

if (!email) {
    console.error("Please provide an email. Usage: package.json script or node loader...");
    process.exit(1);
}

async function main() {
    console.log(`Looking up user: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.error(`User with email ${email} not found. Please log in with Google first to create the account before running this script.`);
        process.exit(1);
    }

    await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    });

    console.log(`✅ Successfully made ${email} an ADMIN!`);
    console.log(`You can now log in via Google and you will be directed to the Admin Dashboard.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
