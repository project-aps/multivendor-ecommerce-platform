import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen p-4">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Unauthorized Access
                </h2>
                <p className="text-gray-700 mb-4">
                    You do not have permission to access this page. Please
                    contact your administrator if you believe this is a mistake.
                </p>
                <Link to="/login" className="text-blue-500 hover:underline">
                    Go to Login Page
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
