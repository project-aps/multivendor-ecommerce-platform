import React, { useState, useEffect } from "react";
import axios from "axios";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import {
    addToCartAsync,
    deleteProductFromCartAsync,
} from "../../redux/slices/cartSlice";
import { IoClose } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import PriceTag from "../../components/PriceTag";
import FormattedPrice from "../../components/FormattedPrice";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";

// Individual Cart Product Component
// const CartProduct = ({ product, onQuantityChange, onRemoveProduct }) => {
//     return (
//         <div className="flex items-center justify-between p-4 border-b">
//             <div className="flex items-center">
//                 <Link to={`/product/${product.product_id}`}>
//                     <img
//                         src={product.thumbnail_url}
//                         alt={product.product_name}
//                         className="w-20 h-20 object-cover mr-4"
//                     />
//                 </Link>
//                 <div>
//                     <h3 className="font-bold">{product.product_name}</h3>
//                     <p className="text-sm text-gray-600">
//                         {product.vendor_name}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                         {/* ₹{product.current_price} */}
//                         {
//                             <PriceTag
//                                 regularPrice={product.old_price}
//                                 discountedPrice={product.current_price}
//                             />
//                         }
//                     </p>
//                     <p className="text-sm text-gray-600">
//                         {product.brand_name}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                         {product.category_name} / {product.subcategory_name}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                         Available:{" "}
//                         {product.available_stock > 0 ? "True" : "False"}
//                     </p>
//                 </div>
//             </div>
//             <div className="flex items-center">
//                 <button
//                     onClick={() =>
//                         onQuantityChange(
//                             product.product_id,
//                             product.quantity - 1
//                         )
//                     }
//                     disabled={product.quantity === 1}
//                     className="px-2 py-1 bg-gray-300 rounded-l"
//                 >
//                     -
//                 </button>
//                 <span className="px-4">{product.quantity}</span>
//                 <button
//                     onClick={() =>
//                         onQuantityChange(
//                             product.product_id,
//                             product.quantity + 1
//                         )
//                     }
//                     disabled={product.quantity >= product.available_stock}
//                     className="px-2 py-1 bg-gray-300 rounded-r"
//                 >
//                     +
//                 </button>
//                 <button
//                     onClick={() => onRemoveProduct(product.product_id)}
//                     className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
//                 >
//                     Remove
//                 </button>
//             </div>
//         </div>
//     );
// };

const CartProduct2 = ({ product, onQuantityChange, onRemoveProduct }) => {
    return (
        <div className="flex py-3 px-3 mb-3 rounded-lg bg-gray-100">
            <Link to={`/product/${product?.product_id}`}>
                <img
                    src={product?.thumbnail_url}
                    alt="productImage"
                    className="h-24 w-24 rounded-md object-contain object-center sm:h-48 sm:w-48 border border-skyText/30 hover:border-skyText duration-300"
                />
            </Link>

            <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div className="relative pr-9 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:pr-0">
                    <div className="flex flex-col gap-1 col-span-3">
                        <h3 className="text-base font-semibold w-full">
                            {product?.product_name.substring(0, 80)}
                        </h3>
                        <p className="text-xs">
                            Brand:{" "}
                            <span className=" font-medium">
                                {product?.brand_name}
                            </span>
                        </p>
                        <p className="text-xs">
                            Category:{" "}
                            <span className="font-medium">
                                {product?.subcategory_name}
                            </span>
                        </p>

                        <div>
                            <PriceTag
                                regularPrice={product?.old_price}
                                discountedPrice={product?.current_price}
                            />
                        </div>
                        <div className="flex items-center gap-6 mt-2">
                            <p className="text-base font-semibold">
                                <FormattedPrice
                                    amount={
                                        product?.current_price *
                                        product?.quantity
                                    }
                                />
                            </p>
                            {/* <AddToCartBtn product={product} showPrice={false} /> */}

                            {/* add remove product */}
                            <div className="flex items-center">
                                <button
                                    onClick={() =>
                                        onQuantityChange(
                                            product.product_id,
                                            product.quantity - 1
                                        )
                                    }
                                    disabled={product.quantity === 1}
                                    className="px-2 py-1 bg-gray-300 rounded-l"
                                >
                                    -
                                </button>
                                <span className="px-4">{product.quantity}</span>
                                <button
                                    onClick={() =>
                                        onQuantityChange(
                                            product.product_id,
                                            product.quantity + 1
                                        )
                                    }
                                    disabled={
                                        product.quantity >=
                                        product.available_stock
                                    }
                                    className="px-2 py-1 bg-gray-300 rounded-r"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() =>
                                        onRemoveProduct(product.product_id)
                                    }
                                    className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="absolute right-0 top-0">
                            <button
                                onClick={() => {
                                    onRemoveProduct(product.product_id);
                                }}
                                className="-m2 inline-flex p-2 text-gray-600 hover:text-red-600"
                            >
                                <IoClose className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    {product?.product_available && (
                        <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                            <FaCheck className="text-lg text-green-500" />{" "}
                            <span>In Stock</span>
                        </p>
                    )}
                    <p>
                        You are saving{" "}
                        <span className="text-sm font-semibold text-green-500">
                            <FormattedPrice
                                amount={
                                    product?.old_price - product?.current_price
                                }
                            />
                        </span>{" "}
                        upon purchase
                    </p>
                </div>
            </div>
        </div>
    );
};

// Pricing Summary Component
const PricingSummary = ({ cartSummary }) => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-xl mb-4">Cart Summary</h3>
            <div className="flex justify-between mb-2">
                <span>Total Original Amount</span>
                <span className="font-semibold">
                    <FormattedPrice amount={cartSummary.total_bill_amount} />
                </span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Total Discount</span>
                <span className="font-semibold">
                    <FormattedPrice
                        amount={
                            cartSummary.total_bill_amount -
                            cartSummary.total_paying_amount
                        }
                    />
                </span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between mb-2">
                <span>Total Amount</span>
                <span className="font-semibold">
                    <FormattedPrice amount={cartSummary.total_paying_amount} />
                </span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Shipping Fee</span>
                <span className="font-semibold">
                    <FormattedPrice amount={cartSummary.total_shipping_fee} />
                </span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total Payable</span>
                <span className="font-semibold">
                    <FormattedPrice
                        amount={
                            cartSummary.total_paying_amount +
                            cartSummary.total_shipping_fee
                        }
                    />
                </span>
            </div>
        </div>
    );
};

// Main Cart Page Component
const CartSummaryComponent = () => {
    const [cartData, setCartData] = useState(null);
    const [cartEmpty, setCartEmpty] = useState(false);
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();

    const fetchCartData = async () => {
        setLoading(true);
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
        setLoading(false);
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
        fetchCartData(); // Fetch the cart data on component mount
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div>
            {cartEmpty ? (
                <div>Cart is Empty</div>
            ) : (
                <div className="container mx-auto flex space-x-8">
                    <div className="w-2/3">
                        {cartData.products_vendor_wise.map((vendor, idx) => (
                            <div key={idx} className="mb-8">
                                {/* <h2 className="font-bold text-2xl mb-4">
                                    {vendor.vendor_name}
                                </h2> */}
                                {vendor.products.map((product) => (
                                    <CartProduct2
                                        key={product.product_id}
                                        product={product}
                                        onQuantityChange={handleQuantityChange}
                                        onRemoveProduct={handleRemoveProduct}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="w-1/3 ">
                        <PricingSummary cartSummary={cartData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartSummaryComponent;
