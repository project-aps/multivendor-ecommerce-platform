// OrderSummary.js
import React from "react";
import FormattedPrice from "./FormattedPrice";
import PriceTag from "./PriceTag";
import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";

const OrderSummary = ({ orderSummary }) => {
    // const { orderSummary } = useSelector((state) => state.checkout);
    // console.log(orderSummary);
    // const orderSummary = useSelector(state => state.checkout.orderSummary || []);

    if (!orderSummary || orderSummary.length === 0) {
        return <div>Loading all orders ...</div>;
    }

    return (
        <div className="flex justify-center gap-4">
            <div className="w-3/5">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>

                {orderSummary.orders.map((vendorOrder) => (
                    <div
                        key={vendorOrder.price.vendorID}
                        className="mb-8 border-b-2 pb-4 px-4 py-4 bg-gray-50 rounded-lg shadow-md"
                    >
                        <div className="flex justify-between">
                            <div className="w-1/2">
                                <h3 className="text-xl font-semibold mb-4">{`Order ID: ${vendorOrder.order[0].id}`}</h3>
                                <h3 className="text-xl font-semibold mb-4">{`Vendor: ${vendorOrder.products[0].vendor_name}`}</h3>
                            </div>
                            <div className="w-1/2">
                                <PricingOrderVendorSummary
                                    order={vendorOrder.price}
                                />
                            </div>
                        </div>
                        {vendorOrder.products.map((product) => (
                            <Link
                                key={product.product_id}
                                to={`/product/${product.product_id}`}
                            >
                                <div
                                    key={product.product_id}
                                    className="flex items-center mt-2 mb-4 px-2 py-2 bg-white rounded-lg shadow-md"
                                >
                                    <img
                                        src={product.thumbnail_url}
                                        alt={product.product_name}
                                        className="w-24 h-24 object-contain mr-4"
                                    />
                                    <div>
                                        <p className="text-lg font-semibold">
                                            {product.product_name}
                                        </p>
                                        <PriceTag
                                            regularPrice={product.old_price}
                                            discountedPrice={
                                                product.current_price
                                            }
                                        />
                                        <p>{`Quantity: ${product.quantity}`}</p>
                                        <p>{`Brand: ${product.brand_name}`}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>
            <div className="w-2/5">
                <PricingOrderSummary order={orderSummary.price} />
            </div>

            {/* pricing summary */}
            {/* <div className="border-t-2 pt-4">
                <h3 className="text-xl font-semibold mb-2">Overall Summary</h3>
                <p>{`Total Bill Amount: NRS. ${orderSummary.price.total_bill_amount}`}</p>
                <p>{`Total Shipping Fee: NRS. ${orderSummary.price.total_shipping_fee}`}</p>
                <p className="font-bold">{`Total Paying Amount: NRS. ${orderSummary.price.total_paying_amount}`}</p>
            </div> */}
        </div>
    );
};

// Pricing Summary Component
const PricingOrderSummary = ({ order }) => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-xl mb-4">Total Price Summary</h3>
            <div className="flex justify-between mb-2">
                <span>Total Ordered Amount</span>
                <span className="font-semibold">
                    <FormattedPrice amount={order.total_bill_amount} />
                </span>
            </div>
            {/* <div className="flex justify-between mb-2">
                <span>Total Discount</span>
                <span className="font-semibold text-red-500">
                    - <FormattedPrice amount={order.discount_amount} />
                </span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Coupon Discount</span>
                <span className="font-semibold text-red-500">
                    - <FormattedPrice amount={order.coupon_discount_amount} />
                </span>
            </div> */}
            {/* <hr className="my-4" /> */}
            {/* <div className="flex justify-between mb-2">
                <span>Sub Total </span>
                <span className="font-semibold">
                    <FormattedPrice
                        amount={
                            order.ordered_amount -
                            order.discount_amount -
                            order.coupon_discount_amount
                        }
                    />
                </span>
            </div> */}
            <div className="flex justify-between mb-2">
                <span>Shipping Fee</span>
                <span className="font-semibold">
                    <FormattedPrice amount={order.total_shipping_fee} />
                    {`(${order.shipping_count})`}
                </span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total Paying Amount</span>
                <span className="font-bold text-green-500">
                    <FormattedPrice amount={order.total_paying_amount} />
                </span>
            </div>
        </div>
    );
};

const PricingOrderVendorSummary = ({ order }) => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-xl mb-4">Price Summary</h3>
            <div className="flex justify-between mb-2">
                <span>Total Original Amount</span>
                <span className="font-semibold">
                    <FormattedPrice amount={order.total_original_amount} />
                </span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Total Discount</span>
                <span className="font-semibold text-red-500">
                    - <FormattedPrice amount={order.total_discount} />
                </span>
            </div>
            {/* <div className="flex justify-between mb-2">
                <span>Coupon Discount</span>
                <span className="font-semibold text-red-500">
                    - <FormattedPrice amount={order.coupon_discount_amount} />
                </span>
            </div> */}
            <hr className="my-4" />
            <div className="flex justify-between mb-2">
                <span>Sub Total </span>
                <span className="font-semibold">
                    <FormattedPrice
                        amount={
                            order.total_original_amount - order.total_discount
                        }
                    />
                </span>
            </div>
            <div className="flex justify-between mb-2">
                <span>Shipping Fee</span>
                <span className="font-semibold">
                    <FormattedPrice amount={order.delivery_fee} />
                </span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="font-bold text-green-500">
                    <FormattedPrice amount={order.total_amount_vendor} />
                </span>
            </div>
        </div>
    );
};

export default OrderSummary;
