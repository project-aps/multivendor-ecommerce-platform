import express from "express";
import {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoriesController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    isAdmin,
    upload.fields([{ name: "image", maxCount: 1 }]),
    createCategory
);
router.get("/", getAllCategories);
router.get("/:id", getCategory);
router.put(
    "/:id",
    isAuthenticated,
    isAdmin,
    upload.fields([{ name: "image", maxCount: 1 }]),
    updateCategory
);
router.delete("/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;
