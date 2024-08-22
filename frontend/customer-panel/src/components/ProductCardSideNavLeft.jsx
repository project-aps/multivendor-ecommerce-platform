import { FaRegEye, FaRegStar, FaStar } from "react-icons/fa";
import { LuArrowLeftRight } from "react-icons/lu";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { addToFavorite } from "../redux/slices/favoriteProductSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ProductCardSideNavLeft = ({ product }) => {
    const dispatch = useDispatch();
    const { favoriteProduct } = useSelector((state) => state.favoriteProduct);
    const [existingProduct, setExistingProduct] = useState(null);

    useEffect(() => {
        const availableItem = favoriteProduct.find(
            (item) => item?.product_id === product?.product_id
        );
        setExistingProduct(availableItem || null);
    }, [product, favoriteProduct]);

    const handleFavorite = () => {
        if (product) {
            dispatch(addToFavorite(product));
            toast.success(
                existingProduct
                    ? `${product?.product_name.substring(
                          0,
                          10
                      )} removed successfully!`
                    : `${product?.product_name.substring(
                          0,
                          10
                      )} added successfully!`
            );
        }
    };

    return (
        <div className="absolute left-0 top-1 flex flex-col gap-1 transition -translate-x-14 group-hover:translate-x-0 duration-300">
            <span
                onClick={handleFavorite}
                className="w-11 h-11 inline-flex text-black text-lg items-center justify-center rounded-full hover:text-white hover:bg-black duration-200"
            >
                {existingProduct ? <FaStar /> : <FaRegStar />}
            </span>
            <span className="w-11 h-11 inline-flex text-black text-lg items-center justify-center rounded-full hover:text-white hover:bg-black duration-200">
                <LuArrowLeftRight />
            </span>
            <Link to={`/product/${product.product_id}`}>
                <span className="w-11 h-11 inline-flex text-black text-lg items-center justify-center rounded-full hover:text-white hover:bg-black duration-200">
                    <FaRegEye />
                </span>
            </Link>
        </div>
    );
};

export default ProductCardSideNavLeft;
