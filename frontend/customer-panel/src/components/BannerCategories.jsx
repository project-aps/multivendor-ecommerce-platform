import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import { Link } from "react-router-dom";
import CustomRightArrow from "./CustomRightArrow";
import CustomLeftArrow from "./CustomLeftArrow";
import vendorProductsAxios from "../utils/axios/vendors_products_axios";
import toast from "react-hot-toast";

const responsive = {
    superLargeDesktop: {
        // the naming can be any, depends on you.
        breakpoint: { max: 4000, min: 3000 },
        items: 5,
    },
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 6,
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 4,
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 2,
    },
};

const BannerCategories = () => {
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
        <Carousel
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            transitionDuration={1000}
            className="flex flex-row p-4 max-w-screen-xl mx-auto lg:px-0 relative"
            customRightArrow={<CustomRightArrow />}
            customLeftArrow={<CustomLeftArrow />}
        >
            {categories.map((item) => (
                <Link
                    key={item?.id}
                    to={`/products?subcategory=${item?.id}`}
                    className="flex items-center gap-x-2 p-1 border border-gray-100 mr-1 flex-1 rounded-md hover:border-skyText hover:shadow-lg"
                >
                    <img
                        src={item?.image_src}
                        alt="categoryImage"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <p className="text-sm font-semibold"> {item?.name}</p>
                </Link>
            ))}
        </Carousel>
    );
};

export default BannerCategories;
