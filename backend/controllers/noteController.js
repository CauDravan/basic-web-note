import mongoose from "mongoose";
import Note from "../models/Note.js";

// GET /api/notes
// Get all notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notes",
      error: error.message,
    });
  }
};

// GET /api/notes/:id
// Get a single note by ID
export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve note",
      error: error.message,
    });
  }
};

// POST /api/notes
// Create a new note
export const createNote = async (req, res) => {
  try {
    const {
      title,
      content,
      parent_id,
      pinned,
      icon,
      color,
      category,
      tags,
    } = req.body;

    // Validate parent note ID if provided
    if (
      parent_id &&
      !mongoose.Types.ObjectId.isValid(parent_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent note ID",
      });
    }

    // Check whether parent note exists
    if (parent_id) {
      const parentNote = await Note.findById(parent_id);

      if (!parentNote) {
        return res.status(404).json({
          success: false,
          message: "Parent note not found",
        });
      }
    }

    const newNote = await Note.create({
      title: title?.trim() || "Untitled",
      content: content || "",
      parent_id: parent_id || null,
      pinned: pinned ?? false,
      icon: icon || "📄",
      color: color || "white",
      category: category || "NOTE",
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: newNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create note",
      error: error.message,
    });
  }
};

// PUT /api/notes/:id
// Update an existing note
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    // Only allow updating these fields
    const allowedFields = [
      "title",
      "content",
      "parent_id",
      "pinned",
      "trashed",
      "icon",
      "color",
      "category",
      "tags",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.title !== undefined) {
      updateData.title = updateData.title.trim();

      if (!updateData.title) {
        updateData.title = "Untitled";
      }
    }

    if (updateData.parent_id) {
      if (!mongoose.Types.ObjectId.isValid(updateData.parent_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent note ID",
        });
      }

      // Prevent a note from being its own parent
      if (updateData.parent_id === id) {
        return res.status(400).json({
          success: false,
          message: "A note cannot be its own parent",
        });
      }

      const parentNote = await Note.findById(updateData.parent_id);

      if (!parentNote) {
        return res.status(404).json({
          success: false,
          message: "Parent note not found",
        });
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: updatedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update note",
      error: error.message,
    });
  }
};

// DELETE /api/notes/:id
// Delete a note permanently
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      data: deletedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};
