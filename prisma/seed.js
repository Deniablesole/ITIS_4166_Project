import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@moviewatch.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@moviewatch.com',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('Created admin user:', admin.username);

  // Create regular users
  const user1Password = await bcrypt.hash('user123', 10);
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      username: 'johnDoe45',
      email: 'john@example.com',
      password: user1Password,
      role: 'user',
    },
  });
  console.log('Created user:', user1.username);

  const user2Password = await bcrypt.hash('user123', 10);
  const user2 = await prisma.user.upsert({
    where: { email: 'moviebuff@example.com' },
    update: {},
    create: {
      username: 'movieBuff21',
      email: 'moviebuff@example.com',
      password: user2Password,
      role: 'user',
    },
  });
  console.log('Created user:', user2.username);

  // Create movies
  const movie1 = await prisma.movie.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Goodfellas',
      director: 'Martin Scorsese',
      genre: 'Mafia',
      releaseYear: 1990,
      duration: 145,
      description: 'Henry Hill and his friends work their way up through the mob hierarchy.',
      averageRating: 9.7,
    },
  });
  console.log('Created movie:', movie1.title);

  const movie2 = await prisma.movie.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Taxi Driver',
      director: 'Martin Scorsese',
      genre: 'Thriller',
      releaseYear: 1976,
      duration: 114,
      description: 'A mentally unstable veteran works as a nighttime taxi driver in New York City.',
      averageRating: 8.7,
    },
  });
  console.log('Created movie:', movie2.title);

  const movie3 = await prisma.movie.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: 'A Bronx Tale',
      director: 'Robert De Niro',
      genre: 'Mafia',
      releaseYear: 1993,
      duration: 121,
      description: 'A young man is torn between his own working-class father and a violent local crime boss.',
      averageRating: 9.5,
    },
  });
  console.log('Created movie:', movie3.title);

  const movie4 = await prisma.movie.upsert({
    where: { id: 4 },
    update: {},
    create: {
      title: 'Happy Gilmore',
      director: 'Dennis Dugan',
      genre: 'Comedy',
      releaseYear: 1996,
      duration: 92,
      description: 'A rejected hockey player puts his skills to the golf course to save his grandmother\'s house.',
      averageRating: 8.0,
    },
  });
  console.log('Created movie:', movie4.title);

  // Create reviews
  const review1 = await prisma.review.create({
    data: {
      userId: user1.id,
      movieId: movie1.id,
      rating: 10,
      reviewDescription: 'Best movie ever. A masterpiece of cinema!',
    },
  });
  console.log('Created review for:', movie1.title);

  const review2 = await prisma.review.create({
    data: {
      userId: user2.id,
      movieId: movie2.id,
      rating: 9.7,
      reviewDescription: 'The plot is great. De Niro\'s performance is unforgettable.',
    },
  });
  console.log('Created review for:', movie2.title);

  const review3 = await prisma.review.create({
    data: {
      userId: admin.id,
      movieId: movie3.id,
      rating: 9.5,
      reviewDescription: 'Great coming-of-age story with powerful performances.',
    },
  });
  console.log('Created review for:', movie3.title);

  // Create watchlists
  const watchlist1 = await prisma.watchlist.create({
    data: {
      userId: user1.id,
      name: 'John\'s Favorites',
      description: 'My all-time favorite movies',
      isPublic: true,
    },
  });
  console.log('Created watchlist:', watchlist1.name);

  const watchlist2 = await prisma.watchlist.create({
    data: {
      userId: admin.id,
      name: 'Admin Recommendations',
      description: 'Movies recommended by the admin',
      isPublic: true,
    },
  });
  console.log('Created watchlist:', watchlist2.name);

  // Add movies to watchlists
  await prisma.watchlistMovie.create({
    data: {
      watchlistId: watchlist1.id,
      movieId: movie1.id,
    },
  });

  await prisma.watchlistMovie.create({
    data: {
      watchlistId: watchlist1.id,
      movieId: movie2.id,
    },
  });

  await prisma.watchlistMovie.create({
    data: {
      watchlistId: watchlist2.id,
      movieId: movie3.id,
    },
  });

  await prisma.watchlistMovie.create({
    data: {
      watchlistId: watchlist2.id,
      movieId: movie4.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });