import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/login" />;
    }
    // Render child routes
    return <Outlet />;
};

export default PrivateRoute;
