import { dbQuery } from "../db/db.js";
import { validateAllInputs } from "../utils/validator.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

// create
export const createBrand = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Name is required",
            });
        }

        // database logic
        let image_src = null;
        if (req.files.image) {
            image_src = req.files.image[0].path;
        }

        let updateQuery = "INSERT INTO brands ( ";
        const queryParams = [];
        let paramCount = 1;

        if (name) {
            updateQuery += `name, `;
            queryParams.push(name);
            paramCount++;
        }
        if (description) {
            updateQuery += `description, `;
            queryParams.push(description);
            paramCount++;
        }
        if (image_src) {
            updateQuery += `image_src, `;
            queryParams.push(image_src);
            paramCount++;
        }
        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);

        // change the updated_at time as of current time
        updateQuery += ` ) VALUES( `;

        for (let i = 1; i < paramCount; i++) {
            updateQuery += `$${i}, `;
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);

        updateQuery += ` ) RETURNING id `;

        const result = await dbQuery(updateQuery, queryParams);

        if (result.rows.length == 0) {
            return sendErrorResponse(res, {
                statusCode: 500,
                message: "Error creating brand",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 201,
            data: result.rows[0],
            message: "Brand Created successfully",
        });
    } catch (error) {
        console.error("Error in brand creation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error creating brands",
            error: error.message,
        });
    }
};

// update
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // database logic

        let image_src = null;
        if (req.files.image) {
            image_src = req.files.image[0].path;
        }

        let updateQuery = "UPDATE brands SET ";
        const queryParams = [];
        let paramCount = 1;

        if (name) {
            updateQuery += `name = $${paramCount}, `;
            queryParams.push(name);
            paramCount++;
        }
        if (image_src) {
            updateQuery += `image_src = $${paramCount}, `;
            queryParams.push(image_src);
            paramCount++;
        }

        if (description) {
            updateQuery += `description = $${paramCount}, `;
            queryParams.push(description);
            paramCount++;
        }

        // Remove trailing comma and space
        updateQuery = updateQuery.slice(0, -2);

        // change the updated_at time as of current time
        updateQuery += `, updated_at = NOW()`;

        updateQuery += ` WHERE id = $${paramCount} RETURNING id, name, description`;
        queryParams.push(id);

        const result = await dbQuery(updateQuery, queryParams);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Brand Updated successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Brand not found",
            });
        }
    } catch (error) {
        console.error("Error in brand update:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating brands",
            error: error.message,
        });
    }
};

// delete
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const query =
            "DELETE FROM brands WHERE id = $1 RETURNING id, name, description";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Brand deleted successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Brand not found",
            });
        }
    } catch (error) {
        console.error("Error in brand deletion:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting brands",
            error: error.message,
        });
    }
};

// get all
export const getAllBrands = async (req, res) => {
    try {
        const query = "SELECT * FROM brands";
        const result = await dbQuery(query);

        const data = result.rows;
        sendSuccessResponse(res, {
            statusCode: 200,
            data,
            message: "All Brands fetched successfully",
        });
    } catch (error) {
        console.error("Error in fetching brands:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching brands",
            error: error.message,
        });
    }
};

// get one
export const getBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const query = "SELECT * FROM brands WHERE id = $1";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Brand fetched successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Brand not found",
            });
        }
    } catch (error) {
        console.error("Error in fetching brand:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching brand",
            error: error.message,
        });
    }
};
