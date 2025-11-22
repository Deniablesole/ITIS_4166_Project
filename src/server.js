import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/users.js';
import watchlistRoutes from './routes/watchlists.js';

// Create an Express application instance and set the port number
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware to parse JSON and handle CORS
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

// Error handling middleware for 404 errors and other errors in the application.
// Routes
app.use('/users', userRoutes);
app.use('/watchlists', watchlistRoutes);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use((err, req, res, next) => {
  console.log(err.stack);
  if (!err.status) {
    err.status = 500;
    err.message = 'Internal Server Error';
  }
  res.status(err.status).json({ error: err.message });
});

// Start the server and listen on the specified port. It logs a message to the console when the server is running.
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

// End of File.