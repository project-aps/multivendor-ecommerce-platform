import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { store, persistor } from "./redux/store";
import "./index.css";
import { PersistGate } from "redux-persist/integration/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <PersistGate persistor={persistor}>
        <Provider store={store}>
            <div>
                <App />
                <Toaster position="top-right" reverseOrder={false} />
            </div>
        </Provider>
    </PersistGate>
);
