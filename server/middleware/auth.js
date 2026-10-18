import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { COOKIE_NAME } from '../utils/token.js';

// Runs before every private route. The user id comes from the signed cookie, never from the request body.
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError('Please sign in to continue', 401);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Your session has expired. Please sign in again.', 401);
  }
  const user = await User.findById(payload.id);
  if (!user) throw new AppError('Your session is no longer valid. Please sign in again.', 401);
  req.user = user;
  next();
});
