import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ size = "small", rating = 3, rating_counts = 0 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    // Determine star size based on the 'size' prop
    const starSize = size === "large" ? 24 : 16;

    return (
        <div className="text-base text-lightText flex items-center">
            <div className="flex items-center">
                {/* Full stars */}
                {Array(fullStars)
                    .fill()
                    .map((_, index) => (
                        <FaStar
                            key={index}
                            size={starSize}
                            className="text-yellow-400"
                        />
                    ))}

                {/* Half star */}
                {halfStar && (
                    <FaStarHalfAlt
                        size={starSize}
                        className="text-yellow-400"
                    />
                )}

                {/* Empty stars */}
                {Array(emptyStars)
                    .fill()
                    .map((_, index) => (
                        <FaRegStar
                            key={index}
                            size={starSize}
                            className="text-gray-400"
                        />
                    ))}
            </div>
            {rating_counts && (
                <div className="px-2">
                    <span>{rating}</span>
                    <span>{` (${rating_counts}) `}</span>
                </div>
            )}
        </div>
    );
};

export default StarRating;
