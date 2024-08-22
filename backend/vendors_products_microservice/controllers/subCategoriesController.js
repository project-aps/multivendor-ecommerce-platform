import { dbQuery } from "../db/db.js";
import { validateAllInputs } from "../utils/validator.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";

// create
export const createSubCategory = async (req, res) => {
    try {
        const { name, category_id, description } = req.body;

        if (!name || !category_id) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Name and category_id are required",
            });
        }

        let image_src = null;
        if (req.files.image) {
            image_src = req.files.image[0].path;
        }

        let updateQuery = "INSERT INTO subcategories ( ";
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
        if (category_id) {
            updateQuery += `category_id, `;
            queryParams.push(category_id);
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
                message: "Error creating sub-category",
            });
        }

        sendSuccessResponse(res, {
            statusCode: 201,
            data: result.rows[0],
            message: "Subcategory Created successfully",
        });
    } catch (error) {
        console.error("Error in SubCategory creation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error creating SubCategory",
            error: error.message,
        });
    }
};

// update
export const updateSubCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category_id } = req.body;

        let image_src = null;
        if (req.files.image) {
            image_src = req.files.image[0].path;
        }

        // database logic

        let updateQuery = "UPDATE subcategories SET ";
        const queryParams = [];
        let paramCount = 1;

        if (name) {
            updateQuery += `name = $${paramCount}, `;
            queryParams.push(name);
            paramCount++;
        }

        if (category_id) {
            updateQuery += `category_id = $${paramCount}, `;
            queryParams.push(category_id);
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

        updateQuery += ` WHERE id = $${paramCount} RETURNING id, name, category_id, description`;
        queryParams.push(id);

        const result = await dbQuery(updateQuery, queryParams);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "SubCategory Updated successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "SubCategory not found",
            });
        }
    } catch (error) {
        console.error("Error in subcategory update:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating subcategory",
            error: error.message,
        });
    }
};

// delete
export const deleteSubCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const query =
            "DELETE FROM subcategories WHERE id = $1 RETURNING id, name, description,category_id";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "SubCategory deleted successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "SubCategory not found",
            });
        }
    } catch (error) {
        console.error("Error in subcategory deletion:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting subcategory",
            error: error.message,
        });
    }
};

// get all
export const getAllSubCategories = async (req, res) => {
    try {
        const { category_id } = req.query;

        // do join query to get details of category as well
        let query = `SELECT subcategories.id, subcategories.name, subcategories.description, subcategories.image_src, subcategories.category_id, categories.name as category_name FROM subcategories JOIN categories ON subcategories.category_id = categories
        .id `;

        if (category_id) {
            query += ` WHERE category_id = $1`;
        }

        // use query params to get the sub-category from specific category_id if query is present

        let result = null;
        if (category_id) {
            result = await dbQuery(query, [category_id]);
        } else {
            result = await dbQuery(query);
        }
        if (result.rows.length == 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "No SubCategories found",
            });
        }

        const data = result.rows;
        sendSuccessResponse(res, {
            statusCode: 200,
            data,
            message: "All SubCategories fetched successfully",
        });
    } catch (error) {
        console.error("Error in fetching categories:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching SubCategories",
            error: error.message,
        });
    }
};

// get one
export const getSubCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const query = "SELECT * FROM subcategories WHERE id = $1";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "SubCategory fetched successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "SubCategory not found",
            });
        }
    } catch (error) {
        console.error("Error in fetching subcategory:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching subcategory",
            error: error.message,
        });
    }
};
