import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

import { debugEnv } from "./utils/debugEnv";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import LogoutPage from "./pages/Auth/LogoutPage";
import UnauthorizedPage from "./pages/Auth/Unauthorized";

import AddProduct from "./pages/Vendor/AddProduct";
import VendorProducts from "./pages/Vendor/AllVendorProducts2";
import SingleProductComponent from "./pages/Vendor/SingleProductDetails";
import UpdateProduct from "./pages/Vendor/UpdateProduct";
import VendorOrders from "./pages/Vendor/AllVendorOrders";
import OrderDetailPage from "./pages/Vendor/OrderDetailsPage";
import MyProfile from "./pages/Profile/MyProfile";
import CreateCategory from "./pages/Admin/CreateCategory";
import AllCategories from "./pages/Admin/AllCategory";
import CreateBrand from "./pages/Admin/CreateBrand";
import AllBrands from "./pages/Admin/AllBrand";
import CreateSubcategory from "./pages/Admin/CreateSubCategory";
import AllSubCategory from "./pages/Admin/AllSubCategory";
import AllVendors from "./pages/Admin/AllVendors";
import SingleVendor from "./pages/Admin/SingleVendor";
import AllProducts from "./pages/Admin/AllProducts";
import SingleProductAdmin from "./pages/Admin/SingleProductDetails";
import AllOrders from "./pages/Admin/AllOrders";
import OrderDetailPageAdmin from "./pages/Admin/OrderDetailsPageAdmin";
import MyEarnings from "./pages/Vendor/VendorEarnings";
import PaymentsTable from "./pages/Admin/AllPayments";
import UsersTable from "./pages/Admin/AllUsers";
import UserDetails from "./pages/Admin/UserDetails";
import UpdateBrand from "./pages/Admin/UpdateBrand";
import UpdateSubCategory from "./pages/Admin/UpdateSubCategory";
import UpdateCategory from "./pages/Admin/UpdateCategory";
import VendorDashboard from "./pages/Vendor/Dashboard/VendorDashboard";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";

const App = () => {
    useEffect(() => {
        debugEnv(); // Check the output in the console
    }, []);
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/logout" element={<LogoutPage />} />
                    <Route path="/unauthorize" element={<UnauthorizedPage />} />

                    {/* Vendor Routes */}
                    <Route element={<PrivateRoute allowedRoles={["vendor"]} />}>
                        <Route path="/vendor" element={<VendorDashboard />} />

                        <Route
                            path="/vendor/products"
                            element={<VendorProducts />}
                        />
                        <Route
                            path="/vendor/products/create"
                            element={<AddProduct />}
                        />
                        <Route
                            path="/vendor/products/:productId"
                            element={<SingleProductComponent />}
                        />
                        <Route
                            path="/vendor/products/update/:id"
                            element={<UpdateProduct />}
                        />

                        {/* orders routes */}
                        <Route
                            path="/vendor/orders"
                            element={<VendorOrders />}
                        />
                        <Route
                            path="/vendor/orders/:orderId"
                            element={<OrderDetailPage />}
                        />

                        {/* earnings routes */}
                        <Route
                            path="/vendor/earnings"
                            element={<MyEarnings />}
                        />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
                        <Route path="/admin" element={<AdminDashboard />} />

                        {/* category routes */}
                        <Route
                            path="/admin/category/create"
                            element={<CreateCategory />}
                        />
                        <Route
                            path="/admin/category"
                            element={<AllCategories />}
                        />
                        <Route
                            path="/admin/category/update/:id"
                            element={<UpdateCategory />}
                        />
                        {/* sub category routes */}
                        <Route
                            path="/admin/subcategories/create"
                            element={<CreateSubcategory />}
                        />
                        <Route
                            path="/admin/subcategories"
                            element={<AllSubCategory />}
                        />
                        <Route
                            path="/admin/subcategories/update/:id"
                            element={<UpdateSubCategory />}
                        />

                        {/* brand routes */}
                        <Route
                            path="/admin/brands/create"
                            element={<CreateBrand />}
                        />
                        <Route path="/admin/brands" element={<AllBrands />} />

                        <Route
                            path="/admin/brands/update/:id"
                            element={<UpdateBrand />}
                        />

                        {/* vendor routes */}
                        <Route path="/admin/vendors" element={<AllVendors />} />
                        <Route
                            path="/admin/vendors/:id"
                            element={<SingleVendor />}
                        />

                        {/* products routes */}
                        <Route
                            path="/admin/products"
                            element={<AllProducts />}
                        />
                        <Route
                            path="/admin/products/:productId"
                            element={<SingleProductAdmin />}
                        />

                        {/* orders routes */}
                        <Route path="/admin/orders" element={<AllOrders />} />
                        <Route
                            path="/admin/orders/:orderId"
                            element={<OrderDetailPageAdmin />}
                        />

                        {/* payments routes */}
                        <Route
                            path="/admin/payments"
                            element={<PaymentsTable />}
                        />

                        {/* users routes */}

                        <Route path="/admin/users" element={<UsersTable />} />
                        <Route
                            path="/admin/users/:userId"
                            element={<UserDetails />}
                        />
                    </Route>

                    {/* ADMIN || VENDOR || AGENT */}
                    <Route
                        element={
                            <PrivateRoute
                                allowedRoles={["vendor", "admin", "agent"]}
                            />
                        }
                    >
                        <Route path="/profile" element={<MyProfile />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>

                    {/* Catch-all route for unauthorized access */}
                    <Route path="*" element={<UnauthorizedPage />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
