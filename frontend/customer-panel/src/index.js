import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import { store, persistor } from "./redux/store";
import "./index.css";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter as Router } from "react-router-dom";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <PersistGate persistor={persistor} loading={<div>Loading....</div>}>
        <Provider store={store}>
            <Router>
                <App />
            </Router>
        </Provider>
    </PersistGate>
);
