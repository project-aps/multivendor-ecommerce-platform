import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
// import usersAxios from "../../utils/axios/users_axios.js";
import axios from "axios";

// Async Thunks for Authentication Actions
// Login Thunk
export const login = createAsyncThunk(
    "auth/login",
    async ({ credentials }, thunkAPI) => {
        try {
            // const loginEndpoint = "/users/login";
            // const response = await usersAxios.post(loginEndpoint, credentials);

            const loginEndpoint =
                process.env.REACT_APP_USERS_BACKEND_API_URL +
                "/api/users/login";
            const response = await axios.post(loginEndpoint, credentials, {
                withCredentials: true,
            });
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
    async ({ userData }, thunkAPI) => {
        try {
            // const registerEndpoint = "/users/register";
            // const response = await usersAxios.post(registerEndpoint, userData);

            const registerEndpoint =
                process.env.REACT_APP_USERS_BACKEND_API_URL +
                "/api/users/register";
            const response = await axios.post(registerEndpoint, userData, {
                withCredentials: true,
            });
            toast.success("Registration successful");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Logout Thunk
export const logout = createAsyncThunk("auth/logout", async (thunkAPI) => {
    try {
        // const logOutEndpoint = "/users/logout";
        // await usersAxios.post(logOutEndpoint);
        const logOutEndpoint =
            process.env.REACT_APP_USERS_BACKEND_API_URL + "/api/users/logout";
        const response = await axios.post(
            logOutEndpoint,
            {},
            {
                withCredentials: true,
            }
        );

        toast.success("Logged out successfully");
    } catch (error) {
        toast.error("Logout failed");
        return thunkAPI.rejectWithValue(error.response?.data);
    }
});

// reducer to remove the user if any error occurs
// const removeUser = (state) => {
//     state.user = null;
// };

// Initial State
const initialState = {
    user: null,
    isLoading: false,
    error: null,
};

// Auth Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // add reducers here
        removeUserData: (state) => {
            state.user = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.data;
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
                state.user = action.payload.data;
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
                state.isLoading = false;
            })
            .addCase(logout.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload?.message || "Logout failed";
            });
    },
});
export const { removeUserData } = authSlice.actions;
// Export actions if needed (though we are using async thunks here)
export default authSlice.reducer;
