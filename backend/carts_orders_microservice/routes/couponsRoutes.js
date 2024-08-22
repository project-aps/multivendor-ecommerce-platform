import express from "express";
import {
    createCoupon,
    updateCoupon,
    deleteCoupon,
    deleteCouponByName,
    getAllCoupons,
    getCouponById,
    validateCoupon,
} from "../controllers/couponsController.js";
import { isAuthenticated, isUser, isAdmin } from "../middleware/auth.js";
const router = express.Router();

router.get("/", isAuthenticated, isAdmin, getAllCoupons);
router.get("/:id", isAuthenticated, getCouponById);
router.post("/validate", isAuthenticated, isUser, validateCoupon);

router.post("/create", isAuthenticated, isAdmin, createCoupon);
router.put("/update/:id", isAuthenticated, isAdmin, updateCoupon);

router.delete("/delete/:id", isAuthenticated, isAdmin, deleteCoupon);
router.delete("/delete", isAuthenticated, isAdmin, deleteCouponByName);

export default router;
