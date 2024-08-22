import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

// import helmet from "helmet";
import cors from "cors";
// import rateLimit from "express-rate-limit";
// import compression from "compression";
import morgan from "morgan";

import cartsRoutes from "./routes/cartsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import couponsRoutes from "./routes/couponsRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";

import { sendErrorResponse } from "./utils/responseHandler.js";
import { processOrderRequests } from "./services/orderService.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

// cors
const corsOptions = {
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_ADMIN_URL],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
};

// middlewares;
app.use(cors(corsOptions));

// Setup morgan logger with custom format
app.use(
    morgan(":date[iso] :remote-addr :method :url :status :response-time ms")
);

processOrderRequests();

// Routes

app.use("/api/carts", cartsRoutes);
app.use("/api/coupon", couponsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    sendErrorResponse(res, {
        statusCode: err.statusCode || 500,
        message: err.message || "Something went wrong",
        error: process.env.NODE_ENV === "production" ? null : err,
    });
});

// listening on the server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
