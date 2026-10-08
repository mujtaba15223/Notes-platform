import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "../config/env.js";
import { fileTypeFromBuffer } from "file-type";
import { AppError } from "../middleware/error.middleware.js";

const ALLOWED_MIME_TYPES = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "text/plain": "txt",
  "text/markdown": "md",
  "text/x-markdown": "md",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const ALLOWED_EXTENSIONS = new Set(Object.values(ALLOWED_MIME_TYPES));

export const storageService = {
  ensureUploadDir() {
    if (!fs.existsSync(env.storagePath)) {
      fs.mkdirSync(env.storagePath, { recursive: true });
    }
  },

  generateUniqueFilename(originalName) {
    const ext = path.extname(originalName).toLowerCase().slice(1);
    const randomName = crypto.randomBytes(16).toString("hex");
    return `${randomName}.${ext}`;
  },

  validateFileType(file) {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return { valid: false, error: "File extension not allowed" };
    }
    return { valid: true };
  },

  async validateMimeType(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const fileType = await fileTypeFromBuffer(buffer);
      
      // Handle SVG files which may not be detected by file-type
      const ext = path.extname(filePath).toLowerCase().slice(1);
      if (ext === "svg" && ALLOWED_MIME_TYPES["image/svg+xml"]) {
        return { valid: true, mimeType: "image/svg+xml", extension: "svg" };
      }

      if (!fileType && ["txt", "md"].includes(ext) && !buffer.includes(0)) {
        try {
          new TextDecoder("utf-8", { fatal: true }).decode(buffer);
          return {
            valid: true,
            mimeType: ext === "md" ? "text/markdown" : "text/plain",
            extension: ext,
          };
        } catch {
          return { valid: false, error: "Text file must use UTF-8 encoding" };
        }
      }
      
      if (!fileType || !ALLOWED_MIME_TYPES[fileType.mime]) {
        return { valid: false, error: "File type not allowed" };
      }
      
      return { valid: true, mimeType: fileType.mime, extension: ALLOWED_MIME_TYPES[fileType.mime] };
    } catch (error) {
      return { valid: false, error: "Could not determine file type" };
    }
  },

  validateFileSize(fileSize) {
    if (fileSize > env.maxFileSize) {
      return { valid: false, error: `File size exceeds ${env.maxFileSize / (1024 * 1024)}MB limit` };
    }
    return { valid: true };
  },

  async saveFile(file) {
    this.ensureUploadDir();
    
    const validation = this.validateFileType(file);
    if (!validation.valid) {
      throw new AppError(validation.error, 400);
    }

    const uniqueName = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(env.storagePath, uniqueName);
    
    fs.writeFileSync(filePath, file.buffer);
    
    const mimeValidation = await this.validateMimeType(filePath);
    if (!mimeValidation.valid) {
      fs.unlinkSync(filePath);
      throw new AppError(mimeValidation.error, 400);
    }

    const stats = fs.statSync(filePath);
    
    return {
      fileName: uniqueName,
      originalName: file.originalname,
      filePath,
      fileUrl: `/uploads/${uniqueName}`,
      fileSize: stats.size,
      fileType: mimeValidation.extension,
      mimeType: mimeValidation.mimeType,
    };
  },

  deleteFile(fileUrl) {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(env.storagePath, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  },

  getFilePath(fileUrl) {
    const fileName = path.basename(fileUrl);
    return path.join(env.storagePath, fileName);
  },
};