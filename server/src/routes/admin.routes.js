import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/stats", asyncHandler(adminController.getStats));
router.get("/users", asyncHandler(adminController.getUsers));
router.put("/users/:id", asyncHandler(adminController.updateUser));
router.delete("/users/:id", asyncHandler(adminController.deleteUser));
router.get("/notes", asyncHandler(adminController.getAllNotes));
router.put("/notes/:id/approve", asyncHandler(adminController.approveNote));
router.put("/notes/:id/reject", asyncHandler(adminController.rejectNote));
router.delete("/notes/:id", asyncHandler(adminController.deleteNote));

export default router;