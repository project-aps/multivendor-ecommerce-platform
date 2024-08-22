import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="ml-64 w-full p-6 bg-gray-100">{children}</div>
        </div>
    );
};

export default Layout;
