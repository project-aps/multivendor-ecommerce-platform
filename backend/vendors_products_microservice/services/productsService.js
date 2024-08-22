import { connectAMQP } from "../config/amqp.js";
import { dbQuery } from "../db/db.js";
import { v4 as uuidv4 } from "uuid";

const correlationMap = new Map();

export const processProductRequests = async () => {
    const { channel } = await connectAMQP();

    // product stock deduction
    channel.consume("product_stock_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "PRODUCT_REQUEST") {
            const product_stock = await reduceProductStocksByProductIDS(
                request.products
            );
            channel.sendToQueue(
                // request.replyTo,
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "PRODUCT_RESPONSE",
                        data: product_stock,
                        correlationId: msg.properties.correlationId,
                    })
                ),
                { correlationId: msg.properties.correlationId }
            );
        }
        channel.ack(msg);
    });

    // product review addition
    channel.consume("product_add_review_request_queue", async (msg) => {
        const request = JSON.parse(msg.content.toString());
        if (request.type === "PRODUCT_REVIEW_REQUEST") {
            const product_review = await addProductReview(
                request.user_id,
                request.order_id,
                request.product_id,
                request.review,
                request.rating
            );
            channel.sendToQueue(
                // request.replyTo,
                msg.properties.replyTo,
                Buffer.from(
                    JSON.stringify({
                        type: "PRODUCT_REVIEW_RESPONSE",
                        data: product_review,
                        correlationId: msg.properties.correlationId,
                    })
                ),
                { correlationId: msg.properties.correlationId }
            );
        }
        channel.ack(msg);
    });
};

// db queries
const reduceProductStocksByProductIDS = async (products) => {
    // products = [
    //     {
    //         id: 1,
    //         quantity: 1,
    //     },
    //     {
    //         id: 2,
    //         quantity,
    //     },
    // ];

    try {
        await dbQuery("BEGIN"); // Start a transaction

        console.log("inside products microservice");
        console.log(products);

        // // Create a batch update query
        // const queryText = `
        //     WITH updated_products AS (
        //         SELECT
        //             UNNEST($1::int[]) AS id,
        //             UNNEST($2::int[]) AS quantity
        //     )
        //     UPDATE products
        //     SET quantity = quantity - updated_products.quantity
        //     FROM updated_products
        //     WHERE products.id = updated_products.id
        //     AND products.quantity >= updated_products.quantity
        //     RETURNING products.id, products.quantity;
        // `;

        // // Prepare the arrays for product IDs and quantities
        // const productIds = products.map((product) => product.id);
        // const quantities = products.map((product) => product.quantity);

        // // Execute the batch update query
        // const result = await dbQuery(queryText, [productIds, quantities]);

        // // Check if all products were updated
        // if (result.rowCount !== products.length) {
        //     await dbQuery("ROLLBACK");
        //     return {
        //         success: false,
        //         message: "Not enough stock for one or more products",
        //     };
        // }

        for (const product of products) {
            const { id, quantity } = product;

            console.log(id, quantity);

            // Asynchronous query to update the stock
            const result = await dbQuery(
                `UPDATE products 
                 SET quantity = quantity - $1, total_items_sold = total_items_sold + $1 
                 WHERE id = $2 AND quantity >= $1 
                 RETURNING id, quantity`,
                [quantity, id]
            );

            // If no rows are updated, it means there's not enough stock
            if (result.rowCount === 0) {
                // throw new Error(`Not enough stock for product ID: ${id}`);
                await dbQuery("ROLLBACK");
                return {
                    success: false,
                    message: `Not enough stock for product ID: ${id}`,
                };
            }
        }

        await dbQuery("COMMIT");
        console.log("done");
        return {
            success: true,
            message: "Stocks reduced successfully",
        };
    } catch (error) {
        await dbQuery("ROLLBACK");
        return {
            success: false,
            message: "Error in stock deduction.",
            error: error.message,
        };
    }
};

// add reviews to the product and reviews table
const addProductReview = async (
    user_id,
    order_id,
    product_id,
    review,
    rating
) => {
    try {
        if (!user_id || !order_id || !product_id || !review) {
            return {
                success: false,
                message: "Missing required fields",
            };
        }

        // check rating is either 1 2 3 4 or 5 only
        if (![1, 2, 3, 4, 5].includes(rating)) {
            return {
                success: false,
                message: "Rating should be between 1 and 5",
            };
        }

        await dbQuery("BEGIN");
        // create the review in the reviews table
        let reviewResult = null;
        if (review) {
            reviewResult = await dbQuery(
                `INSERT INTO reviews (user_id, order_id, product_id, review, rating)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id`,
                [user_id, order_id, product_id, review, rating]
            );
        } else {
            reviewResult = await dbQuery(
                `INSERT INTO reviews (user_id, order_id, product_id, rating)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [user_id, order_id, product_id, rating]
            );
        }

        if (reviewResult.rowCount === 0) {
            await dbQuery("ROLLBACK");
            return {
                success: false,
                message: "Error in adding review",
            };
        }

        // update the avg_rating and rating_count in products table
        const productRating = await dbQuery(
            `SELECT average_rating, total_reviews
             FROM products
             WHERE id = $1`,
            [product_id]
        );

        if (productRating.rowCount === 0) {
            await dbQuery("ROLLBACK");
            return {
                success: false,
                message: "Product not found",
            };
        }

        const newRatingCount = productRating.rows[0].total_reviews + 1;
        const newAvgRating =
            (productRating.rows[0].average_rating *
                productRating.rows[0].total_reviews +
                rating) /
            newRatingCount;

        await dbQuery(
            `UPDATE products
             SET average_rating = $1, total_reviews = $2
             WHERE id = $3`,
            [newAvgRating, newRatingCount, product_id]
        );

        await dbQuery("COMMIT");
        return {
            success: true,
            data: {
                review_id: reviewResult.rows[0].id,
            },
            message: "Product Review added successfully",
        };
    } catch (error) {
        await dbQuery("ROLLBACK");
        return {
            success: false,
            message: "Error in product review addition.",
            error: error.message,
        };
    }
};

//
// get user details
export const getUserIDsDataDetails = async (userId) => {
    const { channel } = await connectAMQP();
    const correlationId = uuidv4();
    const responseQueue = "user_details_response_queue";

    return new Promise((resolve, reject) => {
        // Store the resolve function in the correlationMap
        correlationMap.set(correlationId, resolve);

        channel.consume(
            responseQueue,
            (msg) => {
                const receivedCorrelationId = msg.properties.correlationId;
                if (correlationMap.has(receivedCorrelationId)) {
                    // Resolve the corresponding promise
                    const resolveFn = correlationMap.get(receivedCorrelationId);
                    resolveFn(JSON.parse(msg.content.toString()));

                    // Remove the correlationId from the map
                    correlationMap.delete(receivedCorrelationId);

                    // Acknowledge the message
                    channel.ack(msg);
                }
            },
            { noAck: false }
        );

        channel.sendToQueue(
            "user_details_request_queue",
            Buffer.from(
                JSON.stringify({
                    type: "USER_REQUEST",
                    user_ids: userId,
                })
            ),
            { correlationId, replyTo: responseQueue }
        );
    });
};
