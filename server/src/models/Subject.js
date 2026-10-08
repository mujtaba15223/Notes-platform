import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a subject name"],
      trim: true,
      maxlength: [100, "Subject name cannot be more than 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Please provide a subject code"],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, "Subject code cannot be more than 20 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
      default: "",
    },
    semester: {
      type: Number,
      required: [true, "Please provide a semester"],
      min: [1, "Semester must be at least 1"],
      max: [10, "Semester cannot be more than 10"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

subjectSchema.index({ name: "text", code: "text", description: "text" });
subjectSchema.index({ semester: 1 });
subjectSchema.index({ createdBy: 1 });

subjectSchema.virtual("topics", {
  ref: "Topic",
  localField: "_id",
  foreignField: "subject",
});

subjectSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "subject",
});

subjectSchema.set("toJSON", { virtuals: true });
subjectSchema.set("toObject", { virtuals: true });

export default mongoose.model("Subject", subjectSchema);