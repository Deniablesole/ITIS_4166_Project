import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const movieRepository = {
  // Create a new movie
  async create(movieData) {
    return await prisma.movie.create({
      data: movieData,
    });
  },

  // Get all movies with optional filters
  async findAll(filters = {}) {
    const { title, director, genre, releaseYear, minRating, page = 1, limit = 10 } = filters;
    
    const where = {};
    
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }
    if (director) {
      where.director = { contains: director, mode: 'insensitive' };
    }
    if (genre) {
      where.genre = { contains: genre, mode: 'insensitive' };
    }
    if (releaseYear) {
      where.releaseYear = parseInt(releaseYear);
    }
    if (minRating) {
      where.averageRating = { gte: parseFloat(minRating) };
    }

    const skip = (page - 1) * limit;
    
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.movie.count({ where }),
    ]);

    return {
      movies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Get a single movie by ID
  async findById(id) {
    return await prisma.movie.findUnique({
      where: { id: parseInt(id) },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
      },
    });
  },

  // Update a movie
  async update(id, movieData) {
    return await prisma.movie.update({
      where: { id: parseInt(id) },
      data: movieData,
    });
  },

  // Delete a movie
  async delete(id) {
    return await prisma.movie.delete({
      where: { id: parseInt(id) },
    });
  },

  // Update average rating
  async updateAverageRating(movieId) {
    const result = await prisma.review.aggregate({
      where: { movieId: parseInt(movieId) },
      _avg: { rating: true },
    });

    return await prisma.movie.update({
      where: { id: parseInt(movieId) },
      data: { averageRating: result._avg.rating },
    });
  },
};