import React, { useEffect, useState } from "react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend,
} from "recharts";
import vendorProductsAxios from "../../../utils/axios/vendors_products_axios";
import toast from "react-hot-toast";
import { formatInTimeZone } from "date-fns-tz";

const AllEarningsChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchEarningsData = async () => {
            try {
                const response = await vendorProductsAxios.get(
                    `/vendors/admin/daily-earnings`
                );
                if (response.data.success) {
                    const formattedData = response.data.data.earnings.map(
                        (item) => {
                            const date = new Date(item.date);

                            // Calculate values for separate areas
                            const totalOrderedAmount = parseFloat(
                                item.total_ordered_amount
                            );
                            const totalEarned = parseFloat(item.total_earned);
                            const totalPlatformFee = parseFloat(
                                item.total_platform_fee
                            );

                            return {
                                date: formatInTimeZone(
                                    date,
                                    "Asia/Kathmandu",
                                    "yyyy-MM-dd"
                                ),
                                totalOrderedAmount,
                                totalEarned,
                                totalPlatformFee,
                            };
                        }
                    );

                    setData(formattedData);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching vendor earnings data", error);
                toast.error("Error fetching vendor earnings data");
            }
        };

        fetchEarningsData();
    }, []);

    return (
        // <ResponsiveContainer width="100%" height={400}>
        //     <AreaChart
        //         data={data}
        //         margin={{
        //             top: 10,
        //             right: 30,
        //             left: 0,
        //             bottom: 0,
        //         }}
        //     >
        //         <CartesianGrid strokeDasharray="3 3" />
        //         <XAxis dataKey="date" />
        //         <YAxis />
        //         <Tooltip />
        //         <Legend />

        //         {/* Area for Platform Fee */}
        //         <Area
        //             type="monotone"
        //             dataKey="totalPlatformFee"
        //             stroke="#ffc658"
        //             fill="#ffc658"
        //             fillOpacity={0.5}
        //         />

        //         {/* Area for Earned Amount */}
        //         <Area
        //             type="monotone"
        //             dataKey="totalEarned"
        //             stroke="#8884d8"
        //             fill="#8884d8"
        //             fillOpacity={0.5}
        //         />

        //         {/* Area for Total Order Amount */}
        //         <Area
        //             type="monotone"
        //             dataKey="totalOrderedAmount"
        //             stroke="#82ca9d"
        //             fill="#82ca9d"
        //             fillOpacity={0.5}
        //         />
        //     </AreaChart>
        // </ResponsiveContainer>

        <ResponsiveContainer width="100%" height={400}>
            <AreaChart
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 30,
                    bottom: 20,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                    domain={["auto", "auto"]} // Automatically adjust based on data
                    scale="linear"
                    tickFormatter={(tick) =>
                        new Intl.NumberFormat().format(tick)
                    } // Format ticks for better readability
                    allowDataOverflow={true} // Allow for data overflow if necessary
                />
                <Tooltip />
                <Legend />

                {/* Area for Platform Fee */}
                <Area
                    type="monotone"
                    dataKey="totalPlatformFee"
                    stroke="#ffc658"
                    fill="#ffc658"
                    // fillOpacity={0.5}
                />

                {/* Area for Earned Amount */}
                <Area
                    type="monotone"
                    dataKey="totalEarned"
                    stroke="#8884d8"
                    fill="#8884d8"
                    // fillOpacity={0.5}
                />

                {/* Area for Total Order Amount */}
                <Area
                    type="monotone"
                    dataKey="totalOrderedAmount"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    // fillOpacity={0.5}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default AllEarningsChart;
