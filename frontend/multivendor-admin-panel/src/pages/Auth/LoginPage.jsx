import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/slices/authSlice"; // Adjust path as needed
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [role, setRole] = useState("vendor"); // Default role
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(login({ credentials, role })).unwrap();
            navigate("/dashboard");
        } catch (error) {
            console.error("Error logging in:", error);
            toast.error("Error logging in");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border rounded"
                        >
                            <option value="admin">Admin</option>
                            <option value="vendor">Vendor</option>
                            <option value="agent">Delivery Agent</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className={`w-full py-2 bg-blue-500 text-white rounded ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
