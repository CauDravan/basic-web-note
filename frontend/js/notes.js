import { api } from "./api.js";

const notes = await api.getNotes();          // mảng note
await api.createNote({ title: "Ghi chú mới" });
await api.updateNote(note._id, { pinned: true });
await api.updateNote(note._id, { trashed: true });   // chuyển vào thùng rác