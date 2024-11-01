import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production, initialize Prisma once
  prisma = new PrismaClient();
} else {
  // In development, use a global variable so the Prisma client is not recreated
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;