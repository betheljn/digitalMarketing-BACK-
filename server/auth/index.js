const router = require("express").Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { authenticateUser, authorizeUser } = require("./middleware");
const { generateVerificationToken } = require("./verificationToken");

router.post("/register", async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const verificationToken = generateVerificationToken();
  
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
      });
  
      res.status(201).send({ newUser, message: "New Account Created" });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'An error occurred while registering the user' });
    }
});

router.post("/register/admin", async (req, res, next) => {
  try {
      const { username, password, email, firstName, lastName } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationToken = generateVerificationToken();

      const newAdmin = await prisma.user.create({
          data: {
              firstName,
              lastName,
              email,
              password: hashedPassword,
              role: "ADMIN",
          },
      });

      res.status(201).send({ newAdmin, message: "New Admin Account Created" });
  } catch (error) {
      console.error('Error registering admin:', error);
      res.status(500).json({ error: 'An error occurred while registering the admin' });
  }
});

router.post("/login", async (req, res, next) => {
  try {
      const { email, password } = req.body;

      // Retrieve user from the database
      const user = await prisma.user.findUnique({
          where: { email },
      });

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Passwords match, generate JWT token
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

      // Send token and user data in response
      res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'An error occurred while logging in' });
  }
});


router.post("/logout", authenticateUser, async (req, res) => {
    try {
        // For logout, you can simply clear the token stored on the client side
        // This will effectively log the user out as they won't be able to make authenticated requests anymore
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ error: "An error occurred while logging out" });
    }
});

// User profile route
router.get("/profile", authenticateUser, async (req, res) => {
    try {
      // Retrieve user profile based on the authenticated user's ID
      const userProfile = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
  
      res.status(200).json({ userProfile });
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      res.status(500).json({ error: "An error occurred while retrieving user profile" });
    }
  });

// Admin route to retrieve their profile
router.get("/admin/profile", authenticateUser, authorizeUser(["ADMIN"]), async (req, res) => {
    try {
      // Retrieve admin user from the database based on the user ID stored in the JWT token
      const adminId = req.user.id; // Assuming the user ID is stored in the req.user object after authentication
      const admin = await prisma.user.findUnique({
        where: {
          id: adminId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });
  
      res.status(200).json({ admin });
    } catch (error) {
      console.error("Error retrieving admin profile:", error);
      res.status(500).json({ error: "An error occurred while retrieving admin profile" });
    }
  });

module.exports = router;