import React, { useEffect, useState } from "react";
import vendorProductsAxios from "../utils/axios/vendors_products_axios";
import toast from "react-hot-toast";
import Carousel from "react-multi-carousel";
import { Link } from "react-router-dom";

const responsive = {
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 5,
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 3,
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 2,
    },
};

const placeholderStyles = {
    width: "150px", // Adjust width as needed
    height: "150px", // Adjust height as needed
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0", // Light gray background
    color: "#777", // Dark gray text color
    fontSize: "16px", // Font size for the text
    fontWeight: "bold", // Bold text
    textAlign: "center",
    borderRadius: "8px", // Rounded corners
    overflow: "hidden",
    border: "2px solid #ccc", // Border for better visibility
};

const BannerBrands = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchBrands = async (categoryId = "") => {
            // setLoading(true);
            try {
                const response = await vendorProductsAxios.get("/brands");
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
        fetchBrands();
    }, []);

    return (
        <div className="p-4">
            <Carousel
                responsive={responsive}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={2000}
                swipeable={true}
                draggable={true}
                showDots={false}
                arrows={false}
                containerClass="carousel-container"
            >
                {categories.map((item, index) => (
                    <Link to={`/products?brands=${item.id}`}>
                        <div
                            key={item.id}
                            className="p-2 flex items-center justify-center"
                        >
                            {item.image_src ? (
                                <img
                                    src={item.image_src}
                                    alt={item.name}
                                    className="h-24"
                                />
                            ) : (
                                <div style={placeholderStyles}>{item.name}</div>
                            )}
                        </div>
                    </Link>
                ))}
            </Carousel>
        </div>
    );
};

export default BannerBrands;
