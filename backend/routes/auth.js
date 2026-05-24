const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../middleware/schemas');

const router = express.Router();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role, birthDate, walletBalance, isActive } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        type: 'https://httpstatuses.com/409',
        title: 'Conflict',
        status: 409,
        detail: 'A user with this email already exists',
        instance: req.originalUrl,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      birthDate,
      walletBalance,
      isActive,
    });

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        birthDate: user.birthDate,
        walletBalance: user.walletBalance,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid email or password',
        instance: req.originalUrl,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid email or password',
        instance: req.originalUrl,
      });
    }

    const token = generateToken({ id: user._id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        birthDate: user.birthDate,
        walletBalance: user.walletBalance,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'User not found',
        instance: req.originalUrl,
      });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
