import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import moment from "moment-timezone";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import { useNavigate } from "react-router-dom";

const PaymentsTable = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await ordersDeliveryAxios.get("/payments"); // Replace with your API endpoint
            setPayments(response.data.data); // Assuming the data comes in a "data" field
            toast.success("Payments fetched successfully");
        } catch (err) {
            setError("Failed to fetch payments");
            toast.error("Failed to fetch payments");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "text-yellow-500";
            case "approved":
                return "text-green-500";
            case "rejected":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                All Payments
            </h2>
            {loading ? (
                <p>Loading payments...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Payment ID</th>
                            <th className="py-2 px-4 border-b">Order ID</th>
                            <th className="py-2 px-4 border-b">Amount</th>
                            <th className="py-2 px-4 border-b">
                                Payment Method
                            </th>
                            <th className="py-2 px-4 border-b">
                                Payment Status
                            </th>
                            <th className="py-2 px-4 border-b">
                                Transaction ID
                            </th>
                            <th className="py-2 px-4 border-b">
                                Payment Gateway
                            </th>
                            <th className="py-2 px-4 border-b">Created At</th>
                            <th className="py-2 px-4 border-b">Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => (
                            <tr
                                className="hover:bg-gray-50 cursor-pointer"
                                key={payment.id}
                                onClick={() => {
                                    navigate(
                                        `/admin/orders/${payment.order_id}`
                                    );
                                }}
                            >
                                <td className="py-2 px-4 border-b">
                                    {payment.id}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {payment.order_id}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    Rs. {payment.amount}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {payment.payment_method}
                                </td>
                                <td
                                    className={`py-2 px-4 border-b ${getStatusColor(
                                        payment.payment_status
                                    )}`}
                                >
                                    {payment.payment_status
                                        .charAt(0)
                                        .toUpperCase() +
                                        payment.payment_status.slice(1)}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {payment.transaction_id || "N/A"}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {payment.payment_gateway || "N/A"}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {moment(payment.created_at)
                                        .tz("Asia/Kathmandu")
                                        .format("MMMM Do YYYY, h:mm:ss A")}
                                </td>
                                <td className="py-2 px-4 border-b">
                                    {moment(payment.updated_at)
                                        .tz("Asia/Kathmandu")
                                        .format("MMMM Do YYYY, h:mm:ss A")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PaymentsTable;
