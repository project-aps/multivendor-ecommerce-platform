import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    updateAccessToken,
    getUserProfile,
    updateUserProfile,
} from "../controllers/adminController.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-access-token", updateAccessToken);
router.post("/logout", isAuthenticated, logoutUser);
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, updateUserProfile);
// router.get("/admin-only", isAuthenticated(["admin"]), (req, res) => {
//     res.json({ message: "Admin access granted" });
// });
export default router;
