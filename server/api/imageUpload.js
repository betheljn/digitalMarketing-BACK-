const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const imageRouter = express.Router();

// Define storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit file size to 5MB
}).single('file');

// Route for handling file uploads
imageRouter.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ error: 'An error occurred while uploading file' });
    }
    // File uploaded successfully
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
  });
});

// Route for fetching uploaded files
imageRouter.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/', filename);
  if (fs.existsSync(filePath)) {
    res.status(200).sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Route for deleting uploaded files
imageRouter.delete('/files/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/', filename);
  try {
    // Delete file from disk
    fs.unlinkSync(filePath);
    // Optionally, update the article or project in the database to remove the file association
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'An error occurred while deleting file' });
  }
});

// Route for associating uploaded file with an article
imageRouter.put('/articles/:articleId/upload', async (req, res) => {
  const { articleId } = req.params;
  const { filename } = req.file; // Assuming filename is stored in req.file
  try {
    const updatedArticle = await prisma.article.update({
      where: { id: Number(articleId) },
      data: { picture: filename } // Assuming 'picture' is the field in the Article model to store the file path
    });
    res.status(200).json(updatedArticle);
  } catch (error) {
    console.error('Error updating article with file:', error);
    res.status(500).json({ error: 'An error occurred while updating article with file' });
  }
});

// Route for associating uploaded file with a project
imageRouter.put('/projects/:projectId/upload', async (req, res) => {
  const { projectId } = req.params;
  const { filename } = req.file; // Assuming filename is stored in req.file
  try {
    const updatedProject = await prisma.project.update({
      where: { id: Number(projectId) },
      data: { picture: filename } // Assuming 'picture' is the field in the Project model to store the file path
    });
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error updating project with file:', error);
    res.status(500).json({ error: 'An error occurred while updating project with file' });
  }
});

module.exports = imageRouter;
