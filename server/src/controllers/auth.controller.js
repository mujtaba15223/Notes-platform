import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, token } = await authService.register(req.body);
    
    authService.setTokenCookie(res, token);
    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user, token },
    });
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }
    
    const { user, token } = await authService.login(email, password);
    
    authService.setTokenCookie(res, token);
    
    res.json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  }),

  logout: asyncHandler(async (req, res) => {
    authService.clearTokenCookie(res);
    
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user._id);
    
    res.json({
      success: true,
      data: { user },
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user._id, req.body);
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  }),
};