import React, { useState, useEffect } from "react";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
const SingleVendor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState("");

    const [earnings, setEarnings] = useState(null);
    const [vendorExtra, setVendorExtra] = useState(null);

    useEffect(() => {
        fetchVendor();
        fetchVendorEarnings();
    }, [id]);

    const fetchVendor = async () => {
        setLoading(true);
        try {
            const response = await vendorProductsAxios.get(`/vendors/${id}`);
            if (response.data.success) {
                setVendor(response.data.data);
                setStatus(response.data.data.status);
            } else {
                toast.error(response.data.message || "Failed to fetch vendor");
                navigate("/admin/vendors"); // Redirect if vendor is not found
            }
        } catch (error) {
            toast.error("An error occurred while fetching vendor details");
            console.error(error);
            navigate("/admin/vendors");
        }
        setLoading(false);
    };

    const fetchVendorEarnings = async () => {
        try {
            const response = await vendorProductsAxios.get(
                `/vendors/earnings/${id}`
            );
            if (response.data.success) {
                setEarnings(response.data.data.earnings);
                setVendorExtra(response.data.data.vendor);
            } else {
                toast.error(
                    response.data.message || "Failed to fetch vendor earnings"
                );
            }
        } catch (error) {
            toast.error("An error occurred while fetching vendor earnings");
            console.error(error);
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        setUpdating(true);
        try {
            const response = await vendorProductsAxios.put(
                `/vendors/${newStatus}/${id}`,
                {
                    status: newStatus,
                }
            );
            if (response.data.success) {
                toast.success("Vendor status updated successfully");
                setVendor((prev) => ({ ...prev, status: newStatus }));
            } else {
                toast.error(response.data.message || "Failed to update status");
            }
        } catch (error) {
            toast.error("An error occurred while updating the status");
            console.error(error);
        }
        setUpdating(false);
    };

    if (loading) {
        return <p>Loading vendor details...</p>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">View Vendor</h2>

            {vendor ? (
                <div>
                    <div className="mb-4">
                        <h3 className="text-lg font-medium">Business Name:</h3>
                        <p>{vendor.business_name}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-lg font-medium">Email:</h3>
                        <p>{vendor.email}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-lg font-medium">Description:</h3>
                        <p>{vendor.description}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="text-lg font-medium">Current Status:</h3>
                        <select
                            value={status}
                            onChange={handleStatusChange}
                            className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={updating}
                        >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                    {updating && <p>Updating status...</p>}
                </div>
            ) : (
                <p>Vendor not found</p>
            )}

            <h2 className="text-2xl font-semibold mt-8 mb-6">
                Vendor Earnings
            </h2>
            <div className="w-full p-6 bg-white shadow-lg rounded-lg">
                {/* Vendor Information */}
                {vendorExtra && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            {vendorExtra.business_name}
                        </h2>
                        <p className="text-gray-600">
                            {vendorExtra.description}
                        </p>
                        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between">
                            <div className="text-gray-600">
                                <p>
                                    <span className="font-semibold">
                                        Email:
                                    </span>{" "}
                                    {vendorExtra.email}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Status:
                                    </span>{" "}
                                    {vendorExtra.status}
                                </p>
                            </div>
                            <div className="text-gray-600 mt-4 sm:mt-0">
                                <p>
                                    <span className="font-semibold">
                                        Total Income:
                                    </span>{" "}
                                    Rs. {vendorExtra.total_income}
                                </p>
                                <p>
                                    <span className="font-semibold">
                                        Member Since:
                                    </span>{" "}
                                    {new Date(
                                        vendorExtra.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Earnings Table */}
                {earnings && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr className="w-full bg-gray-200 text-gray-600 text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">
                                        Order ID
                                    </th>
                                    <th className="py-3 px-6 text-left">
                                        Order Amount
                                    </th>
                                    <th className="py-3 px-6 text-left">
                                        Platform Fee
                                    </th>
                                    <th className="py-3 px-6 text-left">
                                        Total Earned
                                    </th>
                                    <th className="py-3 px-6 text-left">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-md">
                                {earnings.map((earning) => (
                                    <tr
                                        key={earning.id}
                                        onClick={() => {
                                            navigate(
                                                `/admin/orders/${earning.order_id}`
                                            );
                                        }}
                                        className="border-b cursor-pointer border-gray-200 hover:bg-gray-100"
                                    >
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            {earning.order_id}
                                        </td>
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            Rs. {earning.order_amount}
                                        </td>
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            Rs. {earning.platform_fee}
                                        </td>
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            Rs. {earning.total_earned}
                                        </td>
                                        <td className="py-3 px-6 text-left whitespace-nowrap">
                                            {new Date(
                                                earning.created_at
                                            ).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SingleVendor;
