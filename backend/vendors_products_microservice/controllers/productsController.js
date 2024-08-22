import { dbQuery } from "../db/db.js";
import { validateAllInputs } from "../utils/validator.js";
import {
    sendSuccessResponse,
    sendErrorResponse,
} from "../utils/responseHandler.js";
import cloudinary from "../utils/cloudinary.js";

// create
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            // vendor_id,
            category_id,
            subcategory_id,
            brand_id,
            description,
            old_price,
            price,
            quantity,
        } = req.body;

        const vendor_id = req.user.id;
        // console.log(vendor_id);

        if (
            !name ||
            !vendor_id ||
            !category_id ||
            !subcategory_id ||
            !price ||
            !quantity
        ) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "All required parameters are required",
            });
        }

        // const [errors, isValid] = validateAllInputs({
        //     name,
        //     vendor_id,
        //     category_id,
        //     subcategory_id,
        //     brand_id,
        //     description,
        //     old_price,
        //     price,
        //     quantity,
        // });
        // if (!isValid) {
        //     return sendErrorResponse(res, {
        //         statusCode: 400,
        //         error: errors,
        //         message: "Invalid inputs",
        //     });
        // }

        // Check for thumbnail image
        if (!req.files || !req.files.thumbnail) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Thumbnail image is required",
            });
        }

        console.log({ files: req.files });

        // // Upload thumbnail image
        // const thumbnail_url = await req.files.thumbnail[0].path;

        // console.log({ thumbnail_url });

        // // Upload gallery images if available
        // let gallery_images_url = [];
        // if (req.files.gallery) {
        //     const galleryUploads = req.files.gallery.map((file) =>
        //         cloudinary.uploader.upload(file.path)
        //     );
        //     const galleryResults = await Promise.all(galleryUploads);
        //     gallery_images_url = galleryResults.map(
        //         (result) => result.secure_url
        //     );
        // }
        console.log({ files: req.files });
        console.log({ gallery: req.files.gallery });

        // Get the file URLs from Cloudinary
        const thumbnail_url = req.files.thumbnail
            ? req.files.thumbnail[0].path
            : null;
        const gallery_images_url = req.files.gallery
            ? req.files.gallery.map((file) => file.path)
            : [];

        // database logic
        await dbQuery("BEGIN");

        //////////////////////////////////////////////
        // insert data into products table

        let updateQuery = "INSERT INTO products ( ";
        const queryParams = [];
        let paramCount = 1;

        if (name) {
            updateQuery += `name, `;
            queryParams.push(name);
            paramCount++;
        }
        if (vendor_id) {
            updateQuery += `vendor_id, `;
            queryParams.push(vendor_id);
            paramCount++;
        }
        if (category_id) {
            updateQuery += `category_id, `;
            queryParams.push(category_id);
            paramCount++;
        }
        if (subcategory_id) {
            updateQuery += `subcategory_id, `;
            queryParams.push(subcategory_id);
            paramCount++;
        }
        if (brand_id) {
            updateQuery += `brand_id, `;
            queryParams.push(brand_id);
            paramCount++;
        }
        if (description) {
            updateQuery += `description, `;
            queryParams.push(description);
            paramCount++;
        }
        if (thumbnail_url) {
            updateQuery += `thumbnail_url, `;
            queryParams.push(thumbnail_url);
            paramCount++;
        }
        if (old_price) {
            updateQuery += `old_price, `;
            queryParams.push(old_price);
            paramCount++;
        }
        if (price) {
            updateQuery += `price, `;
            queryParams.push(price);
            paramCount++;
        }
        if (quantity) {
            updateQuery += `quantity, `;
            queryParams.push(quantity);
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

        updateQuery += ` ) RETURNING * `;

        const result = await dbQuery(updateQuery, queryParams);
        const product_resultData = result.rows[0];
        const product_id = product_resultData.id;

        //////////////////////////////////////////////

        // insert gallery images url into gallery_images table
        // there are multiple images in gallery images

        let gallery_result_data;

        if (gallery_images_url && gallery_images_url.length > 0) {
            const galleryInsertValues = gallery_images_url.map((url) => [
                product_id,
                url,
            ]);
            const galleryQuery = `
                INSERT INTO product_galleries (product_id, image_url)
                VALUES ${galleryInsertValues
                    .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
                    .join(", ")}
                RETURNING *;
            `;

            const galleryValues = galleryInsertValues.flat();

            const galleryResult = await dbQuery(galleryQuery, galleryValues);
            gallery_result_data = galleryResult.rows;

            if (galleryResult.rows.length !== gallery_images_url.length) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 500,
                    message: "Error creating all gallery images",
                });
            }
        }

        //////////////////////////////////////////////////////////

        // const data = result.rows[0];

        const data = {
            product: product_resultData,
            gallery: gallery_result_data,
        };

        await dbQuery("COMMIT");
        sendSuccessResponse(res, {
            statusCode: 201,
            data,
            message: "Product Created successfully",
        });
    } catch (error) {
        await dbQuery("ROLLBACK");
        console.error("Error in product creation:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error creating products",
            error: error.message,
        });
    }
};

// update
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id;

        const {
            name,
            // vendor_id,
            category_id,
            subcategory_id,
            brand_id,
            description,
            old_price,
            price,
            quantity,
            deleted_gallery_images,
        } = req.body;

        console.log(deleted_gallery_images);

        if (
            !(
                name ||
                category_id ||
                subcategory_id ||
                brand_id ||
                description ||
                old_price ||
                price ||
                quantity ||
                req.files.thumbnail ||
                deleted_gallery_images ||
                req.files.gallery
            )
        ) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "At least one parameter is required to update",
            });
        }

        // database logic

        // first check that product is of this vendor only or not
        const checkResult = await dbQuery(
            "SELECT id FROM products WHERE id = $1 AND vendor_id = $2",
            [id, vendor_id]
        );

        if (checkResult.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 403,
                message: "You are not authorized to update this product",
            });
        }

        if (
            name ||
            category_id ||
            subcategory_id ||
            brand_id ||
            description ||
            old_price ||
            price ||
            quantity ||
            req.files.thumbnail
        ) {
            // Get the file URLs from Cloudinary
            const thumbnail_url = req.files.thumbnail
                ? req.files.thumbnail[0].path
                : null;

            await dbQuery("BEGIN");

            let updateQuery = "UPDATE products SET ";
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
            if (subcategory_id) {
                updateQuery += `subcategory_id = $${paramCount}, `;
                queryParams.push(subcategory_id);
                paramCount++;
            }
            if (brand_id) {
                updateQuery += `brand_id = $${paramCount}, `;
                queryParams.push(brand_id);
                paramCount++;
            }
            if (thumbnail_url) {
                updateQuery += `thumbnail_url, `;
                queryParams.push(thumbnail_url);
                paramCount++;
            }
            if (old_price) {
                updateQuery += `old_price = $${paramCount}, `;
                queryParams.push(old_price);
                paramCount++;
            }

            if (price) {
                updateQuery += `price = $${paramCount}, `;
                queryParams.push(price);
                paramCount++;
            }

            if (description) {
                updateQuery += `description = $${paramCount}, `;
                queryParams.push(description);
                paramCount++;
            }
            if (quantity) {
                updateQuery += `quantity = $${paramCount}, `;
                queryParams.push(quantity);
                paramCount++;
            }

            // Remove trailing comma and space
            updateQuery = updateQuery.slice(0, -2);

            // change the updated_at time as of current time
            updateQuery += `, updated_at = NOW()`;

            updateQuery += ` WHERE id = $${paramCount} RETURNING id`;
            queryParams.push(id);

            console.log();

            const result = await dbQuery(updateQuery, queryParams);

            if (result.rows.length > 0) {
                const data = result.rows[0];
                await dbQuery("COMMIT");
            } else {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Product not found",
                });
            }
        } else if (deleted_gallery_images || req.files.gallery) {
            const gallery_images_url = req.files.gallery
                ? req.files.gallery.map((file) => file.path)
                : [];

            let gallery_result_data;

            if (gallery_images_url && gallery_images_url.length > 0) {
                await dbQuery("BEGIN");
                const galleryInsertValues = gallery_images_url.map((url) => [
                    id,
                    url,
                ]);
                const galleryQuery = `
                INSERT INTO product_galleries (product_id, image_url)
                VALUES ${galleryInsertValues
                    .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
                    .join(", ")}
                RETURNING *;
            `;

                const galleryValues = galleryInsertValues.flat();

                const galleryResult = await dbQuery(
                    galleryQuery,
                    galleryValues
                );
                gallery_result_data = galleryResult.rows;

                if (galleryResult.rows.length !== gallery_images_url.length) {
                    await dbQuery("ROLLBACK");
                    return sendErrorResponse(res, {
                        statusCode: 500,
                        message: "Error creating all gallery images",
                    });
                }
                await dbQuery("COMMIT");
            }

            //
            let deleted_gallery_result_data;
            if (deleted_gallery_images) {
                const deleted_gallery_images_ARRAY = JSON.parse(
                    deleted_gallery_images
                );
                await dbQuery("BEGIN");
                const galleryDeleteQuery = `DELETE FROM product_galleries WHERE id IN (${deleted_gallery_images_ARRAY
                    .map((_, idx) => `$${idx + 1}`)
                    .join(", ")}) AND product_id = $${
                    deleted_gallery_images_ARRAY.length + 1
                } RETURNING *;`;
                const galleryDeleteValues = [
                    ...deleted_gallery_images_ARRAY,
                    id,
                ];
                const galleryDeleteResult = await dbQuery(
                    galleryDeleteQuery,
                    galleryDeleteValues
                );

                if (
                    galleryDeleteResult.rows.length !==
                    deleted_gallery_images_ARRAY.length
                ) {
                    await dbQuery("ROLLBACK");
                    return sendErrorResponse(res, {
                        statusCode: 500,
                        message: "Error deleting all gallery images",
                    });
                }
                deleted_gallery_result_data = galleryDeleteResult.rows;
                await dbQuery("COMMIT");
            }
        }

        sendSuccessResponse(res, {
            statusCode: 200,
            message: "Product Updated Successfully.",
        });
    } catch (error) {
        console.error("Error in product update:", error);
        await dbQuery("ROLLBACK");
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating product",
            error: error.message,
        });
    }
};
// update the stock quantity only
export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id;

        const { action, quantity } = req.body;

        const [errors, isValid] = validateAllInputs({ quantity });

        if (!isValid) {
            return sendErrorResponse(res, {
                statusCode: 400,
                error: errors,
                message: "Invalid inputs",
            });
        }

        // Validate action (should be 'increase' or 'decrease')
        if (
            action !== "increase" &&
            action !== "decrease" &&
            action !== "update"
        ) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message:
                    "Invalid action. Should be 'increase' or 'decrease' or 'update'",
            });
        }

        // first check that product is of this vendor only or not
        const checkResult = await dbQuery(
            "SELECT id FROM products WHERE id = $1 AND vendor_id = $2",
            [id, vendor_id]
        );

        if (checkResult.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 403,
                message: "You are not authorized to update this product",
            });
        }

        // increase or decrease the stock quantity
        let query;
        let values;
        if (action === "increase") {
            query =
                "UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2 RETURNING *";
            values = [quantity, id];
        } else if (action === "decrease") {
            query =
                "UPDATE products SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2 RETURNING *";
            values = [quantity, id];
        } else {
            query =
                "UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2 RETURNING *";
            values = [quantity, id];
        }

        const result = await dbQuery(query, values);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: `Stock ${action}d successfully`,
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.error("Error in stock update:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating stock",
            error: error.message,
        });
    }
};

// update thumbnail image
export const updateThumbnail = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id;

        const { thumbnail_url } = req.body;

        // first check that product is of this vendor only or not
        const checkResult = await dbQuery(
            "SELECT id FROM products WHERE id = $1 AND vendor_id = $2",
            [id, vendor_id]
        );

        if (checkResult.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 403,
                message: "You are not authorized to update this product",
            });
        }

        const query = `UPDATE product_thumbnails SET thumbnail_url = $1 WHERE product_id = $2 RETURNING *`;
        const result = await dbQuery(query, [thumbnail_url, id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Thumbnail updated successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.error("Error in thumbnail update:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating thumbnail",
            error: error.message,
        });
    }
};

// add gallery images of the product
export const addGalleryImages = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id;

        const { gallery_images_url } = req.body;

        // first check that product is of this vendor only or not
        const checkResult = await dbQuery(
            "SELECT id FROM products WHERE id = $1 AND vendor_id = $2",
            [id, vendor_id]
        );

        if (checkResult.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 403,
                message: "You are not authorized to update this product",
            });
        }

        // insert gallery images url into gallery_images table
        // there are multiple images in gallery images

        let gallery_result_data;

        if (gallery_images_url && gallery_images_url.length > 0) {
            const galleryInsertValues = gallery_images_url.map((url) => [
                id,
                url,
            ]);
            const galleryQuery = `
                INSERT INTO product_galleries (product_id, image_url)
                VALUES ${galleryInsertValues
                    .map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`)
                    .join(", ")}
                RETURNING *;
            `;

            const galleryValues = galleryInsertValues.flat();

            const galleryResult = await dbQuery(galleryQuery, galleryValues);
            gallery_result_data = galleryResult.rows;

            if (galleryResult.rows.length !== gallery_images_url.length) {
                return sendErrorResponse(res, {
                    statusCode: 500,
                    message: "Error creating all gallery images",
                });
            }
        }

        sendSuccessResponse(res, {
            statusCode: 201,
            data: gallery_result_data,
            message: "Gallery images added successfully",
        });
    } catch (error) {
        console.error("Error in adding gallery images:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error adding gallery images",
            error: error.message,
        });
    }
};

// delete gallery image of the product by gallery image id and product id
export const deleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id;

        const { gallery_image_id } = req.body;

        // first check that product is of this vendor only or not
        const checkResult = await dbQuery(
            "SELECT id FROM products WHERE id = $1 AND vendor_id = $2",
            [id, vendor_id]
        );

        if (checkResult.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 403,
                message: "You are not authorized to update this product",
            });
        }

        const query =
            "DELETE FROM product_galleries WHERE id = $1 AND product_id = $2 RETURNING *";
        const result = await dbQuery(query, [gallery_image_id, id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 201,
                data,
                message: "Gallery image deleted successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Gallery image not found",
            });
        }
    } catch (error) {
        console.error("Error in deleting gallery images:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting gallery images",
            error: error.message,
        });
    }
};

// delete
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const vendor_id = req.user.id;

        // first check that product is of this vendor only or not
        const checkResult = await dbQuery(
            "SELECT id FROM products WHERE id = $1 AND vendor_id = $2",
            [id, vendor_id]
        );

        if (checkResult.rows.length === 0) {
            return sendErrorResponse(res, {
                statusCode: 403,
                message: "You are not authorized to delete this product",
            });
        }

        const query = "DELETE FROM products WHERE id = $1 RETURNING *";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Product deleted successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.error("Error in product deletion:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting product",
            error: error.message,
        });
    }
};

// delete product by admin
export const deleteProductByAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const query = "DELETE FROM products WHERE id = $1 RETURNING *";
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Product deleted successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.error("Error in product deletion:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error deleting product",
            error: error.message,
        });
    }
};

//////////////////////////////////////////////////////////////////
// output should be user friendly

// get all
export const getAllProductsFiltered = async (req, res) => {
    try {
        const {
            category,
            subcategory,
            brand,
            vendor_id,
            vendor_status,
            minPrice,
            maxPrice,
            availableStock,
            search,
            limit = 20,
            // page = 1,
            sort = "created_at",
            order = "DESC",
        } = req.query;

        let { page = 1 } = req.query;
        if (page == 0) {
            page = 1;
        }

        console.log(subcategory);

        console.log({ page });

        // Calculate the offset based on pagination
        const offset = (page - 1) * limit;

        // Base SQL query to fetch products with optional filters and sorting
        let query = `
        SELECT 
            p.name AS product_name,
            p.id AS product_id,
            p.old_price AS old_price,
            p.price AS current_price,
            p.vendor_id AS vendor_id,
            p.thumbnail_url AS thumbnail_url,
            --p.description AS product_description,
            p.quantity AS available_stock,
            p.average_rating AS average_rating,
            p.total_reviews AS total_reviews,
            --b.name AS brand_name,
            --c.name AS category_name,
            --sc.name AS subcategory_name,
            v.business_name AS vendor_name
            --ARRAY_AGG(pg.image_url) AS gallery_images
        FROM 
            products p
        LEFT JOIN 
            brands b ON p.brand_id = b.id
        JOIN 
            subcategories sc ON p.subcategory_id = sc.id
        JOIN 
            categories c ON sc.category_id = c.id
        JOIN 
            vendors v ON p.vendor_id = v.id
        WHERE 
            1= 1
    `;

        let countQuery = `
        SELECT COUNT(*) AS total
        FROM 
            products p
        LEFT JOIN 
            brands b ON p.brand_id = b.id
        JOIN 
            subcategories sc ON p.subcategory_id = sc.id
        JOIN 
            categories c ON sc.category_id = c.id
        JOIN 
            vendors v ON p.vendor_id = v.id
        WHERE 
            1= 1
    `;

        const conditions = [];
        const values = [];

        // Helper function to handle case insensitivity
        const caseInsensitiveCondition = (fieldName, paramValue) => {
            if (Array.isArray(paramValue)) {
                return `LOWER(${fieldName}) IN (${paramValue
                    .map((_, idx) => `$${values.length + idx + 1}`)
                    .join(", ")})`;
            } else {
                return `LOWER(${fieldName}) = LOWER($${values.length + 1})`;
            }
        };

        if (category) {
            // const categoryArray = Array.isArray(category)
            //     ? category.map((cat) => cat.toLowerCase())
            //     : [category.toLowerCase()];
            // conditions.push(caseInsensitiveCondition("c.id", category));
            // values.push(...category);

            conditions.push(`c.id = ANY($${values.length + 1}::int[])`);
            values.push(category);
        }

        if (subcategory) {
            // const subcategoryArray = Array.isArray(subcategory)
            //     ? subcategory.map((subcat) => subcat.toLowerCase())
            //     : [subcategory.toLowerCase()];
            // conditions.push(caseInsensitiveCondition("sc.id", subcategory));
            // values.push(...subcategory);

            conditions.push(`sc.id = ANY($${values.length + 1}::int[])`);
            values.push(subcategory);
        }

        if (brand) {
            // const brandArray = Array.isArray(brand)
            //     ? brand.map((br) => br.toLowerCase())
            //     : [brand.toLowerCase()];
            // conditions.push(caseInsensitiveCondition("b.id", brand));
            // values.push(...brand);

            conditions.push(`b.id = ANY($${values.length + 1}::int[])`);
            values.push(brand);
        }

        if (vendor_status) {
            conditions.push("v.status = $" + (values.length + 1));
            values.push(vendor_status);
        }

        if (vendor_id) {
            conditions.push("p.vendor_id = $" + (values.length + 1));
            values.push(vendor_id);
        }

        if (minPrice) {
            conditions.push("p.price >= $" + (values.length + 1));
            values.push(minPrice);
        }

        if (maxPrice) {
            conditions.push("p.price <= $" + (values.length + 1));
            values.push(maxPrice);
        }

        if (availableStock) {
            conditions.push("p.quantity >= $" + (values.length + 1));
            values.push(availableStock);
        }

        // Add search filter based on provided query parameter
        // if (search) {
        //     const searchQuery = `%${search}%`;
        //     conditions.push(`(
        //         p.name ILIKE $${values.length + 1} OR
        //         p.description ILIKE $${values.length + 1} OR
        //         b.name ILIKE $${values.length + 1} OR
        //         v.business_name ILIKE $${values.length + 1}
        //     )`);
        //     values.push(searchQuery);
        // }

        if (search) {
            const searchTerms = search.split(" ").join(" | ");
            const ilikeTerms = search.split(" ").map((term) => `%${term}%`);

            // Full-text search condition
            conditions.push(`
            (
                to_tsvector('english', p.name || ' ' || p.description || ' ' || b.name || ' ' || v.business_name) @@ to_tsquery($${
                    values.length + 1
                })
                OR
                (p.name ILIKE ANY(ARRAY[${ilikeTerms
                    .map((_, idx) => `$${values.length + 2 + idx}`)
                    .join(", ")}]))
            )
        `);
            values.push(searchTerms, ...ilikeTerms);
        }

        // Add search filter based on provided query parameter
        // if (search) {
        //     conditions.push(`
        //         to_tsvector('english', p.name || ' ' || p.description) @@ to_tsquery('english', $${
        //             values.length + 1
        //         }) OR
        //         to_tsvector('english', b.name) @@ to_tsquery('english', $${
        //             values.length + 1
        //         }) OR
        //         to_tsvector('english', v.business_name) @@ to_tsquery('english', $${
        //             values.length + 1
        //         })
        //     `);

        //     const searchQuery = search.split(" ").join(" | ");
        //     values.push(searchQuery);
        // }

        // Add WHERE clause if there are conditions
        if (conditions.length > 0) {
            query += " AND " + conditions.join(" AND ");
            countQuery += " AND " + conditions.join(" AND ");
        }

        // const countValues = values;

        // Add GROUP BY clause to group products by product id, brand name, category name, subcategory name, and vendor name
        query += " GROUP BY p.id, b.id, c.id, sc.id, v.business_name";

        // Add ORDER BY clause based on sort and order parameters
        switch (sort) {
            case "price":
                query += ` ORDER BY p.price ${order}`;
                break;
            case "created_at":
                query += ` ORDER BY p.created_at ${order}`;
                break;
            case "name":
                query += ` ORDER BY p.name ${order}`;
                break;
            case "total_items_sold":
                query += ` ORDER BY p.total_items_sold ${order}`;
                break;
            default:
                query += ` ORDER BY p.created_at ${order}`;
                break;
        }

        // Add LIMIT and OFFSET for pagination
        query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2};`;
        values.push(limit, offset);

        // console.log({ countQuery, query, values });

        const countResult = await dbQuery(countQuery, values.slice(0, -2));

        const totalProducts = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(totalProducts / limit);

        // console.log({ query, values });

        const result = await dbQuery(query, values);

        if (result.rows.length > 0) {
            const products = result.rows;

            // const products = result.rows.map((row) => ({
            //     product_name: row.product_name,
            //     product_id: row.product_id,
            //     product_description: row.product_description,
            //     old_price: row.old_price,
            //     current_price: row.current_price,
            //     available_stock: row.available_stock,
            //     brand_name: row.brand_name,
            //     category_name: row.category_name,
            //     subcategory_name: row.subcategory_name,
            //     vendor_name: row.vendor_name,
            // }));

            sendSuccessResponse(res, {
                statusCode: 200,
                data: {
                    products,
                    pagination: {
                        totalItems: totalProducts,
                        totalPages,
                        currentPage: parseInt(page),
                        limit: parseInt(limit),
                    },
                },
                message: "Products fetched successfully",
            });
        } else {
            return sendSuccessResponse(res, {
                statusCode: 200,
                data: {
                    products: [],
                    pagination: {
                        totalItems: 0,
                        totalPages: 0,
                        currentPage: 0,
                        limit: parseInt(limit),
                    },
                },
                message: "No Products found",
            });
        }
    } catch (error) {
        console.error("Error in fetching products:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching products",
            error: error.message,
        });
    }
};

// get brand names
export const getBrandNamesByCategoriesAndSubcategories = async (req, res) => {
    try {
        const { categories, subcategories } = req.query;

        // Base SQL query to fetch distinct brand names optionally filtered by categories and subcategories
        let query = `
            SELECT DISTINCT
                b.name AS brand_name
            FROM
                products p
            JOIN
                brands b ON p.brand_id = b.id
            JOIN
                subcategories sc ON p.subcategory_id = sc.id
            JOIN
                categories c ON sc.category_id = c.id
        `;

        const conditions = [];
        const values = [];

        // Function to handle case insensitive comparison with arrays
        const caseInsensitiveCondition = (
            fieldName,
            paramValue,
            startIndex
        ) => {
            return paramValue.map((item, index) => {
                values.push(item.toLowerCase());
                return `LOWER(${fieldName}) = LOWER($${
                    startIndex + index + 1
                })`;
            });
        };

        // Add filters based on provided query parameters
        if (categories && Array.isArray(categories) && categories.length > 0) {
            conditions.push(
                `(${caseInsensitiveCondition(
                    "c.name",
                    categories,
                    values.length
                ).join(" OR ")})`
            );
        }

        if (
            subcategories &&
            Array.isArray(subcategories) &&
            subcategories.length > 0
        ) {
            conditions.push(
                `(${caseInsensitiveCondition(
                    "sc.name",
                    subcategories,
                    values.length
                ).join(" OR ")})`
            );
        }

        // Add WHERE clause if there are conditions
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        // Add ORDER BY clause to sort brand names in ascending order
        query += " ORDER BY brand_name ASC";

        const result = await dbQuery(query, values);

        if (result.rows.length > 0) {
            // const data = result.rows;
            const brandNames = result.rows.map((row) => row.brand_name);

            sendSuccessResponse(res, {
                statusCode: 200,
                data: brandNames,
                message: "Brand names fetched successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Brand names not found for the specified criteria",
            });
        }
    } catch (error) {
        console.error("Error in fetching brand names:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching brand names",
            error: error.message,
        });
    }
};

// get one
export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // const query = "SELECT * FROM products WHERE id = $1";
        const query = `
        SELECT 
            p.name AS product_name,
            p.id AS product_id,
            p.category_id AS category_id,
            p.subcategory_id AS subcategory_id,
            p.brand_id AS brand_id,
            p.vendor_id AS vendor_id,
            p.old_price AS old_price,
            p.price AS current_price,
            p.description AS product_description,
            p.quantity AS available_stock,
            p.average_rating AS average_rating,
            p.total_reviews AS total_reviews,
            p.thumbnail_url AS thumbnail_url,
            b.name AS brand_name,
            c.name AS category_name,
            sc.name AS subcategory_name,
            v.business_name AS vendor_name,
            --pt.thumbnail_url,
            --ARRAY_AGG(pg.image_url) AS gallery_images
            json_agg(
                json_build_object(
                    'id', pg.id,
                    'url', pg.image_url
                )
            ) AS gallery_images
        FROM 
            products p
        LEFT JOIN 
            brands b ON p.brand_id = b.id
        JOIN 
            subcategories sc ON p.subcategory_id = sc.id
        JOIN 
            categories c ON sc.category_id = c.id
        JOIN 
            vendors v ON p.vendor_id = v.id
        --LEFT JOIN product_thumbnails pt ON p.id = pt.product_id
        LEFT JOIN product_galleries pg ON p.id = pg.product_id
        WHERE p.id = $1
        GROUP BY p.id, b.name, c.name, sc.name, v.business_name`;
        const result = await dbQuery(query, [id]);

        if (result.rows.length > 0) {
            const data = result.rows[0];
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Product fetched successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Product not found",
            });
        }
    } catch (error) {
        console.error("Error in fetching product:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching product",
            error: error.message,
        });
    }
};

// get product details of multiple products from an array
export const getProductsDetails = async (req, res) => {
    try {
        const { product_ids } = req.body;

        // check if product_ids is array or not
        if (!Array.isArray(product_ids) || product_ids.length === 0) {
            sendErrorResponse(res, {
                statusCode: 500,
                message: "product_ids should be an array.",
            });
        }

        // Base SQL query to fetch products with optional filters and sorting
        let query = `
        SELECT 
            p.name AS product_name,
            p.id AS product_id,
            p.old_price AS old_price,
            p.price AS current_price,
            p.quantity AS available_stock,
            p.thumbnail_url AS thumbnail_url,
            b.name AS brand_name,
            c.name AS category_name,
            sc.name AS subcategory_name,
            v.business_name AS vendor_name,
            p.vendor_id AS vendor_id
            --pt.thumbnail_url
        FROM 
            products p
        LEFT JOIN 
            brands b ON p.brand_id = b.id
        JOIN 
            subcategories sc ON p.subcategory_id = sc.id
        JOIN 
            categories c ON sc.category_id = c.id
        JOIN 
            vendors v ON p.vendor_id = v.id
        --LEFT JOIN product_thumbnails pt ON p.id = pt.product_id
        WHERE 
            v.status = 'approved' AND p.id IN (${product_ids
                .map((_, idx) => `$${idx + 1}`)
                .join(", ")})
        --GROUP BY p.id, b.name, c.name, sc.name, v.business_name
        --ORDER BY p.name ASC;
    `;

        const result = await dbQuery(query, product_ids);

        if (result.rows.length > 0) {
            const data = result.rows;
            sendSuccessResponse(res, {
                statusCode: 200,
                data,
                message: "Products fetched successfully",
            });
        } else {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Products not found",
            });
        }
    } catch (error) {
        console.error("Error in fetching products:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching products",
            error: error.message,
        });
    }
};

// get all products of a vendor
export const getVendorProducts = async (req, res) => {
    try {
        const vendor_id = req.user.id;

        const query = "SELECT * FROM products WHERE vendor_id = $1";
        const result = await dbQuery(query, [vendor_id]);

        const data = result.rows;
        sendSuccessResponse(res, {
            statusCode: 200,
            data,
            message: "All Products fetched successfully",
        });
    } catch (error) {
        console.error("Error in fetching products:", error);
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching products",
            error: error.message,
        });
    }
};
