import { Router } from "express";
import { topicController } from "../controllers/topic.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

router.get("/", asyncHandler(topicController.getTopics));
router.get("/:id", asyncHandler(topicController.getTopic));

router.post("/", authenticate, authorize("admin"), asyncHandler(topicController.createTopic));
router.put("/:id", authenticate, authorize("admin"), asyncHandler(topicController.updateTopic));
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(topicController.deleteTopic));

export default router;