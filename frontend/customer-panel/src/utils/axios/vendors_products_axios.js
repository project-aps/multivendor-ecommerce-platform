import axios from "axios";
// import { store } from "../../redux/store";
// import { removeUserData } from "../../redux/slices/authSlice";

const vendorProductsAxios = axios.create({
    baseURL: process.env.REACT_APP_VENDORS_PRODUCTS_BACKEND_API_URL + "/api",
    withCredentials: true, // Ensures cookies are sent with each request
    headers: {
        "Content-Type": "application/json",
    },
});

// // Response Interceptor to handle token refresh
// vendorProductsAxios.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;

//         if (
//             error.response &&
//             error.response.status === 401 &&
//             !originalRequest._retry
//         ) {
//             originalRequest._retry = true;

//             try {
//                 // Determine the correct refresh token URL based on the role
//                 const refreshTokenURL =
//                     process.env.REACT_APP_USERS_BACKEND_API_URL +
//                     "/api/users/refresh-access-token";
//                 const response = await axios.post(
//                     refreshTokenURL,
//                     {},
//                     { withCredentials: true }
//                 );

//                 if (response.data.success) {
//                     // No need to update headers; cookies will be updated automatically
//                     return vendorProductsAxios(originalRequest);
//                 } else {
//                     store.dispatch(removeUserData());
//                     // If refresh token fails, redirect to login
//                     window.location.href = "/login";
//                 }
//             } catch (err) {
//                 // Handle refresh token errors
//                 console.error("Token refresh failed:", err);
//                 store.dispatch(removeUserData());
//                 window.location.href = "/login";
//                 return Promise.reject(err);
//             }
//         }

//         return Promise.reject(error);
//     }
// );

export default vendorProductsAxios;
