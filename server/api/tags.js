const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const tagsRouter = express.Router();
const { authenticateUser, authorizeUser } = require('../auth/middleware');

// Get all tags
tagsRouter.get('/', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany();
    res.status(200).json(tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: 'An error occurred while getting tags' });
  }
});

tagsRouter.get('/:articleId', async (req, res) => {
    try {
      const { articleId } = req.params;
      const tags = await prisma.tag.findMany({
        where: {
          articles: { some: { id: parseInt(articleId) } },
        },
      });
      res.status(200).json(tags);
    } catch (error) {
      console.error('Error getting tags for article:', error);
      res.status(500).json({ error: 'An error occurred while getting tags for the article' });
    }
  });

// Create a new tag
tagsRouter.post('/', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { name } = req.body;
    const newTag = await prisma.tag.create({
      data: { name },
    });
    res.status(201).json(newTag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'An error occurred while creating the tag' });
  }
});


// Delete an existing tag
tagsRouter.delete('/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tag.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'An error occurred while deleting the tag' });
  }
});

// Remove tags associated with a specific article
tagsRouter.delete('/:articleId', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
    try {
      const { articleId } = req.params;
      const { tagIds } = req.body;
      const article = await prisma.article.update({
        where: { id: parseInt(articleId) },
        data: {
          tags: {
            disconnect: tagIds.map((tagId) => ({ id: parseInt(tagId) })),
          },
        },
        include: { tags: true },
      });
      res.status(200).json(article);
    } catch (error) {
      console.error('Error removing tags from article:', error);
      res.status(500).json({ error: 'An error occurred while removing tags from the article' });
    }
  });

module.exports = tagsRouter;
