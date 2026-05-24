const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isSpoiler: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Review', reviewSchema);
