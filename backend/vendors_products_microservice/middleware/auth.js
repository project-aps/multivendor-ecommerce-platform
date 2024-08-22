import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { sendErrorResponse } from "../utils/responseHandler.js";

export const isAuthenticated = (req, res, next) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return sendErrorResponse(res, {
            statusCode: 401,
            message: "Access token not found",
        });
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return sendErrorResponse(res, {
                statusCode: 401,
                error: error,
                message: "Access token expired",
            });
        }
        return sendErrorResponse(res, {
            statusCode: 401,
            error,
            error: error,
            message: "Invalid access token",
        });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return sendErrorResponse(res, {
            statusCode: 401,
            message: "Admin access only",
        });
    }
    next();
};

export const isUser = (req, res, next) => {
    if (req.user.role !== "user") {
        return sendErrorResponse(res, {
            statusCode: 401,
            message: "User access only",
        });
    }
    next();
};

export const isVendor = (req, res, next) => {
    if (req.user.role !== "vendor") {
        return sendErrorResponse(res, {
            statusCode: 401,
            message: "Vendor access only",
        });
    }
    next();
};

export const isAdminOrVendor = (req, res, next) => {
    if (req.user.role == "vendor" || req.user.role == "admin") {
        next();
    } else {
        return sendErrorResponse(res, {
            statusCode: 401,
            message: "Vendor/Admin access only",
        });
    }
};
