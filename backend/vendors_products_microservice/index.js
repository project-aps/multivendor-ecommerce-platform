import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

// import helmet from "helmet";
import cors from "cors";
// import rateLimit from "express-rate-limit";
// import compression from "compression";
import morgan from "morgan";

import vendorRoutes from "./routes/vendorRoutes.js";
import brandsRoutes from "./routes/brandsRoutes.js";
import categoryRoutes from "./routes/categoriesRoutes.js";
import subcategoryRoutes from "./routes/subCategoriesRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import reviewsRoutes from "./routes/reviewsRoutes.js";

import { sendErrorResponse } from "./utils/responseHandler.js";
import { processProductRequests } from "./services/productsService.js";
import { processVendorRequests } from "./services/vendorsService.js";

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

processProductRequests();
processVendorRequests();

// Routes

app.use("/api/vendors", vendorRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/reviews", reviewsRoutes);

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
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
