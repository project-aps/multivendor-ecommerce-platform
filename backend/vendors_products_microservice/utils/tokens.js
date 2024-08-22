import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

// utils functions
export const generateAccessToken = (id, role = "user") => {
    return jwt.sign({ id: id, role: role }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || "15m",
    });
};

export const generateRefreshToken = (id, role = "user") => {
    return jwt.sign({ id: id, role: role }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY || "7d",
    });
};

export const generateAccessRefreshTokens = (id, role = "user") => {
    const accessToken = generateAccessToken(id, role);
    const refreshToken = generateRefreshToken(id, role);
    return { accessToken, refreshToken };
};
