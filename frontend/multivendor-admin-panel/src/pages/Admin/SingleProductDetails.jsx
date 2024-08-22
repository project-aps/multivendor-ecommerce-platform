import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const SingleProductAdmin = () => {
    const { productId } = useParams(); // Get the product ID from the URL
    const navigate = useNavigate(); // For navigation
    const [product, setProduct] = useState(null);
    const [open, setOpen] = useState(false); // For delete confirmation modal
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await vendorProductsAxios.get(
                    `/products/${productId}`
                );
                setProduct(response.data.data);
                setLoading(false);
            } catch (error) {
                toast.error("Failed to fetch product details");
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleDelete = async () => {
        try {
            await vendorProductsAxios.delete(`/products/${productId}`);
            toast.success("Product deleted successfully");
            navigate("/vendor/products"); // Redirect to products list after deletion
        } catch (error) {
            toast.error("Failed to delete product");
        } finally {
            setOpen(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                        <img
                            src={product.thumbnail_url}
                            alt={product.product_name}
                            className="w-full h-64 object-cover"
                        />
                    </div>
                    <div className="md:w-2/3 p-6">
                        <h1 className="text-2xl font-bold mb-2">
                            {product.product_name}
                        </h1>
                        <p className="text-gray-700 mb-4">
                            {product.product_description}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-semibold text-green-600">
                                Rs. {product.current_price}
                            </span>
                            <span className="text-red-500  text-xl font-semibold line-through">
                                Rs. {product.old_price}
                            </span>
                        </div>
                        <div className="flex items-center mb-4">
                            <span className="text-gray-700 font-medium mr-2">
                                Stock:
                            </span>
                            <span className="text-gray-900">
                                {product.available_stock}
                            </span>
                        </div>
                        <div className="flex mb-4">
                            <span className="text-gray-700 font-medium mr-2">
                                Brand:
                            </span>
                            <span className="text-gray-900">
                                {product.brand_name}
                            </span>
                        </div>
                        <div className="flex mb-4">
                            <span className="text-gray-700 font-medium mr-2">
                                Category:
                            </span>
                            <span className="text-gray-900">
                                {product.category_name}
                            </span>
                        </div>
                        <div className="flex mb-4">
                            <span className="text-gray-700 font-medium mr-2">
                                Subcategory:
                            </span>
                            <span className="text-gray-900">
                                {product.subcategory_name}
                            </span>
                        </div>
                        <div className="flex gap-4 mb-4">
                            {/* <button
                                onClick={() =>
                                    navigate(
                                        `/vendor/products/update/${productId}`
                                    )
                                }
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Update
                            </button> */}
                            <button
                                onClick={() => setOpen(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-2">
                                Gallery
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {product.gallery_images.map((image, index) =>
                                    image.url ? (
                                        <img
                                            key={index}
                                            src={image.url}
                                            alt={`Gallery ${index + 1}`}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                    ) : (
                                        <div
                                            key={index}
                                            className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-gray-500"
                                        >
                                            No Image
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {open && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">
                            Confirm Delete
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this product?
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleProductAdmin;
