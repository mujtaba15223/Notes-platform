import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export const setTokenCookie = (res, token) => {
  const isProduction = env.nodeEnv === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  // In development, explicitly set domain for Vite proxy
  if (!isProduction) {
    cookieOptions.domain = "localhost";
  }
  
  res.cookie("token", token, cookieOptions);
};

export const clearTokenCookie = (res) => {
  const isProduction = env.nodeEnv === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(0),
  };
  
  if (!isProduction) {
    cookieOptions.domain = "localhost";
  }
  
  res.cookie("token", "", cookieOptions);
};