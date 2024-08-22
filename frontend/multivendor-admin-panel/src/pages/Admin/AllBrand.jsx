import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const AllBrands = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await vendorProductsAxios.get("/brands");
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch brands");
            }
        } catch (error) {
            toast.error("An error occurred while fetching brands");
            console.error(error);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this brand?")) {
            return;
        }

        try {
            const response = await vendorProductsAxios.delete(
                `/category/${id}`
            );
            if (response.data.success) {
                toast.success("Brand deleted successfully");
                fetchCategories(); // Re-fetch categories after deletion
            } else {
                toast.error(response.data.message || "Failed to delete brand");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the brand");
            console.error(error);
        }
    };

    const handleUpdate = (id) => {
        // Redirect to update category page (e.g., /admin/update-category/:id)
        window.location.href = `/admin/brands/update/${id}`;
    };

    const handleView = (id) => {
        // Redirect to view category page (e.g., /admin/view-category/:id)
        window.location.href = `/admin/brands/${id}`;
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">All Brands</h2>

            {loading ? (
                <p>Loading brands...</p>
            ) : (
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border">ID</th>
                            <th className="px-4 py-2 border">Name</th>
                            <th className="px-4 py-2 border">Description</th>
                            <th className="px-4 py-2 border">Image</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-4 py-2 border">
                                    {category.id}
                                </td>
                                <td className="px-4 py-2 border">
                                    {category.name}
                                </td>
                                <td className="px-4 py-2 border">
                                    {category.description
                                        ? category.description
                                        : "N/A"}
                                </td>
                                <td className="px-4 py-2 border">
                                    {category.image_src ? (
                                        <img
                                            src={category.image_src}
                                            alt={category.name}
                                            className="w-20 h-20 object-cover"
                                        />
                                    ) : (
                                        "No Image"
                                    )}
                                </td>
                                <td className="px-4 py-2 border">
                                    <button
                                        onClick={() => handleView(category.id)}
                                        className="bg-blue-500 text-white px-4 py-1 rounded mr-2 hover:bg-blue-600"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleUpdate(category.id)
                                        }
                                        className="bg-yellow-500 text-white px-4 py-1 rounded mr-2 hover:bg-yellow-600"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(category.id)
                                        }
                                        className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AllBrands;
