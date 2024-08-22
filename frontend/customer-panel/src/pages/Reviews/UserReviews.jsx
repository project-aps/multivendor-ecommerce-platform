import React, { useState, useEffect } from "react";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import axios from "axios";
import { Link } from "react-router-dom";
import StarRating from "../../components/StartRating";
import toast from "react-hot-toast";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";

const breadcrumbsData = [
    {
        label: "Home",
        path: "/",
    },
    {
        label: "Profile",
        path: "/profile",
    },
    {
        label: "My Reviews",
        path: "/user-reviews",
    },
];

const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [editingReview, setEditingReview] = useState(null); // To track the review being edited
    const [newReviewText, setNewReviewText] = useState("");
    const [newRating, setNewRating] = useState(5);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Fetch all reviews of the user
        vendorProductsAxios
            .get("/reviews")
            .then((response) => {
                if (response.data.success) {
                    setReviews(response.data.data);
                }
            })
            .catch((error) => {
                console.error("Error fetching reviews", error);
            });

        setLoading(false);
    }, []);

    const handleEditClick = (review) => {
        setEditingReview(review.id);
        setNewReviewText(review.review);
        setNewRating(review.rating);
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
        setNewReviewText("");
        setNewRating(5);
    };

    const handleSaveReview = (id) => {
        vendorProductsAxios
            .put(`/reviews/${id}`, {
                review: newReviewText,
                rating: newRating,
            })
            .then((response) => {
                if (response.data.success) {
                    toast.success("Review Updated Successfully.");
                    setReviews((prevReviews) =>
                        prevReviews.map((review) =>
                            review.id === id
                                ? {
                                      ...review,
                                      review: newReviewText,
                                      rating: newRating,
                                  }
                                : review
                        )
                    );
                    handleCancelEdit();
                }
            })
            .catch((error) => {
                toast.error("Error updating Review.");
                console.error("Error updating review", error);
            });
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="p-4 space-y-6">
            {/* Breadcrumbs component */}
            {breadcrumbsData && <Breadcrumbs crumbs={breadcrumbsData} />}
            <h2 className="text-2xl font-bold mt-2 mb-4">My Reviews</h2>
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className=" flex-col space-x-4 items-start bg-gray-100 border rounded-lg p-6"
                >
                    <Link to={`/order/${review.order_id}`}>
                        <h2 className="font-bold text-xl mb-2">
                            Order ID: {review.order_id}
                        </h2>
                    </Link>

                    <div className="mb-4 p-4 border rounded-md shadow-sm bg-white">
                        <div className="flex items-center mb-2">
                            <img
                                src={review.thumbnail_url}
                                alt={review.product_name}
                                className="w-40 h-40 mr-4 rounded-md"
                            />
                            <div>
                                <h4 className="text-lg font-bold">
                                    {review.product_name}
                                </h4>

                                <div className="review-body mt-2">
                                    <div className="rating mb-2">
                                        <StarRating
                                            rating={review.rating}
                                            size="large"
                                        />
                                    </div>
                                    <p>{review.review}</p>
                                </div>

                                {/* <p className="text-gray-600 text-sm">
                                        {new Date(
                                            review.created_at
                                        ).toLocaleDateString()}
                                    </p> */}
                            </div>
                        </div>

                        <div>
                            {editingReview === review.id ? (
                                <div className="mt-4 space-y-2">
                                    <textarea
                                        value={newReviewText}
                                        onChange={(e) =>
                                            setNewReviewText(e.target.value)
                                        }
                                        className="w-full p-2 border rounded-lg"
                                    />
                                    <select
                                        value={newRating}
                                        onChange={(e) =>
                                            setNewRating(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        className="w-full p-2 border rounded-lg"
                                    >
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <option key={star} value={star}>
                                                {star} Star
                                                {star > 1 && "s"}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 bg-gray-200 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleSaveReview(review.id)
                                            }
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleEditClick(review)}
                                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                                >
                                    Edit Review
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserReviews;
