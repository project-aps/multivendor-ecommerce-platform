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
        const { name, email, password } = req.body;
        const role = "user";

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

        const userExists = await dbQuery(
            "SELECT * FROM users WHERE email = $1",
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
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
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
        const role = "user";

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

        const result = await dbQuery("SELECT * FROM users WHERE email = $1", [
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
            await dbQuery("UPDATE users SET refresh_token = $1 WHERE id = $2", [
                refreshToken,
                user.id,
            ]);

            // send the token in the cookie
            setTokenCookie(res, "accessToken", accessToken, {
                maxAge: 15 * 60 * 1000,
            }); // 15 minutes
            setTokenCookie(res, "refreshToken", refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
            }); // 30 days

            sendSuccessResponse(res, {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
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

        await dbQuery("UPDATE users SET refresh_token = NULL WHERE id = $1", [
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
                    "SELECT * FROM users WHERE id = $1 AND refresh_token = $2",
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
            "SELECT id, name, email FROM users WHERE id = $1",
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

        let updateQuery = "UPDATE users SET ";
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

/////////////////////////////////////////////////////////////////////////////////
// for adminsOnly

// get all users
export const getAllUsers = async (req, res) => {
    try {
        const result = await dbQuery(
            "SELECT id, name, email, active FROM users"
        );
        const users = result.rows;

        sendSuccessResponse(res, {
            data: users,
            message: "Users retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getUsers:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving users",
            error: error.message,
        });
    }
};

// get user by id
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide ID",
            });
        }
        const result = await dbQuery(
            "SELECT id, name, email, active FROM users WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "User not found",
            });
        }
        const user = result.rows[0];

        // fetch address of the users
        const addressResult = await dbQuery(
            "SELECT * FROM addresses WHERE user_id = $1",
            [id]
        );

        user.addresses = addressResult.rows;
        sendSuccessResponse(res, {
            data: user,
            message: "User retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getUserById:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving user",
            error: error.message,
        });
    }
};

// deactivate user by id
export const deactivateUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "UPDATE users SET active = 'f', updated_at = NOW() WHERE id = $1 RETURNING id, name, email, active",
            [id]
        );
        const updatedUser = result.rows[0];

        sendSuccessResponse(res, {
            data: updatedUser,
            message: "User deactivated successfully",
        });
    } catch (error) {
        console.error("Error in deactivation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating user deactivation",
            error: error.message,
        });
    }
};

// deactivate user by id
export const activateUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "UPDATE users SET active = 't', updated_at = NOW() WHERE id = $1 RETURNING id, name, email, active",
            [id]
        );
        const updatedUser = result.rows[0];

        sendSuccessResponse(res, {
            data: updatedUser,
            message: "User activated successfully",
        });
    } catch (error) {
        console.error("Error in activation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating user activation",
            error: error.message,
        });
    }
};

// delete user by id
export const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "DELETE FROM users WHERE id = $1 RETURNING id, name, email",
            [id]
        );
        const deletedUser = result.rows[0];

        sendSuccessResponse(res, {
            data: deletedUser,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting user",
            error: error.message,
        });
    }
};
