const express = require('express');
const contactFormRouter = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Endpoint for creating a contact without authentication
contactFormRouter.post('/contactForm', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the request body for debugging
        const { name, email, phone, message } = req.body.variables;
        console.log('name:', name);
        console.log('email:', email);
        console.log('phone:', phone);
        console.log('message:', message);
        
        const newContact = await prisma.contact.create({
            data: {
                name,
                email,
                message,
                phone,
            }
        });
        res.status(201).json(newContact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'An error occurred while creating the contact' });
    }
});

module.exports = contactFormRouter;

