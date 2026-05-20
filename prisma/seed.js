const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean up existing database tables
  // Delete projects first, cascade will handle tasks
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing database tables cleared.');

  // 2. Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const memberPasswordHash = await bcrypt.hash('member123', 10);

  // 3. Create users
  console.log('👥 Creating mock users...');
  
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const jane = await prisma.user.create({
    data: {
      name: 'Jane Member',
      email: 'jane@example.com',
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Member',
      email: 'bob@example.com',
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
    },
  });

  console.log(`✅ Users created: \n - ${admin.email} (Admin)\n - ${jane.email} (Member)\n - ${bob.email} (Member)`);

  // 4. Create projects
  console.log('📁 Creating mock projects...');
  
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete visual and structural overhaul of the corporate marketing website, moving to Next.js and Tailwind CSS.',
      createdById: admin.id,
      members: {
        connect: [{ id: admin.id }, { id: jane.id }, { id: bob.id }],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'Building the companion iOS and Android application to enable on-the-go notifications and task updates.',
      createdById: admin.id,
      members: {
        connect: [{ id: admin.id }, { id: jane.id }],
      },
    },
  });

  console.log(`✅ Projects created:\n - ${project1.name}\n - ${project2.name}`);

  // 5. Create tasks
  console.log('📋 Creating mock tasks...');
  
  const now = new Date();
  
  const soon = new Date();
  soon.setDate(now.getDate() + 3);

  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const lastWeek = new Date();
  lastWeek.setDate(now.getDate() - 7);

  // Project 1 Tasks
  await prisma.task.create({
    data: {
      title: 'Develop Landing Page Hero UI',
      description: 'Build the interactive canvas and glassmorphic buttons for the new marketing hero section.',
      status: 'IN_PROGRESS',
      dueDate: soon,
      projectId: project1.id,
      assigneeId: jane.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Setup JWT Authentication APIs',
      description: 'Write register, login, and middleware access endpoints utilizing bcryptjs and jose cookies.',
      status: 'TODO',
      dueDate: nextWeek,
      projectId: project1.id,
      assigneeId: bob.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Configure PostgreSQL Database Schema',
      description: 'Setup Prisma ORM models and run primary migration on the local PostgreSQL database server.',
      status: 'DONE',
      dueDate: yesterday,
      projectId: project1.id,
      assigneeId: admin.id,
    },
  });

  // Project 2 Tasks
  await prisma.task.create({
    data: {
      title: 'Figma Interaction Prototypes',
      description: 'Design mobile interface viewports and dynamic drag sheets for task boards.',
      status: 'DONE',
      dueDate: lastWeek,
      projectId: project2.id,
      assigneeId: jane.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Integrate Native Push Notifications',
      description: 'Configure APNS and FCM hooks to notify members of task assignments in real time.',
      status: 'TODO',
      dueDate: yesterday, // Overdue task!
      projectId: project2.id,
      assigneeId: jane.id,
    },
  });

  console.log('✅ Mock tasks populated successfully.');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
