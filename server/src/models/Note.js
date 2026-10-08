import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot be more than 2000 characters"],
      default: "",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Please provide a subject"],
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Please provide a topic"],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: {
      type: String,
      required: [true, "Please provide a file URL"],
    },
    fileName: {
      type: String,
      required: [true, "Please provide a file name"],
    },
    fileType: {
      type: String,
      required: [true, "Please provide a file type"],
      enum: {
        values: [
          "pdf",
          "doc",
          "docx",
          "ppt",
          "pptx",
          "txt",
          "md",
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "svg",
        ],
        message: "Unsupported file type",
      },
    },
    fileSize: {
      type: Number,
      required: [true, "Please provide a file size"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ title: "text", description: "text", tags: "text" });
noteSchema.index({ subject: 1 });
noteSchema.index({ topic: 1 });
noteSchema.index({ uploadedBy: 1 });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ downloads: -1 });
noteSchema.index({ views: -1 });
noteSchema.index({ fileType: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ subject: 1, topic: 1 });

noteSchema.virtual("uploader", {
  ref: "User",
  localField: "uploadedBy",
  foreignField: "_id",
  justOne: true,
});

noteSchema.set("toJSON", { virtuals: true });
noteSchema.set("toObject", { virtuals: true });

export default mongoose.model("Note", noteSchema);