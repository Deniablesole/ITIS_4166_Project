import { movieRepository } from '../repositories/movieRepo.js';

export const movieService = {
  async createMovie(movieData) {
    return await movieRepository.create(movieData);
  },

  async getAllMovies(filters) {
    return await movieRepository.findAll(filters);
  },

  async getMovieById(id) {
    const movie = await movieRepository.findById(id);
    if (!movie) {
      const error = new Error('Movie not found');
      error.status = 404;
      throw error;
    }
    return movie;
  },

  async updateMovie(id, movieData) {
    await this.getMovieById(id); // Check if movie exists
    return await movieRepository.update(id, movieData);
  },

  async deleteMovie(id) {
    await this.getMovieById(id); // Check if movie exists
    return await movieRepository.delete(id);
  },
};