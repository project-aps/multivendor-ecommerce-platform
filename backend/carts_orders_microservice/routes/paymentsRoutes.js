import express from "express";
import {
    getAllPayments,
    getPaymentsById,
} from "../controllers/paymentsController.js";
import { isAdmin, isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

// admin related
router.get("/", isAuthenticated, isAdmin, getAllPayments);
router.get("/:id", isAuthenticated, isAdmin, getPaymentsById);

export default router;
