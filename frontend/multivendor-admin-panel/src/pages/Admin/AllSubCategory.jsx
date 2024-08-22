import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const AllSubCategory = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchSubcategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await vendorProductsAxios.get("/category");
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                toast.error(
                    response.data.message || "Failed to fetch categories"
                );
            }
        } catch (error) {
            toast.error("An error occurred while fetching categories");
            console.error(error);
        }
    };

    const fetchSubcategories = async (categoryId = "") => {
        setLoading(true);
        try {
            const response = await vendorProductsAxios.get("/subcategory", {
                params: categoryId ? { category_id: categoryId } : {},
            });
            if (response.data.success) {
                setSubcategories(response.data.data);
            } else {
                toast.error(
                    response.data.message || "Failed to fetch subcategories"
                );
            }
        } catch (error) {
            toast.error("An error occurred while fetching subcategories");
            console.error(error);
        }
        setLoading(false);
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        fetchSubcategories(categoryId);
    };

    const handleView = (subcategory) => {
        window.location.href = `/admin/subcategories/${subcategory.id}`;
        // Logic to view subcategory details
    };

    const handleUpdate = (subcategory) => {
        window.location.href = `/admin/subcategories/update/${subcategory.id}`;
    };

    const handleDelete = async (subcategoryId) => {
        if (
            window.confirm("Are you sure you want to delete this subcategory?")
        ) {
            try {
                const response = await vendorProductsAxios.delete(
                    `/subcategory/${subcategoryId}`
                );
                if (response.data.success) {
                    toast.success("Subcategory deleted successfully");
                    fetchSubcategories(selectedCategory); // Refresh the list after deletion
                } else {
                    toast.error(
                        response.data.message || "Failed to delete subcategory"
                    );
                }
            } catch (error) {
                toast.error("An error occurred while deleting the subcategory");
                console.error(error);
            }
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Subcategories</h2>

            <div className="mb-4">
                <label className="block text-gray-700">
                    Filter by Category
                </label>
                <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p>Loading subcategories...</p>
            ) : (
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border">ID</th>
                            <th className="py-2 px-4 border">Name</th>
                            <th className="py-2 px-4 border">Description</th>
                            <th className="py-2 px-4 border">Category</th>
                            <th className="py-2 px-4 border">Image</th>
                            <th className="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subcategories.map((subcategory) => (
                            <tr key={subcategory.id}>
                                <td className="py-2 px-4 border">
                                    {subcategory.id}
                                </td>
                                <td className="py-2 px-4 border">
                                    {subcategory.name}
                                </td>
                                <td className="py-2 px-4 border">
                                    {subcategory.description}
                                </td>
                                <td className="py-2 px-4 border">
                                    {categories.find(
                                        (cat) =>
                                            cat.id === subcategory.category_id
                                    )?.name || "N/A"}
                                </td>
                                <td className="py-2 px-4 border">
                                    {subcategory.image_src ? (
                                        <img
                                            src={subcategory.image_src}
                                            alt={subcategory.name}
                                            className="w-16 h-16 object-cover"
                                        />
                                    ) : (
                                        "No Image"
                                    )}
                                </td>
                                <td className="py-2 px-4 border">
                                    <button
                                        onClick={() => handleView(subcategory)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleUpdate(subcategory)
                                        }
                                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(subcategory.id)
                                        }
                                        className="bg-red-500 text-white px-3 py-1 rounded"
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

export default AllSubCategory;
