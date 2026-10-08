import { Router } from "express";
import { noteController } from "../controllers/note.controller.js";
import { authenticate, optionalAuth } from "../middleware/auth.middleware.js";
import { upload, handleUploadError } from "../middleware/upload.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

router.get("/", asyncHandler(noteController.getNotes));
router.get("/my-notes", authenticate, asyncHandler(noteController.getMyNotes));
router.get("/:id", optionalAuth, asyncHandler(noteController.getNote));
router.get("/:id/view", optionalAuth, asyncHandler(noteController.viewNote));
router.get("/:id/download", optionalAuth, asyncHandler(noteController.downloadNote));

router.post("/", authenticate, upload.single("file"), handleUploadError, asyncHandler(noteController.createNote));
router.put("/:id", authenticate, asyncHandler(noteController.updateNote));
router.delete("/:id", authenticate, asyncHandler(noteController.deleteNote));

export default router;