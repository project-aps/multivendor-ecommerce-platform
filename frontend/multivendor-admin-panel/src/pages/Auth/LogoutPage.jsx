import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice"; // Adjust path as needed
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { role, isLoading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        const performLogout = async () => {
            try {
                await dispatch(logout({ role })).unwrap();
                // toast.success("Logged out successfully");
                // Redirect to login page or handle post-logout actions
                navigate("/login");
            } catch (error) {
                toast.error("Logout failed");
            }
        };
        performLogout();
    }, [dispatch, role, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Logging Out</h2>
                {/* <p>Please wait...</p> */}
                {isLoading && !error && <p>Logging out...</p>}
                {error && <p>Logout failed</p>}
            </div>
        </div>
    );
};

export default LogoutPage;
