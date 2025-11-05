import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import workoutRoutes from './routes/workouts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitswap';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("./frontend/dist"));

//mongodb connect
let dbClient;
MongoClient.connect(MONGODB_URI)
  .then(client => {
    dbClient = client;
    const db = client.db();
    console.log('Connected to MongoDB');

    app.locals.db = db;

    app.use('/api/users', userRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/workouts', workoutRoutes);

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
