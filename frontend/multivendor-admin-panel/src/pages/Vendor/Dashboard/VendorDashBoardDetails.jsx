import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import vendorProductsAxios from "../../../utils/axios/vendors_products_axios";
import { DashboardCard } from "./DashboardCard";
import FormattedPrice from "../../../components/FormattedPrice";
import StarRating from "../../../components/StartRating";

const VendorDashboardDetails = () => {
    const [dashboardData, setDashboardData] = useState({
        business_name: "",
        total_balance: 0,
        total_listed_products: 0,
        total_product_reviews: 0,
        average_rating_of_all_products: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await vendorProductsAxios.get(
                    "/vendors/dashboard"
                );
                if (response.data.success) {
                    setDashboardData(response.data.data.vendor);
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
                    Hi {dashboardData.business_name}
                </h1>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">
                        Total Balance
                    </h2>
                    <p className="text-2xl text-green-500">
                        ${dashboardData.total_balance}
                    </p>
                </div>

                <div className="bg-white p-4 rounded shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">
                        Total Listed Products
                    </h2>
                    <p className="text-2xl text-blue-500">
                        {dashboardData.total_listed_products}
                    </p>
                </div>

                <div className="bg-white p-4 rounded shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">
                        Total Product Reviews
                    </h2>
                    <p className="text-2xl text-yellow-500">
                        {dashboardData.total_product_reviews}
                    </p>
                </div>

                <div className="bg-white p-4 rounded shadow-lg">
                    <h2 className="text-xl font-semibold mb-2">
                        Average Rating
                    </h2>
                    <p className="text-2xl text-purple-500">
                        {dashboardData.average_rating_of_all_products}
                    </p>
                </div>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DashboardCard
                    title="Total Balance"
                    value={
                        <span className="text-green-700">
                            <FormattedPrice
                                amount={dashboardData.total_balance}
                            />
                        </span>
                    }
                />
                <DashboardCard
                    title="Total Listed Products"
                    value={dashboardData.total_listed_products}
                />
                <DashboardCard
                    title="Average Ratings"
                    value={
                        <StarRating
                            size="large"
                            rating={parseFloat(
                                dashboardData.average_rating_of_all_products
                            ).toFixed(2)}
                            rating_counts={dashboardData.total_product_reviews}
                        />
                    }
                />
            </div>
        </div>
    );
};

export default VendorDashboardDetails;
