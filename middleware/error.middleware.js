import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;
    
    // MongoDB duplicate Key Error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new ApiError(409, message);
    }

    if(!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || "Internal sever error"

        error = new ApiError(
            statusCode,
            message, error?.errors || [],
            err.stack
        );
    }

    const response = {
        statusCode: error.statusCode,
        success: false,
        message: error.message,
        errors: error.errors,
        data: null,

        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {} )
    }

    return res.status(error.statusCode).json(response);
}

export { errorHandler }