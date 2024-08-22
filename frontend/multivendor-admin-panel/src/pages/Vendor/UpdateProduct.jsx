import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [initialProductData, setInitialProductData] = useState({});
    const [productData, setProductData] = useState({
        product_name: "",
        old_price: "",
        current_price: "",
        product_description: "",
        available_stock: "",
        brand_id: "",
        category_id: "",
        subcategory_id: "",
        thumbnail_url: "",
        gallery_images: [],
    });

    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [gallery, setGallery] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [addedGalleryPreviews, setAddedGalleryPreviews] = useState([]);
    const [deletedGalleryImages, setDeletedGalleryImages] = useState([]);

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await vendorProductsAxios.get(
                    `/products/${id}`
                );
                const data = response.data.data;
                setProductData(data);
                setInitialProductData(data); // Save the initial state
                setThumbnailPreview(data.thumbnail_url);
                setGalleryPreviews(data.gallery_images.map((img) => img.url));
            } catch (error) {
                toast.error("Failed to fetch product details");
            }
        };
        // Fetch categories, subcategories, and brands from the API
        const fetchDropdownData = async () => {
            try {
                const [categoriesRes, subcategoriesRes, brandsRes] =
                    await Promise.all([
                        vendorProductsAxios.get("/category"),
                        vendorProductsAxios.get("/subcategory"),
                        vendorProductsAxios.get("/brands"),
                    ]);

                setCategories(categoriesRes.data.data);
                setSubcategories(subcategoriesRes.data.data);
                setBrands(brandsRes.data.data);
            } catch (error) {
                toast.error("Error fetching dropdown data");
                console.error("Error fetching dropdown data:", error);
            }
        };

        fetchDropdownData();
        fetchProduct();
    }, [id]);

    useEffect(() => {
        console.log("category id changed");
        console.log(productData.category_id);

        const filtered = subcategories.filter(
            (subcategory) => subcategory.category_id == productData.category_id
        );
        console.log(filtered);
        setFilteredSubcategories(filtered);
    }, [productData.category_id, subcategories]);

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

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGallery([...gallery, ...files]);
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setAddedGalleryPreviews([...addedGalleryPreviews, ...newPreviews]);
    };

    const handleDeleteGalleryImage = (index) => {
        const updatedGalleryPreviews = galleryPreviews.filter(
            (_, i) => i !== index
        );
        setGalleryPreviews(updatedGalleryPreviews);

        // const updatedFiles = gallery.filter((_, i) => i !== index);
        // setGallery(updatedFiles);

        const removedImage = productData.gallery_images[index];
        if (removedImage) {
            setDeletedGalleryImages([...deletedGalleryImages, removedImage.id]);
            productData.gallery_images.splice(index, 1);
        }

        // console.log("deleted image index ", index);
        // console.log("deleted image id ", removedImage.id);
    };

    const handleDeleteAddedGalleryImage = (index) => {
        const updatedAddedGalleryPreviews = addedGalleryPreviews.filter(
            (_, i) => i !== index
        );
        setAddedGalleryPreviews(updatedAddedGalleryPreviews);

        const updatedFiles = gallery.filter((_, i) => i !== index);
        setGallery(updatedFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Compare and add only the changed fields
        if (productData.product_name !== initialProductData.product_name) {
            formData.append("name", productData.product_name);
        }
        if (productData.old_price !== initialProductData.old_price) {
            formData.append("old_price", productData.old_price);
        }
        if (productData.current_price !== initialProductData.current_price) {
            formData.append("price", productData.current_price);
        }
        if (
            productData.product_description !==
            initialProductData.product_description
        ) {
            formData.append("description", productData.product_description);
        }
        if (
            productData.available_stock !== initialProductData.available_stock
        ) {
            formData.append("quantity", productData.available_stock);
        }
        if (productData.brand_id != initialProductData.brand_id) {
            formData.append("brand_id", productData.brand_id);
        }
        if (productData.category_id != initialProductData.category_id) {
            formData.append("category_id", productData.category_id);
        }
        if (productData.subcategory_id != initialProductData.subcategory_id) {
            formData.append("subcategory_id", productData.subcategory_id);
        }

        // Handle thumbnail change
        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        // Handle gallery images change
        gallery.forEach((file, index) => {
            formData.append("gallery", file);
        });

        // Handle deleted gallery images
        if (deletedGalleryImages.length > 0) {
            formData.append(
                "deleted_gallery_images",
                JSON.stringify(deletedGalleryImages)
            );
        }

        try {
            await vendorProductsAxios.put(`/products/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Product updated successfully");
            navigate("/vendor/products");
        } catch (error) {
            toast.error("Failed to update product");
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
            <h2 className="text-2xl font-semibold mb-6">Update Product</h2>
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
                        Product Name
                    </label>
                    <input
                        type="text"
                        name="product_name"
                        value={productData.product_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                {/* Old Price and Current Price */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Old Price
                        </label>
                        <input
                            type="text"
                            name="old_price"
                            value={productData.old_price}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Current Price
                        </label>
                        <input
                            type="text"
                            name="current_price"
                            value={productData.current_price}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>

                {/* stock */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Available Stock
                    </label>
                    <input
                        type="number"
                        name="available_stock"
                        value={productData.available_stock}
                        onChange={handleInputChange}
                        className="w-40 px-3 py-2 border rounded-lg"
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Description
                    </label>
                    <textarea
                        name="product_description"
                        value={productData.product_description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg h-24"
                    />
                </div>

                {/* Brand, Category, SubCategory */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Category
                        </label>
                        <select
                            name="category_id"
                            value={productData.category_id}
                            onChange={handleInputChange}
                            className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Subcategory
                        </label>
                        <select
                            name="subcategory_id"
                            value={productData.subcategory_id}
                            onChange={handleInputChange}
                            className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select a subcategory</option>
                            {filteredSubcategories.map((subcategory) => (
                                <option
                                    key={subcategory.id}
                                    value={subcategory.id}
                                >
                                    {subcategory.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Brand
                        </label>
                        <select
                            name="brand_id"
                            value={productData.brand_id}
                            onChange={handleInputChange}
                            className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="">Select a brand</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Thumbnail Image */}
                {/* <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Thumbnail Image
                    </label>
                    <input
                        type="file"
                        onChange={handleThumbnailChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                    {thumbnailPreview && (
                        <img
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            className="mt-2 h-40 w-40 object-cover"
                        />
                    )}
                </div> */}

                {/* Gallery Images */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Gallery Images
                    </label>
                    <div className="mt-2 flex flex-wrap">
                        {galleryPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={preview}
                                    alt={`Gallery Preview ${index}`}
                                    className="h-20 w-20 object-cover m-1"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteGalleryImage(index)
                                    }
                                    className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full p-1"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Added Gallery Images */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Add Gallery Images
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleGalleryChange}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                    <div className="mt-2 flex flex-wrap">
                        {addedGalleryPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={preview}
                                    alt={`Gallery Preview ${index}`}
                                    className="h-20 w-20 object-cover m-1"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteAddedGalleryImage(index)
                                    }
                                    className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full p-1"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
                >
                    Update Product
                </button>
            </form>
        </div>
    );
};

export default UpdateProduct;
