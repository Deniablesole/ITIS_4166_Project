import express from 'express';
import { movieController } from '../controllers/movieController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { movieValidators, idParamValidator } from '../utils/validators.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Public routes
router.get('/', movieValidators.query, validateRequest, movieController.getAllMovies);
router.get('/:id', idParamValidator, validateRequest, movieController.getMovieById);

// Admin only routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  movieValidators.create,
  validateRequest,
  movieController.createMovie
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  idParamValidator,
  movieValidators.update,
  validateRequest,
  movieController.updateMovie
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  idParamValidator,
  validateRequest,
  movieController.deleteMovie
);

export default router;