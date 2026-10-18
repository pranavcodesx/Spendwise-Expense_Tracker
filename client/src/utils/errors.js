export function getErrorMessage(err) {
  if (err.response) {
    if (err.response.data?.message) return err.response.data.message;
    return 'Something went wrong. Please try again.';
  }
  return 'Cannot reach the server. Check that the API is running on port 5000.';
}
// Field-level errors sent by the API, e.g. { email: 'This email is already registered' }
export const getFieldErrors = (err) => err.response?.data?.errors || {};
