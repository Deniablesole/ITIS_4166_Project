import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/users.js';
import movieRoutes from './routes/movieRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import watchlistRoutes from './routes/watchlists.js';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const app = express();
const PORT = process.env.PORT || 3000;


// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Swagger documentation
const swaggerFile = fs.readFileSync(join(__dirname, '../swagger.yaml'), 'utf8');
const swaggerDocument = yaml.parse(swaggerFile);


app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());

// Swagger documentation route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Routes
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/watchlists', watchlistRoutes);

app.get('/', (req, res) => {
  res.send('MovieWatch API is running. Visit /api/docs for documentation.');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err.stack);
  if (!err.status) {
    console.log(err.stack);
    err.status = 500;
    err.message = 'Internal Server Error';
  }
  res.status(err.status).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
