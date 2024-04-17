const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateUser, authorizeUser } = require('../auth/middleware');

const prisma = new PrismaClient();
const articleRouter = express.Router();

// Create a new article
articleRouter.post('/', authenticateUser, authorizeUser(['ADMIN']), async (req, res) => {
  try {
    const { title, content, picture, published, tags } = req.body;
    const userId = req.user.id; // Assuming the authenticated user ID is stored in req.user after authentication

    // Create an array to store tag objects
    const tagObjects = [];

    // Iterate over the tags array
    for (const tagName of tags) {
      // Check if the tag already exists in the database
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagName }
      });

      // If the tag doesn't exist, create it
      if (!existingTag) {
        const newTag = await prisma.tag.create({
          data: { name: tagName }
        });
        // Push the newly created tag object to the array
        tagObjects.push({ id: newTag.id });
      } else {
        // If the tag already exists, push its id to the array
        tagObjects.push({ id: existingTag.id });
      }
    }

    // Create the new article with the associated tags
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        picture,
        published,
        tags: { connect: tagObjects }, // Connect the article to the existing or newly created tags
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
articleRouter.get('/', async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: {
        tags: true }
    });
    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'An error occurred while fetching articles' });
  }
});

// Get related articles by article ID
articleRouter.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ 
      where: { id: Number(id) },
      include: { tags: true }, // Include associated tags
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Find related articles based on tags
    let relatedArticles = await prisma.article.findMany({
      where: {
        tags: {
          some: {
            id: {
              in: article.tags.map(tag => tag.id),
            },
          },
        },
        id: {
          not: article.id, // Exclude the current article
        },
      },
      take: 3, // Limit the number of related articles to 5
    });

    // If no related articles are found, fallback to retrieving the newest articles
    if (relatedArticles.length === 0) {
      relatedArticles = await prisma.article.findMany({
        where: {
          id: { not: article.id }, // Exclude the current article
        },
        orderBy: { createdAt: 'desc' }, // Order by newest articles
        take: 3, // Limit the number of articles
      });
    }

    res.status(200).json(relatedArticles);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    res.status(500).json({ error: 'An error occurred while fetching related articles' });
  }
});

// Route for fetching random featured articles
articleRouter.get('/featured', async (req, res) => {
  try {
    // Fetch all articles from the database
    const allArticles = await prisma.article.findMany();

    // Randomly select a subset of articles to be featured (e.g., 3 articles)
    const featuredArticles = getRandomSubset(allArticles, 3);

    res.status(200).json(featuredArticles);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    res.status(500).json({ error: 'An error occurred while fetching featured articles' });
  }
});

// Helper function to get a random subset of an array
function getRandomSubset(array, size) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}


// Get a single article by ID
articleRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ 
      where: { id: Number(id) },
    include: {
      tags: true } 
    });

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
    const { title, content, picture, published, tags } = req.body;
    const userId = req.user.id; // Assuming the authenticated user ID is stored in req.user after authentication

    // Check if the authenticated user is the author of the article
    const article = await prisma.article.findUnique({ where: { id: Number(id) }, select: { userId: true } });
    if (!article || article.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this article' });
    }

    // Convert tags to an array of TagWhereUniqueInput objects
    const tagObjects = await Promise.all(tags.map(async tagName => {
      // Check if the tag already exists in the database
      const existingTag = await prisma.tag.findUnique({
        where: { name: tagName }
      });

      // If the tag doesn't exist, return null
      if (!existingTag) {
        return null;
      } else {
        // If the tag exists, return its unique identifier
        return { id: existingTag.id };
      }
    }));

    // Update the article with the new data, including the new tags
    const updatedArticle = await prisma.article.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        picture,
        published,
        tags: {
          set: tagObjects.filter(tag => tag !== null), // Filter out null values (non-existing tags)
        },
      },
      include: {
        tags: true, // Include the updated tags in the response
      },
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
