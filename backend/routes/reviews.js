const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { authMiddleware } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { reviewCreateSchema, reviewUpdateSchema, reviewFilterQuery } = require('../middleware/schemas');

const router = express.Router();

async function recalcMovieRating(movieId) {
  if (!movieId) return;
  const [agg] = await Review.aggregate([
    { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
    { $group: { _id: '$movieId', avg: { $avg: '$rating' } } },
  ]);
  await Movie.findByIdAndUpdate(movieId, {
    averageRating: agg ? Math.round(agg.avg * 10) / 10 : 0,
  });
}

router.get('/', authMiddleware, validateQuery(reviewFilterQuery), async (req, res, next) => {
  try {
    const { page, limit, sortBy, order, movieId, userId, minRating } = req.query;

    const filter = {};
    if (movieId) filter.movieId = movieId;
    if (userId) filter.userId = userId;
    if (minRating !== undefined) filter.rating = { $gte: minRating };

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'email')
        .populate('movieId', 'title')
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    res.json({
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'email')
      .populate('movieId', 'title')
      .lean();
    if (!review) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Review not found',
        instance: req.originalUrl,
      });
    }
    res.json(review);
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, validate(reviewCreateSchema), async (req, res, next) => {
  try {
    const review = await Review.create({
      ...req.body,
      userId: req.user.id,
    });
    await recalcMovieRating(review.movieId);
    const populated = await Review.findById(review._id)
      .populate('userId', 'email')
      .populate('movieId', 'title');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, validate(reviewUpdateSchema), async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'email')
      .populate('movieId', 'title');
    if (review) {
      await recalcMovieRating(review.movieId?._id || review.movieId);
    }
    if (!review) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Review not found',
        instance: req.originalUrl,
      });
    }
    res.json(review);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (review) {
      await recalcMovieRating(review.movieId);
    }
    if (!review) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Review not found',
        instance: req.originalUrl,
      });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
