import React, { useEffect, useState } from "react";
import adminAxios from "../../utils/axios/admin_axios";

const MyProfileAdmin = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await adminAxios.get("/admin/profile");
            setProfile(response.data.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
        setLoading(false);
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!profile) {
        return <div className="text-center">Profile not found</div>;
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">My Profile</h2>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name:
                </label>
                <p className="text-lg text-gray-800">{profile.name}</p>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email:
                </label>
                <p className="text-lg text-gray-800">{profile.email}</p>
            </div>
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case "approved":
            return "text-green-600";
        case "pending":
            return "text-yellow-600";
        case "rejected":
            return "text-red-600";
        default:
            return "text-gray-600";
    }
};

export default MyProfileAdmin;
