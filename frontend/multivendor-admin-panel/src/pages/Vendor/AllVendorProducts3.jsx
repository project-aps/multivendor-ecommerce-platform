import React, { useEffect, useState } from "react";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import { useSelector } from "react-redux";

const VendorProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // get vendor id from auth slice
    const { id } = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const vendor_Data_url = "/products" + "?vendor_id=" + id;
                const response = await vendorProductsAxios.get(vendor_Data_url); // Update with your API endpoint
                if (response.data.success) {
                    setProducts(response.data.data);
                } else {
                    setError(response.data.message);
                }
            } catch (error) {
                setError("An error occurred while fetching products.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error)
        return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Vendor Products</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                    <thead>
                        <tr className="w-full bg-gray-100 border-b border-gray-200">
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
                                Thumbnail
                            </th>
                            <th className="py-2 px-4 text-left text-gray-600">
                                Vendor
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr
                                key={product.product_id}
                                className="border-b border-gray-200"
                            >
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
                                <td className="py-2 px-4">
                                    <img
                                        src={product.thumbnail_url}
                                        alt={product.product_name}
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                </td>
                                <td className="py-2 px-4 text-gray-800">
                                    {product.vendor_name}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VendorProducts;
