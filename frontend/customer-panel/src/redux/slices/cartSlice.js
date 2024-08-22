import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios";
import toast from "react-hot-toast";

export const addToCartAsync = createAsyncThunk(
    "cart/addToCartAsync",
    async ({ product_id, quantity = 1 }, thunkAPI) => {
        try {
            const addToCartEndpoint = "/carts/add";
            const response = await ordersDeliveryAxios.post(addToCartEndpoint, {
                product_id,
                quantity,
            });

            if (response.data.success) {
                toast.success(response.data.message);

                return response.data.data;
            } else {
                toast.error(response.data.message);
                return thunkAPI.rejectWithValue(response.data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to add the item to Cart."
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const deleteProductFromCartAsync = createAsyncThunk(
    "cart/deleteProductFromCartAsync",
    async ({ product_id }, thunkAPI) => {
        try {
            const removeToCartEndpoint = "/carts/remove";
            const response = await ordersDeliveryAxios.put(
                removeToCartEndpoint,
                {
                    product_id,
                }
            );

            if (response.data.success) {
                toast.success(response.data.message);

                return response.data.data;
            } else {
                toast.error(response.data.message);
                return thunkAPI.rejectWithValue(response.data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to remove the item from Cart."
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const clearCartAsync = createAsyncThunk(
    "cart/clearCartAsync",
    async (thunkAPI) => {
        try {
            const deleteCartEndpoint = "/carts/delete-cart";
            const response = await ordersDeliveryAxios.delete(
                deleteCartEndpoint
            );

            if (response.data.success) {
                toast.success(response.data.message);
                return response.data;
            } else {
                toast.error(response.data.message);
                return thunkAPI.rejectWithValue(response.data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to clear the Cart."
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const fetchCartAsync = createAsyncThunk(
    "cart/fetchCartAsync",
    async (thunkAPI) => {
        try {
            const fetchCartEndpoint = "/carts";
            const response = await ordersDeliveryAxios.get(fetchCartEndpoint);

            if (response.data.success) {
                toast.success(response.data.message);
                return response.data.data;
            } else {
                toast.error(response.data.message);
                return thunkAPI.rejectWithValue(response.data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to fetch the Cart."
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    items: [],
    totalItems: 0,
    status: "idle",
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        // clear the cart states
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartAsync.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCartAsync.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(addToCartAsync.pending, (state) => {
                state.status = "loading";
            })
            .addCase(deleteProductFromCartAsync.pending, (state) => {
                state.status = "loading";
            })
            .addCase(clearCartAsync.pending, (state) => {
                state.status = "loading";
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(deleteProductFromCartAsync.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(clearCartAsync.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(fetchCartAsync.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload.items;
                state.totalItems = action.payload.totalItems;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                const { product_id, quantity } = action.payload;
                // Check if item already exists
                const existingItemIndex = state.items.findIndex(
                    (item) => item.product_id === product_id
                );

                if (existingItemIndex >= 0) {
                    // Update the quantity if item exists
                    state.items[existingItemIndex].quantity = quantity;
                } else {
                    // Add new item to the cart if not exists
                    state.items.push({ product_id, quantity });
                }
                state.totalItems = action.payload.totalItems;
                state.status = "succeeded";
            })
            .addCase(deleteProductFromCartAsync.fulfilled, (state, action) => {
                const { product_id } = action.payload;

                // Filter out the item with the specified product_id
                state.items = state.items.filter(
                    (item) => item.product_id !== product_id
                );
                state.totalItems = action.payload.totalItems;
                state.status = "succeeded";
            })
            .addCase(clearCartAsync.fulfilled, (state) => {
                state.items = [];
                state.totalItems = 0;
            });
    },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
