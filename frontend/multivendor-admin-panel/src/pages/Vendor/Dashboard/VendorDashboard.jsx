import React, { useEffect, useState } from "react";
// import vendorProductsAxios from "../../../utils/axios/vendors_products_axios";
import toast from "react-hot-toast";
import ordersDeliveryAxios from "../../../utils/axios/orders_delivery_axios";
import FormattedPrice from "../../../components/FormattedPrice";
import VendorEarningsChart from "./VendorEarningsGraph";
import VendorDashboardDetails from "./VendorDashBoardDetails";
import { DashboardCard } from "./DashboardCard";
import VendorDailyOrdersGraph from "./VendorDailyOrdersGraph";

const VendorDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        total_sales: 0,
        total_orders: 0,
        total_delivered_orders: 0,
        total_pending_orders: 0,
        total_processing_orders: 0,
        total_approved_orders: 0,
        total_users_ordered: 0,
        total_products_sold: 0,
        total_items_sold: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await ordersDeliveryAxios.get(
                    "/orders/vendor/dashboard"
                );

                if (response.data.success) {
                    toast.success(response.data.message);
                    setDashboardData(response.data.data);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                toast.error("Error fetching dashboard data");
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8">
            {/* vendor details */}
            <VendorDashboardDetails />

            {/* metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DashboardCard
                    title="Total Sales"
                    // value={`$${dashboardData.total_sales}`}
                    value={
                        <span className="text-green-500">
                            <FormattedPrice
                                amount={dashboardData.total_sales}
                            />{" "}
                        </span>
                    }
                />
                <DashboardCard
                    title="Total Orders"
                    value={dashboardData.total_orders}
                />
                <DashboardCard
                    title="Total Delivered Orders"
                    value={dashboardData.total_delivered_orders}
                />
                <DashboardCard
                    title="Total Pending Orders"
                    value={dashboardData.total_pending_orders}
                />
                <DashboardCard
                    title="Total Approved Orders"
                    value={dashboardData.total_approved_orders}
                />
                <DashboardCard
                    title="Total Delivery Processing Orders"
                    value={dashboardData.total_processing_orders}
                />
                <DashboardCard
                    title="Total Users Ordered"
                    value={dashboardData.total_users_ordered}
                />
                <DashboardCard
                    title="Total Products Sold"
                    value={dashboardData.total_products_sold}
                />
                <DashboardCard
                    title="Total Items Sold"
                    value={dashboardData.total_items_sold}
                />
            </div>

            {/* Vendor Earnings Chart */}
            <div className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Earnings Over Time</h3>
                <VendorEarningsChart />
            </div>

            {/* Daily Orders Chart */}
            <div className="bg-white shadow-md rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Daily Orders</h3>
                <VendorDailyOrdersGraph />
            </div>
        </div>
    );
};

export default VendorDashboard;
