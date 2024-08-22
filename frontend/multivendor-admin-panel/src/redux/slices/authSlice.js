import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import adminAxios from "../../utils/axios/admin_axios.js";
import ordersDeliveryAxios from "../../utils/axios/orders_delivery_axios.js";
import vendorProductsAxios from "../../utils/axios/vendors_products_axios.js";

// Determine the appropriate Axios instance based on the role
const getAxiosInstance = (role) => {
    switch (role) {
        case "admin":
            return adminAxios;
        case "vendor":
            return vendorProductsAxios;
        case "agent":
            return ordersDeliveryAxios;
        default:
            return vendorProductsAxios;
    }
};

const get_role_endpoints = (role) => {
    switch (role) {
        case "admin":
            return "/admin";
        case "vendor":
            return "/vendors";
        case "agent":
            return "/agent";
        default:
            return "/vendors";
    }
};

// Async Thunks for Authentication Actions
// Login Thunk
export const login = createAsyncThunk(
    "auth/login",
    async ({ credentials, role }, thunkAPI) => {
        try {
            const axiosInstance = getAxiosInstance(role);
            const loginEndpoint = get_role_endpoints(role) + "/login";
            const response = await axiosInstance.post(
                loginEndpoint,
                credentials
            );
            localStorage.setItem("role", role);
            toast.success("Login successful");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Register Thunk
export const register = createAsyncThunk(
    "auth/register",
    async ({ userData, role }, thunkAPI) => {
        try {
            const axiosInstance = getAxiosInstance(role);
            const registerEndpoint = get_role_endpoints(role) + "/register";
            const response = await axiosInstance.post(
                registerEndpoint,
                userData
            );
            toast.success("Registration successful");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Logout Thunk
export const logout = createAsyncThunk(
    "auth/logout",
    async ({ role }, thunkAPI) => {
        try {
            const axiosInstance = getAxiosInstance(role);
            const logOutEndpoint = get_role_endpoints(role) + "/logout";
            await axiosInstance.post(logOutEndpoint);
            localStorage.removeItem("role");
            toast.success("Logged out successfully");
        } catch (error) {
            toast.error("Logout failed");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    user: null,
    role: null,
    isLoading: false,
    error: null,
};

// Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.data.user;
                state.role = action.payload.data.role;
                state.isLoading = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Login failed";
            })

            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.role = action.payload.role;
                state.isLoading = false;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Registration failed";
            })

            // Logout
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.role = null;
                state.isLoading = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Logout failed";
            });
    },
});

// Export actions if needed (though we are using async thunks here)
export default authSlice.reducer;
