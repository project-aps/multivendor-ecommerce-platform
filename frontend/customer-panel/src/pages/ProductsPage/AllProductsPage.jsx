import React, { useState, useEffect } from "react";
import ProductCard from "../../components/ProductCard";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import ProductCardSkeleton from "../../components/ProductCardSkeleton";
import ProductCardHorizontal from "../../components/ProductCardHorizontal";

const debounceDelay = 500; // Delay in milliseconds

const breadcrumbsData = [
    {
        label: "Home",
        path: "/",
    },
    {
        label: "Products",
        path: "/products",
    },
];

const AllProductsPage = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]); // Default range
    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        subCategories: [],
        brands: [],
        minPrice: 0,
        maxPrice: 100000,
        vendor_id: null,
    });
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10,
    });

    useEffect(() => {
        // Get search query from URL params
        const search = searchParams.get("search") || "";
        const subcategory = searchParams.get("subcategory") || null;
        const category = searchParams.get("category") || null;
        const brands = searchParams.get("brands") || null;
        const vendor_id = searchParams.get("vendor_id") || null;

        setSearchQuery(search);
        setSelectedFilters((prevFilters) => ({
            ...prevFilters,
            subCategories: subcategory ? [subcategory] : [],
            categories: category ? [category] : [],
            brands: brands ? [brands] : [],
            vendor_id: vendor_id ? vendor_id : null,
        }));
    }, [searchParams]);

    useEffect(() => {
        // Fetch initial filter data
        fetchFilters();
        // fetchProducts();
    }, []);

    useEffect(() => {
        // Fetch products whenever filters, search query, or pagination changes
        // fetchProducts();

        const handler = setTimeout(() => {
            fetchProducts();
        }, debounceDelay);

        // Cleanup the timeout if searchQuery changes before the timeout completes
        return () => {
            clearTimeout(handler);
        };
    }, [selectedFilters, searchQuery, pagination.currentPage]);

    const fetchFilters = async () => {
        try {
            const [categoryResponse, subCategoryResponse, brandResponse] =
                await Promise.all([
                    vendorProductsAxios.get("/category"),
                    vendorProductsAxios.get("/subcategory"),
                    vendorProductsAxios.get("/brands"),
                ]);

            setCategories(categoryResponse.data.data);
            setSubCategories(subCategoryResponse.data.data);
            setBrands(brandResponse.data.data);
        } catch (error) {
            console.error("Error fetching filters", error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchQuery,
                category: selectedFilters.categories,
                subcategory: selectedFilters.subCategories,
                brand: selectedFilters.brands,
                minPrice: selectedFilters.minPrice,
                maxPrice: selectedFilters.maxPrice,
                page: pagination.currentPage,
                limit: pagination.limit,
                vendor_status: "approved",
            };

            if (selectedFilters.vendor_id) {
                params.vendor_id = selectedFilters.vendor_id;
            }

            // if min price == 0 then delete
            if (params.minPrice === 0) {
                delete params.minPrice;
            }

            // if max price == 1000000 then delete
            if (params.maxPrice === 100000) {
                delete params.maxPrice;
            }

            const response = await vendorProductsAxios.get("/products", {
                params,
            });

            if (response.data.success) {
                setProducts(response.data.data.products);
                setPagination({
                    ...pagination,
                    totalItems: response.data.data.pagination.totalItems,
                    totalPages: response.data.data.pagination.totalPages,
                    // currentPage: response.data.data.pagination.currentPage,
                });
            }
        } catch (error) {
            console.error("Error fetching products", error);
        }

        setLoading(false);
    };

    const handleFilterChange = (filterType, value, clear = false) => {
        setSelectedFilters((prevFilters) => {
            const newFilters = { ...prevFilters };

            if (clear) {
                // Clear specific filter type or all filters
                if (filterType === "all") {
                    // Clear all filters
                    return {
                        categories: [],
                        subCategories: [],
                        brands: [],
                        minPrice: 0,
                        maxPrice: 100000,
                    };
                } else if (filterType === "price") {
                    newFilters.minPrice = 0;
                    newFilters.maxPrice = 100000;
                } else {
                    newFilters[filterType] = [];
                }
            } else {
                // Handle adding/removing individual filters
                if (filterType === "price") {
                    newFilters.minPrice = value[0];
                    newFilters.maxPrice = value[1];
                } else {
                    if (newFilters[filterType].includes(value)) {
                        newFilters[filterType] = newFilters[filterType].filter(
                            (v) => v !== value
                        );
                    } else {
                        newFilters[filterType].push(value);
                    }
                }
            }

            return newFilters;
        });

        // Reset pagination to page 1 whenever filters are updated
        setPagination((prevPagination) => ({
            ...prevPagination,
            currentPage: 1,
        }));
    };

    const handleSearch = (e) => {
        setPagination((prevPagination) => ({
            ...prevPagination,
            currentPage: 1,
        }));
        if (e.key === "Enter" || e.type === "click") {
            // set page = 1

            fetchProducts();
        }
    };

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: newPage,
        }));
    };

    const clearCategoryFilters = () =>
        handleFilterChange("categories", null, true);
    const clearSubCategoryFilters = () =>
        handleFilterChange("subCategories", null, true);
    const clearBrandFilters = () => handleFilterChange("brands", null, true);
    const clearPriceFilters = () => handleFilterChange("price", null, true);
    const clearAllFilters = () => handleFilterChange("all", null, true);

    return (
        <div className="container">
            {/* Breadcrumbs component */}
            <div className="mt-8 mx-4 px-2">
                {breadcrumbsData && <Breadcrumbs crumbs={breadcrumbsData} />}
            </div>
            {/* inner component */}
            <div className="mx-4 mt-2 flex">
                {/* Filter Section */}
                <div className="w-1/4 pr-4 space-y-6 rounded-lg bg-gray-200 py-4 px-4">
                    <div className="flex justify-end">
                        <button
                            onClick={clearAllFilters}
                            className="hover:font-semibold"
                        >
                            Clear All Filters
                        </button>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <span className="flex justify-between">
                            <span className="text-xl font-semibold mb-2">
                                Category
                            </span>
                            <button
                                onClick={clearCategoryFilters}
                                className="hover:font-semibold"
                            >
                                Clear
                            </button>
                        </span>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id}>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={selectedFilters.categories.includes(
                                                category.id
                                            )}
                                            onChange={() =>
                                                handleFilterChange(
                                                    "categories",
                                                    category.id
                                                )
                                            }
                                        />
                                        {category.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <span className="flex justify-between">
                            <span className="text-xl font-semibold mb-2">
                                Sub-category
                            </span>
                            <button
                                onClick={clearSubCategoryFilters}
                                className="hover:font-semibold"
                            >
                                Clear
                            </button>
                        </span>
                        <div className="space-y-2">
                            {subCategories.map((subCategory) => (
                                <div key={subCategory.id}>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={selectedFilters.subCategories.includes(
                                                subCategory.id
                                            )}
                                            onChange={() =>
                                                handleFilterChange(
                                                    "subCategories",
                                                    subCategory.id
                                                )
                                            }
                                        />
                                        {subCategory.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <span className="flex justify-between">
                            <span className="text-xl font-semibold mb-2">
                                Brands
                            </span>
                            <button
                                onClick={clearBrandFilters}
                                className="hover:font-semibold"
                            >
                                Clear
                            </button>
                        </span>
                        <div className="space-y-2">
                            {brands.map((brand) => (
                                <div key={brand.id}>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="mr-2"
                                            checked={selectedFilters.brands.includes(
                                                brand.id
                                            )}
                                            onChange={() =>
                                                handleFilterChange(
                                                    "brands",
                                                    brand.id
                                                )
                                            }
                                        />
                                        {brand.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <span className="flex justify-between">
                            <span className="text-xl font-semibold mb-2">
                                Price Range
                            </span>
                            <button
                                onClick={clearPriceFilters}
                                className="hover:font-semibold"
                            >
                                Clear
                            </button>
                        </span>
                        <div className="flex space-x-2 items-center">
                            <input
                                type="number"
                                className="w-1/2 p-2 border rounded-lg"
                                value={selectedFilters.minPrice}
                                onChange={(e) =>
                                    handleFilterChange("price", [
                                        Number(e.target.value),
                                        selectedFilters.maxPrice,
                                    ])
                                }
                            />
                            <span>-</span>
                            <input
                                type="number"
                                className="w-1/2 p-2 border rounded-lg"
                                value={selectedFilters.maxPrice}
                                onChange={(e) =>
                                    handleFilterChange("price", [
                                        selectedFilters.minPrice,
                                        Number(e.target.value),
                                    ])
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Vertical Line */}
                <div className=" mr-4"></div>

                {/* Products Section */}
                <div className="w-3/4">
                    {/* Search Bar */}
                    <div className="flex mb-6">
                        <input
                            type="text"
                            className="flex-1 p-4 border rounded-lg"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <button
                            onClick={handleSearch}
                            className="ml-4 px-6 py-4 bg-blue-600 text-white rounded-lg"
                        >
                            Search
                        </button>
                    </div>

                    {/* Product Cards */}
                    {loading ? (
                        // Show skeleton loaders while loading
                        <div className="grid grid-cols-1 gap-6">
                            <ProductCardSkeleton />
                            <ProductCardSkeleton />
                            <ProductCardSkeleton />
                            {/* Add more skeletons as needed */}
                        </div>
                    ) : (
                        <div>
                            <p className="mb-3 text-xl font-semibold">
                                Results from {pagination.totalItems} Products
                            </p>
                            <div className="grid grid-cols-1 gap-6">
                                {products.map((product) => (
                                    <ProductCardHorizontal
                                        key={product.product_id}
                                        // product={product}
                                        item={product}
                                    />
                                ))}

                                {/* No products found */}
                                {!loading && products.length === 0 && (
                                    <div className="mt-1 text-3xl font-semibold">
                                        No Products Found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* horizontal line */}
                    <div className="mt-4 border-b border-gray-300"></div>

                    {/* Pagination */}
                    {!loading && products.length > 0 && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() =>
                                    handlePageChange(pagination.currentPage - 1)
                                }
                                disabled={pagination.currentPage === 1}
                                className="px-4 py-2 mx-1 bg-gray-300 rounded-lg"
                            >
                                Previous
                            </button>
                            {[...Array(pagination.totalPages)].map(
                                (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handlePageChange(index + 1)
                                        }
                                        className={`px-4 py-2 mx-1 rounded-lg ${
                                            pagination.currentPage === index + 1
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                )
                            )}
                            <button
                                onClick={() =>
                                    handlePageChange(pagination.currentPage + 1)
                                }
                                disabled={
                                    pagination.currentPage ===
                                    pagination.totalPages
                                }
                                className="px-4 py-2 mx-1 bg-gray-300 rounded-lg"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Items = ({ currentItems }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentItems &&
                currentItems?.map((item) => (
                    <ProductCard key={item?.product_id} item={item} />
                ))}
        </div>
    );
};

export default AllProductsPage;
