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
        const { business_name, email, password, description } = req.body;
        const role = "vendor";

        const { errors, isValid } = validateUserInput({
            business_name,
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

        if (description) {
            const [errorsDescription, isValidDescription] =
                validateInputs(description);
            if (!isValidDescription) {
                return sendErrorResponse(res, {
                    statusCode: 400,
                    error: errorsDescription,
                    message: "Invalid input description",
                });
            }
        }

        const userExists = await dbQuery(
            "SELECT * FROM vendors WHERE email = $1",
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

        let result = null;

        if (description) {
            result = await dbQuery(
                "INSERT INTO vendors (business_name, email, password, description) VALUES ($1, $2, $3, $4) RETURNING id, business_name, email, description",
                [business_name, email, hashedPassword, description]
            );
        } else {
            result = await dbQuery(
                "INSERT INTO vendors (business_name, email, password) VALUES ($1, $2, $3) RETURNING id, business_name, email",
                [business_name, email, hashedPassword]
            );
        }

        const user = result.rows[0];

        console.log(user);
        sendSuccessResponse(res, {
            statusCode: 201,
            data: {
                id: user.id,
                business_name: user.business_name,
                description: user.description,
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
        const role = "vendor";

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

        const result = await dbQuery("SELECT * FROM vendors WHERE email = $1", [
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
                "UPDATE vendors SET refresh_token = $1 WHERE id = $2",
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
                        name: user.business_name,
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

        await dbQuery("UPDATE vendors SET refresh_token = NULL WHERE id = $1", [
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
                    "SELECT * FROM vendors WHERE id = $1 AND refresh_token = $2",
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
            "SELECT id, business_name, email, description,status FROM vendors WHERE id = $1",
            [req.user.id]
        );
        const user = result.rows[0];

        // console.log(user);

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
        // const { name, email, password } = req.body;
        const { business_name, email, password, description } = req.body;

        // Validate input
        const { errors, isValid } = validateUserInputData({
            business_name,
            description,
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

        let updateQuery = "UPDATE vendors SET ";
        const queryParams = [];
        let paramCount = 1;

        if (business_name) {
            updateQuery += `business_name = $${paramCount}, `;
            queryParams.push(business_name);
            paramCount++;
        }

        if (description) {
            updateQuery += `description = $${paramCount}, `;
            queryParams.push(description);
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
        // const page = parseInt(req.query.page) || 1; // Current page, default 1
        // const limit = parseInt(req.query.limit) || 10; // Number of records per page, default 10
        // const offset = (page - 1) * limit; // Offset for SQL query

        let filters = [];
        let conditions = [];

        // Extract filters from req.query
        if (req.query.business_name) {
            conditions.push(`business_name ILIKE $${conditions.length + 1}`);
            filters.push(`%${req.query.business_name}%`);
        }

        if (req.query.status) {
            conditions.push(`status = $${conditions.length + 1}`);
            filters.push(req.query.status);
        }

        // pages related details
        // const totalRecords = await dbQuery(
        //     "SELECT COUNT(*) FROM vendors" +
        //     (conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : ""),
        //     filters
        // );
        // const totalPages = Math.ceil(totalRecords.rows[0].count / limit);

        // Build the SQL query
        let sql =
            "SELECT id, business_name, description, email, status FROM vendors";

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        // Sorting
        let orderBy = "business_name ASC"; // Default sorting by business_name ascending
        if (req.query.sort === "desc") {
            orderBy = "business_name DESC"; // Sort descending if specified
        }

        sql += ` ORDER BY ${orderBy}`;

        // Pagination
        // sql += ` LIMIT $${filters.length + 1} OFFSET $${filters.length + 2}`;
        // filters.push(limit);
        // filters.push(offset);

        // Execute the query
        const result = await dbQuery(sql, filters);

        // const result = await dbQuery(
        //     "SELECT id, business_name,description, email, status FROM vendors"
        // );

        const users = result.rows;

        sendSuccessResponse(res, {
            data: users,
            message: "Vendors retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getUsers:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving vendors",
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
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "SELECT id, business_name, description, email, status FROM vendors WHERE id = $1",
            [id]
        );
        const user = result.rows[0];

        if (user) {
            sendSuccessResponse(res, {
                data: user,
                message: "Vendor retrieved successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 404,
                message: "Vendor not found",
            });
        }
    } catch (error) {
        console.error("Error in getUserById:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving Vendor",
            error: error.message,
        });
    }
};

// suspend user by id
export const suspendUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "UPDATE vendors SET status = 'suspended', updated_at = NOW() WHERE id = $1 RETURNING id, business_name, email, status",
            [id]
        );
        const updatedUser = result.rows[0];

        sendSuccessResponse(res, {
            data: updatedUser,
            message: "Vendor Suspended successfully",
        });
    } catch (error) {
        console.error("Error in deactivation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating Vendor Suspension",
            error: error.message,
        });
    }
};

// approve user by id
export const approveUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "UPDATE vendors SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING id, business_name, email, status",
            [id]
        );
        const updatedUser = result.rows[0];

        sendSuccessResponse(res, {
            data: updatedUser,
            message: "Vendor approved successfully",
        });
    } catch (error) {
        console.error("Error in activation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating Vendor activation",
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
            "DELETE FROM vendors WHERE id = $1 RETURNING id, business_name, description, email, status",
            [id]
        );
        const deletedUser = result.rows[0];

        sendSuccessResponse(res, {
            data: deletedUser,
            message: "Vendor deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting vendor",
            error: error.message,
        });
    }
};

// get vendor earnings and total income by vendor id
export const getVendorEarningsOfVendorOWN = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        if (!vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "SELECT id, business_name, description, email, status, created_at, total_income FROM vendors WHERE id = $1",
            [vendor_id]
        );

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Vendor not found",
            });
        }
        const vendor_data = result.rows[0];

        const earnings = await dbQuery(
            "SELECT * FROM vendor_earnings WHERE vendor_id = $1",
            [vendor_id]
        );

        sendSuccessResponse(res, {
            data: {
                vendor: vendor_data,
                earnings: earnings.rows || [],
            },
            message: "Vendor earnings retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getVendorEarnings:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving vendor earnings",
            error: error.message,
        });
    }
};

// get vendor earnings and total income by vendor id
export const getVendorEarningsOfVendorByID = async (req, res) => {
    try {
        const vendor_id = req.params.id;

        if (!vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const result = await dbQuery(
            "SELECT id, business_name, description, email, status, created_at, total_income FROM vendors WHERE id = $1",
            [vendor_id]
        );

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Vendor not found",
            });
        }
        const vendor_data = result.rows[0];

        const earnings = await dbQuery(
            "SELECT * FROM vendor_earnings WHERE vendor_id = $1",
            [vendor_id]
        );

        sendSuccessResponse(res, {
            data: {
                vendor: vendor_data,
                earnings: earnings.rows || [],
            },
            message: "Vendor earnings retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getVendorEarnings:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving vendor earnings",
            error: error.message,
        });
    }
};

// get vendor earnings for graph by date order
export const getVendorEarningsGraphOfVendorOWN = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        if (!vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const query_daily = `SELECT 
        (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date AS date,
        SUM(order_amount) AS total_ordered_amount,
        SUM(total_earned) AS total_earned,
        SUM(platform_fee) AS total_platform_fee
        FROM 
            vendor_earnings
        WHERE 
            vendor_id = $1
        GROUP BY 
            (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date
        ORDER BY 
            (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date ASC;`;

        const earnings_daily = await dbQuery(query_daily, [vendor_id]);

        const earnings_daily_data = earnings_daily.rows;

        // const earnings = await dbQuery(
        //     "SELECT * FROM vendor_earnings WHERE vendor_id = $1",
        //     [vendor_id]
        // );

        sendSuccessResponse(res, {
            data: {
                // vendor: vendor_data,
                earnings: earnings_daily_data,
            },
            message: "Vendor earnings retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getVendorEarnings:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving vendor earnings",
            error: error.message,
        });
    }
};

// get all earnings graph
export const getAllVendorsEarnings = async (req, res) => {
    try {
        // Query to get earnings data for all vendors
        const query_daily = `
            SELECT 
                (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date AS date,
                SUM(order_amount) AS total_ordered_amount,
                SUM(total_earned) AS total_earned,
                SUM(platform_fee) AS total_platform_fee
            FROM 
                vendor_earnings
            GROUP BY 
                (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date
            ORDER BY 
                (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::date ASC;
        `;

        // Execute the query
        const earnings_daily = await dbQuery(query_daily);

        // Extract rows from the result
        const earnings_daily_data = earnings_daily.rows;

        // Send the response with earnings data
        sendSuccessResponse(res, {
            data: {
                earnings: earnings_daily_data,
            },
            message: "All vendors' earnings retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getAllVendorsEarnings:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving all vendors' earnings",
            error: error.message,
        });
    }
};

// get vendor dashboard data
export const getVendorDashboardData = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        if (!vendor_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Please provide id",
            });
        }

        const vendorQuery = `
        SELECT
            (SELECT business_name FROM vendors WHERE id = $1) AS business_name, 
            (SELECT total_income FROM vendors WHERE id = $1) AS total_balance,
            (SELECT COUNT(*) FROM products WHERE vendor_id = $1) AS total_listed_products,
            (SELECT COALESCE(SUM(total_reviews), 0) FROM products WHERE vendor_id = $1) AS total_product_reviews,
            (SELECT 
            CASE
                WHEN COUNT(*) FILTER (WHERE average_rating > 0) > 0
                THEN COALESCE(AVG(NULLIF(average_rating, 0)), 0)
                ELSE 0
            END
            FROM products
            WHERE vendor_id = $1
            ) AS average_rating_of_all_products
    `;
        const result = await dbQuery(vendorQuery, [vendor_id]);
        const vendor_data = result.rows[0];
        sendSuccessResponse(res, {
            data: {
                vendor: vendor_data,
            },
            message: "Vendor Data retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getVendorData:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving vendor data",
            error: error.message,
        });
    }
};

// get admin dashboard data
export const getAdminDashboardData = async (req, res) => {
    try {
        const adminQuery = `
        SELECT
            (SELECT COUNT(*) FROM vendors) AS total_vendors,
            (SELECT COUNT(*) FROM products) AS total_products,
            (SELECT COUNT(*) FROM reviews) AS total_reviews,
            (SELECT COALESCE(SUM(platform_fee), 0) FROM vendor_earnings) AS total_platform_fee,
            (SELECT 
            CASE
                WHEN COUNT(*) FILTER (WHERE average_rating > 0) > 0
                THEN COALESCE(AVG(NULLIF(average_rating, 0)), 0)
                ELSE 0
            END
            FROM products
            ) AS average_rating_of_all_products
    `;

        // also fetch total platform fee generated

        const result = await dbQuery(adminQuery);
        const admin_data = result.rows[0];
        sendSuccessResponse(res, {
            data: {
                admin: admin_data,
            },
            message: "Admin Data retrieved successfully",
        });
    } catch (error) {
        console.error("Error in getAdminData:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error retrieving admin data",
            error: error.message,
        });
    }
};
