import { PrismaClient } from "@prisma/client";

// init var to essentially cache the client
let prisma: PrismaClient | undefined = undefined;

// Not defined
if (!prisma) {
  // Define it
  prisma = new PrismaClient();

  // Connect to DB
  await prisma.$connect();
}

export { prisma };
