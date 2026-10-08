import User from "../models/User.js";
import Note from "../models/Note.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

export const userController = {
  getProfile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    const [totalUploads, totalViews, totalDownloads, recentNotes] = await Promise.all([
      Note.countDocuments({ uploadedBy: user._id }),
      Note.aggregate([
        { $match: { uploadedBy: user._id } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Note.aggregate([
        { $match: { uploadedBy: user._id } },
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      Note.find({ uploadedBy: user._id })
        .populate("subject", "name code")
        .populate("topic", "name")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);
    
    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalUploads,
          totalViews: totalViews[0]?.total || 0,
          totalDownloads: totalDownloads[0]?.total || 0,
        },
        recentNotes,
      },
    });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const allowedUpdates = ["name", "bio", "avatar"];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  }),

  getUserNotes: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const [notes, total] = await Promise.all([
      Note.find({ uploadedBy: req.params.id, isApproved: true })
        .populate("subject", "name code")
        .populate("topic", "name")
        .populate("uploadedBy", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments({ uploadedBy: req.params.id, isApproved: true }),
    ]);
    
    res.json({
      success: true,
      data: notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),
};