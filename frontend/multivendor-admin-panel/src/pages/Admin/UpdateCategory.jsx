import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const UpdateCategory = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [initialProductData, setInitialProductData] = useState({});
    const [productData, setProductData] = useState({
        name: "",
        description: "",
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await vendorProductsAxios.get(
                    `/category/${id}`
                );
                const data = response.data.data;
                setProductData(data);
                setInitialProductData(data); // Save the initial state
                setThumbnailPreview(data.image_src);
            } catch (error) {
                toast.error("Failed to fetch product details");
            }
        };
        fetchProduct();
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
        // Handle image change
        if (thumbnail) {
            formData.append("image", thumbnail);
        }

        try {
            await vendorProductsAxios.put(`/category/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Brands updated successfully");
            navigate("/admin/category");
        } catch (error) {
            toast.error("Failed to update product");
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
            <h2 className="text-2xl font-semibold mb-6">Update Category</h2>
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
                    Update Category
                </button>
            </form>
        </div>
    );
};

export default UpdateCategory;
