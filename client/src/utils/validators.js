export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

export function passwordError(pw) {
  if (pw.length < 8) return 'Use at least 8 characters';
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) return 'Include upper and lower case letters';
  if (!/\d/.test(pw)) return 'Include at least one number';
  return '';
}
