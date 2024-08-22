import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_VENDORS_PRODUCTS_BACKEND_API_URL, // Replace with your API base URL
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
