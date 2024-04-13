const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeUser } = require('../auth/middleware');

const prisma = new PrismaClient();
const projectsRouter = express.Router();

// Create a new project
projectsRouter.post('/', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { name, description, clientId, startDate, endDate, status } = req.body;
    
    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        client: { connect: { id: clientId } }, // Connect the project to the client
        startDate,
        endDate,
        status
      }
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'An error occurred while creating the project' });
  }
});

// Get all projects
projectsRouter.get('/projects', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const projects = await prisma.project.findMany();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'An error occurred while fetching projects' });
  }
});

// Get a single project by ID
projectsRouter.get('/projects/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id: Number(id) } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching project by ID' });
  }
});

// Update a project by ID
projectsRouter.put('/projects/:id', authenticateUser, authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, clientId, startDate, endDate, status } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        client: { connect: { id: clientId } }, // Connect the project to the client
        startDate,
        endDate,
        status
      }
    });
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'An error occurred while updating project' });
  }
});

// Delete a project by ID
projectsRouter.delete('/projects/:id', authenticateUser, authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'An error occurred while deleting project' });
  }
});

module.exports = projectsRouter;
