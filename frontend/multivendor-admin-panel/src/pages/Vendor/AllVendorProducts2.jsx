import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const VendorProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});
    const [limit, setLimit] = useState(10);

    const navigate = useNavigate();

    // get vendor id from auth slice
    const { id } = useSelector((state) => state.auth.user);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        handleLimitChange();
    }, [limit]);

    const fetchProducts = async (query = "", page = 1, limit = 10) => {
        setLoading(true);
        try {
            const response = await vendorProductsAxios.get(
                `/products?vendor_id=${id}&sort=created_at&order=desc&search=${query}&page=${page}&limit=${limit}`
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
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchProducts(searchQuery, newPage, limit);
        }
    };

    const handleLimitChange = () => {
        fetchProducts(searchQuery, 1, limit);
    };

    const handleSearch = () => {
        fetchProducts(searchQuery);
    };

    const handleDelete = async (productId) => {
        try {
            const response = await vendorProductsAxios.delete(
                `/products/${productId}`
            );
            if (!response.data.success) {
                toast.error(response.data.message);
            } else {
                toast.success(response.data.message);
                // Update the product list
                const updatedProducts = products.filter(
                    (product) => product.product_id !== productId
                );
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
            }
        } catch (error) {
            console.error("Failed to delete the product:", error);
        }
    };

    const handleView = (productId) => {
        navigate(`/vendor/products/${productId}`);
    };

    const handleUpdate = (productId) => {
        navigate(`/vendor/products/update/${productId}`);
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
                                Actions
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
                                        `/vendor/products/${product.product_id}`
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

                                <td className="py-2 px-4 flex-col">
                                    <button
                                        onClick={() =>
                                            handleView(product.product_id)
                                        }
                                        className="mb-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleUpdate(product.product_id)
                                        }
                                        className="mb-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(product.product_id)
                                        }
                                        className="mb-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
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

export default VendorProducts;
