import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance.js";
import { toast } from "react-hot-toast";

// Async Thunks for Delivery Agent Actions

// Get Delivery Agent Orders
export const getDeliveryOrders = createAsyncThunk(
    "delivery/getDeliveryOrders",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/delivery/orders");
            return response.data;
        } catch (error) {
            toast.error("Failed to load delivery orders");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Update Delivery Order Status
export const updateOrderStatus = createAsyncThunk(
    "delivery/updateOrderStatus",
    async ({ orderId, status }, thunkAPI) => {
        try {
            const response = await axiosInstance.put(
                `/delivery/orders/${orderId}/status`,
                { status }
            );
            toast.success("Order status updated successfully");
            return response.data;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update order status"
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    orders: [],
    isLoading: false,
    error: null,
};

// Delivery Slice
const deliverySlice = createSlice({
    name: "delivery",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDeliveryOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDeliveryOrders.fulfilled, (state, action) => {
                state.orders = action.payload;
                state.isLoading = false;
            })
            .addCase(getDeliveryOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to load delivery orders";
            })

            .addCase(updateOrderStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const index = state.orders.findIndex(
                    (order) => order.id === action.payload.id
                );
                if (index !== -1) {
                    state.orders[index] = action.payload;
                }
                state.isLoading = false;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to update order status";
            });
    },
});

export default deliverySlice.reducer;
