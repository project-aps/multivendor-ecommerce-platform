import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import toast from "react-hot-toast";

const AllProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [limit, setLimit] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchVendors();
    }, []);

    useEffect(() => {
        handleLimitChange();
    }, [limit]);

    const fetchProducts = async (
        query = "",
        vendorId = "",
        page = 1,
        limit = 10
    ) => {
        setLoading(true);
        try {
            const response = await vendorProductsAxios.get(
                `/products?sort=created_at&order=desc&search=${query}&vendor_id=${vendorId}&page=${page}&limit=${limit}`
            );
            if (response.data.success) {
                setProducts(response.data.data.products);
                setFilteredProducts(response.data.data.products);
                setPagination(response.data.data.pagination);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError("An error occurred while fetching products.");
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await vendorProductsAxios.get(`/vendors/all`);
            if (response.data.success) {
                setVendors(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch vendors");
            }
        } catch (error) {
            toast.error("An error occurred while fetching vendors.");
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchProducts(searchQuery, selectedVendor, newPage, limit);
        }
    };

    const handleLimitChange = () => {
        fetchProducts(searchQuery, selectedVendor, 1, limit);
    };

    const handleSearch = () => {
        fetchProducts(searchQuery, selectedVendor);
    };

    const handleVendorChange = (e) => {
        const vendorId = e.target.value;
        setSelectedVendor(vendorId);
        fetchProducts(searchQuery, vendorId);
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error)
        return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Vendor Products</h1>
            <div className="mb-4 flex items-center">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md mr-2"
                />
                <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Search
                </button>
            </div>
            <div className="mb-4 flex items-center">
                <label className="mr-2">Filter by Vendor:</label>
                <select
                    value={selectedVendor}
                    onChange={handleVendorChange}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Vendors</option>
                    {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                            {vendor.business_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="w-full bg-gray-100 border-b border-gray-200">
                            <th className="py-2 px-4 text-left text-gray-600">
                                ID
                            </th>
                            <th className="py-2 px-4 text-left text-gray-600">
                                Thumbnail
                            </th>
                            <th className="py-2 px-4 text-left text-gray-600">
                                Product Name
                            </th>
                            <th className="py-2 px-4 text-left text-gray-600">
                                Old Price
                            </th>
                            <th className="py-2 px-4 text-left text-gray-600">
                                Current Price
                            </th>
                            <th className="py-2 px-4 text-left text-gray-600">
                                Stock
                            </th>

                            <th className="py-2 px-4 text-left text-gray-600">
                                Vendor Name
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr
                                key={product.product_id}
                                className="cursor-pointer border-b border-gray-200 hover:bg-slate-100"
                                onClick={() => {
                                    navigate(
                                        `/admin/products/${product.product_id}`
                                    );
                                }}
                            >
                                <td className="py-2 px-4 text-gray-800">
                                    {product.product_id}
                                </td>
                                <td className="py-2 px-4">
                                    <img
                                        src={product.thumbnail_url}
                                        alt={product.product_name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                </td>
                                <td className="py-2 px-4 text-gray-800">
                                    {product.product_name}
                                </td>
                                <td className="py-2 px-4 text-gray-800">
                                    {product.old_price}
                                </td>
                                <td className="py-2 px-4 text-gray-800">
                                    {product.current_price}
                                </td>
                                <td className="py-2 px-4 text-gray-800">
                                    {product.available_stock}
                                </td>
                                <td className="py-2 px-4 text-gray-800">
                                    {product.vendor_name}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="bg-gray-300 px-4 py-2 rounded-md disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                {/* limit */}
                <div className="flex items-center">
                    <label className="mr-2">Limit</label>
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(parseInt(e.target.value));
                        }}
                        className="p-2 border border-gray-300 rounded-md"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="bg-gray-300 px-4 py-2 rounded-md disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AllProducts;
