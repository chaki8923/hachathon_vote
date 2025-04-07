import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

enum Role {
  ADMIN = 'ADMIN',
  VOTER = 'VOTER'
}

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  console.log(`Created admin user: ${adminUser.name}`);

  const regularUsers = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        id: randomUUID(),
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        role: Role.VOTER,
      },
    });
    regularUsers.push(user);
    console.log(`Created user: ${user.name}`);
  }

  const projects = [
    {
      name: 'AI-powered Health Assistant',
      teamName: 'Health Hackers',
      description: 'An AI assistant that helps users track their health metrics and provides personalized recommendations.',
      appealPoint: 'Uses machine learning to provide tailored health advice based on user data.',
      demoUrl: 'https://example.com/health-assistant',
      imageUrl: 'https://source.unsplash.com/random/800x600/?health',
    },
    {
      name: 'Sustainable Smart Home',
      teamName: 'Green Tech',
      description: 'An IoT system that optimizes energy usage in homes, reducing carbon footprint while saving money.',
      appealPoint: 'Reduces household energy consumption by up to 30% through smart algorithms.',
      demoUrl: 'https://example.com/smart-home',
      imageUrl: 'https://source.unsplash.com/random/800x600/?home',
    },
    {
      name: 'AR Learning Platform',
      teamName: 'EdTech Innovators',
      description: 'An augmented reality platform that makes learning interactive and engaging for students of all ages.',
      appealPoint: 'Brings textbooks to life with 3D models and interactive exercises.',
      demoUrl: 'https://example.com/ar-learning',
      imageUrl: 'https://source.unsplash.com/random/800x600/?education',
    },
    {
      name: 'Community Marketplace',
      teamName: 'Local Heroes',
      description: 'A platform connecting local producers with consumers, promoting sustainability and community building.',
      appealPoint: 'Reduces food waste and supports local businesses through direct connections.',
      demoUrl: 'https://example.com/marketplace',
      imageUrl: 'https://source.unsplash.com/random/800x600/?market',
    },
    {
      name: 'Virtual Reality Therapy',
      teamName: 'Mind Matters',
      description: 'A VR application designed to help people overcome phobias and anxiety through exposure therapy.',
      appealPoint: 'Clinically tested to reduce anxiety levels by 40% after just 5 sessions.',
      demoUrl: 'https://example.com/vr-therapy',
      imageUrl: 'https://source.unsplash.com/random/800x600/?therapy',
    },
  ];

  for (const projectData of projects) {
    const project = await prisma.project.upsert({
      where: { 
        name_teamName: {
          name: projectData.name,
          teamName: projectData.teamName,
        }
      },
      update: projectData,
      create: {
        id: randomUUID(),
        ...projectData,
      },
    });
    console.log(`Created project: ${project.name} by ${project.teamName}`);
  }

  const now = new Date();
  const weekLater = new Date();
  weekLater.setDate(now.getDate() + 7);

  await prisma.votingPeriod.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const votingPeriod = await prisma.votingPeriod.create({
    data: {
      id: randomUUID(),
      startTime: now,
      endTime: weekLater,
      isActive: true,
    },
  });

  console.log(`Created active voting period: ${votingPeriod.startTime.toISOString()} to ${votingPeriod.endTime.toISOString()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
