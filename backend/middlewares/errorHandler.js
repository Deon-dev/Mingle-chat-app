export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const payload = { message: err.message || 'Server error' };
  if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  res.status(status).json(payload);
}
