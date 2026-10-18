import bcrypt from 'bcrypt';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { assertValid, isCurrency, isEmail, passwordIssue, str } from '../utils/validators.js';
import { clearDemoData, createDemoData } from '../services/demoData.js';

export const getProfile = (req, res) => res.json({ success: true, data: { user: req.user.toPublic() } });

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  const e = {};
  const name = req.body.name === undefined ? user.name : str(req.body.name);
  const email = req.body.email === undefined ? user.email : str(req.body.email).toLowerCase();
  const currency = req.body.currency === undefined ? user.currency : req.body.currency;
  if (name.length < 2 || name.length > 60) e.name = 'Name must be 2 to 60 characters';
  if (!isEmail(email)) e.email = 'Enter a valid email address';
  if (!isCurrency(currency)) e.currency = 'Choose a valid currency';
  assertValid(e);

  if (email !== user.email) {
    // Changing the login email needs the current password. (Email-link verification is not built yet.)
    if (typeof req.body.currentPassword !== 'string' || !(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) {
      throw new AppError('Enter your current password to change your email', 400, { currentPassword: 'Current password is incorrect' });
    }
    if (await User.exists({ email, _id: { $ne: user._id } })) throw new AppError('That email is already in use', 409, { email: 'This email is already registered' });
  }
  Object.assign(user, { name, email, currency });
  await user.save();
  res.json({ success: true, data: { user: user.toPublic() } });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (typeof currentPassword !== 'string' || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError('Current password is incorrect', 400, { currentPassword: 'Current password is incorrect' });
  }
  assertValid({ newPassword: passwordIssue(newPassword) });
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: 'Password changed' });
});

export const loadDemo = asyncHandler(async (req, res) => {
  const data = await createDemoData(req.user._id);
  res.status(201).json({ success: true, data });
});
export const removeDemo = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await clearDemoData(req.user._id) });
});
