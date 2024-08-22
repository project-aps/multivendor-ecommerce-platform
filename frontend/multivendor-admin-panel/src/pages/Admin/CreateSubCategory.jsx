import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const CreateSubcategory = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category_id", selectedCategory);
        if (image) formData.append("image", image);

        try {
            const response = await vendorProductsAxios.post(
                "/subcategory",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            if (response.data.success) {
                toast.success("Subcategory created successfully");
                setName("");
                setDescription("");
                setImage(null);
                setImagePreview(null);
                setSelectedCategory("");
            } else {
                toast.error(
                    response.data.message || "Failed to create subcategory"
                );
            }
        } catch (error) {
            toast.error("An error occurred while creating the subcategory");
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Create Sub Category</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Category
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="name"
                        className="block text-gray-700 text-sm font-bold mb-2"
                    >
                        Subcategory Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter subcategory name"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="description"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="image"
                    >
                        Sub Category Image
                    </label>
                    <input
                        type="file"
                        id="image"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="mt-4 w-32 h-32 object-cover rounded-lg"
                        />
                    )}
                </div>

                <button
                    type="submit"
                    className={`${
                        loading
                            ? "bg-gray-500"
                            : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Subcategory"}
                </button>
            </form>
        </div>
    );
};

export default CreateSubcategory;
