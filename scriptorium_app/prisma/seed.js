const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Seed users
  const users = Array.from({ length: 30 }, (_, i) => ({
    firstName: `FirstName${i + 1}`,
    lastName: `LastName${i + 1}`,
    email: `user${i + 1}@example.com`,
    avatar: `https://randomuser.me/api/portraits/thumb/women/${i + 1}.jpg`,
    phoneNumber: `123-456-78${String(i).padStart(2, '0')}`,
    passwordHash: bcrypt.hashSync('password123', 10), // Hashing password
    isAdministrator: false,
  }));

  await prisma.account.createMany({
    data: users,
  });

  console.log('Database seeded with 30 users!');

  // Fetch all users
  const allUsers = await prisma.account.findMany();

  // Seed code templates
  const templates = Array.from({ length: 30 }, (_, i) => {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    return {
      title: `Template Title ${i + 1}`,
      explanation: `This is an explanation for template ${i + 1}.`,
      codeSnippet: `console.log('Code Template ${i + 1}');`,
      language: `Language${i + 1}`,
      authorId: randomUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await prisma.codeTemplate.createMany({
    data: templates,
  });

  console.log('Database seeded with 30 code templates!');

  // Fetch all templates
  const allTemplates = await prisma.codeTemplate.findMany();

  // Seed blog posts
  const blogPosts = Array.from({ length: 50 }, (_, i) => {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const linkedTemplates = [
      allTemplates[Math.floor(Math.random() * allTemplates.length)].id,
    ];
    return {
      title: `Blog Post Title ${i + 1}`,
      description: `This is a random description for blog post ${i + 1}.`,
      authorId: randomUser.id,
      codeTemplates: { connect: linkedTemplates.map((id) => ({ id })) },
      upvotes: Math.floor(Math.random() * 100),
      downvotes: Math.floor(Math.random() * 20),
      numReports: Math.floor(Math.random() * 10),
      isVisible: true,
      canEdit: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  for (const post of blogPosts) {
    await prisma.blogPost.create({
      data: post,
    });
  }

  console.log('Database seeded with 50 random blog posts linked to templates!');

  // Fetch all blog posts
  const allBlogPosts = await prisma.blogPost.findMany();

  // Seed comments
  const comments = Array.from({ length: 30 }, (_, i) => {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    const randomPost = allBlogPosts[Math.floor(Math.random() * allBlogPosts.length)];
    return {
      content: `This is a comment ${i + 1}.`,
      authorId: randomUser.id,
      blogPostId: randomPost.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await prisma.comment.createMany({
    data: comments,
  });

  console.log('Database seeded with 30 random comments!');

  // Create 30 extra comments specifically on Blog Post 1
  const blogPost1 = await prisma.blogPost.findFirst({
    where: { id: 1 },
  });

  const extraComments = Array.from({ length: 30 }, (_, i) => {
    const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    return {
      content: `This is an extra comment ${i + 1} on Blog Post 1.`,
      authorId: randomUser.id,
      blogPostId: blogPost1.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  await prisma.comment.createMany({
    data: extraComments,
  });

  console.log('Database seeded with 30 extra comments on Blog Post 1!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
