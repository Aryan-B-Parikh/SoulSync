/**
 * Error Handler Middleware
 * Centralized error handling for the Express app
 */

/**
 * Log errors with context
 */
function logError(error, req) {
  console.error('\n❌ Error occurred:');
  console.error(`  Time: ${new Date().toISOString()}`);
  console.error(`  Path: ${req.method} ${req.path}`);
  console.error(`  IP: ${req.ip}`);
  console.error(`  Error: ${error.message}`);
  if (error.stack && process.env.NODE_ENV === 'development') {
    console.error(`  Stack: ${error.stack}`);
  }
  console.error('');
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  logError(err, req);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
