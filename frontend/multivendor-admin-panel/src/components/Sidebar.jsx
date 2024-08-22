import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const { role } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.auth);
    console.log({ role });
    const [openGroup, setOpenGroup] = useState("");
    const [openProfile, setOpenProfile] = useState(false);

    const toggleDropdown = (groupName) => {
        setOpenGroup(openGroup === groupName ? "" : groupName);
    };

    const toggleProfileDropdown = () => {
        setOpenProfile(!openProfile);
    };

    const renderVendorMenu = () => (
        <>
            <hr />
            <DashBoardButton />
            <hr />
            <Dropdown
                title="Products"
                open={openGroup === "Products"}
                toggleDropdown={() => toggleDropdown("Products")}
                links={[
                    { path: "/vendor/products", label: "All Products" },
                    {
                        path: "/vendor/products/create",
                        label: "Create Product",
                    },
                ]}
            />
            <hr />
            <Dropdown
                title="Orders"
                open={openGroup === "Orders"}
                toggleDropdown={() => toggleDropdown("Orders")}
                links={[{ path: "/vendor/orders", label: "All Orders" }]}
            />

            <hr />
            <Dropdown
                title="Earnings"
                open={openGroup === "Earnings"}
                toggleDropdown={() => toggleDropdown("Earnings")}
                links={[{ path: "/vendor/earnings", label: "My Earnings" }]}
            />
        </>
    );

    const DashBoardButton = () => {
        const navigate = useNavigate();
        return (
            <div>
                <div
                    onClick={() => {
                        navigate("/dashboard");
                    }}
                    className="cursor-pointer py-2 hover:bg-gray-700 px-3 rounded flex justify-between items-center"
                >
                    <span>Dashboard</span>
                </div>
            </div>
        );
    };

    const renderDeliveryMenu = () => (
        <Dropdown
            title="Orders"
            open={openGroup === "Orders"}
            toggleDropdown={() => toggleDropdown("Orders")}
            links={[
                { path: "/delivery/orders", label: "All Orders" },
                {
                    path: "/delivery/orders/completed",
                    label: "Completed Orders",
                },
                { path: "/delivery/orders/pending", label: "Pending Orders" },
            ]}
        />
    );

    const renderAdminMenu = () => (
        <>
            <hr />
            <DashBoardButton />
            <hr />
            <Dropdown
                title="Products"
                open={openGroup === "Products"}
                toggleDropdown={() => toggleDropdown("Products")}
                links={[{ path: "/admin/products", label: "All Products" }]}
            />

            <Dropdown
                title="Vendors"
                open={openGroup === "Vendors"}
                toggleDropdown={() => toggleDropdown("Vendors")}
                links={[{ path: "/admin/vendors", label: "All Vendors" }]}
            />
            <hr />
            <Dropdown
                title="Orders"
                open={openGroup === "Orders"}
                toggleDropdown={() => toggleDropdown("Orders")}
                links={[{ path: "/admin/orders", label: "All Orders" }]}
            />
            <Dropdown
                title="Payments"
                open={openGroup === "Payments"}
                toggleDropdown={() => toggleDropdown("Payments")}
                links={[{ path: "/admin/payments", label: "All Payments" }]}
            />
            <hr />
            <Dropdown
                title="Users"
                open={openGroup === "Users"}
                toggleDropdown={() => toggleDropdown("Users")}
                links={[{ path: "/admin/users", label: "All Users" }]}
            />
            <hr />
            <Dropdown
                title="Brands"
                open={openGroup === "Brands"}
                toggleDropdown={() => toggleDropdown("Brands")}
                links={[
                    { path: "/admin/brands", label: "All Brands" },
                    { path: "/admin/brands/create", label: "Create Brand" },
                ]}
            />
            <Dropdown
                title="Categories"
                open={openGroup === "Categories"}
                toggleDropdown={() => toggleDropdown("Categories")}
                links={[
                    { path: "/admin/category", label: "All Categories" },
                    {
                        path: "/admin/category/create",
                        label: "Create Category",
                    },
                ]}
            />
            <Dropdown
                title="Sub-categories"
                open={openGroup === "Sub-categories"}
                toggleDropdown={() => toggleDropdown("Sub-categories")}
                links={[
                    {
                        path: "/admin/subcategories",
                        label: "All Subcategories",
                    },
                    {
                        path: "/admin/subcategories/create",
                        label: "Create Subcategory",
                    },
                ]}
            />
        </>
    );

    const renderProfileDropdown = () => (
        <div>
            <div
                onClick={toggleProfileDropdown}
                className="cursor-pointer py-2 hover:bg-gray-700 px-3 rounded flex justify-between items-center"
            >
                <span>Profile</span>
                <svg
                    className={`w-4 h-4 transform transition-transform ${
                        openProfile ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    ></path>
                </svg>
            </div>
            {openProfile && (
                <ul className="pl-4">
                    <li>
                        <Link
                            to="/profile"
                            className="block py-2 hover:bg-gray-700 px-3 rounded"
                        >
                            My Profile
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/login"
                            className="block py-2 hover:bg-gray-700 px-3 rounded"
                        >
                            Login
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/register"
                            className="block py-2 hover:bg-gray-700 px-3 rounded"
                        >
                            Register
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/logout"
                            className="block py-2 hover:bg-gray-700 px-3 rounded"
                        >
                            Logout
                        </Link>
                    </li>
                </ul>
            )}
        </div>
    );

    return (
        <div className="w-64 bg-gray-800 text-white h-screen overflow-y-scroll fixed">
            <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">
                    {role ? `${role.toUpperCase()} Panel` : "CRM PANEL"}
                </h1>
                <h1 className="text-2xl font-semibold mb-4">
                    {user ? user.name : ""}
                </h1>
                <div className="space-y-4">
                    {renderProfileDropdown()}
                    {role === "vendor" && renderVendorMenu()}
                    {role === "delivery" && renderDeliveryMenu()}
                    {role === "admin" && renderAdminMenu()}
                </div>
            </div>
        </div>
    );
};

const Dropdown = ({ title, open, toggleDropdown, links }) => (
    <div>
        <div
            onClick={toggleDropdown}
            className="cursor-pointer py-2 hover:bg-gray-700 px-3 rounded flex justify-between items-center"
        >
            <span>{title}</span>
            <svg
                className={`w-4 h-4 transform transition-transform ${
                    open ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                ></path>
            </svg>
        </div>
        {open && (
            <ul className="pl-4">
                {links.map((link) => (
                    <li key={link.path}>
                        <Link
                            to={link.path}
                            className="block py-2 hover:bg-gray-700 px-3 rounded"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default Sidebar;
