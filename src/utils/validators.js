import { body, query, param } from 'express-validator';

export const movieValidators = {
  create: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('director').trim().notEmpty().withMessage('Director is required'),
    body('genre').trim().notEmpty().withMessage('Genre is required'),
    body('releaseYear')
      .isInt({ min: 1800, max: new Date().getFullYear() + 5 })
      .withMessage('Valid release year is required'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],

  update: [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('director').optional().trim().notEmpty().withMessage('Director cannot be empty'),
    body('genre').optional().trim().notEmpty().withMessage('Genre cannot be empty'),
    body('releaseYear')
      .optional()
      .isInt({ min: 1800, max: new Date().getFullYear() + 5 })
      .withMessage('Valid release year is required'),
    body('duration')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Duration must be a positive integer'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description cannot be empty'),
  ],

  query: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('releaseYear')
      .optional()
      .isInt({ min: 1800 })
      .withMessage('Valid release year is required'),
    query('minRating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Rating must be between 0 and 10'),
  ],
};

export const reviewValidators = {
  create: [
    body('movieId').isInt({ min: 1 }).withMessage('Valid movie ID is required'),
    body('rating')
      .isFloat({ min: 0, max: 10 })
      .withMessage('Rating must be between 0 and 10'),
    body('reviewDescription')
      .trim()
      .notEmpty()
      .withMessage('Review description is required'),
  ],

  update: [
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Rating must be between 0 and 10'),
    body('reviewDescription')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Review description cannot be empty'),
  ],
};

export const idParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required'),
];