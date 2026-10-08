import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongodbUri)
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        connectionPromise = undefined;
        console.error(`MongoDB connection failed: ${error.message}`);
        throw error;
      });
  }

  return connectionPromise;
};