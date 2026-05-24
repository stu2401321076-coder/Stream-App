const express = require('express');
const path = require('path');
const fs = require('fs');
const Movie = require('../models/Movie');
const { authMiddleware, adminMiddleware, streamAuthMiddleware, generateShortLivedStreamToken } = require('../middleware/auth');
const { validate, validateQuery } = require('../middleware/validate');
const { movieCreateSchema, movieUpdateSchema, movieFilterQuery } = require('../middleware/schemas');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', authMiddleware, validateQuery(movieFilterQuery), async (req, res, next) => {
  try {
    const { page, limit, sortBy, order, title, minRating } = req.query;

    const filter = {};
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
    if (minRating !== undefined) {
      filter.averageRating = { $gte: minRating };
    }

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [movies, total] = await Promise.all([
      Movie.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Movie.countDocuments(filter),
    ]);

    res.json({
      data: movies,
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
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Movie not found',
        instance: req.originalUrl,
      });
    }
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

router.post('/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
  ]),
  validate(movieCreateSchema),
  async (req, res, next) => {
    try {
      const movieData = { ...req.body };
      if (req.files?.video?.[0]) {
        movieData.videoFilePath = req.files.video[0].path;
      }
      if (req.files?.poster?.[0]) {
        movieData.posterImage = req.files.poster[0].path;
      }
      const movie = await Movie.create(movieData);
      res.status(201).json(movie);
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'poster', maxCount: 1 },
  ]),
  validate(movieUpdateSchema),
  async (req, res, next) => {
    try {
      const movieData = { ...req.body };
      if (req.files?.video?.[0]) {
        movieData.videoFilePath = req.files.video[0].path;
      }
      if (req.files?.poster?.[0]) {
        movieData.posterImage = req.files.poster[0].path;
      }
      const movie = await Movie.findByIdAndUpdate(req.params.id, movieData, {
        new: true,
        runValidators: true,
      });
      if (!movie) {
        return res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Movie not found',
          instance: req.originalUrl,
        });
      }
      res.json(movie);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Movie not found',
        instance: req.originalUrl,
      });
    }
    if (movie.videoFilePath && fs.existsSync(movie.videoFilePath)) {
      fs.unlinkSync(movie.videoFilePath);
    }
    if (movie.posterImage && fs.existsSync(movie.posterImage)) {
      fs.unlinkSync(movie.posterImage);
    }
    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/stream', streamAuthMiddleware, async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie || !movie.videoFilePath) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Movie or video file not found',
        instance: req.originalUrl,
      });
    }

    const videoPath = movie.videoFilePath;
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Video file not found on disk',
        instance: req.originalUrl,
      });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      if (start >= fileSize) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`);
        return res.json({
          type: 'https://httpstatuses.com/416',
          title: 'Range Not Satisfiable',
          status: 416,
          detail: 'Requested range is not satisfiable',
          instance: req.originalUrl,
        });
      }

      const stream = fs.createReadStream(videoPath, { start, end });
      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      stream.pipe(res);
      stream.on('error', (err) => next(err));
    } else {
      res.status(200);
      res.set({
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      });
      const stream = fs.createReadStream(videoPath);
      stream.pipe(res);
      stream.on('error', (err) => next(err));
    }
  } catch (err) {
    next(err);
  }
});

router.get('/:id/stream-token', authMiddleware, async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id).lean();
    if (!movie) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'Movie not found',
        instance: req.originalUrl,
      });
    }
    const token = generateShortLivedStreamToken(movie._id);
    res.json({ token, expiresIn: '1h' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
