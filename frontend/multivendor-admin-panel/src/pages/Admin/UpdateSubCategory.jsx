import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const UpdateSubCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [initialProductData, setInitialProductData] = useState({});
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        category_id: "",
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");

    const [categories, setCategories] = useState([]);
    // const [selectedCategory, setSelectedCategory] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await vendorProductsAxios.get(
                    `/subcategory/${id}`
                );
                const data = response.data.data;
                setProductData(data);
                setInitialProductData(data); // Save the initial state
                setThumbnailPreview(data.image_src);
            } catch (error) {
                toast.error("Failed to fetch product details");
            }
        };
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
        fetchProduct();
        fetchCategories();
    }, [id]);

    const handleInputChange = (e) => {
        setProductData({
            ...productData,
            [e.target.name]: e.target.value,
        });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        setThumbnail(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Compare and add only the changed fields
        if (productData.name !== initialProductData.name) {
            formData.append("name", productData.name);
        }
        if (productData.description !== initialProductData.description) {
            formData.append("description", productData.description);
        }
        if (productData.category_id !== initialProductData.category_id) {
            formData.append("category_id", productData.category_id);
        }
        // Handle image change
        if (thumbnail) {
            formData.append("image", thumbnail);
        }

        try {
            await vendorProductsAxios.put(`/subcategory/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Brands updated successfully");
            navigate("/admin/subcategories");
        } catch (error) {
            toast.error("Failed to update product");
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
            <h2 className="text-2xl font-semibold mb-6">Update SubCategory</h2>
            <form onSubmit={handleSubmit}>
                {/* Thumbnail Image */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Thumbnail Image
                    </label>

                    {thumbnailPreview && (
                        <img
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            className="mt-2 h-80 w-80 object-cover"
                        />
                    )}

                    <input
                        type="file"
                        onChange={handleThumbnailChange}
                        className="w-full h-12 px-3 py-2 border rounded-lg"
                    />
                </div>
                {/* Product Name */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Name
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={productData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Category
                    </label>
                    <select
                        value={productData.category_id}
                        name="category_id"
                        onChange={handleInputChange}
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

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg h-24"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                    Update SubCategory
                </button>
            </form>
        </div>
    );
};

export default UpdateSubCategory;
