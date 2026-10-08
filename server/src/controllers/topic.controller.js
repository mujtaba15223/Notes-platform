import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import Note from "../models/Note.js";
import { storageService } from "../services/storage.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";

export const topicController = {
  getTopics: asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, subject } = req.query;
    
    const filter = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (subject) {
      filter.subject = subject;
    }
    
    const skip = (page - 1) * limit;
    
    const [topics, total] = await Promise.all([
      Topic.find(filter)
        .populate("subject", "name code")
        .populate("createdBy", "name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Topic.countDocuments(filter),
    ]);
    
    res.json({
      success: true,
      data: topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  }),

  getTopic: asyncHandler(async (req, res) => {
    const topic = await Topic.findById(req.params.id)
      .populate("subject", "name code")
      .populate("createdBy", "name");
    
    if (!topic) {
      throw new AppError("Topic not found", 404);
    }
    
    res.json({
      success: true,
      data: { topic },
    });
  }),

  createTopic: asyncHandler(async (req, res) => {
    const subject = await Subject.findById(req.body.subject);
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }
    
    const topic = await Topic.create({
      ...req.body,
      createdBy: req.user._id,
    });
    
    await topic.populate("subject", "name code");
    
    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: { topic },
    });
  }),

  updateTopic: asyncHandler(async (req, res) => {
    if (req.body.subject) {
      const subject = await Subject.findById(req.body.subject);
      if (!subject) {
        throw new AppError("Subject not found", 404);
      }

      const currentTopic = await Topic.findById(req.params.id);
      if (!currentTopic) {
        throw new AppError("Topic not found", 404);
      }

      if (currentTopic.subject.toString() !== req.body.subject) {
        const hasNotes = await Note.exists({ topic: currentTopic._id });
        if (hasNotes) {
          throw new AppError("Cannot move a topic that already has notes", 409);
        }
      }
    }
    
    const topic = await Topic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("subject", "name code").populate("createdBy", "name");
    
    if (!topic) {
      throw new AppError("Topic not found", 404);
    }
    
    res.json({
      success: true,
      message: "Topic updated successfully",
      data: { topic },
    });
  }),

  deleteTopic: asyncHandler(async (req, res) => {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      throw new AppError("Topic not found", 404);
    }
    
    const notes = await Note.find({ topic: topic._id }).select("_id fileUrl");
    notes.forEach((note) => storageService.deleteFile(note.fileUrl));
    await Note.deleteMany({ _id: { $in: notes.map((note) => note._id) } });
    await Topic.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Topic deleted successfully",
    });
  }),
};