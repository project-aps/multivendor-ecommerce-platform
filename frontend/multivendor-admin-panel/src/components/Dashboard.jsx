import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
    const { role } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.auth);

    // on the basis of role, navigate to the dashboard i.e. /vendor or /admin
    if (user && role === "vendor") {
        // navigate
        return <Navigate to="/vendor" />;
    }

    if (user && role === "admin") {
        return <Navigate to="/admin" />;
    }
};

export default Dashboard;
