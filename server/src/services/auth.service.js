import User from "../models/User.js";
import { generateToken, setTokenCookie, clearTokenCookie } from "../utils/generateToken.js";
import { AppError } from "../middleware/error.middleware.js";

export const authService = {
  async register(userData) {
    const { name, email, password } = userData;
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }
    
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "student",
    });
    
    const token = generateToken(user._id, user.role);
    
    return { user, token };
  },

  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }
    
    if (!user.isActive) {
      throw new AppError("Account is deactivated", 401);
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }
    
    const token = generateToken(user._id, user.role);
    
    return { user, token };
  },

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  },

  async updateProfile(userId, updates) {
    const allowedUpdates = ["name", "bio", "avatar"];
    const filteredUpdates = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }
    
    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true,
    });
    
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    return user;
  },

  setTokenCookie,
  clearTokenCookie,
};