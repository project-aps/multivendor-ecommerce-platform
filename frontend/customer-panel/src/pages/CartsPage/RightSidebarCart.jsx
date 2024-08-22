import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import {
    addToCartAsync,
    deleteProductFromCartAsync,
} from "../../redux/slices/cartSlice";
import PriceTag from "../../components/PriceTag";
import FormattedPrice from "../../components/FormattedPrice";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

const RightSidebarCart = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [cartData, setCartData] = useState(null);
    const [cartEmpty, setCartEmpty] = useState(false);
    const sidebarRef = useRef(null);

    const fetchCartData = async () => {
        try {
            const response = await ordersDeliveryAxios.get("/carts/details");
            if (response.data.success) {
                setCartData(response.data.data);
                if (response.data.data.cart_empty) {
                    setCartEmpty(true);
                }
            } else {
                toast.error(response.data.message || "Failed to fetch carts");
            }
        } catch (error) {
            toast.error("An error occurred while fetching carts");
            console.error(error);
        }
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            await dispatch(
                addToCartAsync({
                    product_id: productId,
                    quantity: newQuantity,
                })
            );
            fetchCartData(); // Refetch the cart data after updating quantity
        } catch (error) {
            console.error("Error updating product quantity:", error);
        }
    };

    const handleRemoveProduct = async (productId) => {
        try {
            // await axios.delete(`/api/cart/remove-product/${productId}`);
            await dispatch(
                deleteProductFromCartAsync({ product_id: productId })
            );
            fetchCartData(); // Refetch the cart data after removing product
        } catch (error) {
            console.error("Error removing product from cart:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCartData();
        }
        setCartEmpty(false);
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const truncateName = (name, wordLimit = 5) => {
        const words = name.split(" ");
        if (words.length <= wordLimit) return name;
        return words.slice(0, wordLimit).join(" ") + "...";
    };

    return (
        <div ref={sidebarRef}>
            {cartEmpty ? (
                <div className="fixed right-0 top-0 h-full w-96 bg-gray-50 shadow-lg z-50">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold">Your Cart</h2>
                        <button onClick={onClose} className="text-gray-500">
                            X
                        </button>
                    </div>
                    <div>
                        <p className="p-4 text-sm text-gray-600">
                            Cart is Empty
                        </p>
                    </div>
                </div>
            ) : (
                <div className="fixed right-0 top-0 h-full w-96 bg-gray-50 shadow-lg z-50">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold">Your Cart</h2>
                        {/* <button onClick={onClose} className="text-gray-500">
                            X
                        </button> */}

                        <button
                            onClick={onClose}
                            className="-m2 inline-flex p-2 text-gray-600 hover:text-red-600"
                        >
                            <IoClose className="text-xl" />
                        </button>
                    </div>

                    <div
                        className="p-4 overflow-y-auto"
                        style={{ maxHeight: "calc(100% - 10rem)" }}
                    >
                        {cartData?.products_vendor_wise.map((vendor, idx) => (
                            <div key={idx} className="mb-8">
                                {vendor.products.map((product) => (
                                    <div
                                        key={product.product_id}
                                        className="flex items-center justify-between p-2 border-b"
                                    >
                                        <div className="flex items-center">
                                            <Link
                                                to={`/product/${product.product_id}`}
                                            >
                                                <img
                                                    src={product.thumbnail_url}
                                                    alt={product.product_name}
                                                    className="w-20 h-20 object-contain mr-2"
                                                />
                                            </Link>
                                            <div>
                                                <Link
                                                    to={`/product/${product.product_id}`}
                                                >
                                                    <p className="text-sm font-semibold">
                                                        {truncateName(
                                                            product.product_name
                                                        )}
                                                    </p>
                                                </Link>
                                                <p className="text-sm text-gray-600">
                                                    {product.vendor_name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {/* ₹{product.current_price} */}
                                                    {
                                                        <PriceTag
                                                            regularPrice={
                                                                product.old_price
                                                            }
                                                            discountedPrice={
                                                                product.current_price
                                                            }
                                                        />
                                                    }
                                                </p>

                                                <div className="flex items-center mt-2 text-sm">
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                product.product_id,
                                                                product.quantity -
                                                                    1
                                                            )
                                                        }
                                                        disabled={
                                                            product.quantity ===
                                                            1
                                                        }
                                                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded-l"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-4 text-sm">
                                                        {product.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                product.product_id,
                                                                product.quantity +
                                                                    1
                                                            )
                                                        }
                                                        disabled={
                                                            product.quantity >=
                                                            product.available_stock
                                                        }
                                                        className="px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded-r"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleRemoveProduct(
                                                                product.product_id
                                                            )
                                                        }
                                                        className="ml-2 px-3 py-1 bg-red-400 hover:bg-red-600 text-white rounded"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t">
                        <p className="text-lg font-bold mb-4">
                            <span>
                                {"Total :  "}
                                <FormattedPrice
                                    amount={cartData?.total_paying_amount}
                                />
                            </span>
                        </p>
                        <div className="flex-col justify-between">
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate("/checkout");
                                }}
                                className="px-4 mb-2 h-12 w-full py-1 bg-gray-900 hover:bg-black text-white rounded"
                            >
                                <p className="text-md font-semibold">
                                    Checkout
                                </p>
                            </button>
                            {/* <button
                                onClick={onClose}
                                className="px-4 py-2 mb-2 w-full bg-gray-900 hover:bg-black text-white rounded"
                            >
                                <p className="text-md font-semibold">
                                    Continue Shopping
                                </p>
                            </button> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightSidebarCart;
