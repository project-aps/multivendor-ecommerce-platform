import express from "express";
import {
    addCartItem,
    deleteCart,
    getCartItems,
    removeCartItem,
    getCartItemsShortDescription,
} from "../controllers/cartsController.js";
import { isAuthenticated, isUser } from "../middleware/auth.js";
const router = express.Router();

router.get("/", isAuthenticated, isUser, getCartItemsShortDescription);
router.get("/details", isAuthenticated, isUser, getCartItems);
router.post("/add", isAuthenticated, isUser, addCartItem);
router.put("/remove", isAuthenticated, isUser, removeCartItem);
router.delete("/delete-cart", isAuthenticated, isUser, deleteCart);

export default router;
