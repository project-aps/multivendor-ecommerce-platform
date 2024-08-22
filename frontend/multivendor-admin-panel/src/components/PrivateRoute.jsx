import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ allowedRoles }) => {
    const { user, role } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" />;
    }
    if (!allowedRoles.includes(role)) {
        // Redirect to unauthorized page if role is not allowed
        return <Navigate to="/unauthorized" />;
    }

    // Render child routes
    return <Outlet />;
};

export default PrivateRoute;
