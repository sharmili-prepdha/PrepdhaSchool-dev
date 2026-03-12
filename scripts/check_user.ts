import "dotenv/config";
import { prisma } from "../lib/prisma";
async function main() {
    const users = await prisma.user.findMany({
        where: { school: { keyword: "demo-school" } },
        include: { school: true }
    });
    console.log("Users in demo-school:");
    console.log(users.map(u => ({ id: u.id, login_id: u.login_id, role: u.role, school: u.school.keyword, active: u.is_active })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
