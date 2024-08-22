import axios from "axios";
// import store from "../../redux/store";

const ordersDeliveryAxios = axios.create({
    baseURL: process.env.REACT_APP_ORDERS_DELIVERY_BACKEND_API_URL + "/api",
    withCredentials: true, // Ensures cookies are sent with each request
    headers: {
        "Content-Type": "application/json",
    },
});

// Response Interceptor to handle token refresh
ordersDeliveryAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // const state = store.getState();
        // const { role } = state.auth;

        const role = localStorage.getItem("role");

        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                // Determine the correct refresh token URL based on the role
                const refreshTokenURL = getRefreshTokenUrl(role);
                const response = await axios.post(
                    refreshTokenURL,
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    // No need to update headers; cookies will be updated automatically
                    return ordersDeliveryAxios(originalRequest);
                } else {
                    // If refresh token fails, redirect to login
                    window.location.href = "/login";
                }
            } catch (err) {
                // Handle refresh token errors
                console.error("Token refresh failed:", err);
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

// Function to get the appropriate refresh token URL based on the role
const getRefreshTokenUrl = (role) => {
    switch (role) {
        case "admin":
            return (
                process.env.REACT_APP_ADMIN_BACKEND_API_URL +
                "/api/admin/refresh-access-token"
            );

        case "vendor":
            return (
                process.env.REACT_APP_VENDORS_PRODUCTS_BACKEND_API_URL +
                "/api/vendors/refresh-access-token"
            );
        case "agent":
            return (
                process.env.REACT_APP_ORDERS_DELIVERY_BACKEND_API_URL +
                "/api/agent/refresh-access-token"
            );
        default:
            return (
                process.env.REACT_APP_ADMIN_BACKEND_API_URL +
                "/api/admin/refresh-access-token"
            );
    }
};

export default ordersDeliveryAxios;
