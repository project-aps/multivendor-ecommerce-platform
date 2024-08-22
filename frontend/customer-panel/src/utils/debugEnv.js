export const debugEnv = () => {
    console.log("Admin API URL:", process.env.REACT_APP_ADMIN_BACKEND_API_URL);
    console.log(
        "Vendor API URL:",
        process.env.REACT_APP_VENDORS_PRODUCTS_BACKEND_API_URL
    );
    console.log(
        "Agent API URL:",
        process.env.REACT_APP_ORDERS_DELIVERY_BACKEND_API_URL
    );
};
