import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance.js";
import { toast } from "react-hot-toast";

// Async Thunks for Vendor Actions

// Create Product
export const createProduct = createAsyncThunk(
    "vendor/createProduct",
    async (productData, thunkAPI) => {
        try {
            const response = await axiosInstance.post(
                "/vendor/products",
                productData
            );
            toast.success("Product created successfully");
            return response.data;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create product"
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Get All Products
export const getAllProducts = createAsyncThunk(
    "vendor/getAllProducts",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/vendor/products");
            return response.data;
        } catch (error) {
            toast.error("Failed to load products");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Get Vendor Orders
export const getVendorOrders = createAsyncThunk(
    "vendor/getVendorOrders",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/vendor/orders");
            return response.data;
        } catch (error) {
            toast.error("Failed to load orders");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    products: [],
    orders: [],
    stats: null,
    isLoading: false,
    error: null,
};

// Vendor Slice
const vendorSlice = createSlice({
    name: "vendor",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.push(action.payload);
                state.isLoading = false;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to create product";
            })

            .addCase(getAllProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.products = action.payload;
                state.isLoading = false;
            })
            .addCase(getAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to load products";
            })

            .addCase(getVendorOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getVendorOrders.fulfilled, (state, action) => {
                state.orders = action.payload;
                state.isLoading = false;
            })
            .addCase(getVendorOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to load orders";
            });
    },
});

export default vendorSlice.reducer;
