const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("Seeding the Database.");

    // Seed users
    const user1 = await prisma.user.create({
      data: {
        email: 'user1@example.com',
        password: 'password1',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT'
      }
    });

    // Seed company data
    const companyData1 = await prisma.companyData.create({
      data: {
        companyName: 'Example Company',
        industry: 'Technology',
        website: 'https://example.com',
        size: 'Large',
        street: '123 Main St',
        city: 'New York',
        zipCode: '10001',
        state: 'NY',
        country: 'USA',
        foundedYear: 2000,
        revenue: 1000000,
        description: 'This is a sample company',
        services: ['Service1', 'Service2'],
        budget: 500000,
        marketingChannels: ['Channel1', 'Channel2'],
        targetAudience: 'Target audience description',
        competitors: ['Competitor1', 'Competitor2']
      }
    });

    // Seed client
    const client1 = await prisma.client.create({
      data: {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        phoneNumber: '555-1234',
        companyDataId: companyData1.id,
        userId: user1.id
      }
    });

    // Seed projects, articles, services, etc.

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error seeding the database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});

