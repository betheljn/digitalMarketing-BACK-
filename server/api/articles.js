const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeUser } = require('../auth/middleware');

const prisma = new PrismaClient();
const articleRouter = express.Router();

// Create a new article
articleRouter.post('/', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { title, content, picture, published } = req.body;
    const userId = req.user.id; // Assuming the authenticated user ID is stored in req.user after authentication
    
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        picture,
        published,
        author: { connect: { id: userId } } // Connect the article to the author (user)
      }
    });
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'An error occurred while creating the article' });
  }
});

// Get all articles
articleRouter.get('/', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const articles = await prisma.article.findMany();
    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'An error occurred while fetching articles' });
  }
});

// Get a single article by ID
articleRouter.get('/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id: Number(id) } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching article by ID' });
  }
});

// Update an article by ID
articleRouter.put('/:id', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, picture, published } = req.body;
    const userId = req.user.id; // Assuming the authenticated user ID is stored in req.user after authentication

    // Check if the authenticated user is the author of the article
    const article = await prisma.article.findUnique({ where: { id: Number(id) }, select: { userId: true } });
    if (!article || article.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this article' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        picture,
        published
      }
    });
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'An error occurred while updating article' });
  }
});

// Delete an article by ID
articleRouter.delete('/:id',authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming the authenticated user ID is stored in req.user after authentication

    // Check if the authenticated user is the author of the article
    const article = await prisma.article.findUnique({ where: { id: Number(id) }, select: { userId: true } });
    if (!article || article.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this article' });
    }

    await prisma.article.delete({ where: { id: Number(id) } });
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'An error occurred while deleting article' });
  }
});

module.exports = articleRouter;
