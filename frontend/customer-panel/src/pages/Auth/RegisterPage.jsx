import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/slices/authSlice"; // Adjust path as needed
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
    const [userData, setUserData] = useState({
        email: "",
        password: "",
        name: "",
    });
    const dispatch = useDispatch();
    const { isLoading } = useSelector((state) => state.auth);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register({ userData }))
            .unwrap()
            .then(() => toast.success("Registration successful"))
            .catch(() => toast.error("Registration failed"));
    };

    return (
        <div className="flex p-10 items-center justify-center">
            <div className="w-full max-w-md bg-gray-50 p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input
                            name="name"
                            value={userData.name}
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

                    <button
                        type="submit"
                        className={`w-full py-2 bg-blue-500 text-white rounded ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Registering..." : "Register"}
                    </button>

                    <p className="text-sm leading-6 text-center -mt-2 py-10">
                        Already have an Account{" "}
                        <button
                            onClick={() => {
                                navigate("/login");
                            }}
                            className="text-gray-700 font-semibold underline underline-offset-2 decoration-[1px] hover:text-black duration-200"
                        >
                            Login
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
