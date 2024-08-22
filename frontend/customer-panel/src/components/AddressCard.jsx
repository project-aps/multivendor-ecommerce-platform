import React from "react";

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

export default AddressCard;
