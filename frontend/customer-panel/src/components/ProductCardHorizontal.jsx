import AddToCartBtn from "./AddToCartBtn";
import { useState } from "react";
import FormattedPrice from "./FormattedPrice";
import { useNavigate } from "react-router-dom";
import StarRating from "./StartRating";
import ProductCardSideNavLeft from "./ProductCardSideNavLeft";

const ProductCardHorizontal = ({ item, setSearchText }) => {
    const navigation = useNavigate();

    const percentage =
        ((item?.old_price - item?.current_price) / item?.old_price) * 100;

    const handleProduct = () => {
        navigation(`/product/${item?.product_id}`);
        setSearchText && setSearchText("");
    };
    return (
        <div className="border border-gray-200 rounded-lg p-4 overflow-hidden hover:border-black duration-200 cursor-pointer flex w-full h-60">
            <div className="relative p-2 group w-1/3">
                <span className="bg-red-500  text-white absolute right-0 w-16 text-xs text-center py-1 rounded-md font-semibold inline-block z-10">
                    {percentage.toFixed(0)}% off
                </span>
                <img
                    onClick={handleProduct}
                    src={item?.thumbnail_url}
                    alt="productImage"
                    className="w-full h-full rounded-md object-contain group-hover:scale-110 duration-300"
                />
                <ProductCardSideNavLeft product={item} />
            </div>
            <div className=" w-2/3 flex flex-col gap-2 px-2 pb-2">
                <h3 className="text-xs uppercase font-semibold text-lightText">
                    {item?.vendor_name}
                </h3>
                <h2
                    onClick={handleProduct}
                    className="text-lg font-bold line-clamp-2"
                >
                    {item?.product_name}
                </h2>
                {/* rating  */}
                <StarRating
                    rating={item.average_rating ? item.average_rating : 0}
                    rating_counts={item.total_reviews ? item.total_reviews : 0}
                />
                <AddToCartBtn product={item} />
            </div>
        </div>
    );
};

export default ProductCardHorizontal;
