import React, { useEffect, useState } from "react";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await ordersDeliveryAxios.get(
                `/orders/all?order_status=${
                    statusFilter === "all" ? "" : statusFilter
                }`
            );
            if (response.data.success) {
                toast.success(response.data.message);
                setOrders(response.data.data);
            } else {
                setOrders([]);
                toast.error(response.data.message);
            }
        } catch (error) {
            setOrders([]);
            toast.error(error.message);
            console.error("Error fetching orders:", error);
        }
        setLoading(false);
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">All Orders</h2>

            <div className="mb-4">
                <label className="mr-2">Filter by Status:</label>
                <select
                    className="p-2 border rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="approved">Approved</option>
                    <option value="delivery_processing">
                        Delivery Processing
                    </option>
                </select>
            </div>

            {loading ? (
                <div className="text-center">Loading...</div>
            ) : (
                <table className="min-w-full bg-white border rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Order ID</th>
                            <th className="py-2 px-4 border-b">Vendor ID</th>
                            <th className="py-2 px-4 border-b">User ID</th>
                            <th className="py-2 px-4 border-b">
                                Ordered Amount
                            </th>
                            <th className="py-2 px-4 border-b">Shipping Fee</th>
                            <th className="py-2 px-4 border-b">Discount</th>
                            <th className="py-2 px-4 border-b">Total Amount</th>
                            <th className="py-2 px-4 border-b">Order Status</th>
                            <th className="py-2 px-4 border-b">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                className="cursor-pointer border-b border-gray-200 hover:bg-slate-100"
                                onClick={() => {
                                    navigate(`/admin/orders/${order.id}`);
                                }}
                            >
                                <td className="py-2 px-4 border-b">
                                    {order.id}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {order.vendor_id}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {order.user_id}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {order.ordered_amount}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {order.shipping_fee}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {order.discount_amount}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {order.total_amount}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    <div
                                        className={`py-1 px-2 text-white text-center rounded-md ${getStatusColor(
                                            order.order_status
                                        )}`}
                                    >
                                        {order.order_status}
                                    </div>
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {new Date(
                                        order.created_at
                                    ).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const getStatusColor = (status) => {
    switch (status) {
        case "confirmed":
            return "bg-blue-600";
        case "delivered":
            return "bg-green-600";
        case "approved":
            return "bg-yellow-600";
        case "delivery_processing":
            return "bg-orange-600";
        default:
            return "bg-gray-600";
    }
};

export default AllOrders;
