import React from "react";
import { useSelector } from "react-redux";
import MyProfileVendor from "../Vendor/VendorProfile";
import MyProfileAdmin from "../Admin/VendorProfile";

const MyProfile = () => {
    const { role } = useSelector((state) => state.auth);
    return (
        <div>
            {role && role == "vendor" && <MyProfileVendor />}
            {role && role == "admin" && <MyProfileAdmin />}
        </div>
    );
};

export default MyProfile;
