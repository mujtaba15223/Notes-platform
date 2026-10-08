import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a topic name"],
      trim: true,
      maxlength: [100, "Topic name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
      default: "",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Please provide a subject"],
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

topicSchema.index({ name: "text", description: "text" });
topicSchema.index({ subject: 1 });
topicSchema.index({ createdBy: 1 });
topicSchema.index({ subject: 1, name: 1 }, { unique: true });

topicSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "topic",
});

topicSchema.set("toJSON", { virtuals: true });
topicSchema.set("toObject", { virtuals: true });

export default mongoose.model("Topic", topicSchema);