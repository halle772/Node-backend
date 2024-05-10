const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
}

const sendErrorProd = (err, res) => {
    // Operational, trusted error send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });    
    } else {
        // Programming or other unknown error: don't leak error details
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
}

const handleCastErrorDB = err => 
    new AppError(`Invalid ${err.path}: ${err.value}`, 400)

const handleDuplicateFieldsDB = err => 
    new AppError(`Duplicate field value "${err.keyValue.name}". Please use another one`, 400);

const handleValidationErrorsDB = err => {
    const validationErrors = Object.values(err.errors).map(el => el.message);
    return new AppError(`Invalid Input data. ${validationErrors.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token, Please login again', 401);

const handleJWTExpiredError = () => new AppError('Your token is expired. Please login again.', 401);

const handleForbiddenError = () => new AppError('You are not allow to perform this action', 403);

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV.trim() === 'production') {
        let error = {...err};
            
        if (err.name === 'CastError') {
            error = handleCastErrorDB(error);
        } else if (err.code === 11000) {
            error = handleDuplicateFieldsDB(err);
        } else if (err.name === 'ValidationError') {
            error = handleValidationErrorsDB(err);
        } else if (err.name === 'JsonWebTokenError') {
            error = handleJWTError(err);
        } else if (err.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(err);
        } else if (err.statusCode === 403) {
            error = handleForbiddenError(err);
        }

        sendErrorProd(error, res);
    }
}