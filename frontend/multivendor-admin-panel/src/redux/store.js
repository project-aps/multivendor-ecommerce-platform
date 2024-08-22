import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import vendorReducer from "./slices/vendorSlice";
import adminReducer from "./slices/adminSlice";
import deliveryReducer from "./slices/deliverySlice";
import authReducer from "./slices/authSlice";

const rootReducer = combineReducers({
    vendor: vendorReducer,
    admin: adminReducer,
    delivery: deliveryReducer,
    auth: authReducer,
});

const persistConfig = {
    key: "root",
    storage,
    version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

// without persistance

// const store = configureStore({
//     reducer: {
//         vendor: vendorReducer,
//         admin: adminReducer,
//         delivery: deliveryReducer,
//         auth: authReducer,
//     },
// });

// export default store;
