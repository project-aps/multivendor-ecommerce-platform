import React, { useState, useEffect } from "react";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import FormattedPrice from "../../components/FormattedPrice";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";

const OrderDetails = () => {
    const { orderId } = useParams(); // Extract orderId from route parameters
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [breadcrumbsData, setBreadcrumbsData] = useState(null);

    useEffect(() => {
        // Function to fetch order details

        const generateBreadcrumbData = (orderId) => {
            return [
                {
                    label: "Home",
                    path: "/",
                },
                {
                    label: "Orders",
                    path: "/orders",
                },
                {
                    label: `${orderId}`,
                    path: `/order/${orderId}`,
                },
            ];
        };
        const fetchOrderDetails = async () => {
            try {
                const response = await ordersDeliveryAxios.get(
                    `/orders/own/user/${orderId}`
                );

                if (response.data.success) {
                    toast.success(response.data.message);
                    setOrderData(response.data.data);
                    setBreadcrumbsData(
                        generateBreadcrumbData(response.data.data.order.id)
                    );
                } else {
                    toast.error(response.data.message);
                }
            } catch (err) {
                setError("Failed to fetch order details");
            }

            setLoading(false);
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!orderData) {
        return <div>No order details available</div>;
    }

    const { order, products, address, user, payment } = orderData;

    return (
        <div className=" p-6 mx-8 bg-white shadow-md rounded-lg flex justify-center gap-12">
            <div className="w-1/2">
                <div className="mb-4">
                    {breadcrumbsData && (
                        <Breadcrumbs crumbs={breadcrumbsData} />
                    )}
                </div>
                <h2 className="text-2xl font-bold mb-4">Order Details</h2>

                {/* Order Summary */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">
                        Order Summary
                    </h3>
                    <p>
                        <strong>Order ID:</strong> {order.id}
                    </p>
                    <p>
                        <strong>Vendor ID:</strong> {order.vendor_id}
                    </p>
                    <p>
                        <strong>Vendor:</strong>{" "}
                        {products.length > 0 ? products[0].vendor_name : ""}
                    </p>
                    <p>
                        <strong>Order Status:</strong> {order.order_status}
                    </p>

                    {order.delivered_at && (
                        <p>
                            <strong>Delivered At:</strong>{" "}
                            {new Date(order.delivered_at).toLocaleString()}
                        </p>
                    )}
                    <p>
                        <strong>Ordered At:</strong>{" "}
                        {new Date(order.created_at).toLocaleString()}
                    </p>

                    <div className="mt-2">
                        <OrderStatusTimeline orderStatus={order.order_status} />
                    </div>

                    {/* <PricingOrderSummary order={order} /> */}
                </div>

                {/* Products Ordered */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">
                        Products Ordered
                    </h3>
                    {products.map((product) => (
                        <Link to={`/product/${product.product_id}`}>
                            <div
                                key={product.id}
                                className="flex mb-4 p-4 border rounded-lg"
                            >
                                <img
                                    src={product.thumbnail_url}
                                    alt={product.product_name}
                                    className="w-24 h-24 object-contain mr-4"
                                />
                                <div>
                                    <p>
                                        <strong>Product Name:</strong>{" "}
                                        {product.product_name}
                                    </p>
                                    <p>
                                        <strong>Brand:</strong>{" "}
                                        {product.brand_name}
                                    </p>
                                    <p>
                                        <strong>Category:</strong>{" "}
                                        {product.category_name}
                                    </p>
                                    <p>
                                        <strong>Subcategory:</strong>{" "}
                                        {product.subcategory_name}
                                    </p>
                                    <p>
                                        <strong>Quantity:</strong>{" "}
                                        {product.quantity}
                                    </p>
                                    <p>
                                        <strong>Price:</strong>{" "}
                                        <FormattedPrice
                                            amount={product.price}
                                        />
                                    </p>
                                    <p>
                                        <strong>Order Status:</strong>{" "}
                                        {product.order_status}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">
                        Shipping Address
                    </h3>
                    <p>
                        <strong>Name:</strong> {address.full_name}
                    </p>
                    <p>
                        <strong>Contact:</strong> {address.contact_number}
                    </p>
                    <p>
                        <strong>Address:</strong> {address.full_address},{" "}
                        {address.municipality}, {address.district},{" "}
                        {address.state}, {address.country} -{" "}
                        {address.postal_code}
                    </p>
                    <p>
                        <strong>Nearest Landmark:</strong>{" "}
                        {address.nearest_landmark}
                    </p>
                </div>

                {/* User Information */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">
                        User Information
                    </h3>
                    <p>
                        <strong>Name:</strong> {user.name}
                    </p>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                </div>
            </div>
            <div className="w-1/2 flex-col gap-4 ">
                <PricingOrderSummary order={order} />

                {/* payment */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">
                        Payment Information
                    </h3>
                    <p>
                        <strong>Payment Method:</strong>{" "}
                        {payment.payment_method}
                    </p>
                    <p>
                        <strong>Payment Status:</strong>{" "}
                        {payment.payment_status}
                    </p>
                    <p>
                        <strong>Amount Paid:</strong>{" "}
                        <FormattedPrice amount={payment.amount} />
                    </p>
                    {payment.transaction_id && (
                        <p>
                            <strong>Transaction ID:</strong>{" "}
                            {payment.transaction_id}
                        </p>
                    )}
                    {payment.payment_gateway && (
                        <p>
                            <strong>Payment Gateway:</strong>{" "}
                            {payment.payment_gateway}
                        </p>
                    )}
                    <p>
                        <strong>Payment Date:</strong>{" "}
                        {new Date(payment.created_at).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Pricing Summary Component
const PricingOrderSummary = ({ order }) => {
    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold text-xl mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2">
                <span>Total Ordered Amount</span>
                <span className="font-semibold">
                    <FormattedPrice amount={order.ordered_amount} />
                </span>
            </div>
            <div className="flex justify-between mb-2">
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
            </div>
            <hr className="my-4" />
            <div className="flex justify-between mb-2">
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
            </div>
            <div className="flex justify-between mb-2">
                <span>Shipping Fee</span>
                <span className="font-semibold">
                    <FormattedPrice amount={order.shipping_fee} />
                </span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="font-bold text-green-500">
                    <FormattedPrice amount={order.total_amount} />
                </span>
            </div>
        </div>
    );
};

export default OrderDetails;
