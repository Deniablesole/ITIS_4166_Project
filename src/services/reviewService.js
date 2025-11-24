import { reviewRepository } from '../repositories/reviewRepo.js';
import { movieRepository } from '../repositories/movieRepo.js';

export const reviewService = {
  async createReview(reviewData, userId) {
    // Check if movie exists
    const movie = await movieRepository.findById(reviewData.movieId);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }

    // Check if user already reviewed this movie
    const existingReview = await reviewRepository.findByUserAndMovie(
      userId,
      reviewData.movieId
    );
    if (existingReview) {
      const error = new Error('You have already reviewed this movie');
      error.status = 400;
      throw error;
    }

    const review = await reviewRepository.create({ ...reviewData, userId });
    
    // Update movie's average rating
    await movieRepository.updateAverageRating(reviewData.movieId);
    
    return review;
  },

  async getAllReviews(filters) {
    return await reviewRepository.findAll(filters);
  },

  async getReviewById(id) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }
    return review;
  },

  async updateReview(id, reviewData, userId, userRole) {
    const review = await this.getReviewById(id);
    
    // Check ownership
    if (review.userId !== userId && userRole !== 'admin') {
      const error = new Error('Unauthorized to update this review');
      error.status = 403;
      throw error;
    }

    const updatedReview = await reviewRepository.update(id, reviewData);
    
    // Update movie's average rating
    await movieRepository.updateAverageRating(review.movieId);
    
    return updatedReview;
  },

  async deleteReview(id, userId, userRole) {
    const review = await this.getReviewById(id);
    
    // Check ownership or admin role
    if (review.userId !== userId && userRole !== 'admin') {
      const error = new Error('Unauthorized to delete this review');
      error.status = 403;
      throw error;
    }

    const movieId = review.movieId;
    await reviewRepository.delete(id);
    
    // Update movie's average rating
    await movieRepository.updateAverageRating(movieId);
    
    return { message: 'Review deleted successfully' };
  },
};