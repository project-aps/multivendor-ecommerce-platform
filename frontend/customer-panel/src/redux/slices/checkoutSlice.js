// features/checkoutSlice.js
import { createSlice } from "@reduxjs/toolkit";

const checkoutSlice = createSlice({
    name: "checkout",
    initialState: {
        currentStep: 1,
        selectedAddressId: null,
        orderSummary: {},
        orders: [],
        totalAmount: 0,
        paymentMethod: "",
    },
    reducers: {
        goNextStep(state) {
            if (state.currentStep < 5) {
                state.currentStep += 1;
            }
        },
        goPreviousStep(state) {
            if (state.currentStep > 1) {
                state.currentStep -= 1;
            }
        },
        setStep(state, action) {
            state.currentStep = action.payload;
        },
        handleSelectAddress(state, action) {
            state.selectedAddressId = action.payload;
        },
        setOrderSummary(state, action) {
            state.orderSummary = action.payload;
        },
        setOrders(state, action) {
            state.orders = action.payload;
        },
        setTotalAmount(state, action) {
            state.totalAmount = action.payload;
        },
        setPaymentMethod(state, action) {
            state.paymentMethod = action.payload;
        },
        resetCheckoutState(state) {
            // state.currentStep = 1;
            state.selectedAddressId = null;
            state.orderSummary = {};
            state.orders = [];
            state.totalAmount = 0;
            state.paymentMethod = "";
        },
    },
});

export const {
    goNextStep,
    goPreviousStep,
    handleSelectAddress,
    setOrderSummary,
    setOrders,
    setStep,
    setTotalAmount,
    setPaymentMethod,
    resetCheckoutState,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
