const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    releaseDate: {
      type: Date,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    durationMinutes: {
      type: Number,
      min: 0,
    },
    videoFilePath: {
      type: String,
      maxlength: 500,
      default: null,
    },
    posterImage: {
      type: String,
      maxlength: 500,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
