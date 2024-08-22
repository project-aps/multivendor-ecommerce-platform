import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    updateAccessToken,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    approveUserById,
    suspendUserById,
    deleteUserById,
    getVendorEarningsOfVendorOWN,
    getVendorEarningsOfVendorByID,
    getVendorEarningsGraphOfVendorOWN,
    getVendorDashboardData,
    getAllVendorsEarnings,
    getAdminDashboardData,
} from "../controllers/vendorController.js";
import { isAuthenticated, isAdmin, isVendor } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-access-token", updateAccessToken);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, updateUserProfile);

// for vendor only
router.get(
    "/earnings",
    isAuthenticated,
    isVendor,
    getVendorEarningsOfVendorOWN
);
router.get(
    "/daily-earnings",
    isAuthenticated,
    isVendor,
    getVendorEarningsGraphOfVendorOWN
);
router.get("/dashboard", isAuthenticated, isVendor, getVendorDashboardData);

// adminOnly routes
router.get("/all", isAuthenticated, isAdmin, getAllUsers);
router.get("/:id", isAuthenticated, isAdmin, getUserById);
router.put("/approved/:id", isAuthenticated, isAdmin, approveUserById);
router.put("/suspended/:id", isAuthenticated, isAdmin, suspendUserById);
router.delete("/:id", isAuthenticated, isAdmin, deleteUserById);
router.get(
    "/earnings/:id",
    isAuthenticated,
    isAdmin,
    getVendorEarningsOfVendorByID
);
router.get(
    "/admin/daily-earnings",
    isAuthenticated,
    isAdmin,
    getAllVendorsEarnings
);

router.get("/admin/dashboard", isAuthenticated, isAdmin, getAdminDashboardData);

export default router;
