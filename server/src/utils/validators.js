import validator from "validator";
import mongoose from "mongoose";

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (fields, data) => {
  const missing = [];
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === "string" && data[field].trim() === "")) {
      missing.push(field);
    }
  }
  return missing;
};

export const sanitizeString = (str) => {
  return validator.escape(str.trim());
};

export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};