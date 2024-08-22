import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import { useNavigate } from "react-router-dom";

const CreateProduct = () => {
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        subcategory_id: "",
        brand_id: "",
        description: "",
        old_price: "",
        price: "",
        quantity: "",
        thumbnail: null,
        gallery: [],
    });

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
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
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "thumbnail") {
            setFormData({ ...formData, thumbnail: files[0] });
        } else if (name === "gallery") {
            setFormData({ ...formData, gallery: Array.from(files) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);

        const form = new FormData();
        form.append("name", formData.name);
        form.append("category_id", formData.category_id);
        form.append("subcategory_id", formData.subcategory_id);
        form.append("brand_id", formData.brand_id);
        form.append("description", formData.description);
        form.append("old_price", formData.old_price);
        form.append("price", formData.price);
        form.append("quantity", formData.quantity);
        form.append("thumbnail", formData.thumbnail);
        form.append("gallery", formData.gallery);
        formData.gallery.forEach((file) => {
            form.append("gallery", file);
        });

        try {
            const response = await vendorProductsAxios.post(
                "/products/create",
                form,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setLoading(false);
            // console.log("Product created successfully:", response.data);
            if (response.data.success) {
                toast.success("Product added successfully");
                navigate("/vendor/products");
            } else {
                toast.error(response.data.message || "Failed to add product");
            }
        } catch (error) {
            setLoading(false);
            toast.error("Failed to add product");
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 bg-white shadow-lg rounded-lg max-w-7xl mx-auto"
        >
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Product Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter product name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Category
                </label>
                <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
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
                    value={formData.subcategory_id}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm"
                >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
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
                    value={formData.brand_id}
                    onChange={handleChange}
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

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter product description"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Old Price
                    </label>
                    <input
                        type="number"
                        name="old_price"
                        value={formData.old_price}
                        onChange={handleChange}
                        className="mt-1 block p-2 w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="Old Price"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Price
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="mt-1 block p-2 w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="Price"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Quantity
                </label>
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Quantity"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Thumbnail Image
                </label>
                <input
                    type="file"
                    name="thumbnail"
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    accept="image/*"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Gallery Images
                </label>
                <input
                    type="file"
                    name="gallery"
                    onChange={handleChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    accept="image/*"
                    multiple
                />
            </div>

            {/* while loading block the button  */}

            <button
                type="submit"
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={loading}
            >
                {!loading ? "Create Product" : "Creating Product..."}
            </button>
        </form>
    );
};

export default CreateProduct;
