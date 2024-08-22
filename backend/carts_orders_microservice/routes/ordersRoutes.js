import express from "express";
import {
    checkoutOrderSummary,
    markOrderAsConfirmed,
    getAllOwnOrdersOfVendor,
    getOrderDetailsOfVendorByOrderID,
    changeOrderStatusByVendor,
    getAllOwnOrdersOfUser,
    getOrderDetailsOfUserByOrderID,
    getAllOrdersAdmin,
    getOrderDetailsByOrderIDAdmin,
    getPendingReviewsOfUser,
    addReviewOfProduct,
    getVendorsDashboardData,
    getAdminDashboardData,
    getDailyOrders,
    getDailyOrdersForVendor,
} from "../controllers/ordersController.js";
import {
    isAdmin,
    isAuthenticated,
    isUser,
    isVendor,
} from "../middleware/auth.js";
const router = express.Router();

// user related
// order creation
router.post("/checkout-summary", isAuthenticated, isUser, checkoutOrderSummary);
router.post(
    "/confirm/:order_id",
    isAuthenticated,
    isUser,
    markOrderAsConfirmed
);
// order fetching
router.get("/own/user", isAuthenticated, isUser, getAllOwnOrdersOfUser);
router.get(
    "/own/user/:id",
    isAuthenticated,
    isUser,
    getOrderDetailsOfUserByOrderID
);

// review related
router.get(
    "/pending-reviews",
    isAuthenticated,
    isUser,
    getPendingReviewsOfUser
);
router.post("/add-review", isAuthenticated, isUser, addReviewOfProduct);

// vendor related
router.get("/own/vendor", isAuthenticated, isVendor, getAllOwnOrdersOfVendor);
router.get(
    "/vendor/dashboard",
    isAuthenticated,
    isVendor,
    getVendorsDashboardData
);
router.get("/vendor/daily", isAuthenticated, isVendor, getDailyOrdersForVendor);

router.get(
    "/own/vendor/:id",
    isAuthenticated,
    isVendor,
    getOrderDetailsOfVendorByOrderID
);
router.put("/status/:id", isAuthenticated, isVendor, changeOrderStatusByVendor);

// admin related
router.get("/all", isAuthenticated, isAdmin, getAllOrdersAdmin);
router.get("/:id", isAuthenticated, isAdmin, getOrderDetailsByOrderIDAdmin);
router.get("/admin/dashboard", isAuthenticated, isAdmin, getAdminDashboardData);
router.get("/admin/daily", isAuthenticated, isAdmin, getDailyOrders);

export default router;
