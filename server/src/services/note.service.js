import Note from "../models/Note.js";
import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import { storageService } from "./storage.service.js";
import { AppError } from "../middleware/error.middleware.js";

export const noteService = {
  async createNote(noteData, file, userId) {
    const subject = await Subject.findById(noteData.subject);
    if (!subject) {
      throw new AppError("Subject not found", 404);
    }

    const topic = await Topic.findById(noteData.topic);
    if (!topic) {
      throw new AppError("Topic not found", 404);
    }

    if (topic.subject.toString() !== noteData.subject) {
      throw new AppError("Topic does not belong to the selected subject", 400);
    }

    const storedFile = await storageService.saveFile(file);

    let note;
    try {
      note = await Note.create({
        ...noteData,
        uploadedBy: userId,
        fileUrl: storedFile.fileUrl,
        fileName: storedFile.originalName,
        fileType: storedFile.fileType,
        fileSize: storedFile.fileSize,
        tags: noteData.tags ? noteData.tags.split(",").map(t => t.trim().toLowerCase()) : [],
      });
    } catch (error) {
      storageService.deleteFile(storedFile.fileUrl);
      throw error;
    }

    return await this.getNoteById(note._id);
  },

  async getNotes(query = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      subject,
      topic,
      uploadedBy,
      fileType,
      sortBy = "createdAt",
      sortOrder = "desc",
      tags,
    } = query;

    const filter = { isApproved: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (subject) {
      filter.subject = subject;
    }
    if (topic) {
      filter.topic = topic;
    }
    if (uploadedBy) {
      filter.uploadedBy = uploadedBy;
    }
    if (fileType) {
      filter.fileType = fileType;
    }
    if (tags) {
      const tagArray = tags.split(",").map(t => t.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate("subject", "name code")
        .populate("topic", "name")
        .populate("uploadedBy", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Note.countDocuments(filter),
    ]);

    return {
      data: notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getNoteById(id) {
    const note = await Note.findById(id)
      .populate("subject", "name code")
      .populate("topic", "name")
      .populate("uploadedBy", "name avatar bio");
    
    if (!note) {
      throw new AppError("Note not found", 404);
    }
    
    return note;
  },

  async incrementViews(id) {
    return await Note.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
  },

  async incrementDownloads(id) {
    return await Note.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true });
  },

  async updateNote(id, userId, updates, isAdmin = false) {
    const note = await Note.findById(id);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    if (!isAdmin && note.uploadedBy.toString() !== userId.toString()) {
      throw new AppError("Not authorized to update this note", 403);
    }

    const allowedUpdates = ["title", "description", "tags", "subject", "topic"];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = key === "tags" 
          ? updates[key].split(",").map(t => t.trim().toLowerCase())
          : updates[key];
      }
    }

    if (filteredUpdates.subject || filteredUpdates.topic) {
      const subjectId = filteredUpdates.subject || note.subject;
      const topicId = filteredUpdates.topic || note.topic;
      
      const topic = await Topic.findById(topicId);
      if (!topic || topic.subject.toString() !== subjectId.toString()) {
        throw new Error("Topic does not belong to the selected subject");
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(id, filteredUpdates, {
      new: true,
      runValidators: true,
    }).populate("subject", "name code").populate("topic", "name").populate("uploadedBy", "name avatar");

    return updatedNote;
  },

  async deleteNote(id, userId, isAdmin = false) {
    const note = await Note.findById(id);
    if (!note) {
      throw new AppError("Note not found", 404);
    }

    if (!isAdmin && note.uploadedBy.toString() !== userId.toString()) {
      throw new AppError("Not authorized to delete this note", 403);
    }

    storageService.deleteFile(note.fileUrl);
    await Note.findByIdAndDelete(id);
    
    return { message: "Note deleted successfully" };
  },

  async getNoteStats() {
    const [totalNotes, totalDownloads, totalViews, notesByType, notesBySubject] = await Promise.all([
      Note.countDocuments({ isApproved: true }),
      Note.aggregate([{ $group: { _id: null, total: { $sum: "$downloads" } } }]),
      Note.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Note.aggregate([
        { $match: { isApproved: true } },
        { $group: { _id: "$fileType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Note.aggregate([
        { $match: { isApproved: true } },
        { $group: { _id: "$subject", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: "subjects", localField: "_id", foreignField: "_id", as: "subject" } },
        { $unwind: "$subject" },
        { $project: { _id: 1, count: 1, name: "$subject.name", code: "$subject.code" } },
      ]),
    ]);

    return {
      totalNotes,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      notesByType,
      notesBySubject,
    };
  },
};