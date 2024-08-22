import { dbQuery } from "../db/db.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

// get all payments
export const getAllPayments = async (req, res) => {
    try {
        const { rows } = await dbQuery("SELECT * FROM payments");
        sendSuccessResponse(res, {
            statusCode: 200,
            data: rows,
            message: "Payments retrieved successfully",
        });
    } catch (error) {
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting payments",
            error: error.message,
        });
    }
};
// get payments by id
export const getPaymentsById = async (req, res) => {
    try {
        const { rows } = await dbQuery("SELECT * FROM payments WHERE id = $1", [
            req.params.id,
        ]);
        if (rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Payment not found",
            });
        }
        sendSuccessResponse(res, {
            statusCode: 200,
            data: rows[0],
            message: "Payment retrieved successfully",
        });
    } catch (error) {
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error getting payment",
            error: error.message,
        });
    }
};
