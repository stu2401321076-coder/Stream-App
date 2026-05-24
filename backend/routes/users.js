const express = require('express');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateQuery } = require('../middleware/validate');
const { userFilterQuery } = require('../middleware/schemas');

const router = express.Router();

router.get('/', authMiddleware, validateQuery(userFilterQuery), async (req, res, next) => {
  try {
    const { page, limit, sortBy, order, email, isActive } = req.query;

    const filter = {};
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const sortField = sortBy || 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      data: users,
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
    const user = await User.findById(req.params.id).select('-passwordHash').lean();
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

router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.birthDate !== undefined) updates.birthDate = req.body.birthDate;
    if (req.body.walletBalance !== undefined) updates.walletBalance = req.body.walletBalance;
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

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

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        type: 'https://httpstatuses.com/404',
        title: 'Not Found',
        status: 404,
        detail: 'User not found',
        instance: req.originalUrl,
      });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
