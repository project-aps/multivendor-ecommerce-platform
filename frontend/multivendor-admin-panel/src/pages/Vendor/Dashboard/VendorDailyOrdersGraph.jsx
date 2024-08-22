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
import toast from "react-hot-toast";
import { formatInTimeZone } from "date-fns-tz";
import ordersDeliveryAxios from "../../../utils/axios/orders_delivery_axios";

const VendorDailyOrdersGraph = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchEarningsData = async () => {
            try {
                const response = await ordersDeliveryAxios.get(
                    `/orders/vendor/daily`
                );
                if (response.data.success) {
                    const formattedData = response.data.data.dailyOrders.map(
                        (item) => {
                            const date = new Date(item.date);
                            return {
                                date: formatInTimeZone(
                                    date,
                                    "Asia/Kathmandu",
                                    "yyyy-MM-dd"
                                ),
                                totalOrders: parseFloat(item.total_orders),
                            };
                        }
                    );

                    setData(formattedData);
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching daily orders data", error);
                toast.error("Error fetching daily orders data");
            }
        };

        fetchEarningsData();
    }, []);

    return (
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

                {/* Area for Earned Amount */}
                <Area
                    type="monotone"
                    dataKey="totalOrders"
                    stroke="#8884d8"
                    fill="#8884d8"
                    // fillOpacity={0.5}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default VendorDailyOrdersGraph;
