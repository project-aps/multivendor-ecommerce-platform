import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import Container from "../../components/Container";
import PriceTag from "../../components/PriceTag";
// import { FaRegEye } from "react-icons/fa";
import FormattedPrice from "../../components/FormattedPrice";
import AddToCartBtn from "../../components/AddToCartBtn";
// import { productPayment } from "../assets";
import StarRating from "../../components/StartRating";
import toast from "react-hot-toast";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios";
import FAQs from "../../components/FAQs";
import Breadcrumbs from "../../components/Breadcrumbs";
import Reviews from "../../components/Reviews";

const ProductPage = () => {
    const { id } = useParams();

    const [productData, setProductData] = useState(null);
    const [breadcrumbsData, setBreadcrumbsData] = useState(null);
    const [offData, setOffData] = useState(0);
    const [loading, setLoading] = useState(false);
    const [imgUrl, setImgUrl] = useState("");

    const [allImages, setAllImages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await vendorProductsAxios.get(
                    `/products/${id}`
                );
                if (response.data.success) {
                    const result = response.data.data;
                    setProductData(result);
                    // get url of gallery images from all gallery images

                    const galleryImagesUrl = result.gallery_images.map(
                        (image) => {
                            if (image.url) {
                                return image.url;
                            }
                        }
                    );
                    setAllImages([result.thumbnail_url, ...galleryImagesUrl]);
                } else {
                    toast.error(
                        response.data.message || "Failed to fetch product"
                    );
                }
            } catch (error) {
                toast.error("An error occurred while fetching products");
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        // breadcrumbs utils
        const truncateName = (name, wordLimit = 5) => {
            const words = name.split(" ");
            if (words.length <= wordLimit) return name;
            return words.slice(0, wordLimit).join(" ") + "...";
        };

        const generateBreadcrumbData = (productData) => {
            return [
                {
                    label: "Home",
                    path: "/",
                },
                {
                    label: "Products",
                    path: "/products",
                },
                {
                    label: productData.vendor_name,
                    path: `/products?vendor_id=${productData.vendor_id}`,
                },
                {
                    label: productData.category_name,
                    path: `/products?category=${productData.category_id}`,
                },
                {
                    label: productData.subcategory_name,
                    path: `/products?subcategory=${productData.subcategory_id}`,
                },
                {
                    label: truncateName(productData.product_name),
                    path: `/product/${productData.product_id}`,
                },
            ];
        };
        if (productData) {
            setImgUrl(productData?.thumbnail_url);
            setBreadcrumbsData(generateBreadcrumbData(productData));
            const percentage =
                ((productData?.old_price - productData?.current_price) /
                    productData?.old_price) *
                100;
            setOffData(percentage);
            // setColor(productData?.colors[0]);
        }
    }, [productData]);

    // const breadcrumbsData = generateBreadcrumbData(productData);

    return (
        <div>
            {loading ? (
                <Loading />
            ) : (
                <Container>
                    {productData && (
                        <div>
                            {/* Breadcrumbs component */}
                            {breadcrumbsData && (
                                <Breadcrumbs crumbs={breadcrumbsData} />
                            )}

                            {/* product short ino */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* images */}
                                <div className="flex flex-start">
                                    <div className="p-4">
                                        {allImages.map((item, index) => (
                                            <img
                                                src={item}
                                                alt="img"
                                                key={index}
                                                className={`w-24 p-2 cursor-pointer opacity-80 hover:opacity-100 duration-300 ${
                                                    imgUrl === item &&
                                                    "border border-gray-500 rounded-sm opacity-100"
                                                }`}
                                                onClick={() => setImgUrl(item)}
                                            />
                                        ))}
                                    </div>
                                    <div>
                                        <img src={imgUrl} alt="mainImage" />
                                    </div>
                                </div>
                                {/* product details */}
                                <div className="flex flex-col gap-4">
                                    {/* product name */}
                                    <h2 className="text-3xl font-bold">
                                        {productData?.product_name}
                                    </h2>
                                    {/* vendor name */}
                                    <Link
                                        to={`/products?vendor_id=${productData?.vendor_id}`}
                                    >
                                        <h2 className="text-md uppercase font-semibold text-lightText">
                                            {productData?.vendor_name}
                                        </h2>
                                    </Link>

                                    {/* price and rating */}
                                    <div className="flex-col items-center justify-between">
                                        <div className="flex items-center gap-1 mb-4">
                                            <StarRating
                                                size="large"
                                                rating={
                                                    productData.average_rating
                                                        ? productData.average_rating
                                                        : 0
                                                }
                                                rating_counts={
                                                    productData.total_reviews
                                                        ? productData.total_reviews
                                                        : 0
                                                }
                                            />
                                        </div>
                                        <div className="flex">
                                            <PriceTag
                                                regularPrice={
                                                    productData?.old_price
                                                }
                                                discountedPrice={
                                                    productData?.current_price
                                                }
                                                className="text-xl"
                                            />
                                            <div className="bg-red-500 text-white text-xs text-center mx-6 py-1 rounded-md font-semibold w-20">
                                                {offData.toFixed(0)}% off
                                            </div>
                                        </div>
                                    </div>

                                    {/* product brands categories */}
                                    <p>
                                        Brand:{" "}
                                        <span className="font-medium">
                                            {productData?.brand_name}
                                        </span>
                                    </p>
                                    <p>
                                        Category:{" "}
                                        <span className="font-medium">
                                            {productData?.subcategory_name}
                                        </span>
                                    </p>
                                    {/* saving amount */}
                                    <p className="mt-4">
                                        You are saving{" "}
                                        <span className="text-base font-semibold text-green-500">
                                            <FormattedPrice
                                                amount={
                                                    productData?.old_price -
                                                    productData?.current_price
                                                }
                                            />
                                        </span>{" "}
                                        upon purchase
                                    </p>
                                    <AddToCartBtn
                                        product={productData}
                                        showPrice={false}
                                        title="Add to cart"
                                        className="bg-black/80 py-3 text-base text-gray-200 hover:scale-100 hover:text-white duration-200"
                                    />
                                </div>
                            </div>

                            {/* product description and reviews */}
                            <div className="w-full mt-4 px-4 md:px-10">
                                <Tabs
                                    description={
                                        productData.product_description
                                    }
                                    product_id={productData.product_id}
                                />
                            </div>
                        </div>
                    )}
                </Container>
            )}
        </div>
    );
};

const Tabs = ({ description, product_id }) => {
    const [activeTab, setActiveTab] = useState("Description");
    const formattedDescription = description.split("|").map((line, index) => (
        <p key={index} className="mb-1">
            {line}
        </p>
    ));
    const renderContent = () => {
        switch (activeTab) {
            case "Description":
                return (
                    <div className="my-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Description:
                        </h2>
                        <p className="text-lg text-gray-700 font-medium text-md">
                            {description
                                .split(/(?:\r\n|\r|\n)/g)
                                .map((line, index) => (
                                    <p key={index} className="mb-2">
                                        {line}
                                    </p>
                                ))}
                        </p>
                    </div>
                );
            case "Reviews":
                return <Reviews productId={product_id} />;
            case "FAQ":
                return <FAQs />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-around border-b-[1.5px] text-lg font-semibold">
                <button
                    className={`${
                        activeTab === "Description"
                            ? "border-b-2 border-indigo-600"
                            : "border-transparent hover:border-gray-600 hover:text-gray-800 text-gray-600"
                    } py-2 px-8`}
                    onClick={() => setActiveTab("Description")}
                >
                    Product Description
                </button>
                <button
                    className={`${
                        activeTab === "Reviews"
                            ? "border-b-2 border-indigo-600"
                            : "border-transparent hover:border-gray-600 hover:text-gray-800 text-gray-600"
                    } py-2 px-8 focus:outline-none`}
                    onClick={() => setActiveTab("Reviews")}
                >
                    Product Reviews
                </button>
                <button
                    className={`${
                        activeTab === "FAQ"
                            ? "border-b-2 border-indigo-600"
                            : "border-transparent hover:border-gray-600 hover:text-gray-800 text-gray-600"
                    } py-2 px-8 focus:outline-none`}
                    onClick={() => setActiveTab("FAQ")}
                >
                    FAQs
                </button>
            </div>
            <div className="p-4">{renderContent()}</div>
        </div>
    );
};

export default ProductPage;
