const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(150, 'Name must not exceed 150 characters'),
  email: z
    .string()
    .email('Must be a valid email address')
    .max(100, 'Email must not exceed 100 characters'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(255, 'Password must not exceed 255 characters'),
  role: z.enum(['user', 'admin']).optional(),
  birthDate: z.coerce.date().optional(),
  walletBalance: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Must be a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const movieCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title must not exceed 150 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must not exceed 1000 characters'),
  releaseDate: z.coerce.date().optional(),
  averageRating: z.coerce.number().min(0).max(10).optional(),
  durationMinutes: z.coerce.number().min(0).optional(),
});

const movieUpdateSchema = z.object({
  title: z.string().max(150, 'Title must not exceed 150 characters').optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  releaseDate: z.coerce.date().optional(),
  averageRating: z.coerce.number().min(0).max(10).optional(),
  durationMinutes: z.coerce.number().min(0).optional(),
});

const reviewCreateSchema = z.object({
  movieId: z.string().min(1, 'Movie ID is required'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(500, 'Comment must not exceed 500 characters'),
  rating: z.number().min(0).max(10, 'Rating must be between 0 and 10'),
  isSpoiler: z.boolean().optional(),
});

const reviewUpdateSchema = z.object({
  comment: z
    .string()
    .max(500, 'Comment must not exceed 500 characters')
    .optional(),
  rating: z.number().min(0).max(10).optional(),
  isSpoiler: z.boolean().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

const userFilterQuery = paginationSchema.extend({
  email: z.string().max(100).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const movieFilterQuery = paginationSchema.extend({
  title: z.string().max(150).optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
});

const reviewFilterQuery = paginationSchema.extend({
  movieId: z.string().optional(),
  userId: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  movieCreateSchema,
  movieUpdateSchema,
  reviewCreateSchema,
  reviewUpdateSchema,
  userFilterQuery,
  movieFilterQuery,
  reviewFilterQuery,
};
