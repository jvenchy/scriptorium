const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const createAdminUser = async () => {
  const firstName = "Admin";
  const lastName = "User";
  const email = "admin@example.com";
  const phoneNumber = "1234567890";
  const password = await hashPassword("securepassword123");

  try {
    const newAdmin = await prisma.account.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        passwordHash: password,
        isAdministrator: true,  // Set the admin flag here
      },
    });

    console.log("Admin user created:", newAdmin);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdminUser();
