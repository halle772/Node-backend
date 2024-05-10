const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandle = require('./Controllers/errorsController');

const app = express();

// Middleware.
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());

// Unhandled routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global Exception handling
app.use(globalErrorHandle);

// Exporting the module.
module.exports = app;