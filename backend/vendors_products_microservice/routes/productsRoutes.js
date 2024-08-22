import express from "express";
import {
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    deleteProductByAdmin,
    getAllProductsFiltered,
    getBrandNamesByCategoriesAndSubcategories,
    getProduct,
    getProductsDetails,
} from "../controllers/productsController.js";
import { isAuthenticated, isAdmin, isVendor } from "../middleware/auth.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.post(
    "/create",
    isAuthenticated,
    isVendor,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
    ]),
    createProduct
);

router.get("/", getAllProductsFiltered);
router.get("/:id", getProduct);
router.get("/brands", getBrandNamesByCategoriesAndSubcategories);
router.post("/multiple", getProductsDetails);

router.put(
    "/:id",
    isAuthenticated,
    isVendor,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "gallery", maxCount: 10 },
    ]),
    updateProduct
);
// router.put("/update-stock/:id", isAuthenticated, isVendor, updateStock);
// router.put("/update-thumbnail/:id", isAuthenticated, isVendor, updateThumbnail);
// router.post("/add-gallery/:id", isAuthenticated, isVendor, addGalleryImages);

router.delete("/:id", isAuthenticated, isVendor, deleteProduct);
router.delete(
    "/delete-product-admin/:id",
    isAuthenticated,
    isAdmin,
    deleteProductByAdmin
);

export default router;
