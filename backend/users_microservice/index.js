import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

// import helmet from "helmet";
import cors from "cors";
// import rateLimit from "express-rate-limit";
// import compression from "compression";
import morgan from "morgan";

import userRoutes from "./routes/userRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import { sendErrorResponse } from "./utils/responseHandler.js";

import { processUserRequests } from "./services/userService.js";

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

// Routes
// app.use("/", (req, res) => {
//     res.json({
//         message: "Welcome to the API",
//     });
// });

// Start processing user requests from another microservices
processUserRequests();

app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);

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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
