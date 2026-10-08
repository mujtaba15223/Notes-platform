import User from "../models/User.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Note from "../models/Note.js";
import { noteService } from "../services/note.service.js";
import { storageService } from "../services/storage.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

export const adminController = {
  getStats: asyncHandler(async (req, res) => {
    const [
      totalStudents,
      totalSubjects,
      totalTopics,
      totalNotes,
      totalDownloads,
      totalViews,
      recentUploads,
      recentUsers,
      popularSubjects,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Subject.countDocuments(),
      Topic.countDocuments(),
      Note.countDocuments(),
      Note.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]),
      Note.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Note.find()
        .populate("subject", "name code")
        .populate("topic", "name")
        .populate("uploadedBy", "name avatar")
        .sort({ createdAt: -1 })
        .limit(10),
      User.find({ role: "student" })
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(10),
      Note.aggregate([
        { $group: { _id: "$subject", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "subjects", localField: "_id", foreignField: "_id", as: "subject" } },
        { $unwind: "$subject" },
        { $project: { _id: 1, count: 1, name: "$subject.name", code: "$subject.code" } },
      ]),
    ]);
    
    res.json({
      success: true,
      data: {
        totalStudents,
        totalSubjects,
        totalTopics,
        totalNotes,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0,
        recentUploads,
        recentUsers,
        popularSubjects,
      },
    });
  }),

  getUsers: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    
    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (role) {
      filter.role = role;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),

  updateUser: asyncHandler(async (req, res) => {
    const { isActive, role } = req.body;
    const updates = {};
    
    if (isActive !== undefined) updates.isActive = isActive;
    if (role !== undefined) updates.role = role;
    
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    res.json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  }),

  deleteUser: asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new AppError("User not found", 404);
    }
    
    if (user.role === "admin") {
      throw new AppError("Cannot delete admin user", 400);
    }
    
    const notes = await Note.find({ uploadedBy: user._id }).select("_id fileUrl");
    notes.forEach((note) => storageService.deleteFile(note.fileUrl));
    await Note.deleteMany({ _id: { $in: notes.map((note) => note._id) } });
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  }),

  getAllNotes: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, isApproved } = req.query;
    
    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === "true";
    }
    
    const skip = (page - 1) * limit;
    
    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate("subject", "name code")
        .populate("topic", "name")
        .populate("uploadedBy", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments(filter),
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

  approveNote: asyncHandler(async (req, res) => {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate("subject", "name code").populate("topic", "name").populate("uploadedBy", "name avatar");
    
    if (!note) {
      throw new AppError("Note not found", 404);
    }
    
    res.json({
      success: true,
      message: "Note approved successfully",
      data: { note },
    });
  }),

  rejectNote: asyncHandler(async (req, res) => {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).populate("subject", "name code").populate("topic", "name").populate("uploadedBy", "name avatar");
    
    if (!note) {
      throw new AppError("Note not found", 404);
    }
    
    res.json({
      success: true,
      message: "Note rejected successfully",
      data: { note },
    });
  }),

  deleteNote: asyncHandler(async (req, res) => {
    const result = await noteService.deleteNote(req.params.id, req.user._id, true);

    res.json({
      success: true,
      message: result.message,
    });
  }),
};