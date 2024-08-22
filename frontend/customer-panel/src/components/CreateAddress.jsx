import React, { useState } from "react";
import { toast } from "react-hot-toast";
import usersAxios from "../utils/axios/users_axios";
const CreateAddress = ({ onAddressCreated }) => {
    const [address, setAddress] = useState({
        country: "",
        state: "",
        district: "",
        municipality: "",
        ward: "",
        full_address: "",
        full_name: "",
        nearest_landmark: "",
        contact_number: "",
        postal_code: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            const response = await usersAxios.post("/address/add", address);
            if (response.data.success) {
                toast.success("Address added successfully");
                onAddressCreated(response.data.data); // Pass the newly created address back to the parent
                setAddress({
                    country: "",
                    state: "",
                    district: "",
                    municipality: "",
                    ward: "",
                    full_address: "",
                    full_name: "",
                    nearest_landmark: "",
                    contact_number: "",
                    postal_code: "",
                }); // Reset form
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error adding address:", error);
            toast.error("Error adding address");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg">
            <div className="mb-4">
                <label className="block text-md font-medium text-gray-700">
                    Full Name
                </label>
                <input
                    type="text"
                    name="full_name"
                    value={address.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Country
                    </label>
                    <input
                        type="text"
                        name="country"
                        value={address.country}
                        onChange={handleChange}
                        className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-md font-medium text-gray-700">
                        State
                    </label>
                    <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-md font-medium text-gray-700">
                        District
                    </label>
                    <input
                        type="text"
                        name="district"
                        value={address.district}
                        onChange={handleChange}
                        className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Municipality
                    </label>
                    <input
                        type="text"
                        name="municipality"
                        value={address.municipality}
                        onChange={handleChange}
                        className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div>
                    <label className="block text-md font-medium text-gray-700">
                        Ward
                    </label>
                    <input
                        type="number"
                        name="ward"
                        value={address.ward}
                        onChange={handleChange}
                        className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
            </div>
            <div className="mb-4">
                <label className="block text-md font-medium text-gray-700">
                    Full Address
                </label>
                <input
                    type="text"
                    name="full_address"
                    value={address.full_address}
                    onChange={handleChange}
                    className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-md font-medium text-gray-700">
                    Postal Code
                </label>
                <input
                    type="text"
                    name="postal_code"
                    value={address.postal_code}
                    onChange={handleChange}
                    className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-md font-medium text-gray-700">
                    Nearest Landmark
                </label>
                <input
                    type="text"
                    name="nearest_landmark"
                    value={address.nearest_landmark}
                    onChange={handleChange}
                    className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div className="mb-4">
                <label className="block text-md font-medium text-gray-700">
                    Contact Number
                </label>
                <input
                    type="text"
                    name="contact_number"
                    value={address.contact_number}
                    onChange={handleChange}
                    className="mt-1 block w-full border p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
            >
                {loading ? "Adding Address" : "Add Address"}
            </button>
        </form>
    );
};

export default CreateAddress;
