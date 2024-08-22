import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import { useNavigate } from "react-router-dom";

const AllVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchVendors();
    }, [statusFilter]); // Re-fetch vendors whenever the status filter changes

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await vendorProductsAxios.get("/vendors/all", {
                params: statusFilter ? { status: statusFilter } : {},
            });
            if (response.data.success) {
                setVendors(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch vendors");
            }
        } catch (error) {
            toast.error("An error occurred while fetching vendors");
            console.error(error);
        }
        setLoading(false);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">All Vendors</h2>

            <div className="mb-4">
                <label className="block text-gray-700">Filter by Status</label>
                <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {loading ? (
                <p>Loading vendors...</p>
            ) : (
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border">ID</th>
                            <th className="py-2 px-4 border">Business Name</th>
                            <th className="py-2 px-4 border">Description</th>
                            <th className="py-2 px-4 border">Email</th>
                            <th className="py-2 px-4 border">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.map((vendor) => (
                            <tr
                                key={vendor.id}
                                onClick={() => {
                                    navigate(`/admin/vendors/${vendor.id}`);
                                }}
                                className="hover:bg-slate-50 cursor-pointer"
                            >
                                <td className="py-2 px-4 border">
                                    {vendor.id}
                                </td>
                                <td className="py-2 px-4 border">
                                    {vendor.business_name}
                                </td>
                                <td className="py-2 px-4 border">
                                    {vendor.description}
                                </td>
                                <td className="py-2 px-4 border">
                                    {vendor.email}
                                </td>
                                <td className="py-2 px-4 border">
                                    <span
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            vendor.status === "approved"
                                                ? "bg-green-100 text-green-800"
                                                : vendor.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {vendor.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllVendors;
