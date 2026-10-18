import bcrypt from 'bcrypt';
import crypto from 'crypto';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { assertValid, isEmail, passwordIssue, str, validateRegister } from '../utils/validators.js';
import { clearAuthCookie, sendAuthCookie } from '../utils/token.js';
import { sendResetEmail } from '../services/emailService.js';

const SALT_ROUNDS = 12;
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = validateRegister(req.body);
  if (await User.exists({ email })) throw new AppError('An account with this email already exists', 409, { email: 'This email is already registered' });
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  sendAuthCookie(res, user._id, true);
  res.status(201).json({ success: true, data: { user: user.toPublic() } });
});

export const login = asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  const password = req.body.password;
  if (!isEmail(email) || typeof password !== 'string' || !password) throw new AppError('Enter your email and password', 400);
  const user = await User.findOne({ email }).select('+passwordHash');
  // Same message for "no such user" and "wrong password" so attackers cannot discover which emails exist.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new AppError('Invalid email or password', 401);
  sendAuthCookie(res, user._id, req.body.rememberMe === true);
  res.json({ success: true, data: { user: user.toPublic() } });
});

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Signed out' });
};

export const me = (req, res) => res.json({ success: true, data: { user: req.user.toPublic() } });

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = str(req.body.email).toLowerCase();
  if (!isEmail(email)) throw new AppError('Enter a valid email address', 400, { email: 'Enter a valid email address' });
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    // Only a hash of the token is stored, so a database leak cannot be used to reset passwords.
    await User.updateOne({ _id: user._id }, { passwordResetToken: sha256(token), passwordResetExpires: new Date(Date.now() + 3600000) });
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    try {
      await sendResetEmail(user.email, link);
    } catch (err) {
      console.error('Could not send reset email:', err.message);
    }
  }
  // Identical answer whether or not the account exists; we never claim an email was sent.
  res.json({ success: true, message: 'If an account exists for that email, password reset instructions will be sent to it.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (typeof token !== 'string' || !token) throw new AppError('This reset link is invalid or has expired', 400);
  assertValid({ password: passwordIssue(password) });
  const user = await User.findOne({ passwordResetToken: sha256(token), passwordResetExpires: { $gt: new Date() } });
  if (!user) throw new AppError('This reset link is invalid or has expired', 400);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await User.updateOne({ _id: user._id }, { passwordHash, $unset: { passwordResetToken: 1, passwordResetExpires: 1 } });
  res.json({ success: true, message: 'Password updated. You can sign in now.' });
});
