import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice"; // Ensure this path matches your project structure
import toast from "react-hot-toast";

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await dispatch(logout()).unwrap();
            } catch (error) {
                console.error("Error logging out:", error);
                toast.error("Error logging out");
                navigate("/login");
            }
        };

        performLogout();
    }, [dispatch]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <p className="text-gray-700">Logging out...</p>
        </div>
    );
};

export default Logout;
