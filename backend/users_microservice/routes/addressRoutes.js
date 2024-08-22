import express from "express";
import {
    addAddress,
    getUserAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
} from "../controllers/addressController.js";
import { isAuthenticated, isAdmin, isUser } from "../middleware/auth.js";
const router = express.Router();

// routes
router.post("/add", isAuthenticated, isUser, addAddress);

router.get("/all-own", isAuthenticated, isUser, getUserAddresses);
router.get("/own/:id", isAuthenticated, isUser, getAddressById);

router.put("/own/:id", isAuthenticated, isUser, updateAddress);
router.delete("/own/:id", isAuthenticated, isUser, deleteAddress);

export default router;
