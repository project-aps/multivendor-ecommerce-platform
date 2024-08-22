import express from "express";
import {
    getAllSubCategories,
    getSubCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
} from "../controllers/subCategoriesController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    isAdmin,
    upload.fields([{ name: "image", maxCount: 1 }]),
    createSubCategory
);
router.get("/", getAllSubCategories);
router.get("/:id", getSubCategory);
router.put(
    "/:id",
    isAuthenticated,
    isAdmin,
    upload.fields([{ name: "image", maxCount: 1 }]),
    updateSubCategory
);
router.delete("/:id", isAuthenticated, isAdmin, deleteSubCategory);

export default router;
