import React, { useState } from "react";

const ReviewProduct = ({ product, orderId, onSubmit, onClose }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");

    const handleSubmit = () => {
        const reviewData = {
            product_id: product.product_id,
            order_id: orderId,
            review,
            rating,
        };
        onSubmit(reviewData);
    };

    return (
        <div className="review-modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h3 className="text-xl font-semibold mb-4">Review Product:</h3>
                <h3 className="text-xl font-semibold mb-4">
                    {product.product_name}
                </h3>
                <div className="rating mb-4">
                    <label className="block mb-2">Rating:</label>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`cursor-pointer text-2xl ${
                                rating >= star
                                    ? "text-yellow-500"
                                    : "text-gray-300"
                            }`}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <div className="review mb-4">
                    <label className="block mb-2">Review:</label>
                    <textarea
                        className="w-full p-2 border rounded-md"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        rows="4"
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        className="mr-4 p-2 bg-gray-300 rounded-md hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        onClick={handleSubmit}
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewProduct;
