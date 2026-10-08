import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import Note from "../models/Note.js";
import { storageService } from "../services/storage.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

export const subjectController = {
  getSubjects: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, semester } = req.query;
    
    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (semester) {
      filter.semester = parseInt(semester);
    }
    
    const skip = (page - 1) * limit;
    
    const [subjects, total] = await Promise.all([
      Subject.find(filter)
        .populate("createdBy", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Subject.countDocuments(filter),
    ]);
    
    res.json({
      success: true,
      data: subjects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),

  getSubject: asyncHandler(async (req, res) => {
    const subject = await Subject.findById(req.params.id)
      .populate("createdBy", "name");
    
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }
    
    const topics = await Topic.find({ subject: subject._id })
      .populate("createdBy", "name")
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: { subject, topics },
    });
  }),

  createSubject: asyncHandler(async (req, res) => {
    const subject = await Subject.create({
      ...req.body,
      createdBy: req.user._id,
    });
    
    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: { subject },
    });
  }),

  updateSubject: asyncHandler(async (req, res) => {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("createdBy", "name");
    
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }
    
    res.json({
      success: true,
      message: "Subject updated successfully",
      data: { subject },
    });
  }),

  deleteSubject: asyncHandler(async (req, res) => {
    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }
    
    const topics = await Topic.find({ subject: subject._id }).select("_id");
    const topicIds = topics.map((topic) => topic._id);
    const notes = await Note.find({
      $or: [{ subject: subject._id }, { topic: { $in: topicIds } }],
    }).select("_id fileUrl");

    notes.forEach((note) => storageService.deleteFile(note.fileUrl));
    await Note.deleteMany({ _id: { $in: notes.map((note) => note._id) } });
    await Topic.deleteMany({ _id: { $in: topicIds } });
    await Subject.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Subject deleted successfully",
    });
  }),
};