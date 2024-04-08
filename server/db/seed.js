const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
    console.log("Seeding the Database.");
   
    const user1 = await prisma.user.create({
        data: {
          email: 'user1@example.com',
          password: 'password1',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CLIENT'
        }
      });
    
      // Seed address
      const address1 = await prisma.address.create({
        data: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          state: 'NY',
          country: 'USA'
        }
      });
    
      // Seed company
      const company1 = await prisma.company.create({
        data: {
          name: 'Acme Corporation',
          industry: 'Marketing',
          website: 'https://www.acmecorp.com',
          size: 'Large'
        }
      });
    
      // Seed client
      const client1 = await prisma.client.create({
        data: {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          phoneNumber: '555-1234',
          addressId: address1.id,
          companyId: company1.id,
          userId: user1.id
        }
      });
    
      console.log('Seeding completed!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
