import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'spendwise_token';
const cookieBase = () => ({
  httpOnly: true, // JavaScript in the browser can never read this cookie
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.COOKIE_SAMESITE || 'lax',
});

export function sendAuthCookie(res, userId, remember = false) {
  const days = remember ? 30 : 1;
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: `${days}d` });
  // "Remember me" = persistent cookie for 30 days. Otherwise it is a session cookie.
  res.cookie(COOKIE_NAME, token, { ...cookieBase(), ...(remember ? { maxAge: days * 86400000 } : {}) });
}
export const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieBase());
