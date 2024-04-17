const express = require("express");
const apiRouter = express.Router();
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { JWT_SECRET } = process.env;

// Middleware to set `req.user` if possible
apiRouter.use(async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header("Authorization");
  
    if (!auth) {
      next();
    } else if (auth.startsWith(prefix)) {
      const token = auth.slice(prefix.length);
  
      try {
        const { id } = jwt.verify(token, JWT_SECRET);
  
        if (id) {
          const user = await prisma.user.findUnique({
            where: {
              id: parseInt(id),
            },
          });
  
          if (!user) {
            throw new Error("User not found");
          }
  
          req.user = user;
          next();
        } else {
          next({
            name: "AuthorizationHeaderError",
            message: "Authorization token malformed",
          });
        }
      } catch (error) {
        next(error);
      }
    } else {
      next({
        name: "AuthorizationHeaderError",
        message: `Authorization token must start with ${prefix}`,
      });
    }
});

// Middleware to allow access to articles without authentication
apiRouter.use("/articles", (req, res, next) => {
    next(); // Skip authentication for articles endpoint
});

// Middleware to allow access to contactForm without authentication
apiRouter.use("/contactForm", (req, res, next) => {
    next(); // Skip authentication for contactForm endpoint
});

// Log user if set
apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
  
    next();
});

const articleRouter = require("./articles");
apiRouter.use("/articles", articleRouter);

const imageRouter = require("./imageUpload");
apiRouter.use("/imageUpload", imageRouter);

const projectsRouter = require("./projects");
apiRouter.use("/projects", projectsRouter);

const clientsRouter = require("./clients");
apiRouter.use("/clients", clientsRouter);

const companyDataRouter = require("./companyData");
apiRouter.use("/companyData", companyDataRouter);

const tagsRouter = require("./tags");
apiRouter.use("/tags", tagsRouter);

const contactRouter = require("./contact");
apiRouter.use("/contact", contactRouter);

const contactFormRouter = require("./contactForm");
apiRouter.use("/contactForm", contactFormRouter);

module.exports = apiRouter;
