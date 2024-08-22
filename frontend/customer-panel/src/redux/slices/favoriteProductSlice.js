import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
    favoriteProduct: [],
};

// Slice
const favoriteProductSlice = createSlice({
    name: "favoriteProduct",
    initialState,
    reducers: {
        addToFavorite: (state, action) => {
            const product = action.payload;
            const isFavorite = state.favoriteProduct.some(
                (item) => item.product_id === product.product_id
            );
            if (isFavorite) {
                state.favoriteProduct = state.favoriteProduct.filter(
                    (item) => item.product_id !== product.product_id
                );
            } else {
                state.favoriteProduct.push(product);
            }
        },
        removeFromFavorite: (state, action) => {
            const productId = action.payload;
            state.favoriteProduct = state.favoriteProduct.filter(
                (item) => item.product_id !== productId
            );
        },
        resetFavorite: (state) => {
            state.favoriteProduct = [];
        },
    },
});

// Export actions
export const { addToFavorite, removeFromFavorite, resetFavorite } =
    favoriteProductSlice.actions;

// Export reducer
export default favoriteProductSlice.reducer;
