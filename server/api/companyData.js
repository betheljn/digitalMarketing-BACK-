// Import the necessary modules and dependencies
const express = require('express');
const { PrismaClient } = require('@prisma/client');

// Create an instance of the PrismaClient
const prisma = new PrismaClient();

// Create a new Express router
const companyDataRouter = express.Router();

// POST /api/companydata - Create a new company data entry
companyDataRouter.post('/', async (req, res) => {
  try {
    const {
      companyName,
      industry,
      website,
      size,
      street,
      city,
      zipCode,
      state,
      country,
      foundedYear,
      revenue,
      description,
      services,
      budget,
      marketingChannels,
      targetAudience,
      competitors,
    } = req.body;

    const newCompanyData = await prisma.companyData.create({
      data: {
        companyName,
        industry,
        website,
        size,
        street,
        city,
        zipCode,
        state,
        country,
        foundedYear,
        revenue,
        description,
        services: { set: services },
        budget,
        marketingChannels: { set: marketingChannels },
        targetAudience,
        competitors: { set: competitors },
      },
    });

    res.status(201).json(newCompanyData);
  } catch (error) {
    console.error('Error creating company data:', error);
    res.status(500).json({ error: 'An error occurred while creating company data' });
  }
});

// GET /api/companydata - Retrieve all company data entries
companyDataRouter.get('/companies', async (req, res) => {
  try {
    const companyData = await prisma.companyData.findMany();
    res.status(200).json(companyData);
  } catch (error) {
    console.error('Error retrieving company data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving company data' });
  }
});

// GET /api/companydata/:id - Retrieve a specific company data entry by ID
companyDataRouter.get('/companies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const companyData = await prisma.companyData.findUnique({
      where: { id: Number(id) },
    });
    if (!companyData) {
      res.status(404).json({ error: 'Company data not found' });
    } else {
      res.status(200).json(companyData);
    }
  } catch (error) {
    console.error('Error retrieving company data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving company data' });
  }
});

// PUT /api/companydata/:id - Update an existing company data entry
companyDataRouter.put('/companies/:id', async (req, res) => {
  const { id } = req.params;
  const updatedCompanyData = req.body;
  try {
    const companyData = await prisma.companyData.update({
      where: { id: Number(id) },
      data: updatedCompanyData,
    });
    res.status(200).json(companyData);
  } catch (error) {
    console.error('Error updating company data:', error);
    res.status(500).json({ error: 'An error occurred while updating company data' });
  }
});

// DELETE /api/companydata/:id - Delete a company data entry by ID
companyDataRouter.delete('/companies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.companyData.delete({
      where: { id: Number(id) },
    });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting company data:', error);
    res.status(500).json({ error: 'An error occurred while deleting company data' });
  }
});

// Export the router for use in the main application
module.exports = companyDataRouter;
