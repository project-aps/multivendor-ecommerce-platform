import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const MyEarnings = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await vendorProductsAxios.get(
                    "/vendors/earnings"
                );
                if (response.data.success) {
                    setData(response.data.data);
                    toast.success("Earnings data retrieved successfully!");
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to retrieve earnings data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>No data available</p>
            </div>
        );
    }

    const { vendor, earnings } = data;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            {/* Vendor Information */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {vendor.business_name}
                </h2>
                <p className="text-gray-600">{vendor.description}</p>
                <div className="mt-4 flex flex-col sm:flex-row sm:justify-between">
                    <div className="text-gray-600">
                        <p>
                            <span className="font-semibold">Email:</span>{" "}
                            {vendor.email}
                        </p>
                        <p>
                            <span className="font-semibold">Status:</span>{" "}
                            {vendor.status}
                        </p>
                    </div>
                    <div className="text-gray-600 mt-4 sm:mt-0">
                        <p>
                            <span className="font-semibold">Total Income:</span>{" "}
                            Rs. {vendor.total_income}
                        </p>
                        <p>
                            <span className="font-semibold">Member Since:</span>{" "}
                            {new Date(vendor.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Earnings Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="w-full bg-gray-200 text-gray-600 text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Order ID</th>
                            <th className="py-3 px-6 text-left">
                                Order Amount
                            </th>
                            <th className="py-3 px-6 text-left">
                                Platform Fee
                            </th>
                            <th className="py-3 px-6 text-left">
                                Total Earned
                            </th>
                            <th className="py-3 px-6 text-left">Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-md">
                        {earnings.map((earning) => (
                            <tr
                                key={earning.id}
                                className="border-b border-gray-200 hover:bg-gray-100"
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
        </div>
    );
};

export default MyEarnings;
