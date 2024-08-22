import { dbQuery } from "../db/db.js";
import { validateAllInputs } from "../utils/validator.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

// create
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Name is required",
            });
        }

        const [errors, isValid] = validateAllInputs({
            name,
            description,
        });
        if (!isValid) {
            return sendErrorResponse(res, {
                statusCode: 400,
                error: errors,
                message: "Invalid inputs",
            });
        }
        let image_src = null;
        if (req.files.image) {
            image_src = req.files.image[0].path;
        }

        let updateQuery = "INSERT INTO categories ( ";
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
                message: "Error creating category",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 201,
            data: result.rows[0],
            message: "Category Created successfully",
        });
    } catch (error) {
        console.error("Error in category creation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error creating category",
            error: error.message,
        });
    }
};

// update
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        let image_src = null;
        if (req.files.image) {
            image_src = req.files.image[0].path;
        }

        // database logic

        let updateQuery = "UPDATE categories SET ";
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
                message: "Category Updated successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Category not found",
            });
        }
    } catch (error) {
        console.error("Error in category update:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating category",
            error: error.message,
        });
    }
};

// delete
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const query =
            "DELETE FROM categories WHERE id = $1 RETURNING id, name, description";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Category deleted successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Category not found",
            });
        }
    } catch (error) {
        console.error("Error in category deletion:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting category",
            error: error.message,
        });
    }
};

// get all
export const getAllCategories = async (req, res) => {
    try {
        const query = "SELECT * FROM categories";
        const result = await dbQuery(query);

        const data = result.rows;
        sendSuccessResponse(res, {
            statusCode: 200,
            data,
            message: "All Categories fetched successfully",
        });
    } catch (error) {
        console.error("Error in fetching categories:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching categories",
            error: error.message,
        });
    }
};

// get one
export const getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const query = "SELECT * FROM categories WHERE id = $1";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Category fetched successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Category not found",
            });
        }
    } catch (error) {
        console.error("Error in fetching category:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching category",
            error: error.message,
        });
    }
};
