import prisma from "./db.js";

async function testDatabase() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected successfully!");

    const count = await prisma.user.count();
    console.log("Current user count:", count);
  } catch (error) {
    console.error("Database test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
