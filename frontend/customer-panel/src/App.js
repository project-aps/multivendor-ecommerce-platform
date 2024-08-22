import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import { debugEnv } from "./utils/debugEnv";
import { Toaster } from "react-hot-toast";

import { fetchCartAsync } from "./redux/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";

//Auth Pages
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import LogoutPage from "./pages/Auth/LogoutPage";
import UnauthorizedPage from "./pages/Auth/Unauthorized";

import Header from "./components/Header";
import HomePage from "./pages/HomePage/HomePage";
import Footer from "./components/Footer";
import ScrollToTopAutomatic from "./components/ScrollToTopAutomatic";
import PrivateRoute from "./components/PrivateRoute";

import FavoritePage from "./pages/FavoritePage/FavoritePage";

import AllProductsPage from "./pages/ProductsPage/AllProductsPage";
import ProductPage from "./pages/ProductsPage/ProductPage";

import CartsPage from "./pages/CartsPage/CartsPage";
import Checkout from "./pages/CartsPage/CheckoutPage";
import PaymentCard from "./components/PaymentCard";

import AllOrders from "./pages/OrdersPage/AllOrders";
import OrderDetails from "./pages/OrdersPage/OrderDetails";

import ProfilePage from "./pages/ProfilePage/ProfilePage";
import PendingReviews from "./pages/Reviews/PendingReviews";
import UserReviews from "./pages/Reviews/UserReviews";
import AllAddress from "./components/AllAddress";

const App = () => {
    const dispatch = useDispatch();

    // check if user is authenticated then only fetch the cart
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        debugEnv(); // Check the output in the console

        // fetch the cart data
        // dispatch(fetchCartAsync());
    }, []);
    useEffect(() => {
        if (user) {
            dispatch(fetchCartAsync());
        }
    }, [user, dispatch]);

    return (
        <div>
            <Header />

            <ScrollToTopAutomatic />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<AllProductsPage />} />
                <Route path="/favorite" element={<FavoritePage />} />
                <Route path="/product/:id" element={<ProductPage />} />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/logout" element={<LogoutPage />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/address" element={<AllAddress />} />
                    <Route path="/cart" element={<CartsPage />} />
                    <Route path="/orders" element={<AllOrders />} />
                    <Route path="/order/:orderId" element={<OrderDetails />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment" element={<PaymentCard />} />
                    <Route
                        path="/pending-reviews"
                        element={<PendingReviews />}
                    />
                    <Route path="/user-reviews" element={<UserReviews />} />
                </Route>

                {/* Catch-all route for unauthorized access */}
                <Route path="*" element={<UnauthorizedPage />} />
            </Routes>

            <Footer />
            <Toaster
                position="bottom-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                toastOptions={{
                    style: {
                        backgroundColor: "black",
                        color: "white",
                    },
                }}
            />
        </div>
    );
};

export default App;
