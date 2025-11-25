import express from 'express';
import { reviewController } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { reviewValidators, idParamValidator } from '../utils/validators.js';

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