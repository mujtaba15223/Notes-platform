import { Router } from "express";
import { subjectController } from "../controllers/subject.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

router.get("/", asyncHandler(subjectController.getSubjects));
router.get("/:id", asyncHandler(subjectController.getSubject));

router.post("/", authenticate, authorize("admin"), asyncHandler(subjectController.createSubject));
router.put("/:id", authenticate, authorize("admin"), asyncHandler(subjectController.updateSubject));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(subjectController.deleteSubject));

export default router;