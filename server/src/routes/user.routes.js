import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

router.get("/me", authenticate, asyncHandler(userController.getProfile));
router.put("/me", authenticate, asyncHandler(userController.updateProfile));
router.get("/:id/notes", asyncHandler(userController.getUserNotes));

export default router;