import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.server";

async function main() {
  console.log("🌱 Seeding database...");

  // Clean database
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Database cleaned");

  // Create test users
  const hashedPassword = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
      username: "alice",
      password: hashedPassword,
    },
  });

  console.log("✅ Test users created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
