import { movieService } from '../services/movieService.js';

export const movieController = {
  async createMovie(req, res, next) {
    try {
      const movie = await movieService.createMovie(req.body);
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  },

  async getAllMovies(req, res, next) {
    try {
      const filters = {
        title: req.query.title,
        director: req.query.director,
        genre: req.query.genre,
        releaseYear: req.query.releaseYear,
        minRating: req.query.minRating,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      };
      const result = await movieService.getAllMovies(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getMovieById(req, res, next) {
    try {
      const movie = await movieService.getMovieById(req.params.id);
      res.json(movie);
    } catch (error) {
      next(error);
    }
  },

  async updateMovie(req, res, next) {
    try {
      const movie = await movieService.updateMovie(req.params.id, req.body);
      res.json(movie);
    } catch (error) {
      next(error);
    }
  },

  async deleteMovie(req, res, next) {
    try {
      await movieService.deleteMovie(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};