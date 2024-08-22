import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

import { dbQuery } from "../db/db.js";
import {
    validateUserInput,
    validateUserInputData,
    validateInputs,
} from "../utils/validator.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
    setTokenCookie,
    clearTokenCookie,
} from "../utils/responseHandler.js";

import {
    generateAccessRefreshTokens,
    generateAccessToken,
    // generateRefreshToken,
} from "../utils/tokens.js";

// routes controller

// register user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, access_code } = req.body;
        const role = "admin";

        const { errors, isValid } = validateUserInput({
            name,
            email,
            password,
        });
        if (!isValid) {
            return sendErrorResponse(res, {
                statusCode: 400,
                error: errors,
                message: "Invalid input",
            });
        }

        if (!access_code) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide access code",
            });
        }

        if (access_code != process.env.ACCESS_CODE) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Invalid access code",
            });
        }

        const userExists = await dbQuery(
            "SELECT * FROM admins WHERE email = $1",
            [email]
        );
        if (userExists.rows.length > 0) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "User already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await dbQuery(
            "INSERT INTO admins (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
            [name, email, hashedPassword]
        );

        const user = result.rows[0];
        sendSuccessResponse(res, {
            statusCode: 201,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: role,
            },
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("Error in registerUser:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error registering user",
            error: error.message,
        });
    }
};

// login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const role = "admin";

        if (!email || !password) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide email and password",
            });
        }

        // validate email
        const [errorsEmail, isValidEmail] = validateInputs(email);
        if (!isValidEmail) {
            return sendErrorResponse(res, {
                statusCode: 400,
                error: errorsEmail,
                message: "Invalid Email type",
            });
        }

        // validate password
        const [errorsPassword, isValidPassword] = validateInputs(password);
        if (!isValidPassword) {
            return sendErrorResponse(res, {
                statusCode: 400,
                error: errorsPassword,
                message: "Invalid Password type",
            });
        }

        const result = await dbQuery("SELECT * FROM admins WHERE email = $1", [
            email,
        ]);
        const user = result.rows[0];

        // verify user email and password
        if (user && (await bcrypt.compare(password, user.password))) {
            const { accessToken, refreshToken } = generateAccessRefreshTokens(
                user.id,
                role
            );

            // store refreshToken in database
            await dbQuery(
                "UPDATE admins SET refresh_token = $1 WHERE id = $2",
                [refreshToken, user.id]
            );

            // send the token in the cookie
            setTokenCookie(res, "accessToken", accessToken, {
                maxAge: 15 * 60 * 1000,
            }); // 15 minutes
            setTokenCookie(res, "refreshToken", refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
            }); // 30 days

            sendSuccessResponse(res, {
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                    role,
                },
                message: "Login successful",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 401,
                message: "Invalid email or password",
            });
        }
    } catch (error) {
        console.error("Error in loginUser:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error logging in",
            error: error.message,
        });
    }
};

// logout user
export const logoutUser = async (req, res) => {
    try {
        const user = req.user;

        await dbQuery("UPDATE admins SET refresh_token = NULL WHERE id = $1", [
            user.id,
        ]);

        clearTokenCookie(res, "accessToken");
        clearTokenCookie(res, "refreshToken");
        sendSuccessResponse(res, {
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Error in logoutUser:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error logging out",
            error: error.message,
        });
    }
};

// get new access token from refresh token when expired
export const updateAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return sendErrorResponse(res, {
                statusCode: 401,
                message: "Refresh token not found",
            });
        }

        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
            async (err, user) => {
                if (err) {
                    return sendErrorResponse(res, {
                        statusCode: 403,
                        error: err,
                        message: "Invalid refresh token",
                    });
                }

                // verify refreshToken from database with user id
                const result = await dbQuery(
                    "SELECT * FROM admins WHERE id = $1 AND refresh_token = $2",
                    [user.id, refreshToken]
                );

                if (result.rows.length === 0) {
                    return sendErrorResponse(res, {
                        statusCode: 403,
                        message: "Invalid refresh token",
                    });
                }

                const accessToken = generateAccessToken(user.id, user.role);

                setTokenCookie(res, "accessToken", accessToken, {
                    maxAge: 15 * 60 * 1000,
                }); // 15 minutes

                sendSuccessResponse(res, {
                    data: { accessToken },
                    message: "Access token refreshed successfully",
                });
            }
        );
    } catch (error) {
        console.error("Error in refreshToken:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error refreshing token",
            error: error.message,
        });
    }
};

// get user profile data
export const getUserProfile = async (req, res) => {
    try {
        const result = await dbQuery(
            "SELECT id, name, email FROM admins WHERE id = $1",
            [req.user.id]
        );
        const user = result.rows[0];

        console.log(user);

        if (user) {
            sendSuccessResponse(res, {
                data: user,
                message: "User profile retrieved successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 404,
                message: "User not found",
            });
        }
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving user profile",
            error: error.message,
        });
    }
};

// update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        const { errors, isValid } = validateUserInputData({
            name,
            email,
            password,
        });
        if (!isValid) {
            return sendErrorResponse(res, {
                statusCode: 400,
                error: errors,
                message: "Invalid input",
            });
        }

        let updateQuery = "UPDATE admins SET ";
        const queryParams = [];
        let paramCount = 1;

        if (name) {
            updateQuery += `name = $${paramCount}, `;
            queryParams.push(name);
            paramCount++;
        }

        if (email) {
            updateQuery += `email = $${paramCount}, `;
            queryParams.push(email);
            paramCount++;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateQuery += `password = $${paramCount}, `;
            queryParams.push(hashedPassword);
            paramCount++;
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);

        // change the updated_at time as of current time
        updateQuery += `, updated_at = NOW()`;

        updateQuery += ` WHERE id = $${paramCount} RETURNING id, name, email`;
        queryParams.push(req.user.id);

        console.log(updateQuery);
        console.log(queryParams);

        const result = await dbQuery(updateQuery, queryParams);
        const updatedUser = result.rows[0];

        sendSuccessResponse(res, {
            data: updatedUser,
            message: "User profile updated successfully",
        });
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating user profile",
            error: error.message,
        });
    }
};

// set the user
