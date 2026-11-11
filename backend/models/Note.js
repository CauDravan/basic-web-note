import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled",
    },

    content: {
      type: String,
      default: "",
    },

    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      default: null,
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    trashed: {
      type: Boolean,
      default: false,
    },

    icon: {
      type: String,
      default: "📄",
    },

    color: {
      type: String,
      default: "white",
    },

    category: {
      type: String,
      default: "NOTE",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
