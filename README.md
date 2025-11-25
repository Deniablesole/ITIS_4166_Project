# ITIS_4166 Project - Habit & Movie Tracker API

## Setup

1. **Clone the repository**
```bash
git clone https://github.com/YourUsername/ITIS_4166_Project.git
cd ITIS_4166_Project
```

2. **Install dependencies**
```bash
npm install
```

3. **Generate Prisma client**
```bash
npx prisma generate
```

4. **Environment variables**
Create a .env file in the root directory for local development:
```.env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
```
### Generating a JWT Secret Key

This application requires a secret key to sign JWT tokens (`JWT_SECRET`). You can generate one by running:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and use it as your JWT_SECRET in .env

5. **Database setup**
- Set up PostgreSQL locally.
- Run migrations to create tables:
```bash
npx prisma migrate dev --name init
```
- Optional: Seed the database
```bash
node prisma/seed.js
```

6. **Running locally**
```bash
npm run dev
```
Server will run at: http://localhost:3000
Swagger docs are available at: http://localhost:3000/docs