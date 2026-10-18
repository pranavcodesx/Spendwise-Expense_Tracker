// An error we throw on purpose. statusCode becomes the HTTP status; errors holds per-field messages.
export default class AppError extends Error {
  constructor(message, statusCode = 400, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
