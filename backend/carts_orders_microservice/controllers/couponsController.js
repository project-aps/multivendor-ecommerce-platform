import { dbQuery } from "../db/db.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

// Create a new coupon
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discount_type,
            discount_value,
            max_uses,
            valid_from,
            valid_until,
        } = req.body;

        if (
            !code ||
            !discount_value ||
            !max_uses ||
            !valid_from ||
            !valid_until
        ) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        if (
            !(
                discount_type &&
                (discount_type == "amount" || discount_type == "percent")
            )
        ) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message:
                    "Invalid discount type, discount type can be either 'amount' or 'percent'.",
            });
        }

        if (!discount_type) {
            discount_type = "amount";
        }

        const result = await dbQuery(
            `INSERT INTO coupons (code, discount_type, discount_value, max_uses, valid_from, valid_until)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [
                code,
                discount_type,
                discount_value,
                max_uses,
                valid_from,
                valid_until,
            ]
        );

        sendSuccessResponse(res, {
            statusCode: 201,
            data: result.rows[0],
            message: "Coupon created successfully",
        });
    } catch (error) {
        console.error("Error creating coupon:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error creating coupon",
            error: error.message,
        });
    }
};

// Get all coupons
export const getAllCoupons = async (req, res) => {
    try {
        const result = await dbQuery("SELECT * FROM coupons ORDER BY code ASC");

        sendSuccessResponse(res, {
            statusCode: 200,
            data: result.rows,
            message: "Coupons fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching coupons",
            error: error.message,
        });
    }
};

// Get a coupon by ID
export const getCouponById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await dbQuery("SELECT * FROM coupons WHERE id = $1", [
            id,
        ]);

        if (result.rows.length > 0) {
            sendSuccessResponse(res, {
                statusCode: 200,
                data: result.rows[0],
                message: "Coupon fetched successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 404,
                message: "Coupon not found",
            });
        }
    } catch (error) {
        console.error("Error fetching coupon:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching coupon",
            error: error.message,
        });
    }
};

// Update a coupon
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = {};
        const updateValues = [];
        let updateQuery = "UPDATE coupons SET ";

        // Dynamically construct update query and values
        if (req.body.code) {
            updateFields.code = req.body.code;
            updateValues.push(req.body.code);
            updateQuery += `code = $${updateValues.length}, `;
        }
        if (req.body.discount_type) {
            if (
                !req.body.discount_type == "amount" ||
                !req.body.discount_type == "percent"
            ) {
                return sendErrorResponse(res, {
                    statusCode: 400,
                    message:
                        "Invalid discount type, discount type can be either 'amount' or 'percent'.",
                });
            }
            updateFields.discount_type = req.body.discount_type;
            updateValues.push(req.body.discount_type);
            updateQuery += `discount_type = $${updateValues.length}, `;
        }
        if (req.body.discount_value) {
            updateFields.discount_value = req.body.discount_value;
            updateValues.push(req.body.discount_value);
            updateQuery += `discount_value = $${updateValues.length}, `;
        }
        if (req.body.max_uses !== undefined) {
            updateFields.max_uses = req.body.max_uses;
            updateValues.push(req.body.max_uses);
            updateQuery += `max_uses = $${updateValues.length}, `;
        }
        if (req.body.used_count !== undefined) {
            updateFields.used_count = req.body.used_count;
            updateValues.push(req.body.used_count);
            updateQuery += `used_count = $${updateValues.length}, `;
        }
        if (req.body.is_active !== undefined) {
            updateFields.is_active = req.body.is_active;
            updateValues.push(req.body.is_active);
            updateQuery += `is_active = $${updateValues.length}, `;
        }
        if (req.body.valid_from) {
            updateFields.valid_from = req.body.valid_from;
            updateValues.push(req.body.valid_from);
            updateQuery += `valid_from = $${updateValues.length}, `;
        }
        if (req.body.valid_until) {
            updateFields.valid_until = req.body.valid_until;
            updateValues.push(req.body.valid_until);
            updateQuery += `valid_until = $${updateValues.length}, `;
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ` WHERE id = $${updateValues.length + 1} RETURNING *`;
        updateValues.push(id);

        // Execute update query
        const result = await dbQuery(updateQuery, updateValues);

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Coupon not found",
            });
        }

        const updatedCoupon = result.rows[0];

        sendSuccessResponse(res, {
            statusCode: 200,
            data: updatedCoupon,
            message: "Coupon updated successfully",
        });
    } catch (error) {
        console.error("Error updating coupon:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating coupon",
            error: error.message,
        });
    }
};

// Delete a coupon
export const deleteCoupon = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await dbQuery(
            "DELETE FROM coupons WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length > 0) {
            sendSuccessResponse(res, {
                statusCode: 200,
                data: result.rows[0],
                message: "Coupon deleted successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 404,
                message: "Coupon not found",
            });
        }
    } catch (error) {
        console.error("Error deleting coupon:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting coupon",
            error: error.message,
        });
    }
};

// delete coupon by name
export const deleteCouponByName = async (req, res) => {
    const { code } = req.query;

    try {
        const result = await dbQuery(
            "DELETE FROM coupons WHERE code = $1 RETURNING *",
            [code]
        );

        if (result.rows.length > 0) {
            sendSuccessResponse(res, {
                statusCode: 200,
                data: result.rows[0],
                message: "Coupon deleted successfully",
            });
        } else {
            sendErrorResponse(res, {
                statusCode: 404,
                message: "Coupon not found",
            });
        }
    } catch (error) {
        console.error("Error deleting coupon:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting coupon",
            error: error.message,
        });
    }
};

// validate coupon by user
export const validateCoupon = async (req, res) => {
    const { code } = req.query;

    //
    if (!code) {
        return sendErrorResponse(res, {
            statusCode: 400,
            message: "Code is required",
        });
    }

    try {
        // // first logic
        // const result = await dbQuery("SELECT * FROM coupons WHERE code = $1", [
        //     code,
        // ]);

        // if (result.rows.length > 0) {
        //     const coupon = result.rows[0];

        //     if (!coupon.is_active) {
        //         return sendErrorResponse(res, {
        //             statusCode: 400,
        //             message: "Coupon is not active",
        //         });
        //     }

        //     const today = new Date();
        //     const valid_from = new Date(coupon.valid_from);
        //     const valid_until = new Date(coupon.valid_until);

        //     if (today < valid_from || today > valid_until) {
        //         return sendErrorResponse(res, {
        //             statusCode: 400,
        //             message: "Coupon is not valid",
        //         });
        //     }

        //     if (coupon.used_count >= coupon.max_uses) {
        //         return sendErrorResponse(res, {
        //             statusCode: 400,
        //             message: "Coupon has reached maximum uses",
        //         });
        //     }

        //     sendSuccessResponse(res, {
        //         statusCode: 200,
        //         data: coupon,
        //         message: "Coupon is valid",
        //     });
        // } else {
        //     sendErrorResponse(res, {
        //         statusCode: 404,
        //         message: "Coupon not found",
        //     });
        // }

        // second logic
        // Query to check coupon validity
        const query = `
        SELECT * FROM coupons 
        WHERE code = $1 
        AND is_active = TRUE 
        AND valid_from <= NOW() 
        AND valid_until >= NOW()
        AND (max_uses = 0 OR used_count < max_uses)`;

        const result = await dbQuery(query, [code]);

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Coupon is not valid or has expired",
            });
        }

        const coupon = result.rows[0];

        // Coupon is valid
        sendSuccessResponse(res, {
            statusCode: 200,
            data: coupon,
            message: "Coupon is valid",
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error validating coupon",
            error: error.message,
        });
    }
};
