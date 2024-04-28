const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeUser } = require('../auth/middleware');
const prisma = new PrismaClient();
const clientsRouter = express.Router();

// Create a new client
clientsRouter.post('/', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, companyDataId } = req.body;
    const userId = req.user.id
    const newClient = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        companyData: { connect: { id: companyDataId } },
        user: { connect: { id: userId } }
      }
    });
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'An error occurred while creating client' });
  }
});

// Get all clients
clientsRouter.get('/', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'An error occurred while fetching clients' });
  }
});

// Get a single client by ID
clientsRouter.get('/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id: parseInt(id) } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching client by ID' });
  }
});

// Get data of the signed-in client
clientsRouter.get('/me', authenticateUser, authorizeUser(['CLIENT']), async (req, res) => {
  try {
    const userId = req.user.id;
    console.log
    const client = await prisma.client.findFirst({ where: { userId } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).json({ error: 'An error occurred while fetching client data' });
  }
});

// Update a client by ID
clientsRouter.put('/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phoneNumber, companyDataId } = req.body;
    const updatedClient = await prisma.client.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        companyDataId
      }
    });
    res.status(200).json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'An error occurred while updating client' });
  }
});

// Delete a client by ID
clientsRouter.delete('/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'An error occurred while deleting client' });
  }
});

module.exports = clientsRouter;

