import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin, requireOwnership } from '../middleware/auth.js';

// This file contains the routes for user management and authentication.
const router = express.Router();
const prisma = new PrismaClient();

// Get all users (admin only) - This route is protected and only accessible to users with the 'admin' role.
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get a single user by ID - This route is protected and only accessible to the user themselves or an admin.
router.get('/:id', authenticate, requireOwnership((req) => parseInt(req.params.id)), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    // Check if the user exists and return a 404 error if not.
    if (!user) {
      return res.status(404).json({ error: 'User is not in database.' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Register a new user - This route allows anyone to register a new user. It validates the input data and checks if the username or email is already taken.
router.post('/register', [
  body('username').trim().notEmpty().withMessage('Input a Username, it is required'),
  body('email').isEmail().withMessage('Please input a valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Input your password with 6 or more characters.'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract the username, email, and password from the request body.
    const { username, email, password } = req.body;

    // Check if the username or email is already taken. If so, return a 400 error.
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    // This is a simple check to see if the user already exists in the database. If they do, return a 400 error. If not, create a new user and return the user data.
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use.' });
    }

    // Hash the password using bcrypt and create a new user in the database.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database and return the user data.
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'user',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Return the user data and a 201 status code.
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Login a user - This route allows users to log in with their email and password. It validates the input data and checks if the user exists and the password is correct. If so, it returns a JWT token.
router.post('/login', [
  body('email').isEmail().withMessage('Please input a valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract the email and password from the request body.
    const { email, password } = req.body;

    // Check if the user exists and the password is correct. If not, return a 401 error.
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // This is a simple check to see if the user exists in the database. If they do, check if the password is correct. If not, return a 401 error. If so, return a JWT token.
    if (!user) {
      return res.status(401).json({ error: 'Username or Passwrod is incorrect.' });
    }

    // Check if the password is correct using bcrypt. If not, return a 401 error. If so, return a JWT token.
    const isValidPassword = await bcrypt.compare(password, user.password);

    // This is a simple check to see if the password is correct. If not, return a 401 error. If so, return a JWT token.
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Username or Passwrod is incorrect.' });
    }

    // Generate a JWT token and return it in the response.
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// Update a user - This route allows users to update their own data. It validates the input data and checks if the username or email is already taken. If not, it updates the user data and returns the updated user data.
router.put('/:id', authenticate, requireOwnership((req) => parseInt(req.params.id)), [
  body('username').optional().trim().notEmpty().withMessage('Username cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract the user ID from the request parameters and the username and email from the request body.
    const userId = parseInt(req.params.id);
    const { username, email } = req.body;

    // Check if the user exists and the username or email is already taken. If so, return a 400 error. If not, update the user data and return the updated user data.
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    // This is a simple check to see if the user exists in the database. If they do, check if the username or email is already taken. If so, return a 400 error. If not, update the user data and return
    if (!existingUser) {
      return res.status(404).json({ error: 'User is not within the database' });
    }

    // Check if the username or email is already taken. If so, return a 400 error. If not, update the user data and return the updated user data.
    if (username || email) {
      const conflictingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                username ? { username } : {},
                email ? { email } : {},
              ],
            },
          ],
        },
      });

      // This is a simple check to see if the username or email is already taken. If so, return a 400 error. If not, update the user data and return the updated user data.
      if (conflictingUser) {
        return res.status(400).json({ error: 'User is not within the database' });
      }
    }

    // Update the user data and return the updated user data.
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(email && { email }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete a user - This route allows users to delete their own account. It checks if the user exists and deletes the user data.
router.delete('/:id', authenticate, requireOwnership((req) => parseInt(req.params.id)), async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if the user exists and delete the user data. If not, return a 404 error. If so, return a 204 status code.
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User is not within the database' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

//End of File.