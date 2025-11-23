import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireOwnership, requireAdmin } from '../middleware/auth.js';

//The purpose of this file is to create a watchlist for a user and allow them to add movies to it. It also allows them to delete movies from it. It also allows them to delete the watchlist itself. It also allows them to update the watchlist name and description. It also allows them to make the watchlist public or private. It also allows them to view all of their watchlists. It also allows them to view a single watchlist and all of its movies.
const router = express.Router();
const prisma = new PrismaClient();

// Get all watchlists for the authenticated user
router.get('/', authenticate, async (req, res, next) => {
  try {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      select: {
        id: true,
        name: true,
        isPublic: true,
        userId: true,
      },
    });

    res.json(watchlists);
  } catch (error) {
    next(error);
  }
});

// Get a single watchlist by ID
router.get('/:id', async (req, res, next) => {
  try {
    const watchlistId = parseInt(req.params.id);

    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
      include: {
        watchlistMovies: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Check if the watchlist exists and if it's public or owned by the authenticated user
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist could not be identified.' });
    }

    // If the watchlist is not public and the user is not the owner, return an error
    if (!watchlist.isPublic && (!req.user || req.user.id !== watchlist.userId)) {
      return res.status(403).json({ error: 'Insufficient Permissions' });
    }

    // Format the response to include only the necessary fields
    const response = {
      id: watchlist.id,
      name: watchlist.name,
      description: watchlist.description,
      isPublic: watchlist.isPublic,
      userId: watchlist.userId,
      createdAt: watchlist.createdAt,
      movies: watchlist.watchlistMovies.map(wm => ({
        id: wm.movie.id,
        title: wm.movie.title,
      })),
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Create a new watchlist
router.post('/', authenticate, [
  body('name').trim().notEmpty().withMessage('The watchlist requires a name inputted.'),
  body('description').optional().trim(),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract the watchlist data from the request body
    const { name, description, isPublic } = req.body;

    // Create the new watchlist in the database with the authenticated user's ID
    const watchlist = await prisma.watchlist.create({
      data: {
        name,
        description: description || null,
        isPublic: isPublic !== undefined ? isPublic : false,
        userId: req.user.id,
      },
    });
    // Return the newly created watchlist as the response
    res.status(201).json(watchlist);
  } catch (error) {
    next(error);
  }
});
  // Update a watchlist by ID
router.put('/:id', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('The name must be inputted'),
  body('description').optional().trim(),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract the watchlist ID from the request parameters
    const watchlistId = parseInt(req.params.id);

    // Find the watchlist in the database by ID
    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist could not be identified.' });
    }

    if (watchlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient Permissions' });
    }

    const { name, description, isPublic } = req.body;

    // Update the watchlist in the database with the new data
    const updatedWatchlist = await prisma.watchlist.update({
      where: { id: watchlistId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
      },
    });
    // Return the updated watchlist as the response
    res.json(updatedWatchlist);
  } catch (error) {
    next(error);
  }
});

// Delete a watchlist by ID (only the owner or an admin can delete a watchlist)
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const watchlistId = parseInt(req.params.id);

    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist could not be identified.' });
    }
    // Check if the authenticated user is the owner of the watchlist or an admin
    if (req.user.role !== 'admin' && watchlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient Permissions' });
    }
    // Delete the watchlist from the database
    await prisma.watchlist.delete({
      where: { id: watchlistId },
    });
    // Return a 204 No Content response
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
  // Add a movie to a watchlist by ID (only the owner can add a movie to a watchlist)
router.post('/:id/movies', authenticate, [
  body('movieId').isInt({ min: 1 }).withMessage('Input a valid movie name.'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract the watchlist ID and movie ID from the request parameters and body
    const watchlistId = parseInt(req.params.id);
    const { movieId } = req.body;

    // Find the watchlist in the database by ID
    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    // Check if the watchlist exists and if the authenticated user is the owner
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist could not be identified.' });
    }

    // Check if the authenticated user is the owner of the watchlist
    if (watchlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient Permissions' });
    }

    // Find the movie in the database by ID
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    // Check if the movie exists
    if (!movie) {
      return res.status(404).json({ error: 'The requested movie could not be found.' });
    }

    // Check if the movie is already in the watchlist
    const existingEntry = await prisma.watchlistMovie.findUnique({
      where: {
        watchlistId_movieId: {
          watchlistId,
          movieId,
        },
      },
    });

    // If the movie is already in the watchlist, return an error response
    if (existingEntry) {
      return res.status(400).json({ error: 'Already watched' });
    }

    // Add the movie to the watchlist in the database with the watchlist ID and movie ID
    const watchlistMovie = await prisma.watchlistMovie.create({
      data: {
        watchlistId,
        movieId,
      },
    });

    // Return the newly created watchlistMovie as the response with a 201 Created status code
    res.status(201).json(watchlistMovie);
  } catch (error) {
    next(error);
  }
});


// Delete a movie from a watchlist by ID (only the owner can delete a movie from a watchlist)
router.delete('/:watchlistId/movies/:movieId', authenticate, async (req, res, next) => {
  try {
    const watchlistId = parseInt(req.params.watchlistId);
    const movieId = parseInt(req.params.movieId);

    const watchlist = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    // Check if the watchlist exists and if the authenticated user is the owner
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist could not be identified.' });
    }

    // Check if the authenticated user is the owner of the watchlist or an admin
    if (req.user.role !== 'admin' && watchlist.userId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient Permissions' });
    }

    // Check if the movie is in the watchlist
    const watchlistMovie = await prisma.watchlistMovie.findUnique({
      where: {
        watchlistId_movieId: {
          watchlistId,
          movieId,
        },
      },
    });

    // If the movie is not in the watchlist, return an error response with a 404 Not Found status code
    if (!watchlistMovie) {
      return res.status(404).json({ error: 'The requested movie was not found.' });
    }
    // Delete the movie from the watchlist in the database with the watchlist ID and movie ID
    await prisma.watchlistMovie.delete({
      where: {
        watchlistId_movieId: {
          watchlistId,
          movieId,
        },
      },
    });
    // Return a 204 No Content response with no content in the body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
  // Export the router as the default export of the module
export default router;

// End of File