import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { register as registerUser } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Register = () => {
    const [role, setRole] = useState("vendor");
    const [formData, setFormData] = useState({
        name: "",
        business_name: "",
        email: "",
        password: "",
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await dispatch(registerUser({ ...formData, role }));
        if (response.meta.requestStatus === "fulfilled") {
            toast.success("Registration successful! Please log in.");
            navigate("/login");
        }
    };

    const fieldName = role === "admin" ? "name" : "business_name";
    const labelName = role === "admin" ? "Name" : "Business Name";
    const placeholderText =
        role === "admin" ? "Enter your name" : "Enter your business name";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Register
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 mb-2"
                            htmlFor="name"
                        >
                            {labelName}
                        </label>
                        <input
                            type="text"
                            id="name"
                            // name="name"
                            // id={fieldName}
                            name={fieldName}
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded"
                            // placeholder="Enter your name"
                            placeholder={placeholderText}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 mb-2"
                            htmlFor="email"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 mb-2"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 mb-2">
                            Select Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        >
                            <option value="admin">Admin</option>
                            <option value="vendor">Vendor</option>
                            <option value="delivery">Delivery Agent</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-green-500 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;
