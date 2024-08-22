import React, { useState, useEffect } from "react";
import ReviewProduct from "./ReviewProduct";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";

const breadcrumbsData = [
    {
        label: "Home",
        path: "/",
    },
    {
        label: "Profile",
        path: "/profile",
    },
    {
        label: "Pending Reviews",
        path: "/pending-reviews",
    },
];

const PendingReviews = () => {
    const [orders, setOrders] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingReviews();
    }, []);

    const fetchPendingReviews = async () => {
        setLoading(true);
        try {
            const response = await ordersDeliveryAxios.get(
                "/orders/pending-reviews"
            );
            if (response.data.success) {
                setOrders(response.data.data.orders);
                toast.success("Reviews Details fetched Successfully.");
            }
        } catch (error) {
            toast.error("Error fetching pending reviews.");
            console.error("Error fetching pending reviews:", error);
        }
        setLoading(false);
    };

    const handleReviewClick = (product, orderId) => {
        setSelectedProduct(product);
        setSelectedOrderId(orderId);
    };

    const handleReviewSubmission = async (reviewData) => {
        setLoading(true);
        try {
            const response = await ordersDeliveryAxios.post(
                "/orders/add-review",
                reviewData
            );
            if (response.data.success) {
                // Update the is_reviewed status to true
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.order_id === selectedOrderId
                            ? {
                                  ...order,
                                  products: order.products.map((prod) =>
                                      prod.product_id ===
                                      selectedProduct.product_id
                                          ? { ...prod, is_reviewed: true }
                                          : prod
                                  ),
                              }
                            : order
                    )
                );
                setSelectedProduct(null); // Close the review modal/component
                toast.success("Review submitted successfully.");
            }
        } catch (error) {
            toast.error("Error submitting review.");
            console.error("Error submitting review:", error);
        }
        setLoading(false);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="pending-reviews px-8 py-4">
            {/* Breadcrumbs component */}
            {breadcrumbsData && <Breadcrumbs crumbs={breadcrumbsData} />}

            <h2 className="text-3xl font-semibold mt-2 mb-4">
                Pending Reviews
            </h2>
            <div className="px-6">
                {orders.map((order) => (
                    <div
                        key={order.order_id}
                        className="order mb-6 bg-gray-100 border rounded-lg p-6"
                    >
                        <Link to={`/order/${order.order_id}`}>
                            <h2 className="font-bold text-xl mb-2">
                                Order ID: {order.order_id}
                            </h2>
                        </Link>
                        <h3 className="font-bold mb-2 text-green-500">
                            Delivered At :{" "}
                            {new Date(order.delivered_at).toLocaleString()}
                        </h3>
                        {order.products.map((product) => (
                            <div
                                key={product.product_id}
                                className="product mb-4 p-4 border rounded-md shadow-sm bg-white"
                            >
                                <Link to={`/product/${product.product_id}`}>
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={product.thumbnail_url}
                                            alt={product.product_name}
                                            className="w-28 h-28 mr-4 rounded-md"
                                        />
                                        <div>
                                            <h4 className="text-lg font-bold">
                                                {product.product_name}
                                            </h4>
                                            <p className="text-gray-600">
                                                {product.brand_name} |{" "}
                                                {product.category_name} |{" "}
                                                {product.subcategory_name}
                                            </p>
                                            <p className="text-gray-600">
                                                Vendor: {product.vendor_name}
                                            </p>
                                        </div>
                                    </div>
                                </Link>

                                {product.is_reviewed ? (
                                    <p className="text-green-600 font-semibold">
                                        Review Submitted
                                    </p>
                                ) : (
                                    <button
                                        className="mt-2 p-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        onClick={() =>
                                            handleReviewClick(
                                                product,
                                                order.order_id
                                            )
                                        }
                                    >
                                        Add Review
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                {selectedProduct && (
                    <ReviewProduct
                        product={selectedProduct}
                        orderId={selectedOrderId}
                        onSubmit={handleReviewSubmission}
                        onClose={() => setSelectedProduct(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default PendingReviews;
