import { useEffect, useState } from "react";
import usersAxios from "../utils/axios/users_axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import React from "react";
import { handleSelectAddress } from "../redux/slices/checkoutSlice";
import CreateAddress from "./CreateAddress";

const SelectAddress = () => {
    const [addresses, setAddresses] = useState([]);
    const dispatch = useDispatch();

    const { selectedAddressId } = useSelector((state) => state.checkout);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await usersAxios.get("/address/all-own");
                if (response.data.success) {
                    toast.success("Address Fetched Successfully.");
                    setAddresses(response.data.data);
                } else {
                    console.error(
                        "Error fetching addresses:",
                        response.data.message
                    );
                    toast.error(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
                toast.error("Error Fetching Addresses.");
            }
        };

        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await usersAxios.get("/address/all-own");
            if (response.data.success) {
                toast.success("Address Fetched Successfully.");
                setAddresses(response.data.data);
            } else {
                console.error(
                    "Error fetching addresses:",
                    response.data.message
                );
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Error Fetching Addresses.");
        }
    };

    const handleAddressCreated = (newAddress) => {
        // setAddresses([...addresses, newAddress]); // Add the new address to the list
        fetchAddresses();
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">
                Select a Delivery Address
            </h1>

            <div className="flex p-4">
                {/* Left side: Address List */}
                <div className="w-1/2 pr-4">
                    {addresses.map((address) => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            isSelected={selectedAddressId === address.id}
                            onSelect={() => {
                                dispatch(handleSelectAddress(address.id));
                            }}
                        />
                    ))}
                </div>

                {/* Vertical Line */}
                <div className="w-px bg-gray-300 mx-4"></div>
                {/* Right side: Address Form */}
                <div className="w-1/2 pr-4">
                    <CreateAddress onAddressCreated={handleAddressCreated} />
                </div>
            </div>
        </div>
    );
};

const AddressCard = ({ address, isSelected, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(address.id)}
            className={`p-4 border rounded-lg shadow-md cursor-pointer mb-4 ${
                isSelected
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-300 bg-white"
            }`}
        >
            <h2 className="font-bold text-lg">{address.full_name}</h2>
            <p>{address.full_address}</p>
            <p>
                {address.municipality}, Ward: {address.ward}
            </p>
            <p>
                {address.district}, {address.state}, {address.country}
            </p>
            <p>Postal Code: {address.postal_code}</p>
            <p>Nearest Landmark: {address.nearest_landmark}</p>
            <p>Contact: {address.contact_number}</p>
        </div>
    );
};

export default SelectAddress;
