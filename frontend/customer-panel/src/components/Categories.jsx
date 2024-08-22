import React, { useEffect, useState } from "react";
import Container from "./Container";
import Title from "./Title";
import { Link } from "react-router-dom";
import vendorProductsAxios from "../utils/axios/vendors_products_axios";
import toast from "react-hot-toast";

const Categories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchSubcategories = async (categoryId = "") => {
            // setLoading(true);
            try {
                const response = await vendorProductsAxios.get("/subcategory", {
                    params: categoryId ? { category_id: categoryId } : {},
                });
                if (response.data.success) {
                    setCategories(response.data.data);
                } else {
                    toast.error(
                        response.data.message || "Failed to fetch subcategories"
                    );
                }
            } catch (error) {
                toast.error("An error occurred while fetching subcategories");
                console.error(error);
            }
            // setLoading(false);
        };
        fetchSubcategories();
    }, []);
    return (
        <Container>
            <div className="mb-10">
                <div className="flex items-center justify-between">
                    <Title text="Popular categories" />
                    <Link
                        to={"/products"}
                        className="font-medium relative group overflow-hidden"
                    >
                        View All Categories{" "}
                        <span className="absolute bottom-0 left-0 w-full block h-[1px] bg-gray-600 -translate-x-[100%] group-hover:translate-x-0 duration-300" />
                    </Link>
                </div>
                <div className="w-full h-[1px] bg-gray-200 mt-3" />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-7">
                {categories.map((item) => (
                    <Link
                        to={`/products?subcategory=${item?.id}`}
                        key={item?._id}
                        className="w-full bg-gray-200 h-auto relative group overflow-hidden"
                    >
                        <img
                            src={item?.image_src}
                            alt="categoryImage"
                            className="w-full h-auto rounded-md group-hover:scale-110 duration-300"
                        />
                        <div className="absolute bottom-3 w-full text-center">
                            <p className="text-sm md:text-base font-bold">
                                {item?.name}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </Container>
    );
};

export default Categories;
