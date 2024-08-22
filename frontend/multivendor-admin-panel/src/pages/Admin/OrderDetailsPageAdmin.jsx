import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import moment from "moment-timezone";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";

const OrderDetailPageAdmin = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newStatus, setNewStatus] = useState("");

    const [addressData, setAddressData] = useState(null);
    const [userData, setuserData] = useState(null);
    const [vendorData, setVendorData] = useState(null);
    const [paymentData, setPaymentData] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await ordersDeliveryAxios.get(
                `/orders/${orderId}`
            );
            setOrderDetails(response.data.data);
            setNewStatus(response.data.data.order.order_status);
            if (response.data.data.address) {
                setAddressData(response.data.data.address);
            }
            if (response.data.data.user) {
                setuserData(response.data.data.user);
            }
            if (response.data.data.vendor) {
                setVendorData(response.data.data.vendor);
            }
            if (response.data.data.payment) {
                setPaymentData(response.data.data.payment);
            }
        } catch (error) {
            console.error("Error fetching order details:", error);
            toast.error("Failed to fetch order details");
        }
        setLoading(false);
    };

    // const handleStatusChange = async () => {
    //     try {
    //         await ordersDeliveryAxios.put(`/orders/status/${orderId}`, {
    //             order_status: newStatus,
    //         });

    //         toast.success("Order status updated successfully");
    //         fetchOrderDetails(); // Refresh the order details after updating
    //     } catch (error) {
    //         console.error("Error updating order status:", error);
    //         toast.error("Failed to update order status");
    //     }
    // };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!orderDetails) {
        toast.error("Order Not Found.");
        return <div className="text-center">Order not found</div>;
    }

    const { order, products } = orderDetails;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
                Order Details (Order ID: {orderId})
            </h2>

            <div className="flex flex-col bg-white p-8 rounded-lg shadow-md mb-6 ">
                <div className="flex justify-evenly">
                    <div>
                        {userData && <UserCard user={userData} />}
                        {addressData && <AddressCard address={addressData} />}
                    </div>
                    <div>
                        <OrderSummary
                            orderedAmount={order.ordered_amount}
                            discountAmount={order.discount_amount}
                            subTotal={(
                                order.ordered_amount - order.discount_amount
                            ).toFixed(2)}
                            shippingFee={order.shipping_fee}
                            totalAmount={order.total_amount}
                        />
                        <div className="bg-white p-4 mt-6 rounded-lg shadow-md mb-6">
                            <p>
                                <strong>Order ID:</strong> {order.id}
                            </p>
                            <p>
                                <strong>User ID:</strong> {order.user_id}
                            </p>
                            <p>
                                <strong>Vendor ID:</strong> {order.vendor_id}
                            </p>
                            <p>
                                <strong>Order Status:</strong>{" "}
                                <span
                                    className={getStatusColor(
                                        order.order_status
                                    )}
                                >
                                    <span className="font-semibold">
                                        {order.order_status}
                                    </span>
                                </span>
                            </p>

                            {order.delivered_at && (
                                <p>
                                    <strong>Delivered At : </strong>
                                    <span className="text-green-600 font-semibold">
                                        {moment(order.delivered_at)
                                            .tz("Asia/Kathmandu")
                                            .format("MMMM Do YYYY, h:mm:ss A")}
                                    </span>
                                </p>
                            )}

                            <OrderStatusTimeline
                                orderStatus={order.order_status}
                            />

                            {/* update order status */}
                            {/* <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">
                                Update Order Status
                            </h3>
                            <select
                                className="p-2 border rounded-md"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="confirmed">Confirmed</option>
                                <option value="approved">Approved</option>
                                <option value="delivery_processing">
                                    Delivery Processing
                                </option>
                                <option value="delivered">Delivered</option>
                            </select>
                            <button
                                className="ml-4 p-2 bg-blue-600 text-white rounded-md"
                                onClick={handleStatusChange}
                            >
                                Update Status
                            </button>
                        </div> */}
                        </div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-evenly">
                        {vendorData && <VendorCard profile={vendorData} />}
                        {paymentData && <PaymentCard payment={paymentData} />}
                    </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                    Products in this Order
                </h3>
                <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                    <thead>
                        <tr className="w-full bg-gray-200 text-left">
                            <th className="px-6 py-3 border-b border-gray-200">
                                ID
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200">
                                Product Name
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200">
                                Image
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200">
                                Quantity
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200">
                                Price (pcs)
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200">
                                Total Price
                            </th>

                            <th className="px-6 py-3 border-b border-gray-200">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 border-b border-gray-200">
                                    {product.id}
                                </td>
                                <td className="px-6 py-4 border-b border-gray-200">
                                    {product.product_name}
                                </td>
                                <td className="px-6 py-4 border-b border-gray-200">
                                    <img
                                        src={product.thumbnail_url}
                                        alt={product.product_name}
                                        className="w-16 h-16 object-cover"
                                    />
                                </td>
                                <td className="px-6 py-4 border-b border-gray-200">
                                    {product.quantity}
                                </td>
                                <td className="px-6 py-4 border-b border-gray-200">
                                    {product.price}
                                </td>
                                <td className="px-6 py-4 border-b border-gray-200">
                                    {(product.quantity * product.price).toFixed(
                                        2
                                    )}
                                </td>

                                <td className="px-6 py-4 border-b border-gray-200">
                                    <span
                                        className={getStatusColor(
                                            product.order_status
                                        )}
                                    >
                                        {product.order_status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "text-yellow-600";
        case "confirmed":
            return "text-blue-600";
        case "delivered":
            return "text-green-600";
        case "approved":
            return "text-teal-600";
        case "delivery_processing":
            return "text-orange-600";
        default:
            return "text-gray-600";
    }
};

const OrderSummary = ({
    orderedAmount,
    discountAmount,
    subTotal,
    shippingFee,
    totalAmount,
}) => {
    return (
        <div className="max-w-lg w-96 h-auto mx-auto p-6 bg-gray-50 shadow-2xl rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Order Summary :
            </h2>
            <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Ordered Amount:</span>
                    <span>RS. {orderedAmount}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Discount Amount:</span>
                    <span className="text-red-500">- Rs. {discountAmount}</span>
                </div>
                <div className="border-t border-gray-300"></div>
                <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Sub Total:</span>
                    <span>Rs. {subTotal}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                    <span className="font-medium">Shipping Fee:</span>
                    <span>Rs.{shippingFee}</span>
                </div>
                <div className="border-t border-gray-300"></div>
                <div className="flex justify-between text-gray-900 text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>Rs.{totalAmount}</span>
                </div>
            </div>
        </div>
    );
};

const AddressCard = ({ address }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-4 max-w-md mx-auto">
            <div>
                <h2 className="text-xl font-bold mb-4">Address Details :</h2>
            </div>
            <div className="text-gray-700">
                <p>
                    <span className="font-semibold">Name: </span>
                    {address.full_name}
                </p>
                <p>
                    <span className="font-semibold">Contact No.: </span>
                    {address.contact_number}
                </p>
                <p>
                    <span className="font-semibold">Country: </span>
                    {address.country}
                </p>
                <p>
                    <span className="font-semibold">State: </span>
                    {address.state}
                </p>
                <p>
                    <span className="font-semibold">District: </span>
                    {address.district}
                </p>
                <p>
                    <span className="font-semibold">Municipality: </span>
                    {address.municipality}
                </p>
                <p>
                    <span className="font-semibold">Ward No.: </span>
                    {address.ward}
                </p>
                <p>
                    <span className="font-semibold">Postal Code: </span>
                    {address.postal_code}
                </p>
                <p>
                    <span className="font-semibold">Address: </span>
                    {address.full_address}
                </p>

                <p>
                    <span className="font-semibold">Nearest Landmark: </span>
                    {address.nearest_landmark}
                </p>
            </div>
        </div>
    );
};

const UserCard = ({ user }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-4 max-w-md mx-auto">
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold">
                    {user.name[0].toUpperCase()}
                </div>
                <div className="ml-4">
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                </div>
            </div>
        </div>
    );
};

const VendorCard = ({ profile }) => {
    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Vendor Profile</h2>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Business Name:
                </label>
                <p className="text-lg text-gray-800">{profile.business_name}</p>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email:
                </label>
                <p className="text-lg text-gray-800">{profile.email}</p>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description:
                </label>
                <p className="text-lg text-gray-800">{profile.description}</p>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status:
                </label>
                <div
                    className={`text-lg w-24 rounded-md text-white block  py-1 px-2 ${getVendorStatusColor(
                        profile.status
                    )}`}
                >
                    {profile.status}
                </div>
            </div>
        </div>
    );
};

const getVendorStatusColor = (status) => {
    switch (status) {
        case "approved":
            return "bg-green-600";
        case "pending":
            return "bg-yellow-600";
        case "rejected":
            return "bg-red-600";
        default:
            return "bg-gray-600";
    }
};

const PaymentCard = ({ payment }) => {
    // Convert timestamps to Kathmandu, Nepal timezone
    const createdAt = moment(payment.created_at)
        .tz("Asia/Kathmandu")
        .format("MMMM Do YYYY, h:mm:ss A");
    const updatedAt = moment(payment.updated_at)
        .tz("Asia/Kathmandu")
        .format("MMMM Do YYYY, h:mm:ss A");

    // Function to determine the color based on the payment status
    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-500";
            case "approved":
                return "bg-green-500";
            case "rejected":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4">
                <h2 className="text-xl font-bold text-gray-800">
                    Payment Details
                </h2>

                <div className="mt-4">
                    <p className="text-gray-600">
                        <span className="font-semibold">Order ID:</span>{" "}
                        {payment.order_id}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Amount:</span> Rs.
                        {payment.amount}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Payment Method:</span>{" "}
                        {payment.payment_method}
                    </p>
                    <p className="text-gray-600 flex items-center">
                        <span className="font-semibold">Payment Status:</span>
                        <span
                            className={`ml-2 text-white px-2 py-1 rounded ${getPaymentStatusColor(
                                payment.payment_status
                            )}`}
                        >
                            {payment.payment_status.charAt(0).toUpperCase() +
                                payment.payment_status.slice(1)}
                        </span>
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Transaction ID:</span>{" "}
                        {payment.transaction_id || "N/A"}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Payment Gateway:</span>{" "}
                        {payment.payment_gateway || "N/A"}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Created At:</span>{" "}
                        {createdAt}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Updated At:</span>{" "}
                        {updatedAt}
                    </p>
                </div>
            </div>
        </div>
    );
};
export default OrderDetailPageAdmin;
