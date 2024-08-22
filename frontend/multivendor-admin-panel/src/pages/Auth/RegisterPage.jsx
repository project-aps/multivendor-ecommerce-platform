import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/slices/authSlice"; // Adjust path as needed
import { toast } from "react-hot-toast";

const RegisterPage = () => {
    const [userData, setUserData] = useState({
        email: "",
        password: "",
        access_code: "",
        name: "",
        business_name: "",
    });
    const [role, setRole] = useState("vendor"); // Default role
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register({ userData, role }))
            .unwrap()
            .then(() => toast.success("Registration successful"))
            .catch(() => toast.error("Registration failed"));
    };

    const fieldName = role === "admin" ? "name" : "business_name";
    const labelName = role === "admin" ? "Name" : "Business Name";
    const placeholderText =
        role === "admin" ? "Enter your name" : "Enter your business name";

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            {labelName}
                        </label>
                        <input
                            // name="name"
                            id={fieldName}
                            name={fieldName}
                            value={userData[fieldName]}
                            // value={userData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={userData.email}
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
                            value={userData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded"
                            required
                        />
                    </div>

                    {role === "admin" && (
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                ACCESS CODE :
                            </label>
                            <input
                                name="access_code"
                                value={userData.access_code}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded"
                                required
                            />
                        </div>
                    )}
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
                        {isLoading ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
