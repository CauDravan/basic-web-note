import Note, { idPattern, noteFields } from "../models/Note.js";

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function databaseError(res, error, message) {
  if (error.code === "23503") return fail(res, 404, "Parent note not found");
  console.error(message, error.code || error.name);
  return fail(res, 500, message);
}

function withNoteId(handler) {
  return (req, res) => {
    if (!idPattern.test(req.params.id)) return fail(res, 400, "Invalid note ID");
    return handler(req, res, req.params.id.toLowerCase());
  };
}

function withNoteFields(handler, creating = false) {
  return (req, res, id) => {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return fail(res, 400, "A JSON note object is required");
    }
    let data;
    try {
      data = noteFields(req.body, creating);
    } catch (error) {
      return fail(res, 400, error.message);
    }
    if (id && data.parent_id === id) return fail(res, 400, "A note cannot be its own parent");
    return handler(res, data, id);
  };
}

export async function getNotes(req, res) {
  try {
    const data = await Note.find();
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return databaseError(res, error, "Failed to retrieve notes");
  }
}

export const getNoteById = withNoteId(async (req, res, id) => {
  try {
    const data = await Note.findById(id);
    if (!data) return fail(res, 404, "Note not found");
    return res.json({ success: true, data });
  } catch (error) {
    return databaseError(res, error, "Failed to retrieve note");
  }
});

export const createNote = withNoteFields(async (res, note) => {
  try {
    const data = await Note.create(note);
    return res.status(201).json({ success: true, message: "Note created successfully", data });
  } catch (error) {
    return databaseError(res, error, "Failed to create note");
  }
}, true);

export const updateNote = withNoteId(withNoteFields(async (res, note, id) => {
  try {
    const data = await Note.update(id, note);
    if (!data) return fail(res, 404, "Note not found");
    return res.json({ success: true, message: "Note updated successfully", data });
  } catch (error) {
    return databaseError(res, error, "Failed to update note");
  }
}));

export const deleteNote = withNoteId(async (req, res, id) => {
  try {
    const data = await Note.delete(id);
    if (!data) return fail(res, 404, "Note not found");
    return res.json({ success: true, message: "Note deleted successfully", data });
  } catch (error) {
    return databaseError(res, error, "Failed to delete note");
  }
});
