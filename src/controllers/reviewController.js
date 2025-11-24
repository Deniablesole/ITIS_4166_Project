import { reviewService } from '../services/reviewService.js';

export const reviewController = {
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(req.body, req.user.id);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },

  async getAllReviews(req, res, next) {
    try {
      const filters = {
        movieId: req.query.movieId,
        userId: req.query.userId,
      };
      const reviews = await reviewService.getAllReviews(filters);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  },

  async getReviewById(req, res, next) {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  async updateReview(req, res, next) {
    try {
      const review = await reviewService.updateReview(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );
      res.json(review);
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(req, res, next) {
    try {
      const result = await reviewService.deleteReview(
        req.params.id,
        req.user.id,
        req.user.role
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};