const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const contactRouter = express.Router();

// Create a new contact
contactRouter.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
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

// Get all contacts
contactRouter.get('/', async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany();
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'An error occurred while fetching contacts' });
    }
});

// Get a single contact by ID
contactRouter.get('/:id', async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        const contact = await prisma.contact.findUnique({
            where: { id: contactId }
        });
        if (!contact) {
            res.status(404).json({ error: 'Contact not found' });
            return;
        }
        res.status(200).json(contact);
    } catch (error) {
        console.error('Error fetching contact by ID:', error);
        res.status(500).json({ error: 'An error occurred while fetching contact by ID' });
    }
});

// Delete a contact by ID
contactRouter.delete('/:id', async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        await prisma.contact.delete({
            where: { id: contactId }
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting contact by ID:', error);
        res.status(500).json({ error: 'An error occurred while deleting contact by ID' });
    }
});

// Update a contact by ID
contactRouter.put('/:id', async (req, res) => {
    try {
        const contactId = parseInt(req.params.id);
        const { name, email, phone, message, contacted, adminNotes } = req.body;
        
        const updatedContact = await prisma.contact.update({
            where: { id: contactId },
            data: {
                name,
                email,
                phone,
                message,
                contacted,
                adminNotes
            }
        });

        res.status(200).json(updatedContact);
    } catch (error) {
        console.error('Error updating contact by ID:', error);
        res.status(500).json({ error: 'An error occurred while updating contact by ID' });
    }
});



module.exports = contactRouter;

