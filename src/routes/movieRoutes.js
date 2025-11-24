import express from 'express';
import { movieController } from '../controllers/movieController.js';
import { authenticate, requireAdmin, validateRequest } from '../utils/auth.js'; //auth.js needs to be moved to middleware after merge
import { movieValidators, idParamValidator } from '../utils/validators.js';

const router = express.Router();

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