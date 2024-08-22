import { dbQuery } from "../db/db.js";
import { getUserIDsDataDetails } from "../services/productsService.js";
import {
    sendErrorResponse,
    sendSuccessResponse,
} from "../utils/responseHandler.js";

// get all reviews of the user
export const getUserAllReviews = async (req, res) => {
    try {
        const user_id = req.user.id;

        const reviews = await dbQuery(
            `SELECT reviews.id, reviews.product_id AS product_id, reviews.order_id AS order_id, products.name as product_name, products.thumbnail_url as thumbnail_url, reviews.review, reviews.rating, reviews.created_at
             FROM reviews
             JOIN products ON reviews.product_id = products.id
             WHERE reviews.user_id = $1
             ORDER BY reviews.created_at DESC`,
            [user_id]
        );

        sendSuccessResponse(res, {
            statusCode: 200,
            data: reviews.rows,
            message: "All Reviews of User fetched successfully",
        });
    } catch (error) {
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching reviews of the user",
            error: error.message,
        });
    }
};

// update the review of the user
export const updateUserReview = async (req, res) => {
    try {
        const { review_id } = req.params;
        const { review, rating } = req.body;

        // if review only, rating only, both
        if (!review && !rating) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Review or Rating is required",
            });
        }

        if (rating && (rating < 1 || rating > 5)) {
            return sendErrorResponse(res, {
                statusCode: 400,
                message: "Rating should be between 1 and 5",
            });
        }

        // find the rating details and check the user_id and review is present or not

        const reviewDetails = await dbQuery(
            `SELECT user_id, product_id, rating FROM reviews WHERE id = $1`,
            [review_id]
        );

        if (reviewDetails.rowCount === 0) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "Review not found",
            });
        }

        const prev_rating = reviewDetails.rows[0].rating;

        if (reviewDetails.rows[0].user_id !== req.user.id) {
            return sendErrorResponse(res, {
                statusCode: 403,
                message: "You are not authorized to update this review",
            });
        }

        await dbQuery("BEGIN");

        let reviewResult = null;
        if (rating && !review) {
            reviewResult = await dbQuery(
                `UPDATE reviews
                 SET rating = $1
                 WHERE id = $2
                 RETURNING id`,
                [rating, review_id]
            );

            if (reviewResult.rowCount === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Review not found or Error updating review",
                });
            }
        } else if (review && !rating) {
            reviewResult = await dbQuery(
                `UPDATE reviews
                 SET review = $1
                 WHERE id = $2
                 RETURNING id`,
                [review, review_id]
            );

            if (reviewResult.rowCount === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Review not found or Error updating review",
                });
            }
        } else {
            reviewResult = await dbQuery(
                `UPDATE reviews
                 SET review = $1, rating = $2
                 WHERE id = $3
                 RETURNING id`,
                [review, rating, review_id]
            );

            if (reviewResult.rowCount === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Review not found or Error updating review",
                });
            }
        }

        if (rating && prev_rating != rating) {
            // update this product's average rating and total reviews
            const productRating = await dbQuery(
                `SELECT average_rating, total_reviews
                    FROM products
                    WHERE id = $1`,
                [reviewDetails.rows[0].product_id]
            );

            if (productRating.rowCount === 0) {
                await dbQuery("ROLLBACK");
                return sendErrorResponse(res, {
                    statusCode: 404,
                    message: "Product not found",
                });
            }

            const RatingCount = productRating.rows[0].total_reviews;
            const newAvgRating =
                (productRating.rows[0].average_rating * RatingCount -
                    prev_rating +
                    rating) /
                RatingCount;

            await dbQuery(
                `UPDATE products
                    SET average_rating = $1
                    WHERE id = $2`,
                [newAvgRating, reviewDetails.rows[0].product_id]
            );
        }

        await dbQuery("COMMIT");
        sendSuccessResponse(res, {
            statusCode: 200,
            message: "Review updated successfully",
        });
    } catch (error) {
        await dbQuery("ROLLBACK");
        sendErrorResponse(res, {
            statusCode: 500,
            message: "Error updating review",
            error: error.message,
        });
    }
};

// get all the reviews of the product with user details
export const getProductAllReviewsWithUser = async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        // 1. Fetch reviews for the specified product
        const reviewsResult = await dbQuery(
            `SELECT id, user_id, rating, review FROM reviews WHERE product_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [productId, limit, offset]
        );
        const reviews = reviewsResult.rows;

        // If no reviews found, return early
        if (reviews.length === 0) {
            return sendSuccessResponse(res, {
                statusCode: 200,
                data: {
                    reviews: [],
                    pagination: {
                        total: 0,
                        current_page: page,
                        total_pages: 0,
                    },
                },
                message: "Reviews fetched successfully",
            });
        }

        // 2. Extract user_ids from the reviews
        const userIds = reviews.map((review) => review.user_id);

        console.log(userIds);

        // 3. Fetch user details from the user microservice
        const UserIDS_response = await getUserIDsDataDetails(userIds);

        console.log(UserIDS_response);

        if (!UserIDS_response.data.success) {
            return sendErrorResponse(res, {
                statusCode: 404,
                message: "User Details not found",
            });
        }

        const users = UserIDS_response.data.data;

        // 4. Combine reviews with user details
        const reviewsWithUserDetails = reviews.map((review) => {
            const user = users.find((user) => user.id === review.user_id);
            return {
                ...review,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email, // Add other user fields as needed
                },
            };
        });

        // 5. Calculate pagination details
        const totalReviewsResult = await dbQuery(
            `SELECT COUNT(*) FROM reviews WHERE product_id = $1`,
            [productId]
        );

        const total = parseInt(totalReviewsResult.rows[0].count, 10);
        const totalPages = Math.ceil(total / limit);

        return sendSuccessResponse(res, {
            statusCode: 200,
            data: {
                reviews: reviewsWithUserDetails,
                pagination: {
                    total,
                    current_page: page,
                    total_pages: totalPages,
                },
            },
            message: "Reviews fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching reviews with user details:", error);
        return sendErrorResponse(res, {
            statusCode: 500,
            message: "Error fetching reviews with user details",
            error: error.message,
        });
    }
};
