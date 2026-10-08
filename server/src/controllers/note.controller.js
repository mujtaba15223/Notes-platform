import { noteService } from "../services/note.service.js";
import { storageService } from "../services/storage.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import fs from "fs";

const inlineMimeTypes = {
  pdf: "application/pdf",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

const getAccessibleNote = async (req) => {
  const note = await noteService.getNoteById(req.params.id);

  const uploaderId = note.uploadedBy?._id?.toString();

  if (
    note.isApproved === false &&
    req.user?.role !== "admin" &&
    uploaderId !== req.user?._id?.toString()
  ) {
    throw new AppError("Note not found", 404);
  }

  return note;
};

const getExistingFilePath = (note) => {
  const filePath = storageService.getFilePath(note.fileUrl);

  // Cloudinary file
  if (note.fileUrl?.startsWith("http")) {
    return filePath;
  }

  // Local file
  if (!fs.existsSync(filePath)) {
    throw new AppError("The note file is missing from storage", 404);
  }

  return filePath;
};

export const noteController = {
  createNote: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const note = await noteService.createNote(
      req.body,
      req.file,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: "Note uploaded successfully",
      data: { note },
    });
  }),

  getNotes: asyncHandler(async (req, res) => {
    const result = await noteService.getNotes(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }),

  getNote: asyncHandler(async (req, res) => {
    const note = await getAccessibleNote(req);

    await noteService.incrementViews(req.params.id);

    res.json({
      success: true,
      data: { note },
    });
  }),

  updateNote: asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === "admin";

    const note = await noteService.updateNote(
      req.params.id,
      req.user._id,
      req.body,
      isAdmin
    );

    res.json({
      success: true,
      message: "Note updated successfully",
      data: { note },
    });
  }),

  deleteNote: asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === "admin";

    const result = await noteService.deleteNote(
      req.params.id,
      req.user._id,
      isAdmin
    );

    res.json({
      success: true,
      message: result.message,
    });
  }),

  downloadNote: asyncHandler(async (req, res) => {
    const note = await getAccessibleNote(req);
    const filePath = getExistingFilePath(note);

    await noteService.incrementDownloads(req.params.id);

    // Cloudinary file
    if (note.fileUrl?.startsWith("http")) {
      return res.redirect(note.fileUrl);
    }

    // Local file
    res.download(filePath, note.fileName);
  }),

  viewNote: asyncHandler(async (req, res, next) => {
    const note = await getAccessibleNote(req);
    const filePath = getExistingFilePath(note);
    const mimeType = inlineMimeTypes[note.fileType];

    if (!mimeType) {
      throw new AppError(
        "This file type cannot be previewed in the browser. Download it to view.",
        415
      );
    }

    await noteService.incrementViews(req.params.id);

    // Cloudinary file
    if (note.fileUrl?.startsWith("http")) {
      return res.redirect(note.fileUrl);
    }

    // Local file
    res.sendFile(
      filePath,
      {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": "inline",
          "X-Content-Type-Options": "nosniff",
        },
      },
      (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      }
    );
  }),

  getMyNotes: asyncHandler(async (req, res) => {
    const result = await noteService.getNotes({
      ...req.query,
      uploadedBy: req.user._id,
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }),
};