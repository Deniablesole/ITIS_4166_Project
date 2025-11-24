import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const reviewRepository = {
  // Create a review
  async create(reviewData) {
    return await prisma.review.create({
      data: reviewData,
      include: {
        user: {
          select: { id: true, username: true },
        },
        movie: {
          select: { id: true, title: true },
        },
      },
    });
  },

  // Get all reviews with optional filters
  async findAll(filters = {}) {
    const { movieId, userId } = filters;
    
    const where = {};
    if (movieId) where.movieId = parseInt(movieId);
    if (userId) where.userId = parseInt(userId);

    return await prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true },
        },
        movie: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // Get a single review by ID
  async findById(id) {
    return await prisma.review.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, username: true },
        },
        movie: {
          select: { id: true, title: true },
        },
      },
    });
  },

  // Update a review
  async update(id, reviewData) {
    return await prisma.review.update({
      where: { id: parseInt(id) },
      data: reviewData,
      include: {
        user: {
          select: { id: true, username: true },
        },
        movie: {
          select: { id: true, title: true },
        },
      },
    });
  },

  // Delete a review
  async delete(id) {
    return await prisma.review.delete({
      where: { id: parseInt(id) },
    });
  },

  // Check if user has already reviewed a movie
  async findByUserAndMovie(userId, movieId) {
    return await prisma.review.findFirst({
      where: {
        userId: parseInt(userId),
        movieId: parseInt(movieId),
      },
    });
  },
};