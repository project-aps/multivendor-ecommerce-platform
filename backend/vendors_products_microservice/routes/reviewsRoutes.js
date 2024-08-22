import express from "express";
import {
    getUserAllReviews,
    updateUserReview,
    getProductAllReviewsWithUser,
} from "../controllers/reviewsController.js";
import { isAuthenticated, isUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, isUser, getUserAllReviews);
router.put("/:review_id", isAuthenticated, isUser, updateUserReview);
router.get(
    "/product/:productId",
    isAuthenticated,
    getProductAllReviewsWithUser
);

export default router;
