import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import watchlistRoutes from './routes/watchlists.js';
import userRoutes from './routes/users.js';

// Create an Express application instance and set the port number
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and handle CORS
app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

// Define routes for users and watchlists and use them in the application
app.use('/users', userRoutes);
app.use('/watchlists', watchlistRoutes);

// Error handling middleware for 404 errors and other errors in the application.
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handling middleware for other errors in the application. It logs the error stack and sends a JSON response with the error message.
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