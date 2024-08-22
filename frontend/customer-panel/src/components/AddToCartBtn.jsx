import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import PriceTag from "./PriceTag";
import { useDispatch, useSelector } from "react-redux";
import {
    addToCartAsync,
    clearCartAsync,
    deleteProductFromCartAsync,
    fetchCartAsync,
} from "../redux/slices/cartSlice";

const AddToCartBtn = ({ className, title, product, showPrice = true }) => {
    const dispatch = useDispatch();

    const { items } = useSelector((state) => state.cart);
    const [existingProduct, setExistingProduct] = useState(null);

    useEffect(() => {
        const availableItem = items.find(
            (item) => item?.product_id === product?.product_id
        );

        setExistingProduct(availableItem || null);
    }, [product, items]);

    const handleAddToCart = () => {
        if (product) {
            if (existingProduct) {
                dispatch(
                    addToCartAsync({
                        product_id: product.product_id,
                        quantity: existingProduct?.quantity + 1,
                    })
                );
                dispatch(fetchCartAsync());
                // toast.success(
                //     `${product?.product_name.substring(
                //         0,
                //         10
                //     )} added to cart successfully!`
                // );
            } else {
                dispatch(addToCartAsync({ product_id: product.product_id }));
                dispatch(fetchCartAsync());
                // toast.success(
                //     `${product?.product_name.substring(
                //         0,
                //         10
                //     )} added to cart successfully!`
                // );
            }
        } else {
            toast.error("Product is undefined!");
        }
    };

    const handleDeleteProduct = () => {
        if (existingProduct) {
            if (existingProduct?.quantity > 1) {
                // TODO decrease the product quantity
                dispatch(
                    addToCartAsync({
                        product_id: product.product_id,
                        quantity: existingProduct?.quantity - 1,
                    })
                );
                dispatch(fetchCartAsync());
                // toast.success(
                //     `${product?.name.substring(
                //         0,
                //         10
                //     )} decreased to cart successfully`
                // );
            } else {
                // TODO delete the product from cart
                dispatch(
                    deleteProductFromCartAsync({
                        product_id: product.product_id,
                    })
                );
                dispatch(fetchCartAsync());
                // toast.error("You can not decrease less than 1");
            }
        } else {
            toast.error("Product is undefined!");
        }
    };

    const newClassName = twMerge(
        "bg-gray-300 uppercase text-xs py-3 text-center rounded-full font-semibold hover:bg-black hover:text-white hover:scale-105 duration-200 cursor-pointer",
        className
    );

    // const getRegularPrice = () => {
    //     if (existingProduct) {
    //         if (product) {
    //             return product?.old_price * existingProduct?.quantity;
    //         }
    //     } else {
    //         return product?.old_price;
    //     }
    // };

    // const getDiscountedPrice = () => {
    //     if (existingProduct) {
    //         if (product) {
    //             return product?.current_price * product?.quantity;
    //         }
    //     } else {
    //         return product?.current_price;
    //     }
    // };

    // if the product stock is 0 or less make the button out of stock
    if (product?.available_stock <= 0) {
        return (
            <button
                className="bg-red-300 uppercase text-xs mt-8 py-3 text-center rounded-full font-semibold cursor-not-allowed"
                disabled
            >
                Out of stock
            </button>
        );
    }

    return (
        <>
            {showPrice && (
                <div>
                    <PriceTag
                        regularPrice={product?.old_price}
                        discountedPrice={product?.current_price}
                    />
                </div>
            )}
            {existingProduct ? (
                <div className="flex self-center items-center justify-center gap-2">
                    <button
                        onClick={handleDeleteProduct}
                        className="bg-[#f7f7f7] text-black p-2 border-[1px] border-gray-200 hover:border-skyText rounded-full text-sm hover:bg-white duration-200 cursor-pointer"
                    >
                        <FaMinus />
                    </button>
                    <p className="text-base font-semibold w-10 text-center">
                        {existingProduct?.quantity}
                    </p>
                    <button
                        onClick={handleAddToCart}
                        className="bg-[#f7f7f7] text-black p-2 border-[1px] border-gray-200 hover:border-skyText rounded-full text-sm hover:bg-white duration-200 cursor-pointer"
                    >
                        <FaPlus />
                    </button>
                </div>
            ) : (
                <button onClick={handleAddToCart} className={newClassName}>
                    {title ? title : "Add to cart"}
                </button>
            )}
        </>
    );
};

export default AddToCartBtn;
