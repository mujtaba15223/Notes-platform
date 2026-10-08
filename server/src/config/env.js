import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const env = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/student-notes",
  jwtSecret: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:5173"),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  storagePath: path.resolve(serverRoot, process.env.STORAGE_PATH || (process.env.VERCEL
    ? "/tmp/student-notes-uploads"
    : "uploads")),
  bundledStoragePath: path.join(serverRoot, "uploads"),
  nodeEnv: process.env.NODE_ENV || "development",
};