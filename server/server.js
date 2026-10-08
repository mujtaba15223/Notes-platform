import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { env } from "./src/config/env.js";
import mongoose from "mongoose";

try {
  await connectDB();
  const server = app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  server.once("error", async (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${env.port} is already in use. Stop the existing backend process or set PORT to an unused port.`
      );
    } else {
      console.error("Failed to listen for HTTP requests:", error);
    }

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("Failed to close MongoDB after server startup failure:", disconnectError);
    }

    process.exitCode = 1;
  });
} catch (error) {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
}