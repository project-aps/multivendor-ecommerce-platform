import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setPaymentMethod } from "../redux/slices/checkoutSlice";

const PaymentCard = () => {
    const [selectedMethod, setSelectedMethod] = useState(null);

    const dispatch = useDispatch();
    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
        dispatch(setPaymentMethod(method));
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Select Payment Method</h2>
            <div className="space-y-4">
                <div
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                        selectedMethod === "COD"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                    }`}
                    onClick={() => handleSelectMethod("COD")}
                >
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={selectedMethod === "COD"}
                        onChange={() => handleSelectMethod("COD")}
                        className="mr-4"
                    />
                    <span className="text-lg">Cash on Delivery</span>
                </div>

                <div
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                        selectedMethod === "online"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                    }`}
                    // onClick={() => handleSelectMethod("online")}
                >
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        disabled
                        checked={selectedMethod === "online"}
                        onChange={() => handleSelectMethod("online")}
                        className="mr-4"
                    />
                    <span className="text-lg">Online Payment</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentCard;
