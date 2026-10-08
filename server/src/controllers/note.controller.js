import { noteService } from "../services/note.service.js";
import { storageService } from "../services/storage.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { env } from "../config/env.js";
import fs from "fs";
import path from "path";

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

  if (note.fileUrl?.startsWith("http")) {
    return filePath;
  }

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  const bundledFilePath = path.join(
    env.bundledStoragePath,
    path.basename(note.fileUrl)
  );
  if (fs.existsSync(bundledFilePath)) {
    return bundledFilePath;
  }

  throw new AppError("The note file is missing from storage", 404);
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

    if (note.fileUrl?.startsWith("http")) {
      const response = await fetch(note.fileUrl);

      if (!response.ok) {
        throw new AppError(
          `Could not fetch file from Cloudinary (${response.status})`,
          response.status
        );
      }

      res.setHeader(
        "Content-Type",
        response.headers.get("content-type") || "application/octet-stream"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${note.fileName}"`
      );

      if (response.headers.get("content-length")) {
        res.setHeader(
          "Content-Length",
          response.headers.get("content-length")
        );
      }

      if (!response.body) {
        throw new AppError("Could not read file from Cloudinary", 502);
      }

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        res.write(Buffer.from(value));
      }

      return res.end();
    }

    res.download(filePath, note.fileName);
  }),

  viewNote: asyncHandler(async (req, res) => {
    res.redirect(302, `${req.baseUrl}/${encodeURIComponent(req.params.id)}/download`);
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