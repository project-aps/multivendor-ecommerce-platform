import express from "express";
import {
    getAllBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand,
} from "../controllers/brandsController.js";
import { isAuthenticated, isAdmin } from "../middleware/auth.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    isAdmin,
    upload.fields([{ name: "image", maxCount: 1 }]),
    createBrand
);
router.get("/", getAllBrands);
router.get("/:id", getBrand);
router.put(
    "/:id",
    isAuthenticated,
    isAdmin,
    upload.fields([{ name: "image", maxCount: 1 }]),
    updateBrand
);
router.delete("/:id", isAuthenticated, isAdmin, deleteBrand);

export default router;
