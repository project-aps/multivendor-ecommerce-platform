import React from "react";

const ProductCardSkeleton = () => {
    return (
        <div className="animate-pulse p-4 bg-white rounded-lg shadow-md flex w-full h-60 ">
            <div className="w-1/3 h-full p-2 bg-gray-300 rounded-md"></div>
            <div className="w-2/3 h-full p-2">
                <div className="h-4 bg-gray-300 rounded-md w-1/4"></div>
                <div className="h-6 bg-gray-300 rounded-md w-3/4 mt-2"></div>
                <div className="h-4 bg-gray-300 rounded-md w-1/2 mt-3"></div>
                <div className="h-4 bg-gray-300 rounded-md w-1/2 mt-3"></div>
                <div className="h-6 bg-gray-300 rounded-md w-1/2 mt-8"></div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
