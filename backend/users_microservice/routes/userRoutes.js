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
    deactivateUserById,
    deleteUserById,
    activateUserById,
} from "../controllers/userController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-access-token", updateAccessToken);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, updateUserProfile);

// for only admin routes
router.get("/", isAuthenticated, isAdmin, getAllUsers);
router.get("/:id", isAuthenticated, isAdmin, getUserById);
router.delete("/:id", isAuthenticated, isAdmin, deleteUserById);
router.put(
    "/deactivate-user/:id",
    isAuthenticated,
    isAdmin,
    deactivateUserById
);
router.put("/activate-user/:id", isAuthenticated, isAdmin, activateUserById);

export default router;
