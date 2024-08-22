import React, { useState } from "react";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const CreateCategory = () => {
    const [name, setName] = useState(null);
    const [description, setDescription] = useState(null);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            if (image) {
                formData.append("image", image);
            }

            const response = await vendorProductsAxios.post(
                "/category",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                toast.success("Category created successfully");
                setName("");
                setDescription("");
                setImage(null);
                setPreview(null);
            } else {
                toast.error(
                    response.data.message || "Failed to create category"
                );
            }
        } catch (error) {
            toast.error("An error occurred while creating the category");
            console.error(error);
        }

        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Create New Category</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-4">
                    <label
                        className="block text-gray-700 text-sm font-bold mb-2"
                        htmlFor="name"
                    >
                        Category Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        Category Image
                    </label>
                    <input
                        type="file"
                        id="image"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {preview && (
                        <div className="mt-4 w-48">
                            <p className="text-gray-700 text-sm mb-2">
                                Image Preview:
                            </p>
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`w-full py-2 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Category"}
                </button>
            </form>
        </div>
    );
};

export default CreateCategory;
