const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeUser } = require('../auth/middleware');
const prisma = new PrismaClient();
const usersRouter = express.Router();

// Create a new user/client
usersRouter.post('/clients', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, addressId, companyId } = req.body;
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        role: 'CLIENT', // Assuming new users are always clients
        clients: {
          create: {
            firstName,
            lastName,
            email,
            phoneNumber,
            addressId,
            companyId
          }
        }
      },
      include: {
        clients: true
      }
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user/client:', error);
    res.status(500).json({ error: 'An error occurred while creating user/client' });
  }
});

// Get all users/clients
usersRouter.get('/clients', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'An error occurred while fetching clients' });
  }
});

// Get a single user/client by ID
usersRouter.get('/clients/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id: Number(id) } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching client by ID' });
  }
});

// Update a user/client by ID
usersRouter.put('/clients/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, addressId, companyId } = req.body;
    const updatedClient = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        addressId,
        companyId
      }
    });
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'An error occurred while updating client' });
  }
});

// Delete a user/client by ID
usersRouter.delete('/clients/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'An error occurred while deleting client' });
  }
});

// Get user profile and projects
usersRouter.get('/profile', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Retrieve user profile
      const userProfile = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          clients: {
            include: {
              projects: true
            }
          }
        }
      });
  
      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.status(200).json(userProfile);
    } catch (error) {
      console.error('Error retrieving user profile:', error);
      res.status(500).json({ error: 'An error occurred while retrieving user profile' });
    }
  });
  
  // Update user profile
  usersRouter.put('/profile', authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email } = req.body;
  
      // Update user profile
      const updatedUserProfile = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName, email }
      });
  
      res.status(200).json(updatedUserProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'An error occurred while updating user profile' });
    }
  });

module.exports = usersRouter;
