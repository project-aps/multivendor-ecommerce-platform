import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom"; // Import for fetching params from URL
import usersAxios from "../../utils/axios/users_axios";

const UserDetails = () => {
    const { userId } = useParams(); // Get the product ID from the URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const response = await usersAxios.get(`/users/${userId}`);
            if (response.data.success) {
                setUser(response.data.data);
                toast.success("User details fetched successfully");
            } else {
                setError("Failed to fetch user details");
                toast.error("Failed to fetch user details");
            }
        } catch (err) {
            setError("Failed to fetch user details");
            toast.error("Failed to fetch user details");
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async () => {
        try {
            const updatedStatus = !user.active;
            await usersAxios.patch(`/api/users/${user.id}/status`, {
                active: updatedStatus,
            });
            setUser({ ...user, active: updatedStatus });
            toast.success(
                `User ${
                    updatedStatus ? "activated" : "deactivated"
                } successfully`
            );
        } catch (err) {
            toast.error("Failed to update user status");
        }
    };

    if (loading) {
        return <p>Loading user details...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="p-4">
            {user && (
                <>
                    <div className="mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            User Details
                        </h2>
                        <p>Name: {user.name}</p>
                        <p>Email: {user.email}</p>
                        <p>
                            Status:{" "}
                            <span
                                className={
                                    user.active
                                        ? "text-green-500"
                                        : "text-red-500"
                                }
                            >
                                {user.active ? "Active" : "Inactive"}
                            </span>
                        </p>
                        <button
                            onClick={toggleUserStatus}
                            className={`mt-2 px-4 py-2 text-white rounded ${
                                user.active
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-green-500 hover:bg-green-600"
                            }`}
                        >
                            {user.active ? "Deactivate User" : "Activate User"}
                        </button>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Addresses
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map((address) => (
                            <div
                                key={address.id}
                                className="p-4 border border-gray-200 rounded-lg shadow-md"
                            >
                                <h4 className="text-lg font-semibold">
                                    {address.full_name}
                                </h4>
                                <p>{address.full_address}</p>
                                <p>
                                    {address.municipality}, {address.ward}
                                </p>
                                <p>
                                    {address.district}, {address.state},{" "}
                                    {address.country}
                                </p>
                                <p>Postal Code: {address.postal_code}</p>
                                <p>Contact: {address.contact_number}</p>
                                <p>
                                    Nearest Landmark: {address.nearest_landmark}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default UserDetails;
