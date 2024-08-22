import dotenv from "dotenv";
dotenv.config();

export const sendSuccessResponse = (
    res,
    { statusCode = 200, data = null, message = "Success" }
) => {
    res.status(statusCode).json({
        success: true,
        data,
        message,
    });
};

export const sendErrorResponse = (
    res,
    { statusCode = 500, error = null, message = "Server Error" }
) => {
    res.status(statusCode).json({
        success: false,
        error,
        message,
    });
};

export const setTokenCookie = (res, name, value, options = {}) => {
    res.cookie(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: options.maxAge || 24 * 60 * 60 * 1000, // 24 hours by default
        ...options,
    });
};

// clear cookie
export const clearTokenCookie = (res, name) => {
    res.clearCookie(name, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
};
