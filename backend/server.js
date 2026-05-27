const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const movieRoutes = require('./routes/movies');
const reviewRoutes = require('./routes/reviews');
const errorHandler = require('./middleware/errorHandler');
const Movie = require('./models/Movie');
const Review = require('./models/Review');

async function backfillMovieRatings() {
  const aggregates = await Review.aggregate([
    { $group: { _id: '$movieId', avg: { $avg: '$rating' } } },
  ]);
  const ops = aggregates.map((a) => ({
    updateOne: {
      filter: { _id: a._id },
      update: { averageRating: Math.round(a.avg * 10) / 10 },
    },
  }));
  if (ops.length) await Movie.bulkWrite(ops);
  await Movie.updateMany(
    { _id: { $nin: aggregates.map((a) => a._id) } },
    { averageRating: 0 }
  );
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/netflix_clone';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);

app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      await backfillMovieRatings();
    } catch (err) {
      console.error('Failed to backfill movie ratings:', err.message);
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
