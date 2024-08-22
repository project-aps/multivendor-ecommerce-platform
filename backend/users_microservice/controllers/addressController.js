import { dbQuery } from "../db/db.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

export const addAddress = async (req, res) => {
    try {
        const user_id = req.user.id;
        const {
            country,
            state,
            district,
            municipality,
            ward,
            full_address,
            full_name,
            nearest_landmark,
            contact_number,
            postal_code,
        } = req.body;

        if (
            !user_id ||
            !country ||
            !state ||
            !district ||
            !municipality ||
            !ward ||
            !full_address ||
            !full_name ||
            !nearest_landmark ||
            !contact_number ||
            !postal_code
        ) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required fields are required",
            });
        }

        const result = await dbQuery(
            "INSERT INTO addresses (user_id, country, state, district, municipality, ward, full_address, full_name, nearest_landmark, contact_number, postal_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
            [
                user_id,
                country,
                state,
                district,
                municipality,
                ward,
                full_address,
                full_name,
                nearest_landmark,
                contact_number,
                postal_code,
            ]
        );

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Error adding address",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 201,
            data: result.rows[0],
            message: "Address added successfully",
        });
    } catch (error) {
        console.error("Error adding address:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error adding address",
            error: error.message,
        });
    }
};

export const getUserAddresses = async (req, res) => {
    try {
        const user_id = req.user.id;

        const result = await dbQuery(
            "SELECT * FROM addresses WHERE user_id = $1",
            [user_id]
        );

        sendSuccessResponse(res, {
            statusCode: 200,
            data: result.rows,
            message: "Addresses fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching addresses",
            error: error.message,
        });
    }
};

export const getAddressById = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        const result = await dbQuery(
            "SELECT * FROM addresses WHERE user_id = $1 AND id = $2",
            [user_id, id]
        );

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Address not found",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 200,
            data: result.rows[0],
            message: "Address fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching address:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching address",
            error: error.message,
        });
    }
};

export const getAddressForPanelById = async (req, res) => {
    try {
        const { user_id, address_id } = req.body;

        const result = await dbQuery(
            "SELECT * FROM addresses WHERE user_id = $1 AND id = $2",
            [user_id, address_id]
        );

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Address not found",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 200,
            data: result.rows[0],
            message: "Address fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching address:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching address",
            error: error.message,
        });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const {
            country,
            state,
            district,
            municipality,
            ward,
            full_address,
            full_name,
            nearest_landmark,
            contact_number,
            postal_code,
        } = req.body;

        const user_id = req.user.id;
        const { id } = req.params;

        if (!id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Address ID is required",
            });
        }

        const checkResult = await dbQuery(
            "SELECT * FROM addresses WHERE user_id = $1 AND id = $2",
            [user_id, id]
        );

        if (checkResult.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Address not found",
            });
        }

        const fields = [];
        const values = [];
        let query = "UPDATE addresses SET ";

        if (country) {
            fields.push("country = $" + (fields.length + 1));
            values.push(country);
        }
        if (state) {
            fields.push("state = $" + (fields.length + 1));
            values.push(state);
        }
        if (district) {
            fields.push("district = $" + (fields.length + 1));
            values.push(district);
        }
        if (municipality) {
            fields.push("municipality = $" + (fields.length + 1));
            values.push(municipality);
        }
        if (ward) {
            fields.push("ward = $" + (fields.length + 1));
            values.push(ward);
        }
        if (full_address) {
            fields.push("full_address = $" + (fields.length + 1));
            values.push(full_address);
        }
        if (full_name) {
            fields.push("full_name = $" + (fields.length + 1));
            values.push(full_name);
        }
        if (nearest_landmark) {
            fields.push("nearest_landmark = $" + (fields.length + 1));
            values.push(nearest_landmark);
        }
        if (contact_number) {
            fields.push("contact_number = $" + (fields.length + 1));
            values.push(contact_number);
        }
        if (postal_code) {
            fields.push("postal_code = $" + (fields.length + 1));
            values.push(postal_code);
        }

        query +=
            fields.join(", ") +
            ", updated_at = NOW() WHERE id = $" +
            (fields.length + 1);
        values.push(id);

        const result = await dbQuery(query, values);

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Error updating address.",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 200,
            data: result.rows[0],
            message: "Address updated successfully",
        });
    } catch (error) {
        console.error("Error updating address:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating address",
            error: error.message,
        });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { id } = req.params;

        const result = await dbQuery(
            "DELETE FROM addresses WHERE user_id = $1 AND id = $2 RETURNING *",
            [user_id, id]
        );

        if (result.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Address not found",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 200,
            data: result.rows[0],
            message: "Address deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting address:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting address",
            error: error.message,
        });
    }
};
