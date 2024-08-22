import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import vendorProductsAxios from "../../../utils/axios/vendors_products_axios";
import FormattedPrice from "../../../components/FormattedPrice";
import StarRating from "../../../components/StartRating";
import { DashboardCard } from "../../Vendor/Dashboard/DashboardCard";
import { useSelector } from "react-redux";

const AdminDashboardDetails = () => {
    const { user } = useSelector((state) => state.auth);

    const [dashboardData, setDashboardData] = useState({
        total_platform_fee: 0,
        total_vendors: 0,
        total_products: 0,
        total_reviews: 0,
        average_rating_of_all_products: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await vendorProductsAxios.get(
                    "/vendors/admin/dashboard"
                );
                if (response.data.success) {
                    setDashboardData(response.data.data.admin);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
                toast.error("Error fetching dashboard data");
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    Hi {user ? user.name : ""}
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DashboardCard
                    title="Total Platform Fees"
                    value={
                        <span className="text-green-700">
                            <FormattedPrice
                                amount={dashboardData.total_platform_fee}
                            />
                        </span>
                    }
                />
                <DashboardCard
                    title="Total Listed Products"
                    value={dashboardData.total_products}
                />
                <DashboardCard
                    title="Total Listed Vendors"
                    value={dashboardData.total_vendors}
                />
                <DashboardCard
                    title="Average Ratings"
                    value={
                        <StarRating
                            size="large"
                            rating={parseFloat(
                                dashboardData.average_rating_of_all_products
                            ).toFixed(2)}
                            rating_counts={dashboardData.total_reviews}
                        />
                    }
                />
            </div>
        </div>
    );
};

export default AdminDashboardDetails;
