const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('Admin123!', 12);
  await prisma.user.update({ where: { email: 'admin@gmail.com' }, data: { passwordHash: hash } });
  console.log('Password updated.');
  process.exit(0);
}
main();
