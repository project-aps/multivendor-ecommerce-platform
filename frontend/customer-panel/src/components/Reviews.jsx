import React, { useState, useEffect } from "react";
import vendorProductsAxios from "../utils/axios/vendors_products_axios";
import StarRating from "./StartRating";

const Reviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        current_page: 1,
        total_pages: 1,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [pagination.current_page]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await vendorProductsAxios.get(
                `/reviews/product/${productId}`,
                {
                    params: {
                        page: pagination.current_page,
                        limit: 10,
                    },
                }
            );
            if (response.data.success) {
                setReviews(response.data.data.reviews);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
        setLoading(false);
    };

    const handlePageChange = (newPage) => {
        setPagination((prevState) => ({
            ...prevState,
            current_page: newPage,
        }));
    };

    const getInitial = (name) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="reviews-section">
            <h2 className="text-xl font-semibold mb-4">Product Reviews</h2>
            {loading ? (
                <div>Loading reviews...</div>
            ) : (
                <>
                    {reviews.length === 0 ? (
                        <p>No reviews found for this product.</p>
                    ) : (
                        <div>
                            {reviews.map((review, index) => (
                                <div
                                    key={review.id}
                                    className="review-card p-4 mb-4 border rounded-md shadow-sm flex items-start"
                                >
                                    <div className="avatar rounded-full bg-blue-500 text-white text-3xl text-bold w-16 h-16 flex items-center justify-center mr-4">
                                        {getInitial(review.user.name)}
                                    </div>
                                    <div className="review-content">
                                        <div className="review-header mb-2">
                                            <h3 className="font-bold text-lg">
                                                {review.user.name}
                                            </h3>
                                            {/* <p className="text-gray-600">
                                                {review.user.email}
                                            </p> */}
                                        </div>
                                        <div className="review-body">
                                            <div className="rating mb-2">
                                                <StarRating
                                                    key={index}
                                                    rating={review.rating}
                                                    size="large"
                                                />
                                            </div>
                                            <p>{review.review}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="pagination mt-4">
                        {pagination.current_page > 1 && (
                            <button
                                onClick={() =>
                                    handlePageChange(
                                        pagination.current_page - 1
                                    )
                                }
                                className="mr-2 p-2 border rounded-md bg-gray-200 hover:bg-gray-300"
                            >
                                Previous
                            </button>
                        )}
                        {pagination.current_page < pagination.total_pages && (
                            <button
                                onClick={() =>
                                    handlePageChange(
                                        pagination.current_page + 1
                                    )
                                }
                                className="p-2 border rounded-md bg-gray-200 hover:bg-gray-300"
                            >
                                Next
                            </button>
                        )}
                        <div className="page-info mt-2">
                            Page {pagination.current_page} of{" "}
                            {pagination.total_pages}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reviews;
