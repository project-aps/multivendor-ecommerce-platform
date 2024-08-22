import React from "react";
import PropTypes from "prop-types";
import {
    FaCheckCircle,
    FaBoxOpen,
    FaShippingFast,
    FaTruck,
} from "react-icons/fa";

const OrderStatusTimeline = ({ orderStatus }) => {
    const statuses = [
        { key: "confirmed", label: "Confirmed", icon: <FaCheckCircle /> },
        { key: "approved", label: "Approved", icon: <FaBoxOpen /> },
        {
            key: "delivery_processing",
            label: "Delivery Processing",
            icon: <FaShippingFast />,
        },
        { key: "delivered", label: "Delivered", icon: <FaTruck /> },
    ];

    // Determine the index of the current status in the timeline
    const currentStatusIndex = statuses.findIndex(
        (status) => status.key === orderStatus
    );

    return (
        <div className="relative w-full p-4">
            {/* Background line for the timeline */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 transform -translate-y-1/2"></div>

            {/* Progress line for completed steps */}
            <div
                className="absolute top-1/2 left-0 h-1 bg-green-500 transform -translate-y-1/2"
                style={{
                    width: `${
                        ((currentStatusIndex + 1) / statuses.length) * 100
                    }%`,
                }}
            ></div>

            {/* Render status icons and labels */}
            <div className="flex justify-between">
                {statuses.map((status, index) => (
                    <div
                        key={status.key}
                        className="flex flex-col items-center w-1/4 relative"
                    >
                        {/* Circle with icon */}
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 relative z-10 ${
                                index <= currentStatusIndex
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-300 text-gray-500"
                            }`}
                        >
                            {status.icon}
                        </div>

                        {/* Status label */}
                        <div className="text-center">
                            <span
                                className={`${
                                    index <= currentStatusIndex
                                        ? "text-green-500"
                                        : "text-gray-500"
                                } font-medium capitalize`}
                            >
                                {status.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

OrderStatusTimeline.propTypes = {
    orderStatus: PropTypes.oneOf([
        "confirmed",
        "approved",
        "delivery_processing",
        "delivered",
    ]).isRequired,
};

export default OrderStatusTimeline;
