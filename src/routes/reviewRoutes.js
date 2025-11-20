import express from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { authenticate, validateRequest } from '../utils/auth.js'; //auth.js needs to be moved to middleware after merge
import { reviewValidators, idParamValidator } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.get('/', reviewController.getAllReviews);

// Authenticated routes
router.post(
  '/',
  authenticate,
  reviewValidators.create,
  validateRequest,
  reviewController.createReview
);

router.put(
  '/:id',
  authenticate,
  idParamValidator,
  reviewValidators.update,
  validateRequest,
  reviewController.updateReview
);

router.delete(
  '/:id',
  authenticate,
  idParamValidator,
  validateRequest,
  reviewController.deleteReview
);

export default router;