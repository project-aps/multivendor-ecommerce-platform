import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance.js";
import { toast } from "react-hot-toast";

// Async Thunks for Admin Actions

// Create Brand
export const createBrand = createAsyncThunk(
    "admin/createBrand",
    async (brandData, thunkAPI) => {
        try {
            const response = await axiosInstance.post(
                "/admin/brands",
                brandData
            );
            toast.success("Brand created successfully");
            return response.data;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create brand"
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Get All Brands
export const getAllBrands = createAsyncThunk(
    "admin/getAllBrands",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/admin/brands");
            return response.data;
        } catch (error) {
            toast.error("Failed to load brands");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Create Category
export const createCategory = createAsyncThunk(
    "admin/createCategory",
    async (categoryData, thunkAPI) => {
        try {
            const response = await axiosInstance.post(
                "/admin/categories",
                categoryData
            );
            toast.success("Category created successfully");
            return response.data;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create category"
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Get All Categories
export const getAllCategories = createAsyncThunk(
    "admin/getAllCategories",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/admin/categories");
            return response.data;
        } catch (error) {
            toast.error("Failed to load categories");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Create Subcategory
export const createSubcategory = createAsyncThunk(
    "admin/createSubcategory",
    async (subcategoryData, thunkAPI) => {
        try {
            const response = await axiosInstance.post(
                "/admin/subcategories",
                subcategoryData
            );
            toast.success("Subcategory created successfully");
            return response.data;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create subcategory"
            );
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Get All Subcategories
export const getAllSubcategories = createAsyncThunk(
    "admin/getAllSubcategories",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/admin/subcategories");
            return response.data;
        } catch (error) {
            toast.error("Failed to load subcategories");
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    brands: [],
    categories: [],
    subcategories: [],
    isLoading: false,
    error: null,
};

// Admin Slice
const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBrand.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBrand.fulfilled, (state, action) => {
                state.brands.push(action.payload);
                state.isLoading = false;
            })
            .addCase(createBrand.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to create brand";
            })

            .addCase(getAllBrands.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllBrands.fulfilled, (state, action) => {
                state.brands = action.payload;
                state.isLoading = false;
            })
            .addCase(getAllBrands.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to load brands";
            })

            .addCase(createCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
                state.isLoading = false;
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to create category";
            })

            .addCase(getAllCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
                state.isLoading = false;
            })
            .addCase(getAllCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to load categories";
            })

            .addCase(createSubcategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createSubcategory.fulfilled, (state, action) => {
                state.subcategories.push(action.payload);
                state.isLoading = false;
            })
            .addCase(createSubcategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to create subcategory";
            })

            .addCase(getAllSubcategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllSubcategories.fulfilled, (state, action) => {
                state.subcategories = action.payload;
                state.isLoading = false;
            })
            .addCase(getAllSubcategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error =
                    action.payload?.message || "Failed to load subcategories";
            });
    },
});

export default adminSlice.reducer;
