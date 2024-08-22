import React, { useEffect, useState } from "react";
import CartSummaryComponent from "./Cart";
import AddressCard from "../../components/AddressCard";
import usersAxios from "../../utils/axios/users_axios";
import toast from "react-hot-toast";
import SelectAddress from "../../components/SelectAddress";
import { useDispatch, useSelector } from "react-redux";
import {
    goNextStep,
    goPreviousStep,
    resetCheckoutState,
    setOrders,
    setOrderSummary,
    setStep,
    setTotalAmount,
} from "../../redux/slices/checkoutSlice";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import OrderSummary from "../../components/OrderSummary";
import PaymentCard from "../../components/PaymentCard";
import { clearCart } from "../../redux/slices/cartSlice";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Link } from "react-router-dom";

const breadcrumbsData = [
    {
        label: "Home",
        path: "/",
    },
    {
        label: "Cart",
        path: "/cart",
    },
    {
        label: "Checkout",
        path: "/checkout",
    },
];

const Checkout = () => {
    const dispatch = useDispatch();
    const {
        currentStep,
        selectedAddressId,
        orderSummary,
        paymentMethod,
        orders,
    } = useSelector((state) => state.checkout);

    const [orderSummaryData, setOrderSummaryData] = useState([]);
    // const [confirmedOrders, setConfirmedOrders] = useState([]);

    useEffect(() => {
        // Reset state when component mounts
        dispatch(resetCheckoutState());
        dispatch(setStep(1)); // Ensure starting from Step 1
    }, [dispatch]);

    useEffect(() => {
        if (currentStep === 3 && selectedAddressId) {
            // const fetchOrderSummary = async () => {
            //     const response = await fetch(
            //         `/api/generate-order-summary?addressId=${selectedAddressId}`
            //     );
            //     const data = await response.json();
            //     if (response.data.success) {
            //         dispatch(setOrderSummary(data));
            //         dispatch(setOrders(data.orders));
            //         dispatch(setTotalAmount(data.totalAmount));
            //     }
            // };

            function extractOrderInfo(data) {
                return data.orders.map((order) => ({
                    orderId: order.order[0].id,
                    totalAmountVendor: order.price.total_amount_vendor,
                }));
            }

            const fetchOrderSummary = async () => {
                try {
                    const response = await ordersDeliveryAxios.post(
                        "/orders/checkout-summary",
                        {
                            address_id: selectedAddressId,
                        }
                    );
                    if (response.data.success) {
                        const orderInfo = extractOrderInfo(response.data.data);
                        // dispatch(setOrderSummary(response.data.data));

                        console.log(response.data);
                        console.log({ orderInfo });

                        setOrderSummaryData(response.data.data);
                        dispatch(setOrders(orderInfo));
                        dispatch(
                            setTotalAmount(
                                response.data.data.price.total_paying_amount
                            )
                        );
                    } else {
                        toast.error(
                            response.data.message ||
                                "Failed to fetch order summary"
                        );
                    }
                } catch (error) {
                    toast.error(
                        "An error occurred while fetching order summary"
                    );
                    console.error(error);
                }
            };
            fetchOrderSummary();
        }
    }, [currentStep, selectedAddressId, dispatch]);

    const steps = [
        { id: 1, name: "Cart Summary" },
        { id: 2, name: "Address Selection" },
        { id: 3, name: "Order Summary" },
        { id: 4, name: "Payment" },
        { id: 5, name: "Confirmation" },
    ];

    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return <CartSummary />;
            case 2:
                return <SelectAddress />;
            case 3:
                return (
                    <div>
                        {orderSummaryData && (
                            <OrderSummary orderSummary={orderSummaryData} />
                        )}
                    </div>
                );
            case 4:
                return <PaymentCard />;
            case 5:
                return <Confirmation />;
            default:
                return <CartSummary />;
        }
    };

    const goForNextStep = async () => {
        console.log("goForNextStep called");
        if (currentStep === 4) {
            if (!paymentMethod || !selectedAddressId) {
                toast.error(
                    "Please select address and payment method to proceed"
                );
                return;
            }
            dispatch(goNextStep());
        } else if (currentStep === 2) {
            if (!selectedAddressId) {
                toast.error("Please select address to proceed");
                return;
            } else {
                dispatch(goNextStep());
            }
        } else {
            console.log("inside else");
            dispatch(goNextStep());
        }
    };

    return (
        <div className="w-full mx-auto p-4 md:p-10">
            {/* Breadcrumbs component */}
            {breadcrumbsData && <Breadcrumbs crumbs={breadcrumbsData} />}
            <h1 className="text-4xl mt-4 mb-4 font-bold">Checkout Cart </h1>
            <div className="mt-2 flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                    <div
                        key={step.id}
                        className={`flex-1 p-2 text-center cursor-pointer ${
                            currentStep >= step.id
                                ? "bg-green-500 text-white"
                                : "bg-gray-300 text-gray-600"
                        } ${currentStep === 5 ? "cursor-not-allowed" : ""}`}
                        onClick={() => {
                            if (currentStep !== 5) {
                                // Prevent navigating to step 4 without completing step 3
                                if (step.id === 4 && currentStep < 3) {
                                    toast.error(
                                        "Complete the Order Summary before proceeding to Payment."
                                    );
                                }
                                // Prevent navigating to step 5 without completing step 4
                                else if (step.id === 5) {
                                    toast.error(
                                        "Complete the Payment and Confirm Order before proceeding to Order Confirmation."
                                    );
                                }
                                // Prevent navigating to any step beyond step 2 without an address
                                else if (step.id > 2 && !selectedAddressId) {
                                    toast.error(
                                        "Please select address to proceed"
                                    );
                                    dispatch(setStep(2));
                                } else {
                                    dispatch(setStep(step.id));
                                }
                            }
                        }}
                    >
                        {step.name}
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {renderContent()}
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => dispatch(goPreviousStep())}
                    disabled={currentStep === 1 || currentStep === 5}
                    className={`py-2 px-4 rounded-lg ${
                        currentStep === 1 || currentStep === 5
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white"
                    }`}
                >
                    Previous
                </button>
                <button
                    // onClick={() => dispatch(goNextStep())}
                    onClick={goForNextStep}
                    disabled={currentStep === steps.length}
                    className={`py-2 px-4 rounded-lg ${
                        currentStep === steps.length
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 text-white"
                    }
                    ${currentStep === 4 ? "bg-green-500 px-2 " : ""}`}
                >
                    {currentStep === steps.length - 1
                        ? "Confirm Order"
                        : "Next"}
                </button>
            </div>
        </div>
    );
};

const CartSummary = () => (
    <div>
        <CartSummaryComponent />
    </div>
);

const Confirmation = () => {
    const [loading, setLoading] = useState(false);
    const [confirmedOrders, setConfirmedOrders] = useState([]);

    const dispatch = useDispatch();
    const { selectedAddressId, paymentMethod, orders } = useSelector(
        (state) => state.checkout
    );

    // confirm the orders by calling backend api

    useEffect(() => {
        setLoading(true);
        const confirmOrders = async () => {
            if (!paymentMethod || !selectedAddressId) {
                toast.error(
                    "Please select address and payment method to proceed"
                );
                return;
            }

            console.log({ paymentMethod, selectedAddressId, orders });
            // toast.success("Confirming Orders ...");

            try {
                const confirmedOrderIDs = [];
                for (let order of orders) {
                    const response = await ordersDeliveryAxios.post(
                        `/orders/confirm/${order.orderId}`,
                        {
                            payment_method: paymentMethod,
                            amount: order.totalAmountVendor,
                        }
                    );
                    if (response.data.success) {
                        confirmedOrderIDs.push(order.orderId); // Assuming response contains orderId
                        toast.success(
                            `Order ID: ${order.orderId} confirmed successfully`
                        );
                    } else {
                        toast.error(
                            `Failed to confirm order ID: ${order.orderId}. Please try again.`
                        );
                        return;
                    }
                }
                setConfirmedOrders(confirmedOrderIDs); // Store all confirmed order IDs
                // clear the cart
                // dispatch(resetCheckoutState());
                dispatch(clearCart());
                // dispatch(setStep(5));
            } catch (error) {
                console.error("Failed to confirm order:", error);
            }

            setLoading(false);
        };
        confirmOrders();
    }, [dispatch, orders, paymentMethod, loading, selectedAddressId]);

    return (
        <div>
            {loading && <div>Loading....</div>}
            {confirmedOrders && (
                <div>
                    <h2 className="text-xl font-bold mb-4">
                        Order Confirmation
                    </h2>
                    <p>Your order has been placed successfully!</p>
                    {confirmedOrders.map((orderId) => (
                        <Link key={orderId} to={`/order/${orderId}`}>
                            {" "}
                            <p>Order ID: {orderId}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Checkout;
