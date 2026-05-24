const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      maxlength: 255,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      maxlength: 10,
    },
    birthDate: {
      type: Date,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
